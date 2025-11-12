<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_booking_details_page() {
    $booking_id = isset($_GET['booking_id']) ? sanitize_text_field($_GET['booking_id']) : '';
    
    if (!$booking_id) {
        echo '<div class="wrap">';
        echo '<h1>Ошибка</h1>';
        echo '<div class="notice notice-error"><p>Неверные параметры бронирования.</p></div>';
        echo '<a href="' . admin_url('admin.php?page=atlas-bookings') . '" class="button">Вернуться к списку</a>';
        echo '</div>';
        return;
    }
    
    $booking = Atlas_Bookings::get_booking($booking_id);
    
    if (!$booking) {
        echo '<div class="wrap">';
        echo '<h1>Ошибка</h1>';
        echo '<div class="notice notice-error"><p>Бронирование не найдено.</p></div>';
        echo '<a href="' . admin_url('admin.php?page=atlas-bookings') . '" class="button">Вернуться к списку</a>';
        echo '</div>';
        return;
    }
    
    $user = get_userdata($booking['user_id']);
    
    echo '<div class="wrap">';
    echo '<h1 class="wp-heading-inline">Детали бронирования</h1>';
    echo '<a href="' . admin_url('admin.php?page=atlas-bookings') . '" class="page-title-action">← Назад к списку</a>';
    echo '<hr class="wp-header-end">';
    
    $status_class = $booking['status'] === 'pending' ? 'notice-warning' : 'notice-success';
    $status_text = '';
    switch($booking['status']) {
        case 'pending': $status_text = 'Ожидает оплаты'; break;
        case 'paid': $status_text = 'Оплачено'; break;
        case 'cancelled': $status_text = 'Отменено'; break;
        case 'confirmed': $status_text = 'Подтверждено'; break;
        default: $status_text = $booking['status'];
    }
    
    echo '<div class="notice ' . $status_class . ' inline" style="margin: 15px 0; padding: 10px 15px;"><strong>Статус:</strong> ' . esc_html($status_text) . '</div>';
    
    echo '<div id="poststuff">';
    echo '<div id="post-body" class="metabox-holder columns-2">';
    echo '<div id="post-body-content">';
    
    echo '<div class="postbox">';
    echo '<div class="postbox-header">';
    echo '<h2>Основная информация</h2>';
    echo '</div>';
    echo '<div class="inside">';
    echo '<table class="form-table" role="presentation">';
    echo '<tbody>';
    echo '<tr><th scope="row">ID бронирования</th><td><code>' . esc_html($booking_id) . '</code></td></tr>';
    echo '<tr><th scope="row">Дата бронирования</th><td>' . esc_html(date('d.m.Y H:i', strtotime($booking['booking_date']))) . '</td></tr>';
    echo '<tr><th scope="row">Название тура</th><td><strong>' . esc_html($booking['tour_title']) . '</strong></td></tr>';
    if (isset($booking['tour_data']['duration'])) {
        echo '<tr><th scope="row">Длительность</th><td>' . esc_html($booking['tour_data']['duration']) . '</td></tr>';
    }
    if (isset($booking['tour_data']['price'])) {
        echo '<tr><th scope="row">Цена</th><td>$' . esc_html($booking['tour_data']['price']) . '</td></tr>';
    }
    if (isset($booking['tour_data']['flightOutboundDate'])) {
        echo '<tr><th scope="row">Дата вылета</th><td>' . esc_html($booking['tour_data']['flightOutboundDate']) . '</td></tr>';
    }
    if (isset($booking['tour_data']['flightInboundDate'])) {
        echo '<tr><th scope="row">Дата возвращения</th><td>' . esc_html($booking['tour_data']['flightInboundDate']) . '</td></tr>';
    }
    if (isset($booking['tour_data']['managerId']) && !empty($booking['tour_data']['managerId'])) {
        echo '<tr><th scope="row">ID менеджера</th><td><strong>' . esc_html($booking['tour_data']['managerId']) . '</strong></td></tr>';
    }
    echo '</tbody>';
    echo '</table>';
    echo '</div>';
    echo '</div>';
    
    if (isset($booking['tour_data']['tourists']) && is_array($booking['tour_data']['tourists'])) {
        echo '<div class="postbox">';
        echo '<div class="postbox-header">';
        echo '<h2>Туристы (' . count($booking['tour_data']['tourists']) . ' чел.)</h2>';
        echo '</div>';
        echo '<div class="inside">';
        
        foreach ($booking['tour_data']['tourists'] as $index => $tourist) {
            $type_text = $tourist['type'] === 'adult' ? 'Взрослый' : ($tourist['type'] === 'child' ? 'Ребенок' : 'Младенец');
            $gender_text = $tourist['gender'] === 'male' ? 'Мужской' : 'Женский';
            
            echo '<div class="tourist-card">';
            echo '<h3>' . ($index + 1) . '. ' . esc_html($tourist['firstName']) . ' ' . esc_html($tourist['lastName']) . '</h3>';
            echo '<table class="form-table" role="presentation">';
            echo '<tbody>';
            echo '<tr><th scope="row">Тип</th><td>' . esc_html($type_text) . '</td></tr>';
            echo '<tr><th scope="row">Дата рождения</th><td>' . esc_html($tourist['birthDate']) . '</td></tr>';
            echo '<tr><th scope="row">Пол</th><td>' . esc_html($gender_text) . '</td></tr>';
            echo '<tr><th scope="row">ИИН</th><td>' . esc_html($tourist['iin']) . '</td></tr>';
            echo '<tr><th scope="row">Номер паспорта</th><td>' . esc_html($tourist['passportNumber']) . '</td></tr>';
            echo '<tr><th scope="row">Дата выдачи паспорта</th><td>' . esc_html($tourist['passportIssueDate']) . '</td></tr>';
            echo '<tr><th scope="row">Срок действия паспорта</th><td>' . esc_html($tourist['passportExpiryDate']) . '</td></tr>';
            if (!empty($tourist['phone'])) {
                echo '<tr><th scope="row">Телефон</th><td>' . esc_html($tourist['phone']) . '</td></tr>';
            }
            echo '</tbody>';
            echo '</table>';
            echo '</div>';
        }
        
        echo '</div>';
        echo '</div>';
    }
    
    echo '</div>';
    
    echo '<div id="postbox-container-1" class="postbox-container">';
    
    echo '<div class="postbox">';
    echo '<div class="postbox-header">';
    echo '<h2>Информация о пользователе</h2>';
    echo '</div>';
    echo '<div class="inside">';
    echo '<table class="form-table" role="presentation">';
    echo '<tbody>';
    echo '<tr><th scope="row">Имя</th><td>' . esc_html($user->display_name) . '</td></tr>';
    echo '<tr><th scope="row">Email</th><td>' . esc_html($user->user_email) . '</td></tr>';
    $phone = get_user_meta($user_id, 'phone', true);
    if ($phone) {
        echo '<tr><th scope="row">Телефон</th><td>' . esc_html($phone) . '</td></tr>';
    }
    echo '</tbody>';
    echo '</table>';
    echo '</div>';
    echo '</div>';
    
    echo '<div class="postbox">';
    echo '<div class="postbox-header">';
    echo '<h2>Управление статусом</h2>';
    echo '</div>';
    echo '<div class="inside">';
    echo '<form method="post" action="">';
    wp_nonce_field('atlas_update_booking_status', 'atlas_booking_nonce');
    echo '<input type="hidden" name="action" value="update_booking_status">';
    echo '<table class="form-table" role="presentation">';
    echo '<tbody>';
    echo '<tr>';
    echo '<th scope="row"><label for="booking_status">Статус</label></th>';
    echo '<td>';
    echo '<select name="booking_status" id="booking_status" class="regular-text">';
    echo '<option value="pending"' . ($booking['status'] === 'pending' ? ' selected' : '') . '>Ожидает оплаты</option>';
    echo '<option value="paid"' . ($booking['status'] === 'paid' ? ' selected' : '') . '>Оплачено</option>';
    echo '<option value="cancelled"' . ($booking['status'] === 'cancelled' ? ' selected' : '') . '>Отменено</option>';
    echo '<option value="confirmed"' . ($booking['status'] === 'confirmed' ? ' selected' : '') . '>Подтверждено</option>';
    echo '</select>';
    echo '</td>';
    echo '</tr>';
    echo '</tbody>';
    echo '</table>';
    echo '<p class="submit">';
    echo '<input type="submit" name="submit" id="submit" class="button button-primary" value="Обновить статус">';
    echo '</p>';
    echo '</form>';
    echo '</div>';
    echo '</div>';
    
    echo '<div class="postbox">';
    echo '<div class="postbox-header">';
    echo '<h2>Действия</h2>';
    echo '</div>';
    echo '<div class="inside">';
    echo '<form method="post" action="" onsubmit="return confirm(\'Вы уверены, что хотите удалить это бронирование?\');">';
    wp_nonce_field('atlas_delete_booking', 'atlas_booking_delete_nonce');
    echo '<input type="hidden" name="action" value="delete_booking">';
    echo '<p>';
    echo '<input type="submit" name="delete" class="button button-link-delete" value="Удалить бронирование" style="color: #a00;">';
    echo '</p>';
    echo '</form>';
    echo '</div>';
    echo '</div>';
    
    echo '</div>';
    echo '</div>';
    echo '</div>';
    
    if (isset($_POST['action']) && $_POST['action'] === 'update_booking_status') {
        if (wp_verify_nonce($_POST['atlas_booking_nonce'], 'atlas_update_booking_status')) {
            $new_status = sanitize_text_field($_POST['booking_status']);
            $user_bookings[$booking_id]['status'] = $new_status;
            update_user_meta($user_id, 'atlas_bookings', $user_bookings);
            
            echo '<div class="notice notice-success is-dismissible"><p>Статус бронирования обновлен.</p></div>';
            echo '<script>setTimeout(function(){ window.location.reload(); }, 1000);</script>';
        }
    }
    
    if (isset($_POST['action']) && $_POST['action'] === 'delete_booking') {
        if (wp_verify_nonce($_POST['atlas_booking_delete_nonce'], 'atlas_delete_booking')) {
            unset($user_bookings[$booking_id]);
            update_user_meta($user_id, 'atlas_bookings', $user_bookings);
            
            echo '<div class="notice notice-success is-dismissible"><p>Бронирование удалено.</p></div>';
            echo '<script>setTimeout(function(){ window.location.href = "' . admin_url('admin.php?page=atlas-bookings') . '"; }, 1000);</script>';
        }
    }
    
    echo '<style>
    .tourist-card {
        background: #f9f9f9;
        padding: 15px;
        margin-bottom: 15px;
        border-left: 4px solid #0073aa;
    }
    .tourist-card h3 {
        margin-top: 0;
        color: #0073aa;
    }
    .tourist-card:last-child {
        margin-bottom: 0;
    }
    #post-body-content {
        float: left;
        width: 100%;
    }
    #postbox-container-1 {
        float: right;
        margin-left: -300px;
        width: 280px;
    }
    #post-body.columns-2 #post-body-content {
        margin-right: 300px;
    }
    </style>';
    
    echo '</div>';
}



