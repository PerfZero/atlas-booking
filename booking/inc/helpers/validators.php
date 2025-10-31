<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('acf/validate_value/name=date_end', 'atlas_validate_tour_dates', 10, 4);
function atlas_validate_tour_dates($valid, $value, $field, $input) {
    if (!$valid) {
        return $valid;
    }
    
    $start_date_field = str_replace('date_end', 'date_start', $field['name']);
    $start_date = $_POST['acf'][$field['parent']][$field['parent_repeater']][$start_date_field] ?? '';
    
    if (!empty($start_date) && !empty($value)) {
        $start_timestamp = strtotime($start_date);
        $end_timestamp = strtotime($value);
        
        if ($end_timestamp < $start_timestamp) {
            $valid = 'Дата окончания не может быть раньше даты начала тура';
        }
    }
    
    return $valid;
}

function atlas_validate_phone($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 15;
}

function atlas_validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function atlas_sanitize_phone($phone) {
    return preg_replace('/\D/', '', $phone);
}

function atlas_format_phone($phone) {
    $phone = preg_replace('/[^0-9]/', '', $phone);
    
    if (strlen($phone) === 11 && substr($phone, 0, 1) === '7') {
        return '+' . $phone;
    } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '8') {
        return '+7' . substr($phone, 1);
    } elseif (strlen($phone) === 10) {
        return '+7' . $phone;
    }
    
    return $phone;
}

