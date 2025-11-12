<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_auth_routes() {
    register_rest_route('atlas-hajj/v1', '/send-sms', array(
        'methods' => 'POST',
        'callback' => 'atlas_send_sms',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'atlas_verify_code',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/check-auth', array(
        'methods' => 'POST',
        'callback' => 'atlas_check_auth',
        'permission_callback' => 'atlas_require_auth'
    ));
    
    register_rest_route('atlas-hajj/v1', '/logout', array(
        'methods' => 'POST',
        'callback' => 'atlas_logout',
        'permission_callback' => 'atlas_require_auth'
    ));
}
add_action('rest_api_init', 'atlas_register_auth_routes');

function atlas_send_sms($request) {
    $params = $request->get_params();
    $phone = sanitize_text_field($params['phone'] ?? '');
    $code = sanitize_text_field($params['code'] ?? '');
    
    if (empty($phone) || empty($code)) {
        return new WP_Error('missing_params', 'Phone and code are required', array('status' => 400));
    }
    
    $phone = atlas_format_phone($phone);
    
    $sms_limits = get_option('atlas_sms_limits', array());
    $current_time = time();
    $limit_window = 900;
    $max_attempts = 3;
    
    if (isset($sms_limits[$phone])) {
        $attempts = array_filter($sms_limits[$phone], function($timestamp) use ($current_time, $limit_window) {
            return ($current_time - $timestamp) < $limit_window;
        });
        
        if (count($attempts) >= $max_attempts) {
            return new WP_Error('rate_limit', 'Слишком много попыток. Попробуйте через 15 минут', array('status' => 429));
        }
        
        $sms_limits[$phone] = $attempts;
    } else {
        $sms_limits[$phone] = array();
    }
    
    $sms_limits[$phone][] = $current_time;
    update_option('atlas_sms_limits', $sms_limits);
    
    $login = get_option('atlas_smsc_login', '');
    $password = get_option('atlas_smsc_password', '');
    
    if (empty($login) || empty($password)) {
        return new WP_Error('sms_error', 'SMSC credentials not configured', array('status' => 500));
    }
    
    $message = "Ваш код подтверждения: {$code}. Atlas Hajj\n\n@atlas.kz #{$code}";
    
    $url = 'https://smsc.kz/sys/send.php?' . http_build_query([
        'login' => $login,
        'psw' => $password,
        'phones' => $phone,
        'mes' => $message,
        'fmt' => '3',
        'charset' => 'utf-8'
    ]);
    
    $response = wp_remote_get($url);
    
    if (is_wp_error($response)) {
        return new WP_Error('sms_error', 'Failed to send SMS', array('status' => 500));
    }
    
    $body = wp_remote_retrieve_body($response);
    $result = json_decode($body, true);
    
    if (isset($result['error'])) {
        return new WP_Error('sms_error', $result['error'], array('status' => 400));
    }
    
    if (!Atlas_SMS_Codes::save_code($phone, $code, 600)) {
        return new WP_Error('sms_error', 'Failed to save SMS code', array('status' => 500));
    }
    
    return array(
        'success' => true,
        'message' => 'SMS sent successfully'
    );
}

function atlas_verify_code($request) {
    $params = $request->get_params();
    $phone = sanitize_text_field($params['phone'] ?? '');
    $code = sanitize_text_field($params['code'] ?? '');
    
    if (empty($phone) || empty($code)) {
        return new WP_Error('missing_params', 'Phone and code are required', array('status' => 400));
    }
    
    $phone = atlas_format_phone($phone);
    
    $verify_result = Atlas_SMS_Codes::verify_code($phone, $code);
    
    if (!$verify_result['success']) {
        $error_messages = array(
            'code_not_found' => 'Код не найден или истек. Запросите новый код',
            'too_many_attempts' => 'Слишком много попыток. Запросите новый код',
            'invalid_code' => 'Неверный код'
        );
        
        $error_code = $verify_result['error'] ?? 'invalid_code';
        $error_message = $error_messages[$error_code] ?? 'Ошибка проверки кода';
        
        $error_data = array('status' => 400);
        if (isset($verify_result['attempts_left'])) {
            $error_data['attempts_left'] = $verify_result['attempts_left'];
        }
        
        return new WP_Error($error_code, $error_message, $error_data);
    }
    
    $user = atlas_get_or_create_user($phone);
    
    $token_data = Atlas_Auth_Tokens::create_token($user['id'], $phone);
    
    if (!$token_data) {
        return new WP_Error('token_error', 'Failed to create token', array('status' => 500));
    }
    
    return array(
        'success' => true,
        'message' => 'Code verified successfully',
        'token' => $token_data['token'],
        'user' => $user
    );
}

function atlas_check_auth($request) {
    $token = atlas_get_token_from_request($request);
    
    if (empty($token)) {
        return new WP_Error('missing_token', 'Authorization token required in header', array('status' => 401));
    }
    
    $token_data = Atlas_Auth_Tokens::verify_token($token);
    
    if (!$token_data) {
        return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
    }
    
    $user = get_user_by('ID', $token_data['user_id']);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', array('status' => 404));
    }
    
    $phone = get_user_meta($user->ID, 'phone', true);
    
    return array(
        'success' => true,
        'authenticated' => true,
        'user' => array(
            'id' => $user->ID,
            'phone' => $phone,
            'name' => $user->display_name ?: "Пользователь " . substr($phone, -4),
            'email' => $user->user_email,
            'created_at' => $user->user_registered
        )
    );
}

function atlas_logout($request) {
    $token = atlas_get_token_from_request($request);
    
    if (empty($token)) {
        return new WP_Error('missing_token', 'Authorization token required in header', array('status' => 401));
    }
    
    Atlas_Auth_Tokens::delete_token($token);
    
    return array(
        'success' => true,
        'message' => 'Logged out successfully'
    );
}

function atlas_get_or_create_user($phone) {
    $users = get_users(array(
        'meta_key' => 'atlas_phone',
        'meta_value' => $phone,
        'number' => 1
    ));
    
    if (!empty($users)) {
        $user = $users[0];
        return array(
            'id' => $user->ID,
            'phone' => $phone,
            'name' => $user->display_name ?: "Пользователь " . substr($phone, -4),
            'email' => $user->user_email,
            'created_at' => $user->user_registered
        );
    } else {
        $username = 'user_' . substr($phone, -8);
        $email = $username . '@atlas-hajj.local';
        
        $user_id = wp_create_user($username, wp_generate_password(), $email);
        
        if (is_wp_error($user_id)) {
            $username = 'user_' . substr($phone, -8) . '_' . time();
            $email = $username . '@atlas-hajj.local';
            $user_id = wp_create_user($username, wp_generate_password(), $email);
        }
        
        if (!is_wp_error($user_id)) {
            wp_update_user(array(
                'ID' => $user_id,
                'display_name' => "Пользователь " . substr($phone, -4),
                'first_name' => "Пользователь",
                'last_name' => substr($phone, -4)
            ));
            
            update_user_meta($user_id, 'atlas_phone', $phone);
            
            return array(
                'id' => $user_id,
                'phone' => $phone,
                'name' => "Пользователь " . substr($phone, -4),
                'email' => $email,
                'created_at' => current_time('mysql')
            );
        }
    }
    
    return array(
        'id' => 0,
        'phone' => $phone,
        'name' => "Пользователь " . substr($phone, -4),
        'email' => '',
        'created_at' => current_time('mysql')
    );
}

