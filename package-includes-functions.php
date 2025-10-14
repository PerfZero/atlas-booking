<?php
/**
 * Функции для работы с услугами в пакете
 */

// Регистрируем Custom Post Type для услуг в пакете
function atlas_register_package_includes_post_type() {
    register_post_type('package_includes', array(
        'labels' => array(
            'name' => 'Что включено',
            'singular_name' => 'Услуга',
            'menu_name' => 'Что включено',
            'add_new' => 'Добавить услугу',
            'add_new_item' => 'Добавить новую услугу',
            'edit_item' => 'Редактировать услугу',
            'new_item' => 'Новая услуга',
            'view_item' => 'Просмотреть услугу',
            'search_items' => 'Поиск услуг',
            'not_found' => 'Услуги не найдены',
            'not_found_in_trash' => 'В корзине услуги не найдены',
        ),
        'public' => true,
        'has_archive' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => true,
        'show_in_rest' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'package-includes'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_position' => 8,
        'menu_icon' => 'dashicons-yes-alt',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_admin_bar' => true,
    ));
}
add_action('init', 'atlas_register_package_includes_post_type');

// Вспомогательные функции для работы с услугами в пакете
function get_package_includes_data($post_id) {
    $package_includes_ids = get_field('package_includes', $post_id);
    $package_includes_data = array();
    
    if ($package_includes_ids && is_array($package_includes_ids)) {
        foreach ($package_includes_ids as $package_include_id) {
            $package_include_post = get_post($package_include_id);
            if ($package_include_post && $package_include_post->post_type === 'package_includes') {
                $package_includes_data[] = array(
                    'id' => $package_include_id,
                    'title' => $package_include_post->post_title,
                    'description' => $package_include_post->post_content
                );
            }
        }
    }
    
    return $package_includes_data;
}

// API endpoint для получения услуг в пакете
function atlas_get_package_includes($request) {
    $package_includes = get_posts(array(
        'post_type' => 'package_includes',
        'post_status' => 'publish',
        'numberposts' => -1,
    ));
    
    $package_includes_data = array();
    
    if ($package_includes) {
        foreach ($package_includes as $package_include) {
            $package_includes_data[] = array(
                'id' => $package_include->ID,
                'title' => $package_include->post_title,
                'description' => $package_include->post_content,
                'slug' => $package_include->post_name
            );
        }
    }
    
    return $package_includes_data;
}

// Регистрируем API endpoint для услуг в пакете
function atlas_register_package_includes_api_routes() {
    register_rest_route('atlas-hajj/v1', '/package-includes', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_package_includes',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'atlas_register_package_includes_api_routes');
