<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_bookings_admin_page() {
    echo '<div class="wrap">';
    echo '<h1 class="wp-heading-inline">Бронирования Atlas Hajj</h1>';
    
    $all_bookings_raw = Atlas_Bookings::get_all_bookings(1000, 0);
    $all_bookings = array();
    
    foreach ($all_bookings_raw as $booking) {
        $user = get_user_by('ID', $booking['user_id']);
        if ($user) {
            $booking['user_name'] = $user->display_name;
            $booking['user_email'] = $user->user_email;
            $booking['user_phone'] = get_user_meta($user->ID, 'atlas_phone', true);
        }
        $all_bookings[$booking['booking_id']] = $booking;
    }
    
    if (empty($all_bookings)) {
        echo '<div class="notice notice-info">';
        echo '<p><strong>Информация:</strong> Пока нет забронированных туров.</p>';
        echo '</div>';
        echo '</div>';
        return;
    }
    
    $total_bookings = count($all_bookings);
    $pending_bookings = 0;
    $total_tourists = 0;
    
    foreach ($all_bookings as $booking) {
        if ($booking['status'] === 'pending') $pending_bookings++;
        if (isset($booking['tour_data']['tourists'])) {
            $total_tourists += count($booking['tour_data']['tourists']);
        } else {
            $total_tourists += 1;
        }
    }
    
    echo '<div class="metabox-holder">';
    echo '<div class="postbox-container" style="width: 100%;">';
    
    echo '<div class="postbox">';
    echo '<h2 class="hndle ui-sortable-handle"><span>Статистика</span></h2>';
    echo '<div class="inside">';
    echo '<div class="main">';
    echo '<table class="form-table" role="presentation">';
    echo '<tbody>';
    echo '<tr>';
    echo '<th scope="row">Всего бронирований</th>';
    echo '<td><strong>' . $total_bookings . '</strong></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row">Ожидают оплаты</th>';
    echo '<td><strong>' . $pending_bookings . '</strong></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row">Всего туристов</th>';
    echo '<td><strong>' . $total_tourists . '</strong></td>';
    echo '</tr>';
    echo '</tbody>';
    echo '</table>';
    echo '</div>';
    echo '</div>';
    echo '</div>';
    
    echo '<div class="postbox">';
    echo '<h2 class="hndle ui-sortable-handle"><span>Список бронирований</span></h2>';
    echo '<div class="inside">';
    
    echo '<div class="tablenav top">';
    echo '<div class="alignleft actions bulkactions">';
    echo '<select name="bulk_action" id="bulk_action">';
    echo '<option value="-1">Массовые действия</option>';
    echo '<option value="status_pending">Изменить статус на: Ожидает оплаты</option>';
    echo '<option value="status_paid">Изменить статус на: Оплачено</option>';
    echo '<option value="status_cancelled">Изменить статус на: Отменено</option>';
    echo '<option value="status_confirmed">Изменить статус на: Подтверждено</option>';
    echo '<option value="delete">Удалить выбранные</option>';
    echo '</select>';
    echo '<input type="submit" id="doaction" class="button action" value="Применить">';
    echo '</div>';
    echo '</div>';
    
    echo '<table class="wp-list-table widefat fixed striped">';
    echo '<thead>';
    echo '<tr>';
    echo '<td id="cb" class="manage-column column-cb check-column"><input id="cb-select-all-1" type="checkbox"></td>';
    echo '<th scope="col" class="manage-column column-id">ID</th>';
    echo '<th scope="col" class="manage-column column-tour">Тур</th>';
    echo '<th scope="col" class="manage-column column-date">Дата</th>';
    echo '<th scope="col" class="manage-column column-status">Статус</th>';
    echo '<th scope="col" class="manage-column column-actions">Действия</th>';
    echo '</tr>';
    echo '</thead>';
    echo '<tbody>';
    
    foreach ($all_bookings as $booking_id => $booking) {
        $status_class = $booking['status'] === 'pending' ? 'notice-error' : 'notice-success';
        $view_url = admin_url('admin.php?page=atlas-booking-details&booking_id=' . urlencode($booking_id));
        
        echo '<tr class="booking-row" data-booking-url="' . esc_url($view_url) . '" style="cursor: pointer;">';
        echo '<th scope="row" class="check-column" onclick="event.stopPropagation();"><input type="checkbox" name="booking[]" value="' . esc_attr($booking_id) . '" data-user-id="' . esc_attr($booking['user_id']) . '"></th>';
        echo '<td class="column-id"><code>' . esc_html(substr($booking_id, 0, 8)) . '...</code></td>';
        echo '<td class="column-tour">';
        echo '<strong>' . esc_html($booking['tour_title']) . '</strong>';
        if (isset($booking['tour_data']['duration'])) {
            echo '<br><small>' . esc_html($booking['tour_data']['duration']) . '</small>';
        }
        echo '</td>';
        echo '<td class="column-date">' . esc_html(date('d.m.Y H:i', strtotime($booking['booking_date']))) . '</td>';
        echo '<td class="column-status">';
        $status_text = '';
        switch($booking['status']) {
            case 'pending': $status_text = 'Ожидает оплаты'; break;
            case 'paid': $status_text = 'Оплачено'; break;
            case 'cancelled': $status_text = 'Отменено'; break;
            case 'confirmed': $status_text = 'Подтверждено'; break;
            default: $status_text = $booking['status'];
        }
        echo '<span class="' . $status_class . ' inline">' . esc_html($status_text) . '</span>';
        echo '</td>';
        echo '<td class="column-actions" onclick="event.stopPropagation();">';
        echo '<select onchange="changeBookingStatus(\'' . esc_js($booking_id) . '\', \'' . esc_js($booking['user_id']) . '\', this.value)" class="booking-status-select" style="margin: 0 5px;">';
        echo '<option value="pending"' . ($booking['status'] === 'pending' ? ' selected' : '') . '>Ожидает оплаты</option>';
        echo '<option value="paid"' . ($booking['status'] === 'paid' ? ' selected' : '') . '>Оплачено</option>';
        echo '<option value="cancelled"' . ($booking['status'] === 'cancelled' ? ' selected' : '') . '>Отменено</option>';
        echo '<option value="confirmed"' . ($booking['status'] === 'confirmed' ? ' selected' : '') . '>Подтверждено</option>';
        echo '</select>';
        echo '<button onclick="deleteBooking(\'' . esc_js($booking_id) . '\', \'' . esc_js($booking['user_id']) . '\')" class="button button-link-delete" style="color: #a00; margin-left: 5px;">Удалить</button>';
        echo '</td>';
        echo '</tr>';
    }
    
    echo '</tbody>';
    echo '</table>';
    
    echo '</div>';
    echo '</div>';
    echo '</div>';
    echo '</div>';
    
    require_once get_template_directory() . '/inc/helpers/admin-bookings-styles.php';
    require_once get_template_directory() . '/inc/helpers/admin-bookings-scripts.php';
    
    echo '</div>';
}

