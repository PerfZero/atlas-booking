<?php

if (!defined('ABSPATH')) {
    exit;
}

class Atlas_Auth_Tokens {
    private static $table_name = 'atlas_auth_tokens';
    
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            token VARCHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            last_used_at DATETIME DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent TEXT DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY token (token),
            KEY user_id (user_id),
            KEY expires_at (expires_at),
            KEY last_used_at (last_used_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        update_option('atlas_auth_tokens_table_version', '1.0');
    }
    
    public static function create_token($user_id, $phone = '') {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $token = wp_generate_password(32, false);
        $expires_at = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
        $created_at = current_time('mysql');
        
        $ip_address = self::get_client_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'token' => $token,
                'expires_at' => $expires_at,
                'created_at' => $created_at,
                'ip_address' => $ip_address,
                'user_agent' => $user_agent
            ),
            array('%d', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        return array(
            'token' => $token,
            'user_id' => $user_id,
            'phone' => $phone,
            'expires_at' => $expires_at,
            'created_at' => $created_at
        );
    }
    
    public static function verify_token($token) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $token_data = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE token = %s",
            $token
        ), ARRAY_A);
        
        if (!$token_data) {
            return false;
        }
        
        if (strtotime($token_data['expires_at']) < time()) {
            self::delete_token($token);
            return false;
        }
        
        self::update_last_used($token);
        
        return $token_data;
    }
    
    public static function delete_token($token) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->delete(
            $table_name,
            array('token' => $token),
            array('%s')
        );
    }
    
    public static function delete_user_tokens($user_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->delete(
            $table_name,
            array('user_id' => $user_id),
            array('%d')
        );
    }
    
    public static function update_last_used($token) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->update(
            $table_name,
            array('last_used_at' => current_time('mysql')),
            array('token' => $token),
            array('%s'),
            array('%s')
        );
    }
    
    public static function clean_expired_tokens() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $deleted = $wpdb->query("DELETE FROM $table_name WHERE expires_at < NOW()");
        
        return $deleted !== false ? $deleted : 0;
    }
    
    public static function get_user_tokens($user_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d ORDER BY created_at DESC",
            $user_id
        ), ARRAY_A);
    }
    
    public static function get_active_users_count($minutes = 15) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT user_id) FROM $table_name 
             WHERE last_used_at > DATE_SUB(NOW(), INTERVAL %d MINUTE)",
            $minutes
        ));
    }
    
    public static function migrate_from_options() {
        $old_tokens = get_option('atlas_auth_tokens', array());
        
        if (empty($old_tokens)) {
            return array('migrated' => 0, 'skipped' => 0);
        }
        
        $migrated = 0;
        $skipped = 0;
        
        foreach ($old_tokens as $token => $data) {
            $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
            $created_at = isset($data['created_at']) ? $data['created_at'] : time();
            
            if (!$user_id) {
                $skipped++;
                continue;
            }
            
            global $wpdb;
            $table_name = $wpdb->prefix . self::$table_name;
            
            $expires_at = date('Y-m-d H:i:s', $created_at + (30 * 24 * 60 * 60));
            $created_at_mysql = date('Y-m-d H:i:s', $created_at);
            
            $result = $wpdb->insert(
                $table_name,
                array(
                    'user_id' => $user_id,
                    'token' => $token,
                    'expires_at' => $expires_at,
                    'created_at' => $created_at_mysql,
                    'last_used_at' => $created_at_mysql
                ),
                array('%d', '%s', '%s', '%s', '%s')
            );
            
            if ($result !== false) {
                $migrated++;
            } else {
                $skipped++;
            }
        }
        
        update_option('atlas_auth_tokens_backup', $old_tokens);
        delete_option('atlas_auth_tokens');
        
        return array(
            'migrated' => $migrated,
            'skipped' => $skipped,
            'total' => count($old_tokens)
        );
    }
    
    private static function get_client_ip() {
        $ip = '';
        
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }
        
        return sanitize_text_field($ip);
    }
}

