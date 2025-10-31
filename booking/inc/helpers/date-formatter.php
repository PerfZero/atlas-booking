<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_format_date_russian($date_string) {
    if (!$date_string) {
        return null;
    }
    
    $date = new DateTime($date_string);
    
    $months = [
        1 => 'янв', 2 => 'фев', 3 => 'мар', 4 => 'апр', 5 => 'май', 6 => 'июн',
        7 => 'июл', 8 => 'авг', 9 => 'сен', 10 => 'окт', 11 => 'ноя', 12 => 'дек'
    ];
    
    $days = [
        'Mon' => 'Пн', 'Tue' => 'Вт', 'Wed' => 'Ср', 'Thu' => 'Чт',
        'Fri' => 'Пт', 'Sat' => 'Сб', 'Sun' => 'Вс'
    ];
    
    $day_name = $days[$date->format('D')] ?? $date->format('D');
    $month_name = $months[$date->format('n')] ?? $date->format('M');
    
    return $day_name . ', ' . $date->format('j') . ' ' . $month_name;
}

function atlas_format_time($date_string) {
    if (!$date_string) {
        return null;
    }
    
    $date = new DateTime($date_string);
    return $date->format('H:i');
}

function atlas_format_datetime_russian($date_string) {
    if (!$date_string) {
        return null;
    }
    
    $date = new DateTime($date_string);
    
    $months = [
        1 => 'января', 2 => 'февраля', 3 => 'марта', 4 => 'апреля', 5 => 'мая', 6 => 'июня',
        7 => 'июля', 8 => 'августа', 9 => 'сентября', 10 => 'октября', 11 => 'ноября', 12 => 'декабря'
    ];
    
    $day = $date->format('j');
    $month = $months[$date->format('n')] ?? $date->format('F');
    $year = $date->format('Y');
    $time = $date->format('H:i');
    
    return "$day $month $year, $time";
}

function atlas_get_russian_months() {
    return [
        1 => 'янв', 2 => 'фев', 3 => 'мар', 4 => 'апр', 5 => 'май', 6 => 'июн',
        7 => 'июл', 8 => 'авг', 9 => 'сен', 10 => 'окт', 11 => 'ноя', 12 => 'дек'
    ];
}

function atlas_get_russian_days() {
    return [
        'Mon' => 'Пн', 'Tue' => 'Вт', 'Wed' => 'Ср', 'Thu' => 'Чт',
        'Fri' => 'Пт', 'Sat' => 'Сб', 'Sun' => 'Вс'
    ];
}

