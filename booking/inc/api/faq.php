<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_faq_routes() {
    register_rest_route('atlas-hajj/v1', '/faq', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_faq',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'atlas_register_faq_routes');

function atlas_get_faq($request) {
    $args = array(
        'post_type' => 'post',
        'category_name' => 'faq',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    );
    
    $query = new WP_Query($args);
    $faq = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $faq[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'content' => get_the_content(),
                'excerpt' => get_the_excerpt(),
                'acf' => get_fields() ?: array()
            );
        }
    }
    
    wp_reset_postdata();
    
    return $faq;
}

