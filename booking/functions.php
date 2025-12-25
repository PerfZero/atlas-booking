 <?php

    if ( ! defined( '_S_VERSION' ) ) {
        define( '_S_VERSION', '1.0.0' );
    }

    require_once get_template_directory() . '/inc/helpers/date-formatter.php';
    require_once get_template_directory() . '/inc/helpers/validators.php';
    require_once get_template_directory() . '/inc/helpers/admin-scripts.php';
    require_once get_template_directory() . '/inc/helpers/admin-bookings.php';
    require_once get_template_directory() . '/inc/helpers/admin-booking-details.php';
    require_once get_template_directory() . '/inc/helpers/admin-kaspi-test.php';
    require_once get_template_directory() . '/inc/helpers/admin-api-settings.php';
    require_once get_template_directory() . '/inc/helpers/class-auth-tokens.php';
    require_once get_template_directory() . '/inc/helpers/class-sms-codes.php';
    require_once get_template_directory() . '/inc/helpers/class-bookings.php';

    require_once get_template_directory() . '/inc/api/auth.php';
    require_once get_template_directory() . '/inc/api/faq.php';
    require_once get_template_directory() . '/inc/api/partners.php';
    require_once get_template_directory() . '/inc/api/reviews.php';
    require_once get_template_directory() . '/inc/api/kaspi-payments.php';

    require_once get_template_directory() . '/hajj-kit-functions.php';
    require_once get_template_directory() . '/package-includes-functions.php';
    require_once get_template_directory() . '/flight-functions.php';

    // Функция для получения данных рейса
    function get_flight_data($flight_id) {
        if (!$flight_id) return null;
        
        $flight = get_post($flight_id);
        if (!$flight || $flight->post_type !== 'flight') return null;
        
        $flight_type = get_field('flight_type', $flight_id);
        
        $flight_data = array(
            'id' => $flight->ID,
            'number' => $flight->post_title, // Номер рейса
            'flight_type' => $flight_type,
            'ticket_type' => get_field('ticket_type', $flight_id),
        );
        
        // Добавляем основные поля рейса (время, аэропорты) для всех типов рейсов
        // Используем get_post_meta как fallback, если get_field возвращает null из-за conditional_logic
        $flight_data['departure_airport'] = get_field('departure_airport', $flight_id) ?: get_post_meta($flight_id, 'departure_airport', true) ?: get_post_meta($flight_id, 'field_flight_departure_airport', true);
        $flight_data['departure_city'] = get_field('departure_city', $flight_id) ?: get_post_meta($flight_id, 'departure_city', true) ?: get_post_meta($flight_id, 'field_flight_departure_city', true);
        $flight_data['arrival_airport'] = get_field('arrival_airport', $flight_id) ?: get_post_meta($flight_id, 'arrival_airport', true) ?: get_post_meta($flight_id, 'field_flight_arrival_airport', true);
        $flight_data['arrival_city'] = get_field('arrival_city', $flight_id) ?: get_post_meta($flight_id, 'arrival_city', true) ?: get_post_meta($flight_id, 'field_flight_arrival_city', true);
        
        $departure_time_raw = get_field('departure_time', $flight_id) ?: get_post_meta($flight_id, 'departure_time', true) ?: get_post_meta($flight_id, 'field_flight_departure_time', true);
        $arrival_time_raw = get_field('arrival_time', $flight_id) ?: get_post_meta($flight_id, 'arrival_time', true) ?: get_post_meta($flight_id, 'field_flight_arrival_time', true);
        
        $flight_data['departure_time'] = atlas_format_time($departure_time_raw);
        $flight_data['departure_date'] = atlas_format_date_russian($departure_time_raw);
        $flight_data['arrival_time'] = atlas_format_time($arrival_time_raw);
        $flight_data['arrival_date'] = atlas_format_date_russian($arrival_time_raw);
        
        $duration_field = get_field('duration', $flight_id) ?: get_post_meta($flight_id, 'duration', true) ?: get_post_meta($flight_id, 'field_flight_duration', true);
        $flight_data['duration'] = $duration_field ?: atlas_flight_duration_calculator($departure_time_raw, $arrival_time_raw);
        
        // Добавляем авиакомпанию для всех рейсов
        $airline_id = get_field('airline', $flight_id);
        $airline = $airline_id ? get_term($airline_id, 'airline') : null;
        
        $flight_data['airline'] = $airline ? $airline->name : '';
        $flight_data['airline_logo'] = $airline ? get_field('logo', $airline) : null;
        
        // Для рейсов с пересадкой добавляем поля пересадки
        if ($flight_type === 'connecting') {
            $flight_data['connecting_airport'] = get_field('connecting_airport', $flight_id);
            $flight_data['connecting_airport_code'] = get_field('connecting_airport_code', $flight_id);
            $flight_data['connecting_wait_time'] = get_field('connecting_wait_time', $flight_id);
        }
        
        return $flight_data;
    }

    function atlas_filter_hotels_by_tour_date($args, $field, $post_id) {
        if (!in_array($field['name'], array('hotel_mekka', 'hotel_medina'))) {
            return $args;
        }
        
        if (!$post_id || get_post_type($post_id) !== 'post') {
            return $args;
        }
        
        $tour_dates = get_field('tour_dates', $post_id);
        
        if (!$tour_dates || !is_array($tour_dates) || count($tour_dates) === 0) {
            return $args;
        }
        
        $hotel_ids = array();
        
        foreach ($tour_dates as $date_range) {
            if (!isset($date_range['date_start']) || !isset($date_range['date_end'])) {
                continue;
            }
            
            $tour_date_start = $date_range['date_start'];
            $tour_date_end = $date_range['date_end'];
            
            $hotel_query_args = array(
                'post_type' => 'hotel',
                'posts_per_page' => -1,
                'post_status' => 'publish',
                'fields' => 'ids'
            );
            
            if (isset($args['post__in']) && is_array($args['post__in']) && count($args['post__in']) > 0) {
                $hotel_query_args['post__in'] = $args['post__in'];
            }
            
            $hotels_query = new WP_Query($hotel_query_args);
            
            foreach ($hotels_query->posts as $hotel_id) {
                $check_in = get_field('check_in', $hotel_id);
                
                if (!$check_in) {
                    continue;
                }
                
                $hotel_check_in = date('Y-m-d', strtotime($check_in));
                
                if ($hotel_check_in >= $tour_date_start && $hotel_check_in <= $tour_date_end) {
                    $hotel_ids[] = $hotel_id;
                }
            }
            
            wp_reset_postdata();
        }
        
        if (count($hotel_ids) > 0) {
            $args['post__in'] = array_unique($hotel_ids);
        } else {
            $args['post__in'] = array(0);
        }
        
        return $args;
    }
    
    add_filter('acf/fields/post_object/query', 'atlas_filter_hotels_by_tour_date', 10, 3);

    function booking_setup() {

        load_theme_textdomain( 'booking', get_template_directory() . '/languages' );
        
        Atlas_Auth_Tokens::create_table();
        Atlas_SMS_Codes::create_table();
        Atlas_Bookings::create_table();
        
        if (get_option('atlas_auth_tokens_migrated') !== 'yes') {
            $migration_result = Atlas_Auth_Tokens::migrate_from_options();
            if ($migration_result) {
                update_option('atlas_auth_tokens_migrated', 'yes');
                update_option('atlas_auth_tokens_migration_result', $migration_result);
            }
        }
        
        if (get_option('atlas_sms_codes_migrated') !== 'yes') {
            $migration_result = Atlas_SMS_Codes::migrate_from_options();
            if ($migration_result) {
                update_option('atlas_sms_codes_migrated', 'yes');
                update_option('atlas_sms_codes_migration_result', $migration_result);
            }
        }
        
        if (get_option('atlas_bookings_migrated') !== 'yes') {
            $migration_result = Atlas_Bookings::migrate_from_user_meta();
            if ($migration_result) {
                update_option('atlas_bookings_migrated', 'yes');
                update_option('atlas_bookings_migration_result', $migration_result);
            }
        }
        
        add_action('admin_menu', 'atlas_kaspi_admin_menu');

        add_theme_support( 'title-tag' );

        add_theme_support( 'post-thumbnails' );

        add_theme_support(
            'html5',
            array(
                'search-form',
                'comment-form',
                'comment-list',
                'gallery',
                'caption',
                'style',
                'script',
            )
        );

        add_theme_support( 'customize-selective-refresh-widgets' );
    }
    add_action( 'after_setup_theme', 'booking_setup' );

    if( function_exists('acf_add_options_page') ) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки отзывов',
            'menu_title'    => 'Отзывы',
            'menu_slug'     => 'theme-reviews-settings',
            'capability'    => 'edit_posts',
            'icon_url'      => 'dashicons-video-alt3',
            'position'      => 30,
            'redirect'      => false
        ));
        
        acf_add_options_page(array(
            'page_title'    => 'Настройки партнеров',
            'menu_title'    => 'Партнеры',
            'menu_slug'     => 'theme-partners-settings',
            'capability'    => 'edit_posts',
            'icon_url'      => 'dashicons-businessman',
            'position'      => 31,
            'redirect'      => false
        ));
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

    // Регистрируем пользовательский тип записи для отелей
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

    function atlas_posts_admin_columns($columns) {
        $new_columns = array();
        
        foreach ($columns as $key => $value) {
            $new_columns[$key] = $value;
            
            if ($key === 'title') {
                $new_columns['tour_date'] = 'Дата тура';
                $new_columns['hotel_mekka'] = 'Отель в Мекке';
                $new_columns['hotel_medina'] = 'Отель в Медине';
            }
        }
        
        return $new_columns;
    }
    add_filter('manage_posts_columns', 'atlas_posts_admin_columns');

    function atlas_posts_admin_column_content($column, $post_id) {
        switch ($column) {
            case 'tour_date':
                $tour_start_date = get_field('tour_start_date', $post_id);
                $tour_end_date = get_field('tour_end_date', $post_id);
                
                if ($tour_start_date) {
                    $start_date = new DateTime($tour_start_date);
                    if ($tour_end_date) {
                        $end_date = new DateTime($tour_end_date);
                        echo $start_date->format('d.m.Y') . ' - ' . $end_date->format('d.m.Y');
                    } else {
                        echo $start_date->format('d.m.Y');
                    }
                } else {
                    $tour_dates = get_field('tour_dates', $post_id);
                    if ($tour_dates && is_array($tour_dates) && !empty($tour_dates)) {
                        $first_date = $tour_dates[0];
                        if (isset($first_date['date_start']) && !empty($first_date['date_start'])) {
                            $start_date = new DateTime($first_date['date_start']);
                            if (isset($first_date['date_end']) && !empty($first_date['date_end'])) {
                                $end_date = new DateTime($first_date['date_end']);
                                echo $start_date->format('d.m.Y') . ' - ' . $end_date->format('d.m.Y');
                            } else {
                                echo $start_date->format('d.m.Y');
                            }
                        } else {
                            echo '—';
                        }
                    } else {
                        echo '—';
                    }
                }
                break;
                
            case 'hotel_mekka':
                $hotel_name = get_hotel_short_name($post_id, 'hotel_mekka');
                echo $hotel_name ? $hotel_name : '—';
                break;
                
            case 'hotel_medina':
                $hotel_name = get_hotel_short_name($post_id, 'hotel_medina');
                echo $hotel_name ? $hotel_name : '—';
                break;
        }
    }
    add_action('manage_posts_custom_column', 'atlas_posts_admin_column_content', 10, 2);

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




    // Вспомогательные функции для работы с трансферами
    function get_transfer_data($post_id, $field_name) {
        $transfer_id = get_field($field_name, $post_id);
        if ($transfer_id) {
            $transfer_post = get_post($transfer_id);
            if ($transfer_post && $transfer_post->post_type === 'transfer') {
                return array(
                    'id' => $transfer_id,
                    'title' => $transfer_post->post_title,
                    'short_name' => get_field('short_name', $transfer_id),
                    'description' => get_field('description', $transfer_id),
                    'gallery' => get_field('gallery', $transfer_id)
                );
            }
        }
        return null;
    }

    function get_transfer_short_name($post_id, $field_name) {
        $transfer_id = get_field($field_name, $post_id);
        if ($transfer_id) {
            $short_name = get_field('short_name', $transfer_id);
            if ($short_name) {
                return $short_name;
            }
            $transfer_post = get_post($transfer_id);
            if ($transfer_post && $transfer_post->post_type === 'transfer') {
                return $transfer_post->post_title;
            }
        }
        return null;
    }


    function get_transfer_description($post_id, $field_name) {
        $transfer_id = get_field($field_name, $post_id);
        if ($transfer_id) {
            return get_field('description', $transfer_id);
        }
        return null;
    }

    function get_transfer_gallery($post_id, $field_name) {
        $transfer_id = get_field($field_name, $post_id);
        if ($transfer_id) {
            return get_field('gallery', $transfer_id);
        }
        return null;
    }

    function get_transfers_data($post_id) {
        $transfer_ids = get_field('transfers', $post_id);
        $transfers_data = array();
        
        if (!$transfer_ids) {
            $transfer_ids = get_post_meta($post_id, 'transfers', true) ?: get_post_meta($post_id, 'field_tour_transfers', true);
        }
        
        if (!$transfer_ids) {
            return $transfers_data;
        }
        
        if (!is_array($transfer_ids)) {
            $transfer_ids = array($transfer_ids);
        }
        
        foreach ($transfer_ids as $transfer_id) {
            if (!$transfer_id) continue;
            
            $transfer_post = get_post($transfer_id);
            if ($transfer_post && $transfer_post->post_type === 'transfer') {
                $transfers_data[] = array(
                    'id' => $transfer_id,
                    'name' => $transfer_post->post_title,
                    'short_name' => get_field('short_name', $transfer_id) ?: get_post_meta($transfer_id, 'short_name', true) ?: get_post_meta($transfer_id, 'field_transfer_short_name', true),
                    'description' => get_field('description', $transfer_id) ?: get_post_meta($transfer_id, 'description', true) ?: get_post_meta($transfer_id, 'field_transfer_description', true),
                    'gallery' => get_field('gallery', $transfer_id) ?: get_post_meta($transfer_id, 'gallery', true) ?: get_post_meta($transfer_id, 'field_transfer_gallery', true)
                );
            }
        }
        
        return $transfers_data;
    }


    // Вспомогательные функции для работы с отелями
    function get_hotel_data($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            $hotel_post = get_post($hotel_id);
            if ($hotel_post && $hotel_post->post_type === 'hotel') {
                return array(
                    'id' => $hotel_id,
                    'title' => $hotel_post->post_title,
                    'accommodation_text' => get_field('accommodation_text', $hotel_id),
                    'stars' => get_field('stars', $hotel_id),
                    'hotel_text' => get_field('hotel_text', $hotel_id),
                    'short_name' => get_field('short_name', $hotel_id),
                    'full_name' => get_field('full_name', $hotel_id),
                    'description' => get_field('description', $hotel_id),
                    'rating' => get_field('rating', $hotel_id),
                    'rating_text' => get_field('rating_text', $hotel_id),
                    'city' => get_field('city', $hotel_id),
                    'amenities' => get_field('amenities', $hotel_id),
                    'gallery' => get_field('gallery', $hotel_id),
                    'rating_categories' => get_field('rating_categories', $hotel_id),
                    'logo_image' => get_field('logo_image', $hotel_id),
                    'distance_number' => get_field('distance_number', $hotel_id),
                    'distance_text' => get_field('distance_text', $hotel_id),
                    'check_in' => get_field('check_in', $hotel_id),
                    'check_out' => get_field('check_out', $hotel_id),
                    'room_type' => get_field('room_type', $hotel_id),
                    'meal_plan' => get_field('meal_plan', $hotel_id)
                );
            }
        }
        return null;
    }

    function get_hotel_accommodation_text($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('accommodation_text', $hotel_id);
        }
        return null;
    }

    function get_hotel_short_name($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            $short_name = get_field('short_name', $hotel_id);
            if ($short_name) {
                return $short_name;
            }
            // Fallback на обычное название
            $hotel_post = get_post($hotel_id);
            if ($hotel_post && $hotel_post->post_type === 'hotel') {
                return $hotel_post->post_title;
            }
        }
        return null;
    }

    function get_hotel_full_name($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            $full_name = get_field('full_name', $hotel_id);
            if ($full_name) {
                return $full_name;
            }
            // Fallback на обычное название
            $hotel_post = get_post($hotel_id);
            if ($hotel_post && $hotel_post->post_type === 'hotel') {
                return $hotel_post->post_title;
            }
        }
        return null;
    }

    function get_hotel_description($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('description', $hotel_id);
        }
        return null;
    }

    function get_hotel_rating($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('rating', $hotel_id);
        }
        return null;
    }

    function get_hotel_stars($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('stars', $hotel_id);
        }
        return null;
    }

    function get_hotel_rating_text($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('rating_text', $hotel_id);
        }
        return null;
    }

    function get_hotel_amenities($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('amenities', $hotel_id);
        }
        return null;
    }

    function get_hotel_gallery($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('gallery', $hotel_id);
        }
        return null;
    }

    function get_hotel_rating_categories($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('rating_categories', $hotel_id);
        }
        return null;
    }

    function get_hotel_logo_image($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('logo_image', $hotel_id);
        }
        return null;
    }

    function get_hotel_distance_number($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('distance_number', $hotel_id);
        }
        return null;
    }

    function get_hotel_distance_text($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('distance_text', $hotel_id);
        }
        return null;
    }


    // Функция для очистки старых данных отелей
    function atlas_clean_old_hotel_data() {
        if (get_option('atlas_hotel_data_cleaned')) {
            return;
        }
        
        // Получаем все туры
        $tours = get_posts(array(
            'post_type' => 'post',
            'numberposts' => -1,
            'post_status' => 'publish'
        ));
        
        foreach ($tours as $tour) {
            $hotel_mekka = get_field('hotel_mekka', $tour->ID);
            $hotel_medina = get_field('hotel_medina', $tour->ID);
            
            // Если поле содержит строку вместо ID, очищаем его
            if (is_string($hotel_mekka) && strpos($hotel_mekka, 'Проживание') !== false) {
                update_field('hotel_mekka', '', $tour->ID);
            }
            
            if (is_string($hotel_medina) && strpos($hotel_medina, 'Проживание') !== false) {
                update_field('hotel_medina', '', $tour->ID);
            }
        }
        
        update_option('atlas_hotel_data_cleaned', true);
    }
    add_action('init', 'atlas_clean_old_hotel_data');

    add_action('acf/save_post', 'atlas_auto_calculate_flight_duration', 20);
    function atlas_auto_calculate_flight_duration($post_id) {
        if (get_post_type($post_id) !== 'flight') {
            return;
        }
        
        $flight_type = get_field('flight_type', $post_id);
        if ($flight_type !== 'direct') {
            return;
        }
        
        $departure_time_raw = get_field('departure_time', $post_id) ?: get_post_meta($post_id, 'departure_time', true) ?: get_post_meta($post_id, 'field_flight_departure_time', true);
        $arrival_time_raw = get_field('arrival_time', $post_id) ?: get_post_meta($post_id, 'arrival_time', true) ?: get_post_meta($post_id, 'field_flight_arrival_time', true);
        
        if ($departure_time_raw && $arrival_time_raw) {
            $calculated_duration = atlas_flight_duration_calculator($departure_time_raw, $arrival_time_raw);
            if ($calculated_duration) {
                update_field('duration', $calculated_duration, $post_id);
            }
        }
    }

    // Хук для отладки сохранения полей отелей
    add_action('acf/save_post', 'debug_hotel_fields_save', 20);
    function debug_hotel_fields_save($post_id) {
        if (get_post_type($post_id) !== 'post') {
            return;
        }
        
        $hotel_mekka = get_field('hotel_mekka', $post_id);
        $hotel_medina = get_field('hotel_medina', $post_id);
        
    }





    /**
     * Enqueue scripts and styles.
     */
    function booking_scripts() {
        wp_enqueue_style( 'booking-style', get_stylesheet_uri(), array(), _S_VERSION );
        wp_style_add_data( 'booking-style', 'rtl', 'replace' );

        wp_enqueue_script( 'booking-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );

        if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
            wp_enqueue_script( 'comment-reply' );
        }
    }
    add_action( 'wp_enqueue_scripts', 'booking_scripts' );

    /**
     * Implement the Custom Header feature.
     */
    require get_template_directory() . '/inc/custom-header.php';

    /**
     * Custom template tags for this theme.
     */
    require get_template_directory() . '/inc/template-tags.php';

    /**
     * Functions which enhance the theme by hooking into WordPress.
     */
    require get_template_directory() . '/inc/template-functions.php';

    /**
     * Customizer additions.
     */
    require get_template_directory() . '/inc/customizer.php';

    /**
     * Load Jetpack compatibility file.
     */
    if ( defined( 'JETPACK__VERSION' ) ) {
        require get_template_directory() . '/inc/jetpack.php';
    }

    /**
     * Custom API endpoints for Atlas Hajj
     */

    // Добавляем поддержку CORS
    add_action('init', function() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            exit(0);
        }
    });

    // Админка для просмотра бронирований
    add_action('admin_menu', function() {
        add_menu_page(
            'Бронирования туров',
            'Бронирования',
            'manage_options',
            'atlas-bookings',
            'atlas_bookings_admin_page',
            'dashicons-calendar-alt',
            30
        );
        
        add_submenu_page(
            null,
            'Детали бронирования',
            'Детали бронирования',
            'manage_options',
            'atlas-booking-details',
            'atlas_booking_details_page'
        );
    });

    add_action('wp_ajax_atlas_delete_booking', 'atlas_delete_booking_ajax');
    function atlas_delete_booking_ajax() {
        if (!wp_verify_nonce($_POST['nonce'], 'atlas_admin_nonce')) {
            wp_die('Неверный nonce');
        }
        
        if (!current_user_can('manage_options')) {
            wp_die('Недостаточно прав');
        }
        
        $booking_id = sanitize_text_field($_POST['booking_id']);
        
        if (empty($booking_id)) {
            wp_send_json_error('Неверные параметры');
        }
        
        $result = Atlas_Bookings::delete_booking($booking_id);
        
        if ($result === false) {
            wp_send_json_error('Бронирование не найдено');
        }
        
        error_log("Бронирование удалено: booking_id=$booking_id");
        
        wp_send_json_success('Бронирование успешно удалено');
    }

    // AJAX обработчик для смены статуса бронирования
    add_action('wp_ajax_atlas_change_booking_status', 'atlas_change_booking_status_ajax');
    function atlas_change_booking_status_ajax() {
        if (!wp_verify_nonce($_POST['nonce'], 'atlas_admin_nonce')) {
            wp_die('Неверный nonce');
        }
        
        if (!current_user_can('manage_options')) {
            wp_die('Недостаточно прав');
        }
        
        $booking_id = sanitize_text_field($_POST['booking_id']);
        $new_status = sanitize_text_field($_POST['new_status']);
        
        $allowed_statuses = array('pending', 'paid', 'cancelled', 'confirmed', 'expired');
        if (!in_array($new_status, $allowed_statuses)) {
            wp_send_json_error('Неверный статус');
        }
        
        if (empty($booking_id)) {
            wp_send_json_error('Неверные параметры');
        }
        
        $booking = Atlas_Bookings::get_booking($booking_id);
        
        if (!$booking) {
            wp_send_json_error('Бронирование не найдено');
        }
        
        $result = Atlas_Bookings::update_booking_status($booking_id, $new_status);
        
        if ($result === false) {
            wp_send_json_error('Ошибка обновления статуса');
        }
        
        if (in_array($new_status, ['paid', 'confirmed'])) {
            error_log("=== АДМИНКА: Статус изменен на $new_status ===");
            $booking = Atlas_Bookings::get_booking($booking_id);
            error_log("Данные бронирования: " . print_r($booking, true));
            
            // Проверяем разные варианты расположения данных
            $tour_id = null;
            $room_type = null;
            
            // Вариант 1: в tour_data
            if (isset($booking['tour_data']['tour_id']) && isset($booking['tour_data']['roomType'])) {
                $tour_id = $booking['tour_data']['tour_id'];
                $room_type = $booking['tour_data']['roomType'];
                error_log("Найдены данные в tour_data: tour_id=$tour_id, room_type=$room_type");
            }
            // Вариант 2: в корне booking
            elseif (isset($booking['tour_id']) && isset($booking['tour_data']['roomType'])) {
                $tour_id = $booking['tour_id'];
                $room_type = $booking['tour_data']['roomType'];
                error_log("Найдены данные в корне: tour_id=$tour_id, room_type=$room_type");
            }
            
            if ($tour_id && $room_type) {
                $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
                
                error_log("Вызываем atlas_update_tour_spots: tour_id=$tour_id, room_type=$room_type, tourists_count=$tourists_count");
                
                // Обновляем количество мест (уменьшаем)
                $result = atlas_update_tour_spots($tour_id, $tourists_count, $room_type);
                error_log("Результат atlas_update_tour_spots: " . ($result ? 'SUCCESS' : 'FAILED'));
                
                // Добавляем время оплаты, если его нет
                if (!isset($user_bookings[$booking_id]['paid_at'])) {
                    $user_bookings[$booking_id]['paid_at'] = current_time('mysql');
                }
                
                error_log("Места обновлены через админку: tour_id=$tour_id, room_type=$room_type, tourists_count=$tourists_count");
            } else {
                error_log("ОШИБКА: Не найдены tour_id или roomType в данных бронирования");
                error_log("Доступные ключи в booking: " . implode(', ', array_keys($booking)));
                if (isset($booking['tour_data'])) {
                    error_log("Доступные ключи в tour_data: " . implode(', ', array_keys($booking['tour_data'])));
                }
            }
        }
        
        if (in_array($new_status, ['cancelled', 'pending'])) {
            $booking = Atlas_Bookings::get_booking($booking_id);
            if (isset($booking['tour_data']['tourists'])) {
                $tourists_count = count($booking['tour_data']['tourists']);
                $room_type = $booking['tour_data']['roomType'] ?? null;
                $tour_id = $booking['tour_id'];
                
                atlas_return_tour_spots($tour_id, $tourists_count, $room_type);
                
                error_log("Места возвращены через админку: tour_id=$tour_id, room_type=$room_type, tourists_count=$tourists_count");
            }
        }
        
        error_log("Статус бронирования изменен: booking_id=$booking_id, new_status=$new_status, changed_by=" . get_current_user_id());
        
        wp_send_json_success('Статус успешно изменен');
    }

    // Добавляем nonce и ajaxurl в админку
    add_action('admin_enqueue_scripts', 'atlas_admin_scripts');
    function atlas_admin_scripts($hook) {
        if ($hook === 'toplevel_page_atlas-bookings') {
            wp_localize_script('jquery', 'atlas_admin_ajax', array(
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('atlas_admin_nonce')
            ));
            
            // Добавляем переменные в глобальную область
            echo '<script type="text/javascript">
                var ajaxurl = "' . admin_url('admin-ajax.php') . '";
                var atlas_admin_nonce = "' . wp_create_nonce('atlas_admin_nonce') . '";
            </script>';
        }
    }

    function atlas_get_token_from_request($request) {
        $token = $request->get_header('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }
        return $token;
    }

    function atlas_require_auth($request) {
        $token = atlas_get_token_from_request($request);
        
        if (empty($token)) {
            return new WP_Error('missing_token', 'Authorization token required in header', array('status' => 401));
        }
        
        $token_data = Atlas_Auth_Tokens::verify_token($token);
        
        if (!$token_data) {
            return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
        }
        
        return true;
    }

    function atlas_require_admin() {
        return current_user_can('manage_options');
    }

    add_action('rest_api_init', function() {
        register_rest_route('atlas-hajj/v1', '/profile', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_profile',
            'permission_callback' => 'atlas_require_auth'
        ));
        
        register_rest_route('atlas-hajj/v1', '/profile', array(
            'methods' => 'PUT',
            'callback' => 'atlas_update_profile',
            'permission_callback' => 'atlas_require_auth'
        ));
        
        register_rest_route('atlas-hajj/v1', '/book-tour', array(
            'methods' => 'POST',
            'callback' => 'atlas_book_tour',
            'permission_callback' => 'atlas_require_auth'
        ));
        
        register_rest_route('atlas-hajj/v1', '/my-bookings', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_my_bookings',
            'permission_callback' => 'atlas_require_auth'
        ));
        
        register_rest_route('atlas-hajj/v1', '/search-tours', array(
            'methods' => 'GET',
            'callback' => 'atlas_search_tours',
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('atlas-hajj/v1', '/tours', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_tours',
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('atlas-hajj/v1', '/tour/(?P<slug>[a-zA-Z0-9-]+)', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_tour_by_slug',
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('atlas-hajj/v1', '/hotels', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_hotels',
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('atlas-hajj/v1', '/transfers', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_transfers',
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('atlas-hajj/v1', '/pilgrimage-types', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_pilgrimage_types',
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('atlas-hajj/v1', '/tour-dates', array(
            'methods' => 'GET',
            'callback' => 'atlas_get_tour_dates',
            'permission_callback' => '__return_true'
        ));
    });

    function atlas_get_transfers($request) {
        $args = array(
            'post_type' => 'transfer',
            'posts_per_page' => -1,
            'post_status' => 'publish'
        );
        
        $query = new WP_Query($args);
        $transfers = array();
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $transfers[] = array(
                    'id' => $post_id,
                    'name' => get_the_title(),
                    'short_name' => get_field('short_name', $post_id) ?: get_post_meta($post_id, 'short_name', true) ?: get_post_meta($post_id, 'field_transfer_short_name', true),
                    'description' => get_field('description', $post_id) ?: get_post_meta($post_id, 'description', true) ?: get_post_meta($post_id, 'field_transfer_description', true),
                    'gallery' => get_field('gallery', $post_id) ?: get_post_meta($post_id, 'gallery', true) ?: get_post_meta($post_id, 'field_transfer_gallery', true)
                );
            }
        }
        
        wp_reset_postdata();
        
        return $transfers;
    }

    function atlas_get_profile($request) {
        $token = $request->get_header('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }
        
        if (empty($token)) {
            return new WP_Error('missing_token', 'Authorization token required', array('status' => 401));
        }
        
        $token_data = Atlas_Auth_Tokens::verify_token($token);
        
        if (!$token_data) {
            return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
        }
        
        $user = get_user_by('ID', $token_data['user_id']);
        
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        $phone = get_user_meta($user->ID, 'phone', true);
        
        $profile_data = array(
            'id' => $user->ID,
            'phone' => $phone,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'created_at' => $user->user_registered,
            'birth_date' => get_user_meta($user->ID, 'atlas_birth_date', true),
            'gender' => get_user_meta($user->ID, 'atlas_gender', true),
            'iin' => get_user_meta($user->ID, 'atlas_iin', true),
            'passport_number' => get_user_meta($user->ID, 'atlas_passport_number', true),
            'passport_issue_date' => get_user_meta($user->ID, 'atlas_passport_issue_date', true),
            'passport_expiry_date' => get_user_meta($user->ID, 'atlas_passport_expiry_date', true)
        );
        
        return array(
            'success' => true,
            'profile' => $profile_data
        );
    }

    function atlas_update_profile($request) {
        $token = $request->get_header('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }
        
        if (empty($token)) {
            return new WP_Error('missing_token', 'Authorization token required', array('status' => 401));
        }
        
        $token_data = Atlas_Auth_Tokens::verify_token($token);
        
        if (!$token_data) {
            return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
        }
        
        $user = get_user_by('ID', $token_data['user_id']);
        
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        $params = $request->get_params();
        
        // Обновляем основные данные пользователя
        $user_data = array('ID' => $user->ID);
        
        if (!empty($params['first_name'])) {
            $user_data['first_name'] = sanitize_text_field($params['first_name']);
        }
        
        if (!empty($params['last_name'])) {
            $user_data['last_name'] = sanitize_text_field($params['last_name']);
        }
        
        if (!empty($params['name'])) {
            $user_data['display_name'] = sanitize_text_field($params['name']);
        }
        
        if (!empty($user_data)) {
            wp_update_user($user_data);
        }
        
        // Обновляем дополнительные поля
        $meta_fields = array(
            'birth_date', 'gender', 'iin', 'passport_number', 
            'passport_issue_date', 'passport_expiry_date'
        );
        
        foreach ($meta_fields as $field) {
            if (isset($params[$field])) {
                update_user_meta($user->ID, 'atlas_' . $field, sanitize_text_field($params[$field]));
            }
        }
        
        return array(
            'success' => true,
            'message' => 'Profile updated successfully'
        );
    }

    function atlas_get_tours($request) {
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'meta_query' => array(
                array(
                    'key' => 'price',
                    'compare' => 'EXISTS'
                )
            )
        );
        
        $query = new WP_Query($args);
        $tours = array();
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $tours[] = array(
                    'id' => $post_id,
                    'name' => get_the_title(),
                    'slug' => get_post_field('post_name'),
                    'excerpt' => get_the_excerpt(),
                    'content' => get_the_content(),
                    'featured_image' => get_the_post_thumbnail_url($post_id, 'full'),
                    'price' => get_field('price', $post_id),
                    'old_price' => get_field('old_price', $post_id),
                    'duration' => get_field('duration', $post_id),
                    'departure_city' => get_field('departure_city', $post_id),
                    'pilgrimage_type' => wp_get_post_terms($post_id, 'pilgrimage_type', array('fields' => 'slugs'))[0] ?? null,
                    'tour_dates' => get_field('tour_dates', $post_id),
                    'rating' => get_field('rating', $post_id),
                    'reviews_count' => get_field('reviews_count', $post_id),
                    'spots_left' => get_field('spots_left', $post_id),
                    'pilgrims_choice' => get_field('pilgrims_choice', $post_id),
                    'all_inclusive' => get_field('all_inclusive', $post_id),
                    'flight_type' => get_field('flight_type', $post_id),
                    'features' => get_field('features', $post_id),
                    'hotel_mekka' => get_hotel_short_name($post_id, 'hotel_mekka'),
                    'hotel_medina' => get_hotel_short_name($post_id, 'hotel_medina'),
                    'hotel_mekka_accommodation_text' => get_hotel_accommodation_text($post_id, 'hotel_mekka'),
                    'hotel_medina_accommodation_text' => get_hotel_accommodation_text($post_id, 'hotel_medina'),
                    'hotel_mekka_short_name' => get_hotel_short_name($post_id, 'hotel_mekka'),
                    'hotel_medina_short_name' => get_hotel_short_name($post_id, 'hotel_medina'),
                    'hotel_mekka_full_name' => get_hotel_full_name($post_id, 'hotel_mekka'),
                    'hotel_medina_full_name' => get_hotel_full_name($post_id, 'hotel_medina'),
                    'flight_type' => get_field('flight_type', $post_id),
                    
                    // Новые поля для детальной страницы
                    'tags' => get_field('tags', $post_id),
                    'gallery' => get_field('gallery', $post_id),
                    
                    
                    // Детали отелей
                    'hotel_mekka_details' => array(
                        'stars' => get_hotel_stars($post_id, 'hotel_mekka'),
                        'description' => get_hotel_description($post_id, 'hotel_mekka'),
                        'rating' => get_hotel_rating($post_id, 'hotel_mekka'),
                        'rating_text' => get_hotel_rating_text($post_id, 'hotel_mekka'),
                        'rating_categories' => get_hotel_rating_categories($post_id, 'hotel_mekka'),
                        'amenities' => get_hotel_amenities($post_id, 'hotel_mekka'),
                        'check_in' => get_hotel_check_in($post_id, 'hotel_mekka'),
                        'check_out' => get_hotel_check_out($post_id, 'hotel_mekka'),
                        'room_type' => get_hotel_room_type($post_id, 'hotel_mekka'),
                        'meal_plan' => get_hotel_meal_plan($post_id, 'hotel_mekka'),
                        'gallery' => get_hotel_gallery($post_id, 'hotel_mekka'),
                        'logo_image' => get_hotel_logo_image($post_id, 'hotel_mekka'),
                        'distance_number' => get_hotel_distance_number($post_id, 'hotel_mekka'),
                        'distance_text' => get_hotel_distance_text($post_id, 'hotel_mekka')
                    ),
                    'hotel_medina_details' => array(
                        'stars' => get_hotel_stars($post_id, 'hotel_medina'),
                        'description' => get_hotel_description($post_id, 'hotel_medina'),
                        'rating' => get_hotel_rating($post_id, 'hotel_medina'),
                        'rating_text' => get_hotel_rating_text($post_id, 'hotel_medina'),
                        'rating_categories' => get_hotel_rating_categories($post_id, 'hotel_medina'),
                        'amenities' => get_hotel_amenities($post_id, 'hotel_medina'),
                        'check_in' => get_hotel_check_in($post_id, 'hotel_medina'),
                        'check_out' => get_hotel_check_out($post_id, 'hotel_medina'),
                        'room_type' => get_hotel_room_type($post_id, 'hotel_medina'),
                        'meal_plan' => get_hotel_meal_plan($post_id, 'hotel_medina'),
                        'gallery' => get_hotel_gallery($post_id, 'hotel_medina'),
                        'logo_image' => get_hotel_logo_image($post_id, 'hotel_medina'),
                        'distance_number' => get_hotel_distance_number($post_id, 'hotel_medina'),
                        'distance_text' => get_hotel_distance_text($post_id, 'hotel_medina')
                    ),
                    
                    // Трансферы
                    'transfers' => get_transfers_data($post_id),
                    
                    // Хадж наборы
                    'hajj_kits' => get_hajj_kits_data($post_id),
                    
                    // Варианты размещения
                    'room_options' => get_field('room_options', $post_id),
                    
                    // Что включено в пакет
                    'package_includes' => get_package_includes_data($post_id),
                    
                    // Хадж наборы
                    'hajj_kits' => get_hajj_kits_data($post_id),
                    
                    // Отзывы паломников
                    'reviews' => get_field('reviews', $post_id)
                );
            }
        }
        
        wp_reset_postdata();
        
        return $tours;
    }

    function atlas_get_tour_dates($request) {
        $departure_city = $request->get_param('departure_city');
        $pilgrimage_type = $request->get_param('pilgrimage_type');
        
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'meta_query' => array(
                array(
                    'key' => 'price',
                    'compare' => 'EXISTS'
                )
            )
        );
        
        if ($departure_city && $departure_city !== 'all') {
            $args['meta_query'][] = array(
                'key' => 'departure_city',
                'value' => $departure_city,
                'compare' => '='
            );
        }
        
        if ($pilgrimage_type && $pilgrimage_type !== 'all') {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'pilgrimage_type',
                    'field' => 'slug',
                    'terms' => $pilgrimage_type
                )
            );
        }
        
        $query = new WP_Query($args);
        $dates = array();
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $tour_dates = get_field('tour_dates', $post_id);
                
                if ($tour_dates && is_array($tour_dates) && count($tour_dates) > 0) {
                    $dates[] = array(
                        'id' => $post_id,
                        'tour_dates' => $tour_dates
                    );
                }
            }
        }
        
        wp_reset_postdata();
        
        return $dates;
    }

    function atlas_get_tour_by_slug($request) {
        $slug = $request['slug'];
        
        $args = array(
            'post_type' => 'post',
            'name' => $slug,
            'post_status' => 'publish'
        );
        
        $query = new WP_Query($args);
        
        if ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            $tour = array(
                'id' => $post_id,
                'name' => get_the_title(),
                'slug' => get_post_field('post_name'),
                'excerpt' => get_the_excerpt(),
                'content' => get_the_content(),
                'featured_image' => get_the_post_thumbnail_url($post_id, 'full'),
                'price' => get_field('price', $post_id),
                'old_price' => get_field('old_price', $post_id),
                'duration' => get_field('duration', $post_id),
                'departure_city' => get_field('departure_city', $post_id),
                'pilgrimage_type' => wp_get_post_terms($post_id, 'pilgrimage_type', array('fields' => 'slugs')),
                'tour_dates' => get_field('tour_dates', $post_id),
                'rating' => get_field('rating', $post_id),
                'reviews_count' => get_field('reviews_count', $post_id),
                'spots_left' => get_field('spots_left', $post_id),
                'pilgrims_choice' => get_field('pilgrims_choice', $post_id),
                'all_inclusive' => get_field('all_inclusive', $post_id),
                'flight_type' => get_field('flight_type', $post_id),
                'features' => get_field('features', $post_id),
                    'hotel_mekka' => get_hotel_data($post_id, 'hotel_mekka'),
                    'hotel_medina' => get_hotel_data($post_id, 'hotel_medina'),
                    'transfers' => get_transfers_data($post_id),
                'transfer_type' => get_field('transfer_type', $post_id),
                
                // Новые поля для детальной страницы
                'tags' => get_field('tags', $post_id),
                'gallery' => get_field('gallery', $post_id),
                
                
                // Детали отелей
                'hotel_mekka_details' => array(
                    'stars' => get_hotel_stars($post_id, 'hotel_mekka'),
                    'description' => get_hotel_description($post_id, 'hotel_mekka'),
                    'rating' => get_hotel_rating($post_id, 'hotel_mekka'),
                    'rating_text' => get_hotel_rating_text($post_id, 'hotel_mekka'),
                    'rating_categories' => get_hotel_rating_categories($post_id, 'hotel_mekka'),
                    'amenities' => get_hotel_amenities($post_id, 'hotel_mekka'),
                    'check_in' => get_hotel_check_in($post_id, 'hotel_mekka'),
                    'check_out' => get_hotel_check_out($post_id, 'hotel_mekka'),
                    'room_type' => get_hotel_room_type($post_id, 'hotel_mekka'),
                    'meal_plan' => get_hotel_meal_plan($post_id, 'hotel_mekka'),
                    'gallery' => get_hotel_gallery($post_id, 'hotel_mekka')
                ),
                'hotel_medina_details' => array(
                    'stars' => get_hotel_stars($post_id, 'hotel_medina'),
                    'description' => get_hotel_description($post_id, 'hotel_medina'),
                    'rating' => get_hotel_rating($post_id, 'hotel_medina'),
                    'rating_text' => get_hotel_rating_text($post_id, 'hotel_medina'),
                    'rating_categories' => get_hotel_rating_categories($post_id, 'hotel_medina'),
                    'amenities' => get_hotel_amenities($post_id, 'hotel_medina'),
                    'check_in' => get_hotel_check_in($post_id, 'hotel_medina'),
                    'check_out' => get_hotel_check_out($post_id, 'hotel_medina'),
                    'room_type' => get_hotel_room_type($post_id, 'hotel_medina'),
                    'meal_plan' => get_hotel_meal_plan($post_id, 'hotel_medina'),
                    'gallery' => get_hotel_gallery($post_id, 'hotel_medina')
                ),
                
                // Варианты размещения
                'room_options' => get_field('room_options', $post_id),
                
                // Что включено в пакет
                'package_includes' => get_package_includes_data($post_id),
                
                // Хадж наборы
                'hajj_kits' => get_hajj_kits_data($post_id),
                
                // Услуги
                'services' => get_field('services', $post_id) ?: [],
                
                // Тип трансфера
                'transfer_type' => get_field('transfer_type', $post_id),
                
            // Отзывы паломников
            'reviews' => get_field('reviews', $post_id),
            
            // Рейсы
            'flight_type' => get_field('flight_type', $post_id),
            'flight_outbound' => get_field('flight_outbound', $post_id) ? get_flight_data(get_field('flight_outbound', $post_id)) : null,
            'flight_inbound' => get_field('flight_inbound', $post_id) ? get_flight_data(get_field('flight_inbound', $post_id)) : null,
            'flight_outbound_connecting' => get_field('flight_outbound_connecting_before', $post_id) ? get_flight_data(get_field('flight_outbound_connecting_before', $post_id)) : (get_field('flight_outbound_connecting', $post_id) ? get_flight_data(get_field('flight_outbound_connecting', $post_id)) : null),
            'flight_connecting' => get_field('flight_connecting_outbound', $post_id) ? get_flight_data(get_field('flight_connecting_outbound', $post_id)) : (get_field('flight_connecting', $post_id) ? get_flight_data(get_field('flight_connecting', $post_id)) : null),
            'flight_outbound_connecting_after' => get_field('flight_outbound_connecting_after', $post_id) ? get_flight_data(get_field('flight_outbound_connecting_after', $post_id)) : null,
            'flight_inbound_connecting' => get_field('flight_inbound_connecting_before', $post_id) ? get_flight_data(get_field('flight_inbound_connecting_before', $post_id)) : (get_field('flight_inbound_connecting', $post_id) ? get_flight_data(get_field('flight_inbound_connecting', $post_id)) : null),
            'flight_connecting_inbound' => get_field('flight_connecting_inbound', $post_id) ? get_flight_data(get_field('flight_connecting_inbound', $post_id)) : null,
            'flight_inbound_connecting_after' => get_field('flight_inbound_connecting_after', $post_id) ? get_flight_data(get_field('flight_inbound_connecting_after', $post_id)) : null,
            
            // Отдельные поля отелей для совместимости с фронтендом
            'hotel_mekka_accommodation_text' => get_hotel_accommodation_text($post_id, 'hotel_mekka'),
                'hotel_mekka_short_name' => get_hotel_short_name($post_id, 'hotel_mekka'),
                'hotel_mekka_full_name' => get_hotel_full_name($post_id, 'hotel_mekka'),
                
                'hotel_medina_accommodation_text' => get_hotel_accommodation_text($post_id, 'hotel_medina'),
                'hotel_medina_short_name' => get_hotel_short_name($post_id, 'hotel_medina'),
                'hotel_medina_full_name' => get_hotel_full_name($post_id, 'hotel_medina')
            );
            
            wp_reset_postdata();
            return $tour;
        }
        
        return new WP_Error('not_found', 'Tour not found', array('status' => 404));
    }

    function atlas_get_pilgrimage_types($request) {
        $terms = get_terms(array(
            'taxonomy' => 'pilgrimage_type',
            'hide_empty' => false,
        ));
        
        if (is_wp_error($terms)) {
            return array(
                'success' => false,
                'message' => $terms->get_error_message(),
                'pilgrimage_types' => array()
            );
        }
        
        $pilgrimage_types = array();
        
        foreach ($terms as $term) {
            $pilgrimage_types[] = array(
                'id' => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
                'description' => $term->description,
                'count' => $term->count
            );
        }
        
        return array(
            'success' => true,
            'pilgrimage_types' => $pilgrimage_types
        );
    }

    function atlas_search_tours($request) {
        $departure_city = $request->get_param('departure_city');
        $pilgrimage_type = $request->get_param('pilgrimage_type');
        $start_date = $request->get_param('start_date');
        $end_date = $request->get_param('end_date');
        $min_price = $request->get_param('min_price');
        $max_price = $request->get_param('max_price');
        $sort_by = $request->get_param('sort_by');
        
        $flight_type = $request->get_param('flight_type');
        $ticket_type = $request->get_param('ticket_type');
        $food_types = $request->get_param('food_types');
        $transfer_ids = $request->get_param('transfer_ids');
        $mekka_hotel_stars = $request->get_param('mekka_hotel_stars');
        $medina_hotel_stars = $request->get_param('medina_hotel_stars');
        $mekka_distance_min = $request->get_param('mekka_distance_min');
        $mekka_distance_max = $request->get_param('mekka_distance_max');
        $medina_distance_min = $request->get_param('medina_distance_min');
        $medina_distance_max = $request->get_param('medina_distance_max');
        
        $args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'meta_query' => array(),
            'tax_query' => array()
        );
        
        if ($departure_city && $departure_city !== 'all') {
            $args['meta_query'][] = array(
                'key' => 'departure_city',
                'value' => $departure_city,
                'compare' => '='
            );
        }
        
        if ($pilgrimage_type && $pilgrimage_type !== 'all') {
            $args['tax_query'][] = array(
                'taxonomy' => 'pilgrimage_type',
                'field' => 'slug',
                'terms' => $pilgrimage_type
            );
        }
        
        if ($min_price || $max_price) {
            $price_query = array('key' => 'price');
            if ($min_price) $price_query['value'] = $min_price;
            if ($max_price) $price_query['value'] = $max_price;
            if ($min_price && $max_price) {
                $price_query['value'] = array($min_price, $max_price);
                $price_query['type'] = 'NUMERIC';
                $price_query['compare'] = 'BETWEEN';
            } else if ($min_price) {
                $price_query['compare'] = '>=';
                $price_query['type'] = 'NUMERIC';
            } else {
                $price_query['compare'] = '<=';
                $price_query['type'] = 'NUMERIC';
            }
            $args['meta_query'][] = $price_query;
        }
        
        // Поиск по датам теперь будет обрабатываться в PHP после получения туров
        // так как даты теперь хранятся в repeater поле
        
        $query = new WP_Query($args);
        $tours = array();
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                
                        $tour = array(
                'id' => $post_id,
                'name' => get_the_title(),
                'slug' => get_post_field('post_name'),
                'excerpt' => get_the_excerpt(),
                'content' => get_the_content(),
                'featured_image' => get_the_post_thumbnail_url($post_id, 'full'),
                'price' => get_field('price', $post_id),
                'old_price' => get_field('old_price', $post_id),
                'duration' => get_field('duration', $post_id),
                'departure_city' => get_field('departure_city', $post_id),
                'pilgrimage_type' => wp_get_post_terms($post_id, 'pilgrimage_type', array('fields' => 'slugs')),
                'tour_dates' => get_field('tour_dates', $post_id),
                'rating' => get_field('rating', $post_id),
                'reviews_count' => get_field('reviews_count', $post_id),
                'spots_left' => get_field('spots_left', $post_id),
                'pilgrims_choice' => get_field('pilgrims_choice', $post_id),
                'all_inclusive' => get_field('all_inclusive', $post_id),
                'flight_type' => get_field('flight_type', $post_id),
                'features' => get_field('features', $post_id),
                    'hotel_mekka' => get_hotel_data($post_id, 'hotel_mekka'),
                    'hotel_medina' => get_hotel_data($post_id, 'hotel_medina'),
                    'transfers' => get_transfers_data($post_id),
                'transfer_type' => get_field('transfer_type', $post_id),
                
                // Новые поля для детальной страницы
                'tags' => get_field('tags', $post_id),
                'gallery' => get_field('gallery', $post_id),
                
                
                // Детали отелей
                'hotel_mekka_details' => array(
                    'stars' => get_hotel_stars($post_id, 'hotel_mekka'),
                    'description' => get_hotel_description($post_id, 'hotel_mekka'),
                    'rating' => get_hotel_rating($post_id, 'hotel_mekka'),
                    'rating_text' => get_hotel_rating_text($post_id, 'hotel_mekka'),
                    'rating_categories' => get_hotel_rating_categories($post_id, 'hotel_mekka'),
                    'amenities' => get_hotel_amenities($post_id, 'hotel_mekka'),
                    'check_in' => get_hotel_check_in($post_id, 'hotel_mekka'),
                    'check_out' => get_hotel_check_out($post_id, 'hotel_mekka'),
                    'room_type' => get_hotel_room_type($post_id, 'hotel_mekka'),
                    'meal_plan' => get_hotel_meal_plan($post_id, 'hotel_mekka'),
                    'gallery' => get_hotel_gallery($post_id, 'hotel_mekka')
                ),
                'hotel_medina_details' => array(
                    'stars' => get_hotel_stars($post_id, 'hotel_medina'),
                    'description' => get_hotel_description($post_id, 'hotel_medina'),
                    'rating' => get_hotel_rating($post_id, 'hotel_medina'),
                    'rating_text' => get_hotel_rating_text($post_id, 'hotel_medina'),
                    'rating_categories' => get_hotel_rating_categories($post_id, 'hotel_medina'),
                    'amenities' => get_hotel_amenities($post_id, 'hotel_medina'),
                    'check_in' => get_hotel_check_in($post_id, 'hotel_medina'),
                    'check_out' => get_hotel_check_out($post_id, 'hotel_medina'),
                    'room_type' => get_hotel_room_type($post_id, 'hotel_medina'),
                    'meal_plan' => get_hotel_meal_plan($post_id, 'hotel_medina'),
                    'gallery' => get_hotel_gallery($post_id, 'hotel_medina')
                ),
                
                // Варианты размещения
                'room_options' => get_field('room_options', $post_id),
                
                // Что включено в пакет
                'package_includes' => get_package_includes_data($post_id),
                
                // Хадж набор
                'hajj_kits' => get_hajj_kits_data($post_id),
                
                // Рейсы
                'flight_outbound' => get_field('flight_outbound', $post_id) ? get_flight_data(get_field('flight_outbound', $post_id)) : null,
                'flight_inbound' => get_field('flight_inbound', $post_id) ? get_flight_data(get_field('flight_inbound', $post_id)) : null,
                'flight_outbound_connecting' => get_field('flight_outbound_connecting_before', $post_id) ? get_flight_data(get_field('flight_outbound_connecting_before', $post_id)) : (get_field('flight_outbound_connecting', $post_id) ? get_flight_data(get_field('flight_outbound_connecting', $post_id)) : null),
                'flight_connecting' => get_field('flight_connecting_outbound', $post_id) ? get_flight_data(get_field('flight_connecting_outbound', $post_id)) : (get_field('flight_connecting', $post_id) ? get_flight_data(get_field('flight_connecting', $post_id)) : null),
                'flight_outbound_connecting_after' => get_field('flight_outbound_connecting_after', $post_id) ? get_flight_data(get_field('flight_outbound_connecting_after', $post_id)) : null,
                'flight_inbound_connecting' => get_field('flight_inbound_connecting_before', $post_id) ? get_flight_data(get_field('flight_inbound_connecting_before', $post_id)) : (get_field('flight_inbound_connecting', $post_id) ? get_flight_data(get_field('flight_inbound_connecting', $post_id)) : null),
                'flight_connecting_inbound' => get_field('flight_connecting_inbound', $post_id) ? get_flight_data(get_field('flight_connecting_inbound', $post_id)) : null,
                'flight_inbound_connecting_after' => get_field('flight_inbound_connecting_after', $post_id) ? get_flight_data(get_field('flight_inbound_connecting_after', $post_id)) : null
            );
                
                $tours[] = $tour;
            }
        }
        
        wp_reset_postdata();
        
        // Фильтрация по датам (если указаны)
        if ($start_date || $end_date) {
            $filtered_tours = array();
            foreach ($tours as $tour) {
                if (isset($tour['tour_dates']) && is_array($tour['tour_dates'])) {
                    foreach ($tour['tour_dates'] as $date_range) {
                        if (isset($date_range['date_start']) && isset($date_range['date_end'])) {
                            $tour_start_str = $date_range['date_start'];
                            $tour_end_str = $date_range['date_end'];
                            
                            $tour_start_ts = strtotime($tour_start_str);
                            $tour_end_ts = strtotime($tour_end_str);
                            
                            if ($tour_start_ts === false || $tour_end_ts === false) {
                                continue;
                            }
                            
                            $matches = false;
                            
                            if ($start_date && $end_date) {
                                $start_ts = strtotime($start_date);
                                $end_ts = strtotime($end_date);
                                if ($start_ts !== false && $end_ts !== false) {
                                    $matches = ($tour_start_ts == $start_ts && $tour_end_ts == $end_ts);
                                }
                            } elseif ($start_date) {
                                $start_ts = strtotime($start_date);
                                if ($start_ts !== false) {
                                    $matches = ($tour_start_ts >= $start_ts);
                                }
                            } elseif ($end_date) {
                                $end_ts = strtotime($end_date);
                                if ($end_ts !== false) {
                                    $matches = ($tour_end_ts <= $end_ts);
                                }
                            }
                            
                            if ($matches) {
                                $filtered_tours[] = $tour;
                                break;
                            }
                        }
                    }
                }
            }
            $tours = $filtered_tours;
        }
        
        $filtered_tours = array();
        foreach ($tours as $tour) {
            $matches = true;
            
            if ($flight_type && isset($tour['flight_type'])) {
                if ($tour['flight_type'] !== $flight_type) {
                    $matches = false;
                }
            }
            
            if ($ticket_type && $matches) {
                $ticket_types_array = is_array($ticket_type) ? $ticket_type : explode(',', $ticket_type);
                $tour_ticket_types = array();
                if (isset($tour['flight_outbound']['ticket_type'])) {
                    $tour_ticket_types[] = $tour['flight_outbound']['ticket_type'];
                }
                if (isset($tour['flight_inbound']['ticket_type'])) {
                    $tour_ticket_types[] = $tour['flight_inbound']['ticket_type'];
                }
                $has_matching_ticket = false;
                foreach ($ticket_types_array as $ticket_type_item) {
                    if (in_array($ticket_type_item, $tour_ticket_types)) {
                        $has_matching_ticket = true;
                        break;
                    }
                }
                if (!$has_matching_ticket) {
                    $matches = false;
                }
            }
            
            if ($food_types && $matches) {
                $food_types_array = is_array($food_types) ? $food_types : explode(',', $food_types);
                $tour_meal_plans = array();
                if (isset($tour['hotel_mekka_details']['meal_plan'])) {
                    $tour_meal_plans[] = $tour['hotel_mekka_details']['meal_plan'];
                }
                if (isset($tour['hotel_medina_details']['meal_plan'])) {
                    $tour_meal_plans[] = $tour['hotel_medina_details']['meal_plan'];
                }
                $has_matching_food = false;
                foreach ($food_types_array as $food_type) {
                    if (in_array($food_type, $tour_meal_plans)) {
                        $has_matching_food = true;
                        break;
                    }
                }
                if (!$has_matching_food) {
                    $matches = false;
                }
            }
            
            if ($transfer_ids && $matches) {
                $transfer_ids_array = is_array($transfer_ids) ? $transfer_ids : explode(',', $transfer_ids);
                $tour_transfer_ids = array();
                if (isset($tour['transfers']) && is_array($tour['transfers'])) {
                    foreach ($tour['transfers'] as $transfer) {
                        if (isset($transfer['id'])) {
                            $tour_transfer_ids[] = $transfer['id'];
                        }
                    }
                }
                $has_matching_transfer = false;
                foreach ($transfer_ids_array as $transfer_id) {
                    if (in_array(intval($transfer_id), $tour_transfer_ids)) {
                        $has_matching_transfer = true;
                        break;
                    }
                }
                if (!$has_matching_transfer) {
                    $matches = false;
                }
            }
            
            if ($mekka_hotel_stars && $matches) {
                $mekka_stars_array = is_array($mekka_hotel_stars) ? $mekka_hotel_stars : explode(',', $mekka_hotel_stars);
                $tour_mekka_stars = isset($tour['hotel_mekka_details']['stars']) ? $tour['hotel_mekka_details']['stars'] : null;
                if (!in_array($tour_mekka_stars, $mekka_stars_array)) {
                    $matches = false;
                }
            }
            
            if ($medina_hotel_stars && $matches) {
                $medina_stars_array = is_array($medina_hotel_stars) ? $medina_hotel_stars : explode(',', $medina_hotel_stars);
                $tour_medina_stars = isset($tour['hotel_medina_details']['stars']) ? $tour['hotel_medina_details']['stars'] : null;
                if (!in_array($tour_medina_stars, $medina_stars_array)) {
                    $matches = false;
                }
            }
            
            if (($mekka_distance_min || $mekka_distance_max) && $matches) {
                $distance_str = isset($tour['hotel_mekka']['distance_number']) ? $tour['hotel_mekka']['distance_number'] : '';
                if ($distance_str) {
                    $distance = floatval(preg_replace('/[^\d.]/', '', $distance_str));
                    if ($mekka_distance_min && $distance < floatval($mekka_distance_min)) {
                        $matches = false;
                    }
                    if ($mekka_distance_max && $distance > floatval($mekka_distance_max)) {
                        $matches = false;
                    }
                } else {
                    $matches = false;
                }
            }
            
            if (($medina_distance_min || $medina_distance_max) && $matches) {
                $distance_str = isset($tour['hotel_medina']['distance_number']) ? $tour['hotel_medina']['distance_number'] : '';
                if ($distance_str) {
                    $distance = floatval(preg_replace('/[^\d.]/', '', $distance_str));
                    if ($medina_distance_min && $distance < floatval($medina_distance_min)) {
                        $matches = false;
                    }
                    if ($medina_distance_max && $distance > floatval($medina_distance_max)) {
                        $matches = false;
                    }
                } else {
                    $matches = false;
                }
            }
            
            if ($matches) {
                $filtered_tours[] = $tour;
            }
        }
        $tours = $filtered_tours;
        
        if ($sort_by) {
            switch ($sort_by) {
                case 'price-low':
                    usort($tours, function($a, $b) {
                        return floatval($a['price']) - floatval($b['price']);
                    });
                    break;
                case 'price-high':
                    usort($tours, function($a, $b) {
                        return floatval($b['price']) - floatval($a['price']);
                    });
                    break;
                case 'rating':
                    usort($tours, function($a, $b) {
                        return floatval($b['rating']) - floatval($a['rating']);
                    });
                    break;
            }
        }
        
        return array(
            'success' => true,
            'tours' => $tours,
            'total' => count($tours)
        );
    }

    function atlas_book_tour($request) {
        $params = $request->get_params();
        $token = atlas_get_token_from_request($request);
        $tour_id = intval($params['tour_id'] ?? 0);
        $tour_data = $params['tour_data'] ?? array();
        
        if (empty($tour_id)) {
            return new WP_Error('missing_params', 'tour_id is required', array('status' => 400));
        }
        
        $token_data = Atlas_Auth_Tokens::verify_token($token);
        
        if (!$token_data) {
            return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
        }
        
        $user_id = $token_data['user_id'];
        
        $tour = get_post($tour_id);
        
        if (!$tour) {
            return new WP_Error('tour_not_found', 'Tour not found', array('status' => 404));
        }
        
        // Получаем полные данные о туре для бронирования
        $full_tour_data = array(
            'hotel_mekka' => get_hotel_short_name($tour_id, 'hotel_mekka'),
            'hotel_medina' => get_hotel_short_name($tour_id, 'hotel_medina'),
            'duration' => get_field('duration', $tour_id),
            'price' => $tour_data['price'] ?? get_field('price', $tour_id), // Используем цену из tour_data или ACF поле
            'tour_dates' => get_field('tour_dates', $tour_id)
        );
        
        $combined_tour_data = array_merge($full_tour_data, $tour_data);
        
        if (isset($tour_data['tourists']) && is_array($tour_data['tourists']) && count($tour_data['tourists']) > 0) {
            $first_tourist = $tour_data['tourists'][0];
            
            $user_update_data = array(
                'ID' => $user_id,
                'first_name' => $first_tourist['firstName'] ?? '',
                'last_name' => $first_tourist['lastName'] ?? '',
                'display_name' => trim(($first_tourist['firstName'] ?? '') . ' ' . ($first_tourist['lastName'] ?? ''))
            );
            
            wp_update_user($user_update_data);
            
            update_user_meta($user_id, 'atlas_birth_date', $first_tourist['birthDate'] ?? '');
            update_user_meta($user_id, 'atlas_gender', $first_tourist['gender'] ?? '');
            update_user_meta($user_id, 'atlas_iin', $first_tourist['iin'] ?? '');
            update_user_meta($user_id, 'atlas_passport_number', $first_tourist['passportNumber'] ?? '');
            update_user_meta($user_id, 'atlas_passport_issue_date', $first_tourist['passportIssueDate'] ?? '');
            update_user_meta($user_id, 'atlas_passport_expiry_date', $first_tourist['passportExpiryDate'] ?? '');
        }
        
        $booking_result = Atlas_Bookings::create_booking($user_id, $tour_id, $combined_tour_data);
        
        if (!$booking_result) {
            return new WP_Error('booking_error', 'Failed to create booking', array('status' => 500));
        }
        
        return array(
            'success' => true,
            'message' => 'Tour booked successfully',
            'booking_id' => $booking_result['booking_id'],
            'booking' => $booking_result
        );
    }

    function atlas_get_my_bookings($request) {
        $token = atlas_get_token_from_request($request);
        
        if (empty($token)) {
            return new WP_Error('missing_token', 'Authorization token required in header', array('status' => 401));
        }
        
        $token_data = Atlas_Auth_Tokens::verify_token($token);
        
        if (!$token_data) {
            return new WP_Error('invalid_token', 'Invalid or expired token', array('status' => 401));
        }
        
        $user_id = $token_data['user_id'];
        
        $user_bookings = Atlas_Bookings::get_user_bookings($user_id);
        
        $bookings = array();
        foreach ($user_bookings as $booking) {
            $tour = get_post($booking['tour_id']);
            if ($tour) {
                $booking['tour_image'] = get_the_post_thumbnail_url($booking['tour_id'], 'medium');
                $booking['tour_price'] = $booking['tour_data']['price'] ?? get_field('price', $booking['tour_id']);
                $booking['tour_duration'] = get_field('duration', $booking['tour_id']);
                
                $booking['tour_data']['hotel_mekka'] = get_hotel_short_name($booking['tour_id'], 'hotel_mekka');
                $booking['tour_data']['hotel_medina'] = get_hotel_short_name($booking['tour_id'], 'hotel_medina');
                
                $booking['tour_data']['hotels'] = array(
                    'mekka' => get_hotel_data($booking['tour_id'], 'hotel_mekka'),
                    'medina' => get_hotel_data($booking['tour_id'], 'hotel_medina')
                );
                
                $booking['tour_data']['flight_type'] = get_field('flight_type', $booking['tour_id']);
                $booking['tour_data']['flight_outbound'] = get_flight_data(get_field('flight_outbound', $booking['tour_id']));
                $booking['tour_data']['flight_inbound'] = get_flight_data(get_field('flight_inbound', $booking['tour_id']));
                $booking['tour_data']['flight_outbound_connecting'] = get_flight_data(get_field('flight_outbound_connecting_before', $booking['tour_id'])) ?: get_flight_data(get_field('flight_outbound_connecting', $booking['tour_id']));
                $booking['tour_data']['flight_connecting'] = get_field('flight_connecting_outbound', $booking['tour_id']) ? get_flight_data(get_field('flight_connecting_outbound', $booking['tour_id'])) : get_flight_data(get_field('flight_connecting', $booking['tour_id']));
                $booking['tour_data']['flight_outbound_connecting_after'] = get_flight_data(get_field('flight_outbound_connecting_after', $booking['tour_id']));
                $booking['tour_data']['flight_inbound_connecting'] = get_flight_data(get_field('flight_inbound_connecting_before', $booking['tour_id'])) ?: get_flight_data(get_field('flight_inbound_connecting', $booking['tour_id']));
                $booking['tour_data']['flight_connecting_inbound'] = get_field('flight_connecting_inbound', $booking['tour_id']) ? get_flight_data(get_field('flight_connecting_inbound', $booking['tour_id'])) : null;
                $booking['tour_data']['flight_inbound_connecting_after'] = get_flight_data(get_field('flight_inbound_connecting_after', $booking['tour_id']));
                
                    $booking['tour_data']['services'] = get_field('services', $booking['tour_id']) ?: [];
                    $booking['tour_data']['transfers'] = get_field('transfers', $booking['tour_id']);
                    $booking['tour_data']['transfer_type'] = get_field('transfer_type', $booking['tour_id']);
            }
            
            $booking['status'] = $booking['status'] ?? 'pending';
            $booking['payment_id'] = $booking['payment_id'] ?? null;
            $booking['expires_at'] = $booking['expires_at'] ?? null;
            $booking['booking_date'] = $booking['booking_date'] ?? null;
            
            $bookings[] = $booking;
        }
        
        return array(
            'success' => true,
            'bookings' => $bookings,
            'server_time' => current_time('mysql')
        );
    }

    // Функции для получения деталей проживания отелей
    function get_hotel_check_in($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('check_in', $hotel_id);
        }
        return null;
    }

    function get_hotel_check_out($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('check_out', $hotel_id);
        }
        return null;
    }

    function get_hotel_room_type($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('room_type', $hotel_id);
        }
        return null;
    }

    function get_hotel_meal_plan($post_id, $field_name) {
        $hotel_id = get_field($field_name, $post_id);
        if ($hotel_id) {
            return get_field('meal_plan', $hotel_id);
        }
        return null;
    }


    function atlas_schedule_token_cleanup() {
        if (!wp_next_scheduled('atlas_cleanup_expired_tokens')) {
            wp_schedule_event(time(), 'hourly', 'atlas_cleanup_expired_tokens');
        }
    }
    add_action('wp', 'atlas_schedule_token_cleanup');

    function atlas_cleanup_expired_tokens_task() {
        $deleted = Atlas_Auth_Tokens::clean_expired_tokens();
        if ($deleted > 0) {
            error_log("Atlas: Cleaned up {$deleted} expired tokens");
        }
    }
    add_action('atlas_cleanup_expired_tokens', 'atlas_cleanup_expired_tokens_task');

    function atlas_schedule_sms_cleanup() {
        if (!wp_next_scheduled('atlas_cleanup_expired_sms')) {
            wp_schedule_event(time(), 'hourly', 'atlas_cleanup_expired_sms');
        }
    }
    add_action('wp', 'atlas_schedule_sms_cleanup');

    function atlas_cleanup_expired_sms_task() {
        $deleted_expired = Atlas_SMS_Codes::clean_expired_codes();
        $deleted_verified = Atlas_SMS_Codes::clean_verified_codes(7);
        
        if ($deleted_expired > 0 || $deleted_verified > 0) {
            error_log("Atlas: Cleaned up {$deleted_expired} expired SMS codes and {$deleted_verified} old verified codes");
        }
    }
    add_action('atlas_cleanup_expired_sms', 'atlas_cleanup_expired_sms_task');

    function atlas_schedule_bookings_cleanup() {
        if (!wp_next_scheduled('atlas_expire_old_bookings')) {
            wp_schedule_event(time(), 'every_5_minutes', 'atlas_expire_old_bookings');
        }
    }
    add_action('wp', 'atlas_schedule_bookings_cleanup');

    function atlas_expire_old_bookings_task() {
        $expired = Atlas_Bookings::expire_old_bookings();
        
        if ($expired > 0) {
            error_log("Atlas: Expired {$expired} old pending bookings");
        }
    }
    add_action('atlas_expire_old_bookings', 'atlas_expire_old_bookings_task');

    add_filter('cron_schedules', function($schedules) {
        $schedules['every_5_minutes'] = array(
            'interval' => 300,
            'display'  => __('Каждые 5 минут')
        );
        return $schedules;
    });

