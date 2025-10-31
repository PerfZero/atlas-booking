<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_pilgrimage_taxonomy() {
    register_taxonomy(
        'pilgrimage_type',
        'post',
        array(
            'labels' => array(
                'name' => 'Типы паломничества',
                'singular_name' => 'Тип паломничества',
                'menu_name' => 'Типы паломничества',
                'all_items' => 'Все типы',
                'edit_item' => 'Редактировать тип',
                'view_item' => 'Просмотреть тип',
                'update_item' => 'Обновить тип',
                'add_new_item' => 'Добавить новый тип',
                'new_item_name' => 'Название нового типа',
                'search_items' => 'Поиск типов',
                'popular_items' => 'Популярные типы',
                'separate_items_with_commas' => 'Разделить типы запятыми',
                'add_or_remove_items' => 'Добавить или удалить типы',
                'choose_from_most_used' => 'Выбрать из наиболее используемых',
                'not_found' => 'Типы не найдены',
            ),
            'hierarchical' => true,
            'public' => true,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_nav_menus' => true,
            'show_tagcloud' => true,
            'rewrite' => array('slug' => 'pilgrimage-type'),
            'show_in_rest' => true,
        )
    );
}
add_action('init', 'atlas_register_pilgrimage_taxonomy');

function atlas_create_default_pilgrimage_types() {
    if (!get_option('atlas_pilgrimage_types_created')) {
        $default_types = array(
            'umrah' => 'Умра',
            'hajj' => 'Хадж',
            'ramadan' => 'Рамадан'
        );
        
        foreach ($default_types as $slug => $name) {
            if (!term_exists($slug, 'pilgrimage_type')) {
                wp_insert_term($name, 'pilgrimage_type', array('slug' => $slug));
            }
        }
        
        update_option('atlas_pilgrimage_types_created', true);
    }
}
add_action('after_switch_theme', 'atlas_create_default_pilgrimage_types');

