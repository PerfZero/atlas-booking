<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_partners_routes() {
    register_rest_route('atlas-hajj/v1', '/partners', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_partners',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/home-partners', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_home_partners',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'atlas_register_partners_routes');

function atlas_get_partners($request) {
    $args = array(
        'post_type' => 'post',
        'category_name' => 'partners',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    );
    
    $query = new WP_Query($args);
    $partners = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $partners[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'featured_media' => get_the_post_thumbnail_url() ?: '/air_astana.svg',
                'acf' => get_fields() ?: array()
            );
        }
    }
    
    wp_reset_postdata();
    
    return $partners;
}

function atlas_get_home_partners($request) {
    $partners_list = get_field('partners_list', 'option');
    $partners = array();
    
    if ($partners_list && is_array($partners_list)) {
        foreach ($partners_list as $index => $partner) {
            $partners[] = array(
                'id' => $index + 1,
                'logo' => $partner['logo'] ?? '',
                'name' => $partner['name'] ?? ''
            );
        }
    }
    
    return $partners;
}

