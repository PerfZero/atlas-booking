<?php

if (!defined('ABSPATH')) {
    exit;
}

class Atlas_SMS_Codes {
    private static $table_name = 'atlas_sms_codes';
    
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            phone VARCHAR(20) NOT NULL,
            code VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            attempts INT(11) DEFAULT 0,
            verified TINYINT(1) DEFAULT 0,
            ip_address VARCHAR(45) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY phone (phone),
            KEY expires_at (expires_at),
            KEY verified (verified)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        update_option('atlas_sms_codes_table_version', '1.0');
    }
    
    public static function save_code($phone, $code, $expires_in = 600) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        self::delete_old_codes($phone);
        
        $expires_at = date('Y-m-d H:i:s', time() + $expires_in);
        $created_at = current_time('mysql');
        $ip_address = self::get_client_ip();
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'phone' => $phone,
                'code' => $code,
                'expires_at' => $expires_at,
                'created_at' => $created_at,
                'ip_address' => $ip_address,
                'attempts' => 0,
                'verified' => 0
            ),
            array('%s', '%s', '%s', '%s', '%s', '%d', '%d')
        );
        
        return $result !== false;
    }
    
    public static function verify_code($phone, $code) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $sms_data = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name 
             WHERE phone = %s 
             AND verified = 0 
             AND expires_at > NOW() 
             ORDER BY created_at DESC 
             LIMIT 1",
            $phone
        ), ARRAY_A);
        
        if (!$sms_data) {
            return array(
                'success' => false,
                'error' => 'code_not_found'
            );
        }
        
        $wpdb->update(
            $table_name,
            array('attempts' => $sms_data['attempts'] + 1),
            array('id' => $sms_data['id']),
            array('%d'),
            array('%d')
        );
        
        if ($sms_data['attempts'] >= 5) {
            return array(
                'success' => false,
                'error' => 'too_many_attempts'
            );
        }
        
        if ($sms_data['code'] !== $code) {
            return array(
                'success' => false,
                'error' => 'invalid_code',
                'attempts_left' => 5 - ($sms_data['attempts'] + 1)
            );
        }
        
        $wpdb->update(
            $table_name,
            array('verified' => 1),
            array('id' => $sms_data['id']),
            array('%d'),
            array('%d')
        );
        
        return array(
            'success' => true,
            'verified' => true
        );
    }
    
    public static function delete_old_codes($phone) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->delete(
            $table_name,
            array('phone' => $phone, 'verified' => 0),
            array('%s', '%d')
        );
    }
    
    public static function clean_expired_codes() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $deleted = $wpdb->query("DELETE FROM $table_name WHERE expires_at < NOW()");
        
        return $deleted !== false ? $deleted : 0;
    }
    
    public static function clean_verified_codes($days = 7) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $deleted = $wpdb->query($wpdb->prepare(
            "DELETE FROM $table_name 
             WHERE verified = 1 
             AND created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $days
        ));
        
        return $deleted !== false ? $deleted : 0;
    }
    
    public static function get_phone_stats($phone, $hours = 24) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $stats = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as total_codes,
                SUM(verified) as verified_codes,
                SUM(CASE WHEN attempts >= 5 THEN 1 ELSE 0 END) as blocked_codes
             FROM $table_name 
             WHERE phone = %s 
             AND created_at > DATE_SUB(NOW(), INTERVAL %d HOUR)",
            $phone,
            $hours
        ), ARRAY_A);
        
        return $stats;
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
    
    public static function migrate_from_options() {
        $old_codes = get_option('atlas_sms_codes', array());
        
        if (empty($old_codes)) {
            return array('migrated' => 0, 'skipped' => 0);
        }
        
        $migrated = 0;
        $skipped = 0;
        
        foreach ($old_codes as $phone => $data) {
            $code = isset($data['code']) ? $data['code'] : '';
            $time = isset($data['time']) ? $data['time'] : time();
            
            if (empty($code)) {
                $skipped++;
                continue;
            }
            
            $expires_in = 600 - (time() - $time);
            if ($expires_in <= 0) {
                $skipped++;
                continue;
            }
            
            if (self::save_code($phone, $code, $expires_in)) {
                $migrated++;
            } else {
                $skipped++;
            }
        }
        
        update_option('atlas_sms_codes_backup', $old_codes);
        delete_option('atlas_sms_codes');
        
        return array(
            'migrated' => $migrated,
            'skipped' => $skipped,
            'total' => count($old_codes)
        );
    }
}

