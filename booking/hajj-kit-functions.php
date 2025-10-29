<?php
/**
 * Функции для работы с хадж наборами
 */

// Регистрируем Custom Post Type для хадж наборов
function atlas_register_hajj_kit_post_type() {
    register_post_type('hajj_kit', array(
        'labels' => array(
            'name' => 'Хадж наборы',
            'singular_name' => 'Хадж набор',
            'menu_name' => 'Хадж наборы',
            'add_new' => 'Добавить набор',
            'add_new_item' => 'Добавить новый набор',
            'edit_item' => 'Редактировать набор',
            'new_item' => 'Новый набор',
            'view_item' => 'Просмотреть набор',
            'search_items' => 'Поиск наборов',
            'not_found' => 'Наборы не найдены',
            'not_found_in_trash' => 'В корзине наборы не найдены',
        ),
        'public' => true,
        'has_archive' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => true,
        'show_in_rest' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'hajj-kit'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_position' => 7,
        'menu_icon' => 'dashicons-archive',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_admin_bar' => true,
    ));
}
add_action('init', 'atlas_register_hajj_kit_post_type');

// Импортируем ACF поля для хадж наборов
function atlas_import_hajj_kit_acf_fields() {
    if (!get_option('atlas_hajj_kit_acf_imported')) {
        $acf_fields = json_decode(file_get_contents(get_template_directory() . '/acf-hajj-kit-fields.json'), true);
        
        if ($acf_fields) {
            acf_add_local_field_group($acf_fields);
        }
        
        update_option('atlas_hajj_kit_acf_imported', true);
    }
}
add_action('acf/init', 'atlas_import_hajj_kit_acf_fields');

// Вспомогательные функции для работы с хадж наборами
function get_hajj_kit_data($post_id, $field_name) {
    $hajj_kit_id = get_field($field_name, $post_id);
    if ($hajj_kit_id) {
        $hajj_kit_post = get_post($hajj_kit_id);
        if ($hajj_kit_post && $hajj_kit_post->post_type === 'hajj_kit') {
            return array(
                'id' => $hajj_kit_id,
                'title' => $hajj_kit_post->post_title,
                'short_name' => get_field('short_name', $hajj_kit_id),
                'description' => get_field('description', $hajj_kit_id),
                'gender' => get_field('gender', $hajj_kit_id),
                'items' => get_field('items', $hajj_kit_id),
                'gallery' => get_field('gallery', $hajj_kit_id)
            );
        }
    }
    return null;
}

function get_hajj_kits_data($post_id) {
    $hajj_kit_ids = get_field('hajj_kits', $post_id);
    $hajj_kits_data = array();
    
    // Отладочная информация
    error_log('get_hajj_kits_data called for post_id: ' . $post_id);
    error_log('hajj_kit_ids: ' . print_r($hajj_kit_ids, true));
    
    if ($hajj_kit_ids && is_array($hajj_kit_ids)) {
        foreach ($hajj_kit_ids as $hajj_kit_id) {
            $hajj_kit_post = get_post($hajj_kit_id);
            if ($hajj_kit_post && $hajj_kit_post->post_type === 'hajj_kit') {
                $hajj_kits_data[] = array(
                    'id' => $hajj_kit_id,
                    'name' => $hajj_kit_post->post_title,
                    'short_name' => get_field('short_name', $hajj_kit_id),
                    'description' => get_field('description', $hajj_kit_id),
                    'gender' => get_field('gender', $hajj_kit_id),
                    'items' => get_field('items', $hajj_kit_id),
                    'gallery' => get_field('gallery', $hajj_kit_id)
                );
            }
        }
    }
    
    return $hajj_kits_data;
}

// API endpoint для получения хадж наборов
function atlas_get_hajj_kits($request) {
    $hajj_kits = get_posts(array(
        'post_type' => 'hajj_kit',
        'post_status' => 'publish',
        'numberposts' => -1,
    ));
    
    $hajj_kits_data = array();
    
    if ($hajj_kits) {
        foreach ($hajj_kits as $hajj_kit) {
            $hajj_kits_data[] = array(
                'id' => $hajj_kit->ID,
                'name' => $hajj_kit->post_title,
                'slug' => $hajj_kit->post_name,
                'description' => get_field('description', $hajj_kit->ID),
                'short_name' => get_field('short_name', $hajj_kit->ID),
                'gender' => get_field('gender', $hajj_kit->ID),
                'items' => get_field('items', $hajj_kit->ID),
                'gallery' => get_field('gallery', $hajj_kit->ID) ?: array()
            );
        }
    }
    
    return $hajj_kits_data;
}

// Регистрируем API endpoint для хадж наборов
function atlas_register_hajj_kit_api_routes() {
    register_rest_route('atlas-hajj/v1', '/hajj-kits', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_hajj_kits',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'atlas_register_hajj_kit_api_routes');
