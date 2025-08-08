<?php
// Скрипт для создания тестовых туров
// Добавьте этот код в functions.php или запустите отдельно

function create_test_tours() {
    // Тур 1: Fairmont Package из Алматы
    $tour1_data = array(
        'post_title' => 'Fairmont Package',
        'post_content' => 'Премиум тур в отель Fairmont Makkah Clock Royal Tower. Роскошное размещение в самом центре Мекки с видом на Каабу.',
        'post_excerpt' => 'Премиум тур в 5* отель Fairmont с видом на Каабу. Всё включено: авиабилеты, проживание, питание, трансферы.',
        'post_status' => 'publish',
        'post_type' => 'post',
        'post_author' => 1,
        'post_name' => 'fairmont-package'
    );
    
    $tour1_id = wp_insert_post($tour1_data);
    
    if ($tour1_id) {
        // ACF поля для тура 1
        update_field('price', 2400, $tour1_id);
        update_field('old_price', 2500, $tour1_id);
        update_field('duration', '3 дня в Медине · 3 дня в Мекке', $tour1_id);
        update_field('departure_city', 'almaty', $tour1_id);
        update_field('pilgrimage_type', 'umrah', $tour1_id);
        update_field('tour_start_date', '2025-01-15', $tour1_id);
        update_field('tour_end_date', '2025-01-21', $tour1_id);
        update_field('rating', 9.3, $tour1_id);
        update_field('reviews_count', 124, $tour1_id);
        update_field('spots_left', 9, $tour1_id);
        update_field('hotel_mekka', 'Fairmont Makkah Clock Royal Tower', $tour1_id);
        update_field('hotel_medina', 'Le Meridien Madinah', $tour1_id);
        update_field('distance_mekka', '50 м.', $tour1_id);
        update_field('distance_medina', '150 м.', $tour1_id);
        update_field('flight_type', 'direct', $tour1_id);
        update_field('food_type', 'all_inclusive', $tour1_id);
        update_field('transfer_type', 'bus', $tour1_id);
        
        // Особенности тура 1
        $features1 = array(
            array('feature_text' => 'Всё включено'),
            array('feature_text' => 'Прямой рейс'),
            array('feature_text' => 'Вид на Каабу'),
            array('feature_text' => 'VIP трансфер')
        );
        update_field('features', $features1, $tour1_id);
        
        // Теги тура 1
        $tags1 = array(
            array('tag_text' => 'Умра'),
            array('tag_text' => 'Премиум'),
            array('tag_text' => 'Вид на Каабу')
        );
        update_field('tags', $tags1, $tour1_id);
        
        echo "Тур 1 создан: Fairmont Package (ID: $tour1_id)\n";
    }
    
    // Тур 2: Address Package из Астаны
    $tour2_data = array(
        'post_title' => 'Address Package',
        'post_content' => 'Комфортный тур в отель Address Jabal Omar Makkah. Отличное соотношение цена-качество с размещением в центре Мекки.',
        'post_excerpt' => 'Комфортный тур в 5* отель Address с отличным расположением. Всё включено: авиабилеты, проживание, питание.',
        'post_status' => 'publish',
        'post_type' => 'post',
        'post_author' => 1,
        'post_name' => 'address-package'
    );
    
    $tour2_id = wp_insert_post($tour2_data);
    
    if ($tour2_id) {
        // ACF поля для тура 2
        update_field('price', 2200, $tour2_id);
        update_field('old_price', 2300, $tour2_id);
        update_field('duration', '3 дня в Медине · 3 дня в Мекке', $tour2_id);
        update_field('departure_city', 'astana', $tour2_id);
        update_field('pilgrimage_type', 'umrah', $tour2_id);
        update_field('tour_start_date', '2025-01-20', $tour2_id);
        update_field('tour_end_date', '2025-01-26', $tour2_id);
        update_field('rating', 9.1, $tour2_id);
        update_field('reviews_count', 89, $tour2_id);
        update_field('spots_left', 12, $tour2_id);
        update_field('hotel_mekka', 'Address Jabal Omar Makkah', $tour2_id);
        update_field('hotel_medina', 'Crowne Plaza Madinah', $tour2_id);
        update_field('distance_mekka', '100 м.', $tour2_id);
        update_field('distance_medina', '200 м.', $tour2_id);
        update_field('flight_type', 'direct', $tour2_id);
        update_field('food_type', 'all_inclusive', $tour2_id);
        update_field('transfer_type', 'bus', $tour2_id);
        
        // Особенности тура 2
        $features2 = array(
            array('feature_text' => 'Всё включено'),
            array('feature_text' => 'Прямой рейс'),
            array('feature_text' => 'Центральное расположение'),
            array('feature_text' => 'Комфортные номера')
        );
        update_field('features', $features2, $tour2_id);
        
        // Теги тура 2
        $tags2 = array(
            array('tag_text' => 'Умра'),
            array('tag_text' => 'Комфорт'),
            array('tag_text' => 'Центр города')
        );
        update_field('tags', $tags2, $tour2_id);
        
        echo "Тур 2 создан: Address Package (ID: $tour2_id)\n";
    }
    
    echo "Тестовые туры успешно созданы!\n";
}

// Запустить создание туров (раскомментируйте для запуска)
// create_test_tours();

// Или добавьте хук для запуска при активации темы
add_action('after_switch_theme', 'create_test_tours');
?>
