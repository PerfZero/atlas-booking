<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_kaspi_routes() {
    register_rest_route('atlas/v1', '/kaspi/payment_app.cgi', array(
        'methods' => 'GET',
        'callback' => 'atlas_kaspi_payment_app',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/payment_app.cgi', array(
        'methods' => 'POST',
        'callback' => 'atlas_kaspi_payment_app',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/create-payment', array(
        'methods' => 'POST',
        'callback' => 'atlas_create_kaspi_payment',
        'permission_callback' => 'atlas_require_auth'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/payment-status', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_kaspi_payment_status',
        'permission_callback' => 'atlas_require_auth'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/test-payment', array(
        'methods' => 'POST',
        'callback' => 'atlas_test_kaspi_payment',
        'permission_callback' => 'atlas_require_admin'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/webhook', array(
        'methods' => 'POST',
        'callback' => 'atlas_process_kaspi_webhook',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/test', array(
        'methods' => 'GET',
        'callback' => 'atlas_kaspi_test_page',
        'permission_callback' => 'atlas_require_admin'
    ));
}
add_action('rest_api_init', 'atlas_register_kaspi_routes');

function atlas_kaspi_payment_app($request) {
    $params = $request->get_params();
    $command = sanitize_text_field($params['command'] ?? '');
    
    if ($command === 'check') {
        return atlas_kaspi_check_payment($params);
    } elseif ($command === 'pay') {
        $result = atlas_kaspi_process_payment($params);
        
        $order_id = sanitize_text_field($params['account'] ?? '');
        $txn_id = sanitize_text_field($params['txn_id'] ?? '');
        
        if (!empty($order_id) && !empty($txn_id)) {
            wp_redirect('https://booking.atlas.kz/kaspi-payment-success?txn_id=' . $txn_id . '&order_id=' . $order_id);
            exit;
        }
        
        return $result;
    } else {
        return new WP_Error('invalid_command', 'Invalid command', array('status' => 400));
    }
}

function atlas_kaspi_check_payment($params) {
    $txn_id = sanitize_text_field($params['txn_id'] ?? '');
    $account = sanitize_text_field($params['account'] ?? '');
    $sum = floatval($params['sum'] ?? 0);
    
    if (strpos($account, 'ATLAS-TEST-') === 0) {
        return atlas_kaspi_handle_test_order($account, $txn_id, 'check');
    }
    
    if (empty($txn_id) || empty($account)) {
        error_log('Invalid parameters for check');
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    
    $payment = null;
    if (isset($payments[$txn_id])) {
        $payment = $payments[$txn_id];
    } else {
        foreach ($payments as $payment_data) {
            if ($payment_data['order_id'] === $account) {
                $payment = $payment_data;
                break;
            }
        }
    }
    
    if ($payment) {
        error_log('Found payment: ' . print_r($payment, true));
        
        $status = $payment['status'] ?? 'pending';
        
        switch ($status) {
            case 'pending':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 0,
                    'comment' => 'Заказ найден и доступен для оплаты'
                );
            case 'completed':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 3,
                    'comment' => 'Заказ уже оплачен'
                );
            case 'cancelled':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 2,
                    'comment' => 'Заказ отменен'
                );
            case 'processing':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 4,
                    'comment' => 'Платеж в обработке'
                );
            default:
                return array(
                    'txn_id' => $txn_id,
                    'result' => 5,
                    'comment' => 'Другая ошибка провайдера'
                );
        }
    } else {
        error_log('KASPI Payment ERROR: Payment not found for txn_id=' . $txn_id . ', account=' . $account);
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
}

