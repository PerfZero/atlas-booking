<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_register_reviews_routes() {
    register_rest_route('atlas-hajj/v1', '/reviews', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_reviews',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/pilgrim-reviews', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_pilgrim_reviews',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'atlas_register_reviews_routes');

function atlas_get_reviews($request) {
    $args = array(
        'post_type' => 'post',
        'category_name' => 'reviews',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    );
    
    $query = new WP_Query($args);
    $reviews = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $reviews[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'content' => get_the_content(),
                'excerpt' => get_the_excerpt(),
                'date' => get_the_date('c'),
                'acf' => get_fields() ?: array()
            );
        }
    }
    
    wp_reset_postdata();
    
    return $reviews;
}

function atlas_get_pilgrim_reviews($request) {
    $reviews_list = get_field('reviews_list', 'option');
    $reviews = array();
    
    if ($reviews_list && is_array($reviews_list)) {
        foreach ($reviews_list as $index => $review) {
            $reviews[] = array(
                'id' => $index + 1,
                'videoId' => $review['video_id'] ?? '',
                'title' => $review['title'] ?? ''
            );
        }
    }
    
    return $reviews;
}

