<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_hotel_post_type() {
    register_post_type('hotel', array(
        'labels' => array(
            'name' => 'Отели',
            'singular_name' => 'Отель',
            'menu_name' => 'Отели',
            'add_new' => 'Добавить отель',
            'add_new_item' => 'Добавить новый отель',
            'edit_item' => 'Редактировать отель',
            'new_item' => 'Новый отель',
            'view_item' => 'Просмотреть отель',
            'search_items' => 'Поиск отелей',
            'not_found' => 'Отели не найдены',
            'not_found_in_trash' => 'В корзине отели не найдены',
        ),
        'public' => true,
        'has_archive' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => true,
        'show_in_rest' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'hotel'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_position' => 5,
        'menu_icon' => 'dashicons-building',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_admin_bar' => true,
    ));
}
add_action('init', 'atlas_register_hotel_post_type');

function atlas_hotel_post_object_result($title, $post, $field, $post_id) {
    if ($post->post_type === 'hotel') {
        $check_in = get_field('check_in', $post->ID);
        $check_out = get_field('check_out', $post->ID);
        $city = get_field('city', $post->ID);
        
        $info_parts = array();
        
        if ($city) {
            $city_name = $city === 'mekka' ? 'Мекка' : 'Медина';
            $info_parts[] = $city_name;
        }
        
        if ($check_in && $check_out) {
            $check_in_date = new DateTime($check_in);
            $check_out_date = new DateTime($check_out);
            $formatted_check_in = $check_in_date->format('d.m.Y');
            $formatted_check_out = $check_out_date->format('d.m.Y');
            $info_parts[] = $formatted_check_in . ' - ' . $formatted_check_out;
        } elseif ($check_in) {
            $check_in_date = new DateTime($check_in);
            $formatted_check_in = $check_in_date->format('d.m.Y');
            $info_parts[] = 'с ' . $formatted_check_in;
        } elseif ($check_out) {
            $check_out_date = new DateTime($check_out);
            $formatted_check_out = $check_out_date->format('d.m.Y');
            $info_parts[] = 'до ' . $formatted_check_out;
        }
        
        if (!empty($info_parts)) {
            $title .= ' (' . implode(' | ', $info_parts) . ')';
        }
    }
    return $title;
}
add_filter('acf/fields/post_object/result', 'atlas_hotel_post_object_result', 10, 4);

function atlas_hotel_admin_columns($columns) {
    $new_columns = array();
    
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        
        if ($key === 'title') {
            $new_columns['hotel_city'] = 'Город';
            $new_columns['hotel_stars'] = 'Звезды';
            $new_columns['hotel_check_in'] = 'Дата заезда';
            $new_columns['hotel_check_out'] = 'Дата выезда';
            $new_columns['hotel_rating'] = 'Рейтинг';
        }
    }
    
    return $new_columns;
}
add_filter('manage_hotel_posts_columns', 'atlas_hotel_admin_columns');

function atlas_hotel_admin_column_content($column, $post_id) {
    switch ($column) {
        case 'hotel_city':
            $city = get_field('city', $post_id);
            if ($city === 'mekka') {
                echo 'Мекка';
            } elseif ($city === 'medina') {
                echo 'Медина';
            } else {
                echo '—';
            }
            break;
            
        case 'hotel_stars':
            $stars = get_field('stars', $post_id);
            echo $stars ? $stars . ' ★' : '—';
            break;
            
        case 'hotel_check_in':
            $check_in = get_field('check_in', $post_id);
            if ($check_in) {
                $date = new DateTime($check_in);
                echo $date->format('d.m.Y');
            } else {
                echo '—';
            }
            break;
            
        case 'hotel_check_out':
            $check_out = get_field('check_out', $post_id);
            if ($check_out) {
                $date = new DateTime($check_out);
                echo $date->format('d.m.Y');
            } else {
                echo '—';
            }
            break;
            
        case 'hotel_rating':
            $rating = get_field('rating', $post_id);
            echo $rating ? $rating : '—';
            break;
    }
}
add_action('manage_hotel_posts_custom_column', 'atlas_hotel_admin_column_content', 10, 2);

function atlas_hotel_sortable_columns($columns) {
    $columns['hotel_city'] = 'city';
    $columns['hotel_stars'] = 'stars';
    $columns['hotel_check_in'] = 'check_in';
    $columns['hotel_check_out'] = 'check_out';
    $columns['hotel_rating'] = 'rating';
    return $columns;
}
add_filter('manage_edit-hotel_sortable_columns', 'atlas_hotel_sortable_columns');

function atlas_hotel_orderby($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    if ($query->get('post_type') !== 'hotel') {
        return;
    }
    
    $orderby = $query->get('orderby');
    
    if ('city' === $orderby) {
        $query->set('meta_key', 'city');
        $query->set('orderby', 'meta_value');
    } elseif ('stars' === $orderby) {
        $query->set('meta_key', 'stars');
        $query->set('orderby', 'meta_value_num');
    } elseif ('check_in' === $orderby) {
        $query->set('meta_key', 'check_in');
        $query->set('orderby', 'meta_value');
    } elseif ('check_out' === $orderby) {
        $query->set('meta_key', 'check_out');
        $query->set('orderby', 'meta_value');
    } elseif ('rating' === $orderby) {
        $query->set('meta_key', 'rating');
        $query->set('orderby', 'meta_value_num');
    }
}
add_action('pre_get_posts', 'atlas_hotel_orderby');






