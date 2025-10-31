<?php

if (!defined('ABSPATH')) {
    exit;
}

class Atlas_Bookings {
    private static $table_name = 'atlas_bookings';
    
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            booking_id VARCHAR(64) NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            tour_id BIGINT(20) UNSIGNED NOT NULL,
            tour_title TEXT NOT NULL,
            tour_slug VARCHAR(255),
            tour_data LONGTEXT,
            status VARCHAR(50) DEFAULT 'pending',
            payment_id VARCHAR(100),
            amount DECIMAL(10,2),
            expires_at DATETIME,
            booking_date DATETIME NOT NULL,
            updated_at DATETIME,
            PRIMARY KEY (id),
            UNIQUE KEY booking_id (booking_id),
            KEY user_id (user_id),
            KEY tour_id (tour_id),
            KEY status (status),
            KEY expires_at (expires_at),
            KEY booking_date (booking_date)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        update_option('atlas_bookings_table_version', '1.0');
    }
    
    public static function create_booking($user_id, $tour_id, $tour_data) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $tour = get_post($tour_id);
        if (!$tour) {
            return false;
        }
        
        $booking_id = 'BK' . time() . '_' . wp_generate_password(8, false, false);
        $booking_date = current_time('mysql');
        $expires_at = date('Y-m-d H:i:s', time() + (20 * 60));
        
        $amount = isset($tour_data['price']) ? floatval($tour_data['price']) : 0;
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'booking_id' => $booking_id,
                'user_id' => $user_id,
                'tour_id' => $tour_id,
                'tour_title' => $tour->post_title,
                'tour_slug' => $tour->post_name,
                'tour_data' => json_encode($tour_data, JSON_UNESCAPED_UNICODE),
                'status' => 'pending',
                'amount' => $amount,
                'expires_at' => $expires_at,
                'booking_date' => $booking_date,
                'updated_at' => $booking_date
            ),
            array('%s', '%d', '%d', '%s', '%s', '%s', '%s', '%f', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        return array(
            'booking_id' => $booking_id,
            'user_id' => $user_id,
            'tour_id' => $tour_id,
            'tour_title' => $tour->post_title,
            'tour_slug' => $tour->post_name,
            'booking_date' => $booking_date,
            'status' => 'pending',
            'tour_data' => $tour_data
        );
    }
    
    public static function get_booking($booking_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $booking = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE booking_id = %s",
            $booking_id
        ), ARRAY_A);
        
        if ($booking && !empty($booking['tour_data'])) {
            $booking['tour_data'] = json_decode($booking['tour_data'], true);
        }
        
        return $booking;
    }
    
    public static function get_user_bookings($user_id, $status = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        if ($status) {
            $bookings = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $table_name WHERE user_id = %d AND status = %s ORDER BY booking_date DESC",
                $user_id,
                $status
            ), ARRAY_A);
        } else {
            $bookings = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $table_name WHERE user_id = %d ORDER BY booking_date DESC",
                $user_id
            ), ARRAY_A);
        }
        
        foreach ($bookings as &$booking) {
            if (!empty($booking['tour_data'])) {
                $booking['tour_data'] = json_decode($booking['tour_data'], true);
            }
        }
        
        return $bookings;
    }
    
    public static function update_booking_status($booking_id, $status, $payment_id = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $data = array(
            'status' => $status,
            'updated_at' => current_time('mysql')
        );
        $format = array('%s', '%s');
        
        if ($payment_id !== null) {
            $data['payment_id'] = $payment_id;
            $format[] = '%s';
        }
        
        return $wpdb->update(
            $table_name,
            $data,
            array('booking_id' => $booking_id),
            $format,
            array('%s')
        );
    }
    
    public static function delete_booking($booking_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        return $wpdb->delete(
            $table_name,
            array('booking_id' => $booking_id),
            array('%s')
        );
    }
    
    public static function expire_old_bookings() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        $expired = $wpdb->query("
            UPDATE $table_name 
            SET status = 'expired', updated_at = NOW()
            WHERE status = 'pending' 
            AND expires_at < NOW()
        ");
        
        return $expired !== false ? $expired : 0;
    }
    
    public static function get_booking_stats($user_id = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        if ($user_id) {
            $stats = $wpdb->get_row($wpdb->prepare(
                "SELECT 
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                    SUM(CASE WHEN status IN ('paid', 'confirmed') THEN amount ELSE 0 END) as total_revenue
                 FROM $table_name 
                 WHERE user_id = %d",
                $user_id
            ), ARRAY_A);
        } else {
            $stats = $wpdb->get_row("
                SELECT 
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                    SUM(CASE WHEN status IN ('paid', 'confirmed') THEN amount ELSE 0 END) as total_revenue
                 FROM $table_name
            ", ARRAY_A);
        }
        
        return $stats;
    }
    
    public static function get_all_bookings($limit = 100, $offset = 0, $status = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table_name;
        
        if ($status) {
            $bookings = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $table_name WHERE status = %s ORDER BY booking_date DESC LIMIT %d OFFSET %d",
                $status,
                $limit,
                $offset
            ), ARRAY_A);
        } else {
            $bookings = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $table_name ORDER BY booking_date DESC LIMIT %d OFFSET %d",
                $limit,
                $offset
            ), ARRAY_A);
        }
        
        foreach ($bookings as &$booking) {
            if (!empty($booking['tour_data'])) {
                $booking['tour_data'] = json_decode($booking['tour_data'], true);
            }
        }
        
        return $bookings;
    }
    
    public static function migrate_from_user_meta() {
        global $wpdb;
        
        $users = get_users();
        $migrated = 0;
        $skipped = 0;
        
        foreach ($users as $user) {
            $user_bookings = get_user_meta($user->ID, 'atlas_bookings', true);
            
            if (!is_array($user_bookings) || empty($user_bookings)) {
                continue;
            }
            
            foreach ($user_bookings as $old_booking_id => $booking) {
                $tour_id = isset($booking['tour_id']) ? intval($booking['tour_id']) : 0;
                $tour_title = isset($booking['tour_title']) ? $booking['tour_title'] : '';
                $tour_slug = isset($booking['tour_slug']) ? $booking['tour_slug'] : '';
                $tour_data = isset($booking['tour_data']) ? $booking['tour_data'] : array();
                $status = isset($booking['status']) ? $booking['status'] : 'pending';
                $booking_date = isset($booking['booking_date']) ? $booking['booking_date'] : current_time('mysql');
                
                if (!$tour_id || !$tour_title) {
                    $skipped++;
                    continue;
                }
                
                $amount = isset($tour_data['price']) ? floatval($tour_data['price']) : 0;
                $expires_at = null;
                
                if ($status === 'pending') {
                    $booking_time = strtotime($booking_date);
                    $expires_at = date('Y-m-d H:i:s', $booking_time + (20 * 60));
                    
                    if (time() > strtotime($expires_at)) {
                        $status = 'expired';
                    }
                }
                
                $table_name = $wpdb->prefix . self::$table_name;
                $result = $wpdb->insert(
                    $table_name,
                    array(
                        'booking_id' => $old_booking_id,
                        'user_id' => $user->ID,
                        'tour_id' => $tour_id,
                        'tour_title' => $tour_title,
                        'tour_slug' => $tour_slug,
                        'tour_data' => json_encode($tour_data, JSON_UNESCAPED_UNICODE),
                        'status' => $status,
                        'amount' => $amount,
                        'expires_at' => $expires_at,
                        'booking_date' => $booking_date,
                        'updated_at' => $booking_date
                    ),
                    array('%s', '%d', '%d', '%s', '%s', '%s', '%s', '%f', '%s', '%s', '%s')
                );
                
                if ($result !== false) {
                    $migrated++;
                } else {
                    $skipped++;
                }
            }
            
            update_user_meta($user->ID, 'atlas_bookings_backup', $user_bookings);
        }
        
        return array(
            'migrated' => $migrated,
            'skipped' => $skipped,
            'total_users' => count($users)
        );
    }
}

