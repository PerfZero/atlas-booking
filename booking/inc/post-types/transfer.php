<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_transfer_post_type() {
    register_post_type('transfer', array(
        'labels' => array(
            'name' => 'Трансферы',
            'singular_name' => 'Трансфер',
            'menu_name' => 'Трансферы',
            'add_new' => 'Добавить трансфер',
            'add_new_item' => 'Добавить новый трансфер',
            'edit_item' => 'Редактировать трансфер',
            'new_item' => 'Новый трансфер',
            'view_item' => 'Просмотреть трансфер',
            'search_items' => 'Поиск трансферов',
            'not_found' => 'Трансферы не найдены',
            'not_found_in_trash' => 'В корзине трансферы не найдены',
        ),
        'public' => true,
        'has_archive' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => true,
        'show_in_rest' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'transfer'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_position' => 6,
        'menu_icon' => 'dashicons-car',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_admin_bar' => true,
    ));
}
add_action('init', 'atlas_register_transfer_post_type');








