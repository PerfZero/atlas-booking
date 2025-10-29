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
    // Сбрасываем импорт для обновления полей
    delete_option('atlas_flight_acf_imported');
    
    $file_path = get_template_directory() . '/acf-flight-fields.json';
    if (!file_exists($file_path)) {
        $file_path = dirname(get_template_directory()) . '/acf-flight-fields.json';
    }
    if (!file_exists($file_path)) {
        return;
    }
    $acf_fields = @json_decode(@file_get_contents($file_path), true);
    
    if ($acf_fields) {
        acf_add_local_field_group($acf_fields);
    }
    
    update_option('atlas_flight_acf_imported', true);
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

function atlas_flight_admin_columns($columns) {
    $new_columns = array();
    
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        
        if ($key === 'title') {
            $new_columns['flight_type'] = 'Тип рейса';
            $new_columns['departure_city'] = 'Город вылета';
            $new_columns['arrival_city'] = 'Город прилёта';
            $new_columns['departure_time'] = 'Время вылета';
            $new_columns['airline'] = 'Авиакомпания';
        }
    }
    
    return $new_columns;
}
add_filter('manage_flight_posts_columns', 'atlas_flight_admin_columns');

function atlas_flight_admin_column_content($column, $post_id) {
    switch ($column) {
        case 'flight_type':
            $flight_type = get_field('flight_type', $post_id);
            echo $flight_type === 'direct' ? 'Прямой' : 'С пересадкой';
            break;
            
        case 'departure_city':
            $departure_city = get_field('departure_city', $post_id);
            echo $departure_city ? $departure_city : '—';
            break;
            
        case 'arrival_city':
            $arrival_city = get_field('arrival_city', $post_id);
            echo $arrival_city ? $arrival_city : '—';
            break;
            
        case 'departure_time':
            $departure_time = get_field('departure_time', $post_id);
            if ($departure_time) {
                $date = new DateTime($departure_time);
                echo $date->format('d.m.Y H:i');
            } else {
                echo '—';
            }
            break;
            
        case 'airline':
            $airline_id = get_field('airline', $post_id);
            if ($airline_id) {
                $airline = get_term($airline_id, 'airline');
                echo $airline ? $airline->name : '—';
            } else {
                echo '—';
            }
            break;
    }
}
add_action('manage_flight_posts_custom_column', 'atlas_flight_admin_column_content', 10, 2);

function atlas_flight_sortable_columns($columns) {
    $columns['departure_time'] = 'departure_time';
    $columns['departure_city'] = 'departure_city';
    $columns['arrival_city'] = 'arrival_city';
    $columns['flight_type'] = 'flight_type';
    return $columns;
}
add_filter('manage_edit-flight_sortable_columns', 'atlas_flight_sortable_columns');

function atlas_flight_orderby($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    $orderby = $query->get('orderby');
    
    if ('departure_time' === $orderby) {
        $query->set('meta_key', 'departure_time');
        $query->set('orderby', 'meta_value');
    } elseif ('departure_city' === $orderby) {
        $query->set('meta_key', 'departure_city');
        $query->set('orderby', 'meta_value');
    } elseif ('arrival_city' === $orderby) {
        $query->set('meta_key', 'arrival_city');
        $query->set('orderby', 'meta_value');
    } elseif ('flight_type' === $orderby) {
        $query->set('meta_key', 'flight_type');
        $query->set('orderby', 'meta_value');
    }
}
add_action('pre_get_posts', 'atlas_flight_orderby');

function atlas_flight_post_object_result($title, $post, $field, $post_id) {
    if ($post->post_type === 'flight') {
        $departure_time = get_field('departure_time', $post->ID);
        if ($departure_time) {
            $date = new DateTime($departure_time);
            $formatted_date = $date->format('d.m.Y H:i');
            $departure_city = get_field('departure_city', $post->ID);
            $arrival_city = get_field('arrival_city', $post->ID);
            
            if ($departure_city && $arrival_city) {
                $title .= ' (' . $departure_city . ' → ' . $arrival_city . ' | ' . $formatted_date . ')';
            } else {
                $title .= ' (' . $formatted_date . ')';
            }
        }
    }
    return $title;
}
add_filter('acf/fields/post_object/result', 'atlas_flight_post_object_result', 10, 4);