function atlas_kaspi_process_payment($params) {
    $txn_id = sanitize_text_field($params['txn_id'] ?? '');
    $account = sanitize_text_field($params['account'] ?? '');
    $sum = floatval($params['sum'] ?? 0);
    $txn_date = sanitize_text_field($params['txn_date'] ?? '');
    
    if (strpos($account, 'ATLAS-TEST-') === 0) {
        return atlas_kaspi_handle_test_order($account, $txn_id, 'pay', $sum, $txn_date);
    }
    
    if (empty($txn_id) || empty($account) || $sum <= 0) {
        error_log('Invalid parameters for payment');
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    
    $payment = null;
    $payment_key = null;
    
    if (isset($payments[$txn_id])) {
        $payment = $payments[$txn_id];
        $payment_key = $txn_id;
    } else {
        foreach ($payments as $key => $payment_data) {
            if ($payment_data['order_id'] === $account) {
                $payment = $payment_data;
                $payment_key = $key;
                break;
            }
        }
    }
    
    if ($payment) {
        $status = $payment['status'] ?? 'pending';
        
        if ($status === 'completed') {
            return array(
                'txn_id' => $txn_id,
                'prv_txn_id' => 'ATLAS-PAYMENT-' . $payment_key,
                'result' => 3,
                'sum' => $payment['processed_amount'] ?? $sum,
                'comment' => 'Заказ уже оплачен'
            );
        } elseif ($status === 'cancelled') {
            return array(
                'txn_id' => $txn_id,
                'result' => 2,
                'comment' => 'Заказ отменен'
            );
        } elseif ($status === 'processing') {
            return array(
                'txn_id' => $txn_id,
                'result' => 4,
                'comment' => 'Платеж в обработке'
            );
        }
        
        $payment['status'] = 'completed';
        $payment['completed_at'] = current_time('mysql');
        $payment['kaspi_txn_date'] = $txn_date;
        $payment['processed_amount'] = $sum;
        $payment['kaspi_txn_id'] = $txn_id;
        
        $payments[$payment_key] = $payment;
        update_option('atlas_kaspi_payments', $payments);
        
        if (isset($payment['user_id']) && isset($payment['tour_id'])) {
            $booking = Atlas_Bookings::get_booking($payment['order_id']);
            
            if ($booking) {
                Atlas_Bookings::update_booking_status($payment['order_id'], 'paid', $payment_key);
                
                $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
                $room_type = isset($booking['tour_data']['roomType']) ? $booking['tour_data']['roomType'] : null;
                atlas_update_tour_spots($payment['tour_id'], $tourists_count, $room_type);
            } else {
                error_log('KASPI Payment ERROR: Booking not found for order_id=' . $payment['order_id']);
            }
        } else {
            error_log('KASPI Payment ERROR: Payment missing user_id or tour_id');
        }
        
        return array(
            'txn_id' => $txn_id,
            'prv_txn_id' => 'ATLAS-PAYMENT-' . $txn_id,
            'result' => 0,
            'sum' => $sum,
            'comment' => 'Платеж успешно обработан'
        );
    } else {
        error_log('KASPI Payment ERROR: Payment not found for txn_id=' . $txn_id . ', account=' . $account);
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
}

function atlas_kaspi_handle_test_order($account, $txn_id, $command, $sum = 0, $txn_date = '') {
    $test_orders = array(
        'ATLAS-TEST-00001' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты'),
        'ATLAS-TEST-00002' => array('status' => 'not_found', 'result' => 1, 'comment' => 'Заказ не найден'),
        'ATLAS-TEST-00003' => array('status' => 'cancelled', 'result' => 2, 'comment' => 'Заказ отменен'),
        'ATLAS-TEST-00004' => array('status' => 'completed', 'result' => 3, 'comment' => 'Заказ уже оплачен'),
        'ATLAS-TEST-00005' => array('status' => 'processing', 'result' => 4, 'comment' => 'Платеж в обработке'),
        'ATLAS-TEST-00006' => array('status' => 'error', 'result' => 5, 'comment' => 'Другая ошибка провайдера'),
        'ATLAS-TEST-00007' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты', 'min_amount' => 1000),
        'ATLAS-TEST-00008' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты', 'max_amount' => 5000000),
        'ATLAS-TEST-00009' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты', 'delay' => true)
    );
    
    if (!isset($test_orders[$account])) {
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
    
    $test_order = $test_orders[$account];
    
    if (isset($test_order['min_amount']) && $sum < $test_order['min_amount']) {
        return array(
            'txn_id' => $txn_id,
            'result' => 5,
            'comment' => 'Сумма меньше минимальной'
        );
    }
    
    if (isset($test_order['max_amount']) && $sum > $test_order['max_amount']) {
        return array(
            'txn_id' => $txn_id,
            'result' => 5,
            'comment' => 'Сумма больше максимальной'
        );
    }
    
    if (isset($test_order['delay'])) {
        sleep(2);
    }
    
    if ($command === 'check') {
        return array(
            'txn_id' => $txn_id,
            'result' => $test_order['result'],
            'comment' => $test_order['comment']
        );
    } elseif ($command === 'pay') {
        if ($test_order['status'] === 'pending') {
            return array(
                'txn_id' => $txn_id,
                'prv_txn_id' => 'ATLAS-PAYMENT-' . $txn_id,
                'result' => 0,
                'sum' => $sum,
                'comment' => 'Платеж успешно обработан'
            );
        } else {
            return array(
                'txn_id' => $txn_id,
                'result' => $test_order['result'],
                'comment' => $test_order['comment']
            );
        }
    }
    
    return array(
        'txn_id' => $txn_id,
        'result' => 5,
        'comment' => 'Другая ошибка провайдера'
    );
}

function atlas_kaspi_test_page($request) {
    $tran_id = 'KSP' . uniqid();
    $order_id = 'test_' . time();
    $amount = 100000;
    
    $payment_data = array(
        'tran_id' => $tran_id,
        'order_id' => $order_id,
        'amount' => $amount,
        'tour_id' => 33,
        'user_id' => 3,
        'status' => 'pending',
        'created_at' => current_time('mysql')
    );
    
    $payments = get_option('atlas_kaspi_payments', array());
    $payments[$tran_id] = $payment_data;
    update_option('atlas_kaspi_payments', $payments);
    
    $html = '<html><head><title>Kaspi Test</title></head><body>';
    $html .= '<h1>Kaspi Payment Test</h1>';
    $html .= '<p><strong>TranId:</strong> ' . $tran_id . '</p>';
    $html .= '<p><strong>OrderId:</strong> ' . $order_id . '</p>';
    $html .= '<p><strong>Amount:</strong> ' . number_format($amount) . ' ₸</p>';
    $html .= '<p><strong>Status:</strong> ' . $payment_data['status'] . '</p>';
    $html .= '<h3>Test URLs:</h3>';
    $html .= '<p><strong>Check Payment:</strong><br>';
    $html .= 'https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=check&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</p>';
    $html .= '<p><strong>Kaspi URL:</strong><br>';
    $html .= 'https://kaspi.kz/online?TranId=' . $tran_id . '&OrderId=' . $order_id . '&Amount=' . $amount . '&Service=AtlasBooking&returnUrl=https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</p>';
    $html .= '<form action="https://kaspi.kz/online" method="post">';
    $html .= '<input type="hidden" name="TranId" value="' . $tran_id . '">';
    $html .= '<input type="hidden" name="OrderId" value="' . $order_id . '">';
    $html .= '<input type="hidden" name="Amount" value="' . $amount . '">';
    $html .= '<input type="hidden" name="Service" value="AtlasBooking">';
    $html .= '<input type="hidden" name="returnUrl" value="https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '">';
    $html .= '<button type="submit">Test Kaspi Payment</button>';
    $html .= '</form>';
    $html .= '</body></html>';
    
    return new WP_REST_Response($html, 200, array('Content-Type' => 'text/html'));
}

function atlas_update_tour_spots($tour_id, $spots_to_reduce = 1, $room_type = null) {
    error_log("=== atlas_update_tour_spots ВЫЗВАНА ===");
    error_log("Параметры: tour_id=$tour_id, spots_to_reduce=$spots_to_reduce, room_type=$room_type");
    
    $room_options = get_field('room_options', $tour_id);
    error_log("room_options получены: " . print_r($room_options, true));
    $updated = false;
    
    if (is_array($room_options)) {
        error_log("room_options - массив, начинаем обработку");
        foreach ($room_options as $index => $room) {
            error_log("Обрабатываем комнату $index: " . print_r($room, true));
            
            if ($room_type && isset($room['type']) && $room['type'] === $room_type) {
                error_log("Найдена комната нужного типа: {$room['type']}");
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = max(0, $current_spots - $spots_to_reduce);
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                    error_log("Updated spots for tour {$tour_id}, room type {$room_type}: {$current_spots} -> {$new_spots}");
                } else {
                    error_log("spots_left не найден для комнаты типа {$room_type}");
                }
            } elseif (!$room_type) {
                error_log("Тип комнаты не указан, обновляем все");
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = max(0, $current_spots - $spots_to_reduce);
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                    error_log("Updated all spots for tour {$tour_id}: {$current_spots} -> {$new_spots}");
                }
            } else {
                error_log("Комната типа {$room['type']} не соответствует искомому {$room_type}");
            }
        }
        
        if ($updated) {
            error_log("Обновляем room_options в базе данных");
            $update_result = update_field('room_options', $room_options, $tour_id);
            error_log("Результат update_field: " . ($update_result ? 'SUCCESS' : 'FAILED'));
        } else {
            error_log("Ничего не обновлено в room_options");
        }
    } else {
        error_log("room_options не является массивом");
    }
    
    if (!$updated) {
        error_log("Обновляем общее поле spots_left");
        $current_spots = get_field('spots_left', $tour_id);
        if ($current_spots === false || $current_spots === null) {
            $current_spots = 10;
        }
        
        $new_spots = max(0, $current_spots - $spots_to_reduce);
        $update_result = update_field('spots_left', $new_spots, $tour_id);
        error_log("Updated general spots for tour {$tour_id}: {$current_spots} -> {$new_spots}, update_result: " . ($update_result ? 'SUCCESS' : 'FAILED'));
    }
    
    error_log("=== atlas_update_tour_spots ЗАВЕРШЕНА ===");
    return true;
}

function atlas_return_tour_spots($tour_id, $spots_to_return = 1, $room_type = null) {
    $room_options = get_field('room_options', $tour_id);
    $updated = false;
    
    if (is_array($room_options)) {
        foreach ($room_options as $index => $room) {
            if ($room_type && isset($room['type']) && $room['type'] === $room_type) {
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = $current_spots + $spots_to_return;
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                    error_log("Returned spots for tour {$tour_id}, room type {$room_type}: {$current_spots} -> {$new_spots}");
                }
            } elseif (!$room_type) {
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = $current_spots + $spots_to_return;
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                }
            }
        }
        
        if ($updated) {
            update_field('room_options', $room_options, $tour_id);
        }
    }
    
    if (!$updated) {
        $current_spots = get_field('spots_left', $tour_id);
        if ($current_spots === false || $current_spots === null) {
            $current_spots = 10;
        }
        
        $new_spots = $current_spots + $spots_to_return;
        update_field('spots_left', $new_spots, $tour_id);
        error_log("Returned general spots for tour {$tour_id}: {$current_spots} -> {$new_spots}");
    }
    
    return true;
}

