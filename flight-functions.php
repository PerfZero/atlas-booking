<?php
/**
 * Функции для работы с рейсами
 */

// Регистрируем Custom Post Type для рейсов
function atlas_register_flight_post_type() {
    register_post_type('flight', array(
        'labels' => array(
            'name' => 'Рейсы',
            'singular_name' => 'Рейс',
            'menu_name' => 'Рейсы',
            'add_new' => 'Добавить рейс',
            'add_new_item' => 'Добавить новый рейс',
            'edit_item' => 'Редактировать рейс',
            'new_item' => 'Новый рейс',
            'view_item' => 'Просмотреть рейс',
            'search_items' => 'Поиск рейсов',
            'not_found' => 'Рейсы не найдены',
            'not_found_in_trash' => 'В корзине рейсы не найдены',
        ),
        'public' => true,
        'has_archive' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => true,
        'show_in_rest' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'flight'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_position' => 9,
        'menu_icon' => 'dashicons-airplane',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_admin_bar' => true,
    ));
}
add_action('init', 'atlas_register_flight_post_type');

// Регистрируем таксономию для авиакомпаний
function atlas_register_airline_taxonomy() {
    register_taxonomy('airline', 'flight', array(
        'labels' => array(
            'name' => 'Авиакомпании',
            'singular_name' => 'Авиакомпания',
            'menu_name' => 'Авиакомпании',
            'all_items' => 'Все авиакомпании',
            'edit_item' => 'Редактировать авиакомпанию',
            'view_item' => 'Просмотреть авиакомпанию',
            'update_item' => 'Обновить авиакомпанию',
            'add_new_item' => 'Добавить новую авиакомпанию',
            'new_item_name' => 'Название новой авиакомпании',
            'search_items' => 'Поиск авиакомпаний',
            'popular_items' => 'Популярные авиакомпании',
            'separate_items_with_commas' => 'Разделить авиакомпании запятыми',
            'add_or_remove_items' => 'Добавить или удалить авиакомпании',
            'choose_from_most_used' => 'Выбрать из наиболее используемых',
            'not_found' => 'Авиакомпании не найдены',
        ),
        'public' => true,
        'publicly_queryable' => true,
        'hierarchical' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => true,
        'show_in_rest' => true,
        'show_tagcloud' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'airline'),
    ));
}
add_action('init', 'atlas_register_airline_taxonomy');

// Импортируем ACF поля для рейсов
function atlas_import_flight_acf_fields() {
    if (!get_option('atlas_flight_acf_imported')) {
        $acf_fields = json_decode(file_get_contents(get_template_directory() . '/acf-flight-fields.json'), true);
        
        if ($acf_fields) {
            acf_add_local_field_group($acf_fields);
        }
        
        update_option('atlas_flight_acf_imported', true);
    }
}
add_action('acf/init', 'atlas_import_flight_acf_fields');

// Импортируем ACF поля для авиакомпаний
function atlas_import_airline_acf_fields() {
    if (!get_option('atlas_airline_acf_imported')) {
        $acf_fields = json_decode(file_get_contents(get_template_directory() . '/acf-airline-fields.json'), true);
        
        if ($acf_fields) {
            acf_add_local_field_group($acf_fields);
        }
        
        update_option('atlas_airline_acf_imported', true);
    }
}
add_action('acf/init', 'atlas_import_airline_acf_fields');


// Получаем все рейсы
function atlas_get_flights() {
    $flights = get_posts(array(
        'post_type' => 'flight',
        'posts_per_page' => -1,
        'post_status' => 'publish',
    ));
    
    $result = array();
    foreach ($flights as $flight) {
        $result[] = get_flight_data($flight->ID);
    }
    
    return $result;
}

// Регистрируем API endpoint для рейсов
function atlas_register_flight_api_routes() {
    register_rest_route('atlas-hajj/v1', '/flights', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_flights',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'atlas_register_flight_api_routes');