function atlas_kaspi_admin_menu() {
    add_menu_page(
        'Kaspi Test', 
        'Kaspi Test', 
        'manage_options', 
        'kaspi-test', 
        'atlas_kaspi_admin_page',
        'dashicons-money-alt',
        30
    );
}

function atlas_create_kaspi_payment($request) {
    $params = $request->get_params();
    
    $order_id = sanitize_text_field($params['order_id'] ?? '');
    $amount = intval($params['amount'] ?? 0);
    $tour_id = intval($params['tour_id'] ?? 0);
    $token = atlas_get_token_from_request($request);
    
    if (empty($order_id) || $amount <= 0 || $tour_id <= 0) {
        return new WP_Error('invalid_params', 'Invalid parameters', array('status' => 400));
    }
    
    $token_data = Atlas_Auth_Tokens::verify_token($token);
    
    if (!$token_data) {
        return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
    }
    
    $user_id = $token_data['user_id'];
    
    $tran_id = 'KSP' . uniqid();
    
    $payment_data = array(
        'tran_id' => $tran_id,
        'order_id' => $order_id,
        'amount' => $amount,
        'tour_id' => $tour_id,
        'user_id' => $user_id,
        'status' => 'pending',
        'created_at' => current_time('mysql')
    );
    
    $payments = get_option('atlas_kaspi_payments', array());
    $payments[$tran_id] = $payment_data;
    update_option('atlas_kaspi_payments', $payments);
    
    $kaspi_data = array(
        'TranId' => $tran_id,
        'OrderId' => $order_id,
        'Amount' => $amount * 100,
        'Service' => 'AtlasBooking',
        'returnUrl' => 'https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount,
        'refererHost' => 'api.booking.atlas.kz',
        'GenerateQrCode' => false
    );
    
    $response = wp_remote_post('https://kaspi.kz/online', array(
        'body' => json_encode($kaspi_data),
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
            'User-Agent' => 'Atlas-Hajj/1.0'
        )
    ));
    
    if (is_wp_error($response)) {
        error_log('KASPI ERROR: Request failed - ' . $response->get_error_message());
        return new WP_Error('kaspi_error', 'Failed to get payment URL from Kaspi', array('status' => 500));
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    
    error_log('KASPI Response Code: ' . $response_code);
    error_log('KASPI Response Body: ' . $response_body);
    error_log('KASPI Request Data: ' . json_encode($kaspi_data));
    
    if ($response_code === 200) {
        $kaspi_result = json_decode($response_body, true);
        
        if ($kaspi_result && isset($kaspi_result['code']) && $kaspi_result['code'] === 0) {
            return array(
                'success' => true,
                'payment_url' => $kaspi_result['redirectUrl'],
                'tran_id' => $tran_id,
                'order_id' => $order_id,
                'amount' => $amount
            );
        } else {
            $error_message = 'Unknown error';
            if (isset($kaspi_result['message'])) {
                $error_message = $kaspi_result['message'];
            } elseif (isset($kaspi_result['comment'])) {
                $error_message = $kaspi_result['comment'];
            }
            error_log('KASPI ERROR: ' . $error_message . ' | Full response: ' . print_r($kaspi_result, true));
            return new WP_Error('kaspi_error', 'Kaspi returned error: ' . $error_message, array('status' => 400));
        }
    } else {
        error_log('KASPI ERROR: Request failed with HTTP ' . $response_code);
        return new WP_Error('kaspi_error', 'Failed to get payment URL from Kaspi (HTTP ' . $response_code . ')', array('status' => 500));
    }
}

function atlas_test_kaspi_payment($request) {
    $tran_id = 'KSP' . uniqid();
    $order_id = 'test_' . time();
    $amount = 1000;
    
    $payment_data = array(
        'tran_id' => $tran_id,
        'order_id' => $order_id,
        'amount' => $amount,
        'tour_id' => 1,
        'user_id' => 1,
        'status' => 'pending',
        'created_at' => current_time('mysql')
    );
    
    $payments = get_option('atlas_kaspi_payments', array());
    $payments[$tran_id] = $payment_data;
    update_option('atlas_kaspi_payments', $payments);
    
    $check_url = 'https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=check&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount;
    
    return array(
        'success' => true,
        'test_payment' => $payment_data,
        'check_url' => $check_url,
        'message' => 'Тестовый платеж создан. Используйте check_url для проверки.'
    );
}

function atlas_get_kaspi_payment_status($request) {
    $params = $request->get_params();
    $tran_id = sanitize_text_field($params['tran_id'] ?? '');
    $order_id = sanitize_text_field($params['order_id'] ?? '');
    
    if (empty($tran_id) && empty($order_id)) {
        return new WP_Error('missing_params', 'Transaction ID or Order ID is required', array('status' => 400));
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    
    if (!empty($tran_id)) {
        if (!isset($payments[$tran_id])) {
            return new WP_Error('payment_not_found', 'Payment not found', array('status' => 404));
        }
        $payment = $payments[$tran_id];
    } else {
        $payment = null;
        foreach ($payments as $tran_id_key => $payment_data) {
            if ($payment_data['order_id'] === $order_id) {
                $payment = $payment_data;
                break;
            }
        }
        
        if (!$payment) {
            return new WP_Error('payment_not_found', 'Payment not found', array('status' => 404));
        }
    }
    
    return array(
        'success' => true,
        'payment' => $payment
    );
}

function atlas_process_kaspi_webhook($request) {
    $params = $request->get_params();
    $tran_id = sanitize_text_field($params['TranId'] ?? '');
    $order_id = sanitize_text_field($params['OrderId'] ?? '');
    $amount = intval($params['Amount'] ?? 0);
    $status = sanitize_text_field($params['Status'] ?? '');
    
    if (empty($tran_id) || empty($order_id)) {
        return new WP_Error('invalid_webhook', 'Invalid webhook data', array('status' => 400));
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    if (!isset($payments[$tran_id])) {
        return new WP_Error('payment_not_found', 'Payment not found', array('status' => 404));
    }
    
    $payment = $payments[$tran_id];
    
    if ($status === 'success' || $status === 'completed') {
        $payment['status'] = 'completed';
        $payment['completed_at'] = current_time('mysql');
        
        $booking = Atlas_Bookings::get_booking($payment['order_id']);
        if ($booking) {
            Atlas_Bookings::update_booking_status($payment['order_id'], 'paid', $tran_id);
            
            $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
            $room_type = isset($booking['tour_data']['roomType']) ? $booking['tour_data']['roomType'] : null;
            atlas_update_tour_spots($payment['tour_id'], $tourists_count, $room_type);
        }
    } else {
        $payment['status'] = 'failed';
        $payment['failed_at'] = current_time('mysql');
    }
    
    $payments[$tran_id] = $payment;
    update_option('atlas_kaspi_payments', $payments);
    
    return array(
        'success' => true,
        'message' => 'Webhook processed successfully'
    );
}

function atlas_kaspi_payment_success_redirect() {
    if (strpos($_SERVER['REQUEST_URI'], '/kaspi-payment-success') !== false) {
        $txn_id = isset($_GET['txn_id']) ? sanitize_text_field($_GET['txn_id']) : '';
        $order_id = isset($_GET['order_id']) ? sanitize_text_field($_GET['order_id']) : '';
        
        $redirect_url = 'https://booking.atlas.kz/kaspi-payment-success';
        $params = array();
        
        if (!empty($txn_id)) {
            $params['txn_id'] = $txn_id;
        }
        if (!empty($order_id)) {
            $params['order_id'] = $order_id;
        }
        
        if (!empty($params)) {
            $redirect_url .= '?' . http_build_query($params);
        }
        
        wp_redirect($redirect_url);
        exit;
    }
}
add_action('template_redirect', 'atlas_kaspi_payment_success_redirect');

