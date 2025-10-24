<?php
/**
 * booking functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package booking
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '1.0.0' );
}

// Подключаем функции для хадж наборов
require_once get_template_directory() . '/hajj-kit-functions.php';

// Подключаем функции для услуг в пакете
require_once get_template_directory() . '/package-includes-functions.php';

// Подключаем функции для рейсов
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
    $flight_data['departure_airport'] = get_field('departure_airport', $flight_id);
    $flight_data['departure_city'] = get_field('departure_city', $flight_id);
    $flight_data['arrival_airport'] = get_field('arrival_airport', $flight_id);
    $flight_data['arrival_city'] = get_field('arrival_city', $flight_id);
    
    // Форматируем время вылета и прилета
    $departure_time_raw = get_field('departure_time', $flight_id);
    $arrival_time_raw = get_field('arrival_time', $flight_id);
    
    if ($departure_time_raw) {
        $departure_date = new DateTime($departure_time_raw);
        $flight_data['departure_time'] = $departure_date->format('H:i');
        
        // Форматируем дату на русском языке
        $months = [
            1 => 'янв', 2 => 'фев', 3 => 'мар', 4 => 'апр', 5 => 'май', 6 => 'июн',
            7 => 'июл', 8 => 'авг', 9 => 'сен', 10 => 'окт', 11 => 'ноя', 12 => 'дек'
        ];
        $days = [
            'Mon' => 'Пн', 'Tue' => 'Вт', 'Wed' => 'Ср', 'Thu' => 'Чт',
            'Fri' => 'Пт', 'Sat' => 'Сб', 'Sun' => 'Вс'
        ];
        
        $day_name = $days[$departure_date->format('D')] ?? $departure_date->format('D');
        $month_name = $months[$departure_date->format('n')] ?? $departure_date->format('M');
        $flight_data['departure_date'] = $day_name . ', ' . $departure_date->format('j') . ' ' . $month_name;
    } else {
        $flight_data['departure_time'] = null;
        $flight_data['departure_date'] = null;
    }
    
    if ($arrival_time_raw) {
        $arrival_date = new DateTime($arrival_time_raw);
        $flight_data['arrival_time'] = $arrival_date->format('H:i');
        
        // Форматируем дату на русском языке
        $months = [
            1 => 'янв', 2 => 'фев', 3 => 'мар', 4 => 'апр', 5 => 'май', 6 => 'июн',
            7 => 'июл', 8 => 'авг', 9 => 'сен', 10 => 'окт', 11 => 'ноя', 12 => 'дек'
        ];
        $days = [
            'Mon' => 'Пн', 'Tue' => 'Вт', 'Wed' => 'Ср', 'Thu' => 'Чт',
            'Fri' => 'Пт', 'Sat' => 'Сб', 'Sun' => 'Вс'
        ];
        
        $day_name = $days[$arrival_date->format('D')] ?? $arrival_date->format('D');
        $month_name = $months[$arrival_date->format('n')] ?? $arrival_date->format('M');
        $flight_data['arrival_date'] = $day_name . ', ' . $arrival_date->format('j') . ' ' . $month_name;
    } else {
        $flight_data['arrival_time'] = null;
        $flight_data['arrival_date'] = null;
    }
    
    $flight_data['duration'] = get_field('duration', $flight_id);
    
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


/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function booking_setup() {
	/*
		* Make theme available for translation.
		* Translations can be filed in the /languages/ directory.
		* If you're building a theme based on booking, use a find and replace
		* to change 'booking' to the name of your theme in all the template files.
		*/
	load_theme_textdomain( 'booking', get_template_directory() . '/languages' );
	
	// Добавляем пункт меню в админку
	add_action('admin_menu', 'atlas_kaspi_admin_menu');

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
	add_theme_support( 'title-tag' );

	/*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'booking' ),
		)
	);

	/*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
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

	// Set up the WordPress core custom background feature.
	add_theme_support(
		'custom-background',
		apply_filters(
			'booking_custom_background_args',
			array(
				'default-color' => 'ffffff',
				'default-image' => '',
			)
		)
	);

	// Add theme support for selective refresh for widgets.
	add_theme_support( 'customize-selective-refresh-widgets' );

	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'booking_setup' );

// Регистрируем таксономию для типов паломничества
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


// Создаем базовые типы паломничества при активации темы
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
add_action('after_setup_theme', 'atlas_create_default_pilgrimage_types');


// Импортируем ACF поля для таксономии отелей
function atlas_import_hotel_acf_fields() {
    if (!get_option('atlas_hotel_acf_imported')) {
        $acf_fields = json_decode(file_get_contents(get_template_directory() . '/acf-hotel-fields.json'), true);
        
        if ($acf_fields) {
            acf_add_local_field_group($acf_fields);
        }
        
        update_option('atlas_hotel_acf_imported', true);
    }
}
add_action('acf/init', 'atlas_import_hotel_acf_fields');

function atlas_import_transfer_acf_fields() {
    if (!get_option('atlas_transfer_acf_imported')) {
        $acf_fields = json_decode(file_get_contents(get_template_directory() . '/acf-transfer-fields.json'), true);
        
        if ($acf_fields) {
            acf_add_local_field_group($acf_fields);
        }
        
        update_option('atlas_transfer_acf_imported', true);
    }
}
add_action('acf/init', 'atlas_import_transfer_acf_fields');


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
    
    if ($transfer_ids && is_array($transfer_ids)) {
        foreach ($transfer_ids as $transfer_id) {
            $transfer_post = get_post($transfer_id);
            if ($transfer_post && $transfer_post->post_type === 'transfer') {
                $transfers_data[] = array(
                    'id' => $transfer_id,
                    'name' => $transfer_post->post_title,
                    'short_name' => get_field('short_name', $transfer_id),
                    'description' => get_field('description', $transfer_id),
                    'gallery' => get_field('gallery', $transfer_id)
                );
            }
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

// Хук для отладки сохранения полей отелей
add_action('acf/save_post', 'debug_hotel_fields_save', 20);
function debug_hotel_fields_save($post_id) {
    if (get_post_type($post_id) !== 'post') {
        return;
    }
    
    $hotel_mekka = get_field('hotel_mekka', $post_id);
    $hotel_medina = get_field('hotel_medina', $post_id);
    
    error_log('Hotel Mekka saved: ' . print_r($hotel_mekka, true));
    error_log('Hotel Medina saved: ' . print_r($hotel_medina, true));
}

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function booking_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'booking_content_width', 640 );
}
add_action( 'after_setup_theme', 'booking_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function booking_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'booking' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'booking' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'booking_widgets_init' );

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
});

function atlas_bookings_admin_page() {
    echo '<div class="wrap">';
    echo '<h1 class="wp-heading-inline">Бронирования Atlas Hajj</h1>';
    
    $all_bookings = array();
    $users = get_users();
    
    foreach ($users as $user) {
        $user_bookings = get_user_meta($user->ID, 'atlas_bookings', true);
        if (is_array($user_bookings)) {
            foreach ($user_bookings as $booking_id => $booking) {
                $booking['user_name'] = $user->display_name;
                $booking['user_email'] = $user->user_email;
                $booking['user_phone'] = get_user_meta($user->ID, 'phone', true);
                $booking['booking_id'] = $booking_id;
                $all_bookings[$booking_id] = $booking;
            }
        }
    }
    
    if (empty($all_bookings)) {
        echo '<div class="notice notice-info">';
        echo '<p><strong>Информация:</strong> Пока нет забронированных туров.</p>';
        echo '</div>';
        echo '</div>';
        return;
    }
    
    // Статистика
    $total_bookings = count($all_bookings);
    $pending_bookings = 0;
    $total_tourists = 0;
    
    foreach ($all_bookings as $booking) {
        if ($booking['status'] === 'pending') $pending_bookings++;
        if (isset($booking['tour_data']['tourists'])) {
            $total_tourists += count($booking['tour_data']['tourists']);
        } else {
            $total_tourists += 1;
        }
    }
    
    echo '<div class="metabox-holder">';
    echo '<div class="postbox-container" style="width: 100%;">';
    
    // Статистика в метабоксах
    echo '<div class="postbox">';
    echo '<h2 class="hndle ui-sortable-handle"><span>Статистика</span></h2>';
    echo '<div class="inside">';
    echo '<div class="main">';
    echo '<table class="form-table" role="presentation">';
    echo '<tbody>';
    echo '<tr>';
    echo '<th scope="row">Всего бронирований</th>';
    echo '<td><strong>' . $total_bookings . '</strong></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row">Ожидают оплаты</th>';
    echo '<td><strong>' . $pending_bookings . '</strong></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row">Всего туристов</th>';
    echo '<td><strong>' . $total_tourists . '</strong></td>';
    echo '</tr>';
    echo '</tbody>';
    echo '</table>';
    echo '</div>';
    echo '</div>';
    echo '</div>';
    
    // Таблица бронирований
    echo '<div class="postbox">';
    echo '<h2 class="hndle ui-sortable-handle"><span>Список бронирований</span></h2>';
    echo '<div class="inside">';
    
    echo '<div class="tablenav top">';
    echo '<div class="alignleft actions bulkactions">';
    echo '<select name="bulk_action" id="bulk_action">';
    echo '<option value="-1">Массовые действия</option>';
    echo '<option value="status_pending">Изменить статус на: Ожидает оплаты</option>';
    echo '<option value="status_paid">Изменить статус на: Оплачено</option>';
    echo '<option value="status_cancelled">Изменить статус на: Отменено</option>';
    echo '<option value="status_confirmed">Изменить статус на: Подтверждено</option>';
    echo '<option value="delete">Удалить выбранные</option>';
    echo '</select>';
    echo '<input type="submit" id="doaction" class="button action" value="Применить">';
    echo '</div>';
    echo '</div>';
    
    echo '<table class="wp-list-table widefat fixed striped">';
    echo '<thead>';
    echo '<tr>';
    echo '<td id="cb" class="manage-column column-cb check-column"><input id="cb-select-all-1" type="checkbox"></td>';
    echo '<th scope="col" class="manage-column column-id">ID</th>';
    echo '<th scope="col" class="manage-column column-user">Пользователь</th>';
    echo '<th scope="col" class="manage-column column-tour">Тур</th>';
    echo '<th scope="col" class="manage-column column-date">Дата</th>';
    echo '<th scope="col" class="manage-column column-status">Статус</th>';
    echo '<th scope="col" class="manage-column column-tourists">Туристы</th>';
    echo '<th scope="col" class="manage-column column-actions">Действия</th>';
    echo '</tr>';
    echo '</thead>';
    echo '<tbody>';
    
    foreach ($all_bookings as $booking_id => $booking) {
        $status_class = $booking['status'] === 'pending' ? 'notice-error' : 'notice-success';
        $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
        
        echo '<tr>';
        echo '<th scope="row" class="check-column"><input type="checkbox" name="booking[]" value="' . esc_attr($booking_id) . '" data-user-id="' . esc_attr($booking['user_id']) . '"></th>';
        echo '<td class="column-id"><code>' . esc_html(substr($booking_id, 0, 8)) . '...</code></td>';
        echo '<td class="column-user">';
        echo '<strong>' . esc_html($booking['user_name']) . '</strong><br>';
        echo '<small>' . esc_html($booking['user_email']) . '</small>';
        if ($booking['user_phone']) {
            echo '<br><small>' . esc_html($booking['user_phone']) . '</small>';
        }
        echo '</td>';
        echo '<td class="column-tour">';
        echo '<strong>' . esc_html($booking['tour_title']) . '</strong>';
        if (isset($booking['tour_data']['duration'])) {
            echo '<br><small>' . esc_html($booking['tour_data']['duration']) . '</small>';
        }
        echo '</td>';
        echo '<td class="column-date">' . esc_html(date('d.m.Y H:i', strtotime($booking['booking_date']))) . '</td>';
        echo '<td class="column-status">';
        $status_text = '';
        switch($booking['status']) {
            case 'pending': $status_text = 'Ожидает оплаты'; break;
            case 'paid': $status_text = 'Оплачено'; break;
            case 'cancelled': $status_text = 'Отменено'; break;
            case 'confirmed': $status_text = 'Подтверждено'; break;
            default: $status_text = $booking['status'];
        }
        echo '<span class="' . $status_class . ' inline">' . esc_html($status_text) . '</span>';
        echo '</td>';
        echo '<td class="column-tourists">' . $tourists_count . '</td>';
        echo '<td class="column-actions">';
        echo '<button onclick="showBookingDetails(\'' . esc_js(json_encode($booking, JSON_UNESCAPED_UNICODE)) . '\')" class="button button-secondary">Просмотр</button>';
        echo '<select onchange="changeBookingStatus(\'' . esc_js($booking_id) . '\', \'' . esc_js($booking['user_id']) . '\', this.value)" class="booking-status-select" style="margin: 0 5px;">';
        echo '<option value="pending"' . ($booking['status'] === 'pending' ? ' selected' : '') . '>Ожидает оплаты</option>';
        echo '<option value="paid"' . ($booking['status'] === 'paid' ? ' selected' : '') . '>Оплачено</option>';
        echo '<option value="cancelled"' . ($booking['status'] === 'cancelled' ? ' selected' : '') . '>Отменено</option>';
        echo '<option value="confirmed"' . ($booking['status'] === 'confirmed' ? ' selected' : '') . '>Подтверждено</option>';
        echo '</select>';
        echo '<button onclick="deleteBooking(\'' . esc_js($booking_id) . '\', \'' . esc_js($booking['user_id']) . '\')" class="button button-link-delete" style="color: #a00; margin-left: 5px;">Удалить</button>';
        echo '</td>';
        echo '</tr>';
    }
    
    echo '</tbody>';
    echo '</table>';
    
    echo '</div>';
    echo '</div>';
    echo '</div>';
    echo '</div>';
    
    echo '<div id="bookingModal" class="wp-modal" style="display: none;">
        <div class="wp-modal-backdrop"></div>
        <div class="wp-modal-content">
            <div class="wp-modal-header">
                <h2>Детали бронирования</h2>
                <button type="button" class="notice-dismiss" onclick="closeBookingModal()">
                    <span class="screen-reader-text">Закрыть</span>
                </button>
            </div>
            <div class="wp-modal-body" id="bookingModalBody">
            </div>
        </div>
    </div>';
    
    echo '<style>
    .wp-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .wp-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
    }
    
    .wp-modal-content {
        position: relative;
        background: #fff;
        border: 1px solid #ccd0d4;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .wp-modal-header {
        padding: 15px 20px;
        border-bottom: 1px solid #ccd0d4;
        background: #fcfcfc;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .wp-modal-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }
    
    .wp-modal-body {
        padding: 20px;
    }
    
    .booking-details-section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f9f9f9;
        border-left: 4px solid #0073aa;
    }
    
    .booking-details-section h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
    }
    
    .tourist-info-card {
        background: #fff;
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #ccd0d4;
        border-radius: 3px;
    }
    
    .tourist-info-header {
        font-weight: 600;
        margin-bottom: 10px;
        color: #0073aa;
    }
    
    .tourist-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
    }
    
    .tourist-info-item {
        padding: 5px 0;
    }
    
    .tourist-info-item strong {
        color: #23282d;
    }
    
    .column-actions .button {
        margin-right: 5px;
    }
    
    .button-link-delete {
        color: #a00 !important;
        text-decoration: none;
        border: none !important;
        background: none !important;
        padding: 0 !important;
        font-size: 13px;
    }
    
    .button-link-delete:hover {
        color: #dc3232 !important;
        text-decoration: underline;
    }
    
    .button-link-delete:disabled {
        color: #999 !important;
        cursor: not-allowed;
    }
    
    .booking-status-select {
        font-size: 12px;
        padding: 2px 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: #fff;
        min-width: 120px;
    }
    
    .booking-status-select:disabled {
        background: #f1f1f1;
        color: #999;
        cursor: not-allowed;
    }
    
    .column-actions {
        white-space: nowrap;
    }
    
    .column-actions .button,
    .column-actions select {
        vertical-align: middle;
    }
    </style>';
    
    echo '<script>
    function showBookingDetails(bookingData) {
        const booking = JSON.parse(bookingData);
        
        // Функция для декодирования Unicode
        function decodeUnicode(str) {
            if (typeof str !== "string") return str;
            return str.replace(/\\u([0-9a-fA-F]{4})/g, function(match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            });
        }
        
        // Декодируем все строковые значения
        function decodeObject(obj) {
            if (typeof obj === "string") {
                return decodeUnicode(obj);
            } else if (Array.isArray(obj)) {
                return obj.map(decodeObject);
            } else if (obj && typeof obj === "object") {
                const decoded = {};
                for (const key in obj) {
                    decoded[key] = decodeObject(obj[key]);
                }
                return decoded;
            }
            return obj;
        }
        
        const decodedBooking = decodeObject(booking);
        const modal = document.getElementById("bookingModal");
        const modalBody = document.getElementById("bookingModalBody");
        
        let html = "";
        
        // Основная информация
        html += \'<div class="booking-details-section">\';
        html += \'<h3>Основная информация</h3>\';
        html += \'<table class="form-table" role="presentation">\';
        html += \'<tbody>\';
        html += \'<tr><th scope="row">ID бронирования</th><td>\' + decodedBooking.booking_id + \'</td></tr>\';
        html += \'<tr><th scope="row">Дата бронирования</th><td>\' + decodedBooking.booking_date + \'</td></tr>\';
        html += \'<tr><th scope="row">Статус</th><td><span class="\' + (decodedBooking.status === "pending" ? "notice-error" : "notice-success") + \' inline">\' + decodedBooking.status + \'</span></td></tr>\';
        html += \'</tbody>\';
        html += \'</table>\';
        html += \'</div>\';
        
        // Информация о пользователе
        html += \'<div class="booking-details-section">\';
        html += \'<h3>Информация о пользователе</h3>\';
        html += \'<table class="form-table" role="presentation">\';
        html += \'<tbody>\';
        html += \'<tr><th scope="row">Имя</th><td>\' + decodedBooking.user_name + \'</td></tr>\';
        html += \'<tr><th scope="row">Email</th><td>\' + decodedBooking.user_email + \'</td></tr>\';
        if (decodedBooking.user_phone) {
            html += \'<tr><th scope="row">Телефон</th><td>\' + decodedBooking.user_phone + \'</td></tr>\';
        }
        html += \'</tbody>\';
        html += \'</table>\';
        html += \'</div>\';
        
        // Информация о туре
        html += \'<div class="booking-details-section">\';
        html += \'<h3>Информация о туре</h3>\';
        html += \'<table class="form-table" role="presentation">\';
        html += \'<tbody>\';
        html += \'<tr><th scope="row">Название тура</th><td>\' + decodedBooking.tour_title + \'</td></tr>\';
        if (decodedBooking.tour_data && decodedBooking.tour_data.duration) {
            html += \'<tr><th scope="row">Длительность</th><td>\' + decodedBooking.tour_data.duration + \'</td></tr>\';
        }
        if (decodedBooking.tour_data && decodedBooking.tour_data.price) {
            html += \'<tr><th scope="row">Цена</th><td>$\' + decodedBooking.tour_data.price + \'</td></tr>\';
        }
        if (decodedBooking.tour_data && decodedBooking.tour_data.flightOutboundDate) {
            html += \'<tr><th scope="row">Дата вылета</th><td>\' + decodedBooking.tour_data.flightOutboundDate + \'</td></tr>\';
        }
        if (decodedBooking.tour_data && decodedBooking.tour_data.flightInboundDate) {
            html += \'<tr><th scope="row">Дата возвращения</th><td>\' + decodedBooking.tour_data.flightInboundDate + \'</td></tr>\';
        }
        html += \'</tbody>\';
        html += \'</table>\';
        html += \'</div>\';
        
        // Информация о туристах
        if (decodedBooking.tour_data && decodedBooking.tour_data.tourists && decodedBooking.tour_data.tourists.length > 0) {
            html += \'<div class="booking-details-section">\';
            html += \'<h3>Информация о туристах (\' + decodedBooking.tour_data.tourists.length + \' чел.)</h3>\';
            
            decodedBooking.tour_data.tourists.forEach((tourist, index) => {
                const typeText = tourist.type === "adult" ? "Взрослый" : tourist.type === "child" ? "Ребенок" : "Младенец";
                const genderText = tourist.gender === "male" ? "Мужской" : "Женский";
                
                html += \'<div class="tourist-info-card">\';
                html += \'<div class="tourist-info-header">\' + (index + 1) + \'. \' + tourist.firstName + \' \' + tourist.lastName + \'</div>\';
                html += \'<table class="form-table" role="presentation">\';
                html += \'<tbody>\';
                html += \'<tr><th scope="row">Тип</th><td>\' + typeText + \'</td></tr>\';
                html += \'<tr><th scope="row">Дата рождения</th><td>\' + tourist.birthDate + \'</td></tr>\';
                html += \'<tr><th scope="row">Пол</th><td>\' + genderText + \'</td></tr>\';
                html += \'<tr><th scope="row">ИИН</th><td>\' + tourist.iin + \'</td></tr>\';
                html += \'<tr><th scope="row">Номер паспорта</th><td>\' + tourist.passportNumber + \'</td></tr>\';
                html += \'<tr><th scope="row">Дата выдачи паспорта</th><td>\' + tourist.passportIssueDate + \'</td></tr>\';
                html += \'<tr><th scope="row">Срок действия паспорта</th><td>\' + tourist.passportExpiryDate + \'</td></tr>\';
                if (tourist.phone) {
                    html += \'<tr><th scope="row">Телефон</th><td>\' + tourist.phone + \'</td></tr>\';
                }
                html += \'</tbody>\';
                html += \'</table>\';
                html += \'</div>\';
            });
            
            html += \'</div>\';
        }
        
        modalBody.innerHTML = html;
        modal.style.display = "flex";
    }
    
    function closeBookingModal() {
        document.getElementById("bookingModal").style.display = "none";
    }
    
    // Закрытие модального окна при клике вне его
    document.addEventListener("click", function(event) {
        const modal = document.getElementById("bookingModal");
        if (event.target.classList.contains("wp-modal-backdrop")) {
            modal.style.display = "none";
        }
    });
    
    // Закрытие по Escape
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            const modal = document.getElementById("bookingModal");
            if (modal.style.display === "flex") {
                modal.style.display = "none";
            }
        }
    });
    
    // Функция смены статуса бронирования
    function changeBookingStatus(bookingId, userId, newStatus) {
        // Показываем индикатор загрузки
        const selectElement = event.target;
        const originalValue = selectElement.value;
        selectElement.disabled = true;
        
        // Отправляем AJAX запрос
        fetch(ajaxurl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "action=atlas_change_booking_status&booking_id=" + bookingId + "&user_id=" + userId + "&new_status=" + newStatus + "&nonce=" + atlas_admin_nonce
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем отображение статуса в таблице
                const row = selectElement.closest("tr");
                const statusCell = row.querySelector(".column-status span");
                
                // Обновляем класс и текст статуса
                statusCell.className = newStatus === "pending" ? "notice-error inline" : "notice-success inline";
                statusCell.textContent = getStatusText(newStatus);
                
                // Показываем уведомление
                showNotice("Статус бронирования изменен на: " + getStatusText(newStatus), "success");
                
                // Обновляем статистику
                updateStatistics();
            } else {
                // Возвращаем предыдущее значение
                selectElement.value = originalValue;
                showNotice("Ошибка при изменении статуса: " + (data.data || "Неизвестная ошибка"), "error");
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
            selectElement.value = originalValue;
            showNotice("Ошибка при изменении статуса", "error");
        })
        .finally(() => {
            selectElement.disabled = false;
        });
    }
    
    // Функция получения текста статуса
    function getStatusText(status) {
        const statusTexts = {
            "pending": "Ожидает оплаты",
            "paid": "Оплачено",
            "cancelled": "Отменено",
            "confirmed": "Подтверждено"
        };
        return statusTexts[status] || status;
    }

    // Функция удаления бронирования
    function deleteBooking(bookingId, userId) {
        if (!confirm("Вы уверены, что хотите удалить это бронирование? Это действие нельзя отменить.")) {
            return;
        }
        
        // Показываем индикатор загрузки
        const deleteButton = event.target;
        const originalText = deleteButton.textContent;
        deleteButton.textContent = "Удаление...";
        deleteButton.disabled = true;
        
        // Отправляем AJAX запрос
        fetch(ajaxurl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "action=atlas_delete_booking&booking_id=" + bookingId + "&user_id=" + userId + "&nonce=" + atlas_admin_nonce
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Удаляем строку из таблицы
                const row = deleteButton.closest("tr");
                row.style.opacity = "0.5";
                row.style.transition = "opacity 0.3s";
                setTimeout(() => {
                    row.remove();
                    // Обновляем статистику
                    updateStatistics();
                }, 300);
                
                // Показываем уведомление
                showNotice("Бронирование успешно удалено", "success");
            } else {
                showNotice("Ошибка при удалении: " + (data.data || "Неизвестная ошибка"), "error");
                deleteButton.textContent = originalText;
                deleteButton.disabled = false;
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
            showNotice("Ошибка при удалении бронирования", "error");
            deleteButton.textContent = originalText;
            deleteButton.disabled = false;
        });
    }
    
    // Функция обновления статистики
    function updateStatistics() {
        const rows = document.querySelectorAll("tbody tr");
        let totalBookings = rows.length;
        let pendingBookings = 0;
        let totalTourists = 0;
        
        rows.forEach(row => {
            const statusCell = row.querySelector(".column-status span");
            if (statusCell && statusCell.textContent.trim() === "pending") {
                pendingBookings++;
            }
            
            const touristsCell = row.querySelector(".column-tourists");
            if (touristsCell) {
                totalTourists += parseInt(touristsCell.textContent) || 0;
            }
        });
        
        // Обновляем статистику в метабоксе
        const statsTable = document.querySelector(".metabox-holder .postbox .inside table tbody");
        if (statsTable) {
            const rows = statsTable.querySelectorAll("tr");
            if (rows[0]) rows[0].querySelector("td").textContent = totalBookings;
            if (rows[1]) rows[1].querySelector("td").textContent = pendingBookings;
            if (rows[2]) rows[2].querySelector("td").textContent = totalTourists;
        }
    }
    
    // Функция показа уведомлений
    function showNotice(message, type) {
        const notice = document.createElement("div");
        notice.className = "notice notice-" + type + " is-dismissible";
        notice.innerHTML = "<p>" + message + "</p>";
        
        const wrap = document.querySelector(".wrap");
        wrap.insertBefore(notice, wrap.firstChild);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            notice.remove();
        }, 5000);
    }
    
    // Обработчик для "Выбрать все"
    document.getElementById("cb-select-all-1").addEventListener("change", function() {
        const checkboxes = document.querySelectorAll("input[name=\"booking[]\"]");
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    // Обработчик для массовых действий
    document.getElementById("doaction").addEventListener("click", function(e) {
        e.preventDefault();
        
        const bulkAction = document.getElementById("bulk_action").value;
        const checkedBoxes = document.querySelectorAll("input[name=\"booking[]\"]:checked");
        
        if (bulkAction === "-1") {
            showNotice("Выберите действие", "error");
            return;
        }
        
        if (checkedBoxes.length === 0) {
            showNotice("Выберите бронирования для удаления", "error");
            return;
        }
        
        if (bulkAction.startsWith("status_")) {
            const newStatus = bulkAction.replace("status_", "");
            const statusText = getStatusText(newStatus);
            
            if (!confirm("Вы уверены, что хотите изменить статус выбранных бронирований на: " + statusText + "?")) {
                return;
            }
            
            // Показываем индикатор загрузки
            this.value = "Изменение...";
            this.disabled = true;
            
            // Собираем данные для изменения статуса
            const bookingsToUpdate = [];
            checkedBoxes.forEach(checkbox => {
                bookingsToUpdate.push({
                    bookingId: checkbox.value,
                    userId: checkbox.dataset.userId
                });
            });
            
            // Изменяем статус по одному
            let updatedCount = 0;
            const totalCount = bookingsToUpdate.length;
            
            bookingsToUpdate.forEach((booking, index) => {
                fetch(ajaxurl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: "action=atlas_change_booking_status&booking_id=" + booking.bookingId + "&user_id=" + booking.userId + "&new_status=" + newStatus + "&nonce=" + atlas_admin_nonce
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updatedCount++;
                        
                        // Обновляем отображение статуса в таблице
                        const row = document.querySelector("input[value=\'" + booking.bookingId + "\']").closest("tr");
                        const statusCell = row.querySelector(".column-status span");
                        const statusSelect = row.querySelector(".booking-status-select");
                        
                        // Обновляем класс и текст статуса
                        statusCell.className = newStatus === "pending" ? "notice-error inline" : "notice-success inline";
                        statusCell.textContent = statusText;
                        statusSelect.value = newStatus;
                        
                        // Если это последний элемент
                        if (updatedCount === totalCount) {
                            showNotice("Успешно изменен статус " + updatedCount + " бронирований на: " + statusText, "success");
                            updateStatistics();
                            document.getElementById("doaction").value = "Применить";
                            document.getElementById("doaction").disabled = false;
                        }
                    } else {
                        showNotice("Ошибка при изменении статуса бронирования " + booking.bookingId, "error");
                    }
                })
                .catch(error => {
                    console.error("Ошибка:", error);
                    showNotice("Ошибка при изменении статуса бронирования " + booking.bookingId, "error");
                });
            });
            
        } else if (bulkAction === "delete") {
            if (!confirm("Вы уверены, что хотите удалить выбранные бронирования? Это действие нельзя отменить.")) {
                return;
            }
            
            // Показываем индикатор загрузки
            this.value = "Удаление...";
            this.disabled = true;
            
            // Собираем данные для удаления
            const bookingsToDelete = [];
            checkedBoxes.forEach(checkbox => {
                bookingsToDelete.push({
                    bookingId: checkbox.value,
                    userId: checkbox.dataset.userId
                });
            });
            
            // Удаляем по одному
            let deletedCount = 0;
            const totalCount = bookingsToDelete.length;
            
            bookingsToDelete.forEach((booking, index) => {
                fetch(ajaxurl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: "action=atlas_delete_booking&booking_id=" + booking.bookingId + "&user_id=" + booking.userId + "&nonce=" + atlas_admin_nonce
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        deletedCount++;
                        
                        // Удаляем строку из таблицы
                        const row = document.querySelector("input[value=\'" + booking.bookingId + "\']").closest("tr");
                        row.style.opacity = "0.5";
                        row.style.transition = "opacity 0.3s";
                        setTimeout(() => {
                            row.remove();
                        }, 300);
                        
                        // Если это последний элемент
                        if (deletedCount === totalCount) {
                            showNotice("Успешно удалено " + deletedCount + " бронирований", "success");
                            updateStatistics();
                            document.getElementById("doaction").value = "Применить";
                            document.getElementById("doaction").disabled = false;
                        }
                    } else {
                        showNotice("Ошибка при удалении бронирования " + booking.bookingId, "error");
                    }
                })
                .catch(error => {
                    console.error("Ошибка:", error);
                    showNotice("Ошибка при удалении бронирования " + booking.bookingId, "error");
                });
            });
        }
    });
    </script>';
    
    echo '</div>';
}

// AJAX обработчик для удаления бронирований
add_action('wp_ajax_atlas_delete_booking', 'atlas_delete_booking_ajax');
function atlas_delete_booking_ajax() {
    // Проверяем nonce для безопасности
    if (!wp_verify_nonce($_POST['nonce'], 'atlas_admin_nonce')) {
        wp_die('Неверный nonce');
    }
    
    // Проверяем права доступа
    if (!current_user_can('manage_options')) {
        wp_die('Недостаточно прав');
    }
    
    $booking_id = sanitize_text_field($_POST['booking_id']);
    $user_id = intval($_POST['user_id']);
    
    if (empty($booking_id) || empty($user_id)) {
        wp_send_json_error('Неверные параметры');
    }
    
    // Получаем бронирования пользователя
    $user_bookings = get_user_meta($user_id, 'atlas_bookings', true);
    
    if (!is_array($user_bookings) || !isset($user_bookings[$booking_id])) {
        wp_send_json_error('Бронирование не найдено');
    }
    
    // Удаляем бронирование
    unset($user_bookings[$booking_id]);
    update_user_meta($user_id, 'atlas_bookings', $user_bookings);
    
    // Логируем удаление
    error_log("Бронирование удалено: booking_id=$booking_id, user_id=$user_id");
    
    wp_send_json_success('Бронирование успешно удалено');
}

// AJAX обработчик для смены статуса бронирования
add_action('wp_ajax_atlas_change_booking_status', 'atlas_change_booking_status_ajax');
function atlas_change_booking_status_ajax() {
    // Проверяем nonce для безопасности
    if (!wp_verify_nonce($_POST['nonce'], 'atlas_admin_nonce')) {
        wp_die('Неверный nonce');
    }
    
    // Проверяем права доступа
    if (!current_user_can('manage_options')) {
        wp_die('Недостаточно прав');
    }
    
    $booking_id = sanitize_text_field($_POST['booking_id']);
    $user_id = intval($_POST['user_id']);
    $new_status = sanitize_text_field($_POST['new_status']);
    
    // Валидируем статус
    $allowed_statuses = array('pending', 'paid', 'cancelled', 'confirmed');
    if (!in_array($new_status, $allowed_statuses)) {
        wp_send_json_error('Неверный статус');
    }
    
    if (empty($booking_id) || empty($user_id)) {
        wp_send_json_error('Неверные параметры');
    }
    
    // Получаем бронирования пользователя
    $user_bookings = get_user_meta($user_id, 'atlas_bookings', true);
    
    if (!is_array($user_bookings) || !isset($user_bookings[$booking_id])) {
        wp_send_json_error('Бронирование не найдено');
    }
    
    // Обновляем статус
    $user_bookings[$booking_id]['status'] = $new_status;
    $user_bookings[$booking_id]['status_changed_at'] = current_time('mysql');
    $user_bookings[$booking_id]['status_changed_by'] = get_current_user_id();
    
    // Если статус изменен на "paid" или "confirmed", обновляем количество мест
    if (in_array($new_status, ['paid', 'confirmed'])) {
        error_log("=== АДМИНКА: Статус изменен на $new_status ===");
        $booking = $user_bookings[$booking_id];
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
    
    // Если статус изменен на "cancelled" или "pending", возвращаем места
    if (in_array($new_status, ['cancelled', 'pending'])) {
        $booking = $user_bookings[$booking_id];
        if (isset($booking['tour_data']['tour_id']) && isset($booking['tour_data']['roomType'])) {
            $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
            $room_type = $booking['tour_data']['roomType'];
            $tour_id = $booking['tour_data']['tour_id'];
            
            // Возвращаем места (увеличиваем количество)
            atlas_return_tour_spots($tour_id, $tourists_count, $room_type);
            
            error_log("Места возвращены через админку: tour_id=$tour_id, room_type=$room_type, tourists_count=$tourists_count");
        }
    }
    
    update_user_meta($user_id, 'atlas_bookings', $user_bookings);
    
    // Логируем изменение статуса
    error_log("Статус бронирования изменен: booking_id=$booking_id, user_id=$user_id, new_status=$new_status, changed_by=" . get_current_user_id());
    
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

    // API для отправки SMS
add_action('rest_api_init', function() {
    register_rest_route('atlas-hajj/v1', '/send-sms', array(
        'methods' => 'POST',
        'callback' => 'atlas_send_sms',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/verify-code', array(
        'methods' => 'POST',
        'callback' => 'atlas_verify_code',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/check-auth', array(
        'methods' => 'POST',
        'callback' => 'atlas_check_auth',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/logout', array(
        'methods' => 'POST',
        'callback' => 'atlas_logout',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/profile', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_profile',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/profile', array(
        'methods' => 'PUT',
        'callback' => 'atlas_update_profile',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/book-tour', array(
        'methods' => 'POST',
        'callback' => 'atlas_book_tour',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/my-bookings', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_my_bookings',
        'permission_callback' => '__return_true'
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
    
    register_rest_route('atlas-hajj/v1', '/reviews', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_reviews',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/partners', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_partners',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/faq', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_faq',
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
    
    
    register_rest_route('atlas/v1', '/kaspi/payment_app.cgi', array(
        'methods' => 'GET',
        'callback' => 'atlas_kaspi_payment_app',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/payment_app.cgi', array(
        'methods' => 'POST',
        'callback' => 'atlas_kaspi_payment_app',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/create-payment', array(
        'methods' => 'POST',
        'callback' => 'atlas_create_kaspi_payment',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/payment-status', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_kaspi_payment_status',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/test-payment', array(
        'methods' => 'POST',
        'callback' => 'atlas_test_kaspi_payment',
        'permission_callback' => '__return_true'
    ));
});

function atlas_send_sms($request) {
    $params = $request->get_params();
    $phone = sanitize_text_field($params['phone'] ?? '');
    $code = sanitize_text_field($params['code'] ?? '');
    
    if (empty($phone) || empty($code)) {
        return new WP_Error('missing_params', 'Phone and code are required', array('status' => 400));
    }
    
    // Форматируем номер телефона для SMSC
    $phone = preg_replace('/[^0-9]/', '', $phone);
    
    // Если номер начинается с 7, добавляем +
    if (strlen($phone) === 11 && substr($phone, 0, 1) === '7') {
        $phone = '+' . $phone;
    }
    // Если номер начинается с 8, заменяем на +7
    elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '8') {
        $phone = '+7' . substr($phone, 1);
    }
    // Если номер 10 цифр, добавляем +7
    elseif (strlen($phone) === 10) {
        $phone = '+7' . $phone;
    }
    
    // Конфигурация SMSC
    $login = 'SattilyBro';
    $password = 'pswForSmsc1!';
    $message = "Ваш код подтверждения: {$code}. Atlas Hajj";
    
    // Формируем URL для отправки SMS
    $url = 'https://smsc.kz/sys/send.php?' . http_build_query([
        'login' => $login,
        'psw' => $password,
        'phones' => $phone,
        'mes' => $message,
        'fmt' => '3',
        'charset' => 'utf-8'
    ]);
    
    // Отправляем запрос
    $response = wp_remote_get($url);
    
    if (is_wp_error($response)) {
        return new WP_Error('sms_error', 'Failed to send SMS', array('status' => 500));
    }
    
    $body = wp_remote_retrieve_body($response);
    $result = json_decode($body, true);
    
    if (isset($result['error'])) {
        return new WP_Error('sms_error', $result['error'], array('status' => 400));
    }
    
    // Сохраняем код в WordPress опциях как резервный вариант
    $sms_codes = get_option('atlas_sms_codes', array());
    $sms_codes[$phone] = array(
        'code' => $code,
        'time' => time()
    );
    update_option('atlas_sms_codes', $sms_codes);
    
    // Также сохраняем в сессии
    if (!session_id()) {
        session_start();
    }
    
    // Очищаем старые коды для этого номера
    unset($_SESSION['sms_code_' . $phone]);
    unset($_SESSION['sms_time_' . $phone]);
    
    // Сохраняем новый код
    $_SESSION['sms_code_' . $phone] = $code;
    $_SESSION['sms_time_' . $phone] = time();
    
    return array(
        'success' => true,
        'message' => 'SMS sent successfully',
        'id' => $result['id'] ?? null,
        'debug' => array(
            'phone' => $phone,
            'code' => $code,
            'time' => time()
        )
    );
}

function atlas_verify_code($request) {
    $params = $request->get_params();
    $phone = sanitize_text_field($params['phone'] ?? '');
    $code = sanitize_text_field($params['code'] ?? '');
    
    if (empty($phone) || empty($code)) {
        return new WP_Error('missing_params', 'Phone and code are required', array('status' => 400));
    }
    
    // Форматируем номер телефона так же, как при отправке
    $phone = preg_replace('/[^0-9]/', '', $phone);
    
    if (strlen($phone) === 11 && substr($phone, 0, 1) === '7') {
        $phone = '+' . $phone;
    } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '8') {
        $phone = '+7' . substr($phone, 1);
    } elseif (strlen($phone) === 10) {
        $phone = '+7' . $phone;
    }
    
    // Пытаемся получить код из сессии
    if (!session_id()) {
        session_start();
    }
    
    $stored_code = $_SESSION['sms_code_' . $phone] ?? '';
    $stored_time = $_SESSION['sms_time_' . $phone] ?? 0;
    
    // Если код не найден в сессии, пробуем из WordPress опций
    if (empty($stored_code)) {
        $sms_codes = get_option('atlas_sms_codes', array());
        if (isset($sms_codes[$phone])) {
            $stored_code = $sms_codes[$phone]['code'];
            $stored_time = $sms_codes[$phone]['time'];
        }
    }
    
    // Проверяем время жизни кода (10 минут)
    if (time() - $stored_time > 600) {
        unset($_SESSION['sms_code_' . $phone]);
        unset($_SESSION['sms_time_' . $phone]);
        
        // Также очищаем из WordPress опций
        $sms_codes = get_option('atlas_sms_codes', array());
        unset($sms_codes[$phone]);
        update_option('atlas_sms_codes', $sms_codes);
        
        return new WP_Error('code_expired', 'Code has expired', array('status' => 400));
    }
    
    if ($code === $stored_code) {
        // Очищаем код после успешной проверки
        unset($_SESSION['sms_code_' . $phone]);
        unset($_SESSION['sms_time_' . $phone]);
        
        // Также очищаем из WordPress опций
        $sms_codes = get_option('atlas_sms_codes', array());
        unset($sms_codes[$phone]);
        update_option('atlas_sms_codes', $sms_codes);
        
        // Создаем или получаем пользователя
        $user = atlas_get_or_create_user($phone);
        
        // Генерируем токен авторизации
        $token = wp_generate_password(32, false);
        $user_data = array(
            'user_id' => $user['id'],
            'phone' => $phone,
            'token' => $token,
            'created_at' => time()
        );
        
        // Сохраняем токен в опциях WordPress
        $tokens = get_option('atlas_auth_tokens', array());
        $tokens[$token] = $user_data;
        update_option('atlas_auth_tokens', $tokens);
        
        return array(
            'success' => true,
            'message' => 'Code verified successfully',
            'token' => $token,
            'user' => $user
        );
    }
    
    // Добавляем отладочную информацию при ошибке
    return new WP_Error('invalid_code', 'Invalid code', array(
        'status' => 400,
        'debug' => array(
            'provided_code' => $code,
            'stored_code' => $stored_code,
            'phone' => $phone,
            'time_diff' => time() - $stored_time
        )
    ));
}

function atlas_check_auth($request) {
    $params = $request->get_params();
    $token = sanitize_text_field($params['token'] ?? '');
    
    if (empty($token)) {
        return new WP_Error('missing_token', 'Token is required', array('status' => 400));
    }
    
    // Получаем токены из WordPress опций
    $tokens = get_option('atlas_auth_tokens', array());
    
    if (!isset($tokens[$token])) {
        return new WP_Error('invalid_token', 'Invalid token', array('status' => 401));
    }
    
    $token_data = $tokens[$token];
    
    // Проверяем время жизни токена (30 дней)
    if (time() - $token_data['created_at'] > 2592000) {
        // Удаляем истекший токен
        unset($tokens[$token]);
        update_option('atlas_auth_tokens', $tokens);
        
        return new WP_Error('token_expired', 'Token has expired', array('status' => 401));
    }
    
    // Получаем данные пользователя
    $user = get_user_by('ID', $token_data['user_id']);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', array('status' => 404));
    }
    
    return array(
        'success' => true,
        'authenticated' => true,
        'user' => array(
            'id' => $user->ID,
            'phone' => $token_data['phone'],
            'name' => $user->display_name ?: "Пользователь " . substr($token_data['phone'], -4),
            'email' => $user->user_email,
            'created_at' => $user->user_registered
        )
    );
}

function atlas_logout($request) {
    $params = $request->get_params();
    $token = sanitize_text_field($params['token'] ?? '');
    
    if (empty($token)) {
        return new WP_Error('missing_token', 'Token is required', array('status' => 400));
    }
    
    // Получаем токены из WordPress опций
    $tokens = get_option('atlas_auth_tokens', array());
    
    if (isset($tokens[$token])) {
        // Удаляем токен
        unset($tokens[$token]);
        update_option('atlas_auth_tokens', $tokens);
    }
    
    return array(
        'success' => true,
        'message' => 'Logged out successfully'
    );
}

function atlas_get_or_create_user($phone) {
    // Ищем пользователя по номеру телефона
    $users = get_users(array(
        'meta_key' => 'atlas_phone',
        'meta_value' => $phone,
        'number' => 1
    ));
    
    if (!empty($users)) {
        // Пользователь найден
        $user = $users[0];
        return array(
            'id' => $user->ID,
            'phone' => $phone,
            'name' => $user->display_name ?: "Пользователь " . substr($phone, -4),
            'email' => $user->user_email,
            'created_at' => $user->user_registered
        );
    } else {
        // Создаем нового пользователя
        $username = 'user_' . substr($phone, -8);
        $email = $username . '@atlas-hajj.local';
        
        $user_id = wp_create_user($username, wp_generate_password(), $email);
        
        if (is_wp_error($user_id)) {
            // Если ошибка создания, генерируем уникальное имя
            $username = 'user_' . substr($phone, -8) . '_' . time();
            $email = $username . '@atlas-hajj.local';
            $user_id = wp_create_user($username, wp_generate_password(), $email);
        }
        
        if (!is_wp_error($user_id)) {
            // Обновляем данные пользователя
            wp_update_user(array(
                'ID' => $user_id,
                'display_name' => "Пользователь " . substr($phone, -4),
                'first_name' => "Пользователь",
                'last_name' => substr($phone, -4)
            ));
            
            // Сохраняем номер телефона
            update_user_meta($user_id, 'atlas_phone', $phone);
            
            return array(
                'id' => $user_id,
                'phone' => $phone,
                'name' => "Пользователь " . substr($phone, -4),
                'email' => $email,
                'created_at' => current_time('mysql')
            );
        }
    }
    
    // Возвращаем базовые данные если что-то пошло не так
    return array(
        'id' => 0,
        'phone' => $phone,
        'name' => "Пользователь " . substr($phone, -4),
        'email' => '',
        'created_at' => current_time('mysql')
    );
}

function atlas_get_profile($request) {
    $token = $request->get_header('Authorization');
    if ($token) {
        $token = str_replace('Bearer ', '', $token);
    }
    
    if (empty($token)) {
        return new WP_Error('missing_token', 'Authorization token required', array('status' => 401));
    }
    
    // Проверяем токен
    $tokens = get_option('atlas_auth_tokens', array());
    if (!isset($tokens[$token])) {
        return new WP_Error('invalid_token', 'Invalid token', array('status' => 401));
    }
    
    $token_data = $tokens[$token];
    $user = get_user_by('ID', $token_data['user_id']);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', array('status' => 404));
    }
    
    // Получаем дополнительные данные пользователя
    $profile_data = array(
        'id' => $user->ID,
        'phone' => $token_data['phone'],
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
    
    // Проверяем токен
    $tokens = get_option('atlas_auth_tokens', array());
    if (!isset($tokens[$token])) {
        return new WP_Error('invalid_token', 'Invalid token', array('status' => 401));
    }
    
    $token_data = $tokens[$token];
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
        'flight_outbound_connecting' => get_field('flight_outbound_connecting', $post_id) ? get_flight_data(get_field('flight_outbound_connecting', $post_id)) : null,
        'flight_connecting' => get_field('flight_connecting', $post_id) ? get_flight_data(get_field('flight_connecting', $post_id)) : null,
        'flight_inbound_connecting' => get_field('flight_inbound_connecting', $post_id) ? get_flight_data(get_field('flight_inbound_connecting', $post_id)) : null,
        
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

function atlas_search_tours($request) {
    $departure_city = $request->get_param('departure_city');
    $pilgrimage_type = $request->get_param('pilgrimage_type');
    $start_date = $request->get_param('start_date');
    $end_date = $request->get_param('end_date');
    $min_price = $request->get_param('min_price');
    $max_price = $request->get_param('max_price');
    $sort_by = $request->get_param('sort_by');
    
    $args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'meta_query' => array(),
        'tax_query' => array()
    );
    
    if ($departure_city) {
        $args['meta_query'][] = array(
            'key' => 'departure_city',
            'value' => $departure_city,
            'compare' => '='
        );
    }
    
    if ($pilgrimage_type) {
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
            'flight_outbound_connecting' => get_field('flight_outbound_connecting', $post_id) ? get_flight_data(get_field('flight_outbound_connecting', $post_id)) : null,
            'flight_connecting' => get_field('flight_connecting', $post_id) ? get_flight_data(get_field('flight_connecting', $post_id)) : null,
            'flight_inbound_connecting' => get_field('flight_inbound_connecting', $post_id) ? get_flight_data(get_field('flight_inbound_connecting', $post_id)) : null
        );
            
            $tours[] = $tour;
        }
    }
    
    wp_reset_postdata();
    
    // Фильтрация по датам (если указаны)
    if ($start_date && $end_date) {
        $filtered_tours = array();
        foreach ($tours as $tour) {
            if (isset($tour['tour_dates']) && is_array($tour['tour_dates'])) {
                foreach ($tour['tour_dates'] as $date_range) {
                    if (isset($date_range['date_start']) && isset($date_range['date_end'])) {
                        $tour_start = $date_range['date_start'];
                        $tour_end = $date_range['date_end'];
                        
                        // Проверяем пересечение дат
                        if (($tour_start >= $start_date && $tour_start <= $end_date) || 
                            ($tour_end >= $start_date && $tour_end <= $end_date) ||
                            ($tour_start <= $start_date && $tour_end >= $end_date)) {
                            $filtered_tours[] = $tour;
                            break; // Нашли подходящую дату для этого тура
                        }
                    }
                }
            }
        }
        $tours = $filtered_tours;
    }
    
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
    $token = sanitize_text_field($params['token'] ?? '');
    $tour_id = intval($params['tour_id'] ?? 0);
    $tour_data = $params['tour_data'] ?? array();
    
    if (empty($token) || empty($tour_id)) {
        return new WP_Error('missing_params', 'Token and tour_id are required', array('status' => 400));
    }
    
    $tokens = get_option('atlas_auth_tokens', array());
    if (!isset($tokens[$token])) {
        return new WP_Error('invalid_token', 'Invalid token', array('status' => 401));
    }
    
    $user_data = $tokens[$token];
    $user_id = $user_data['user_id'];
      
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
    
    // Объединяем данные тура с переданными данными
    $combined_tour_data = array_merge($full_tour_data, $tour_data);
    
    $booking_data = array(
        'user_id' => $user_id,
        'tour_id' => $tour_id,
        'tour_title' => $tour->post_title,
        'tour_slug' => $tour->post_name,
        'booking_date' => current_time('mysql'),
        'status' => 'pending',
        'tour_data' => $combined_tour_data
    );
    
    // Обновляем профиль пользователя данными первого туриста
    if (isset($tour_data['tourists']) && is_array($tour_data['tourists']) && count($tour_data['tourists']) > 0) {
        $first_tourist = $tour_data['tourists'][0];
        
        // Обновляем данные пользователя
        $user_update_data = array(
            'ID' => $user_id,
            'first_name' => $first_tourist['firstName'] ?? '',
            'last_name' => $first_tourist['lastName'] ?? '',
            'display_name' => trim(($first_tourist['firstName'] ?? '') . ' ' . ($first_tourist['lastName'] ?? ''))
        );
        
        wp_update_user($user_update_data);
        
        // Обновляем дополнительные поля с правильными ключами
        update_user_meta($user_id, 'atlas_birth_date', $first_tourist['birthDate'] ?? '');
        update_user_meta($user_id, 'atlas_gender', $first_tourist['gender'] ?? '');
        update_user_meta($user_id, 'atlas_iin', $first_tourist['iin'] ?? '');
        update_user_meta($user_id, 'atlas_passport_number', $first_tourist['passportNumber'] ?? '');
        update_user_meta($user_id, 'atlas_passport_issue_date', $first_tourist['passportIssueDate'] ?? '');
        update_user_meta($user_id, 'atlas_passport_expiry_date', $first_tourist['passportExpiryDate'] ?? '');
        

    }
    
    $user_bookings = get_user_meta($user_id, 'atlas_bookings', true);
    if (!is_array($user_bookings)) {
        $user_bookings = array();
    }
    
    $booking_id = uniqid('booking_');
    $user_bookings[$booking_id] = $booking_data;
    
    update_user_meta($user_id, 'atlas_bookings', $user_bookings);
    
    return array(
        'success' => true,
        'message' => 'Tour booked successfully',
        'booking_id' => $booking_id,
        'booking' => $booking_data
    );
}

function atlas_get_my_bookings($request) {
    $params = $request->get_params();
    $token = sanitize_text_field($params['token'] ?? '');
    
    if (empty($token)) {
        return new WP_Error('missing_token', 'Token is required', array('status' => 400));
    }
    
    $tokens = get_option('atlas_auth_tokens', array());
    if (!isset($tokens[$token])) {
        return new WP_Error('invalid_token', 'Invalid token', array('status' => 401));
    }
    
    $user_data = $tokens[$token];
    $user_id = $user_data['user_id'];
    
    $user_bookings = get_user_meta($user_id, 'atlas_bookings', true);
    if (!is_array($user_bookings)) {
        $user_bookings = array();
    }
    
    $bookings = array();
    foreach ($user_bookings as $booking_id => $booking) {
        $tour = get_post($booking['tour_id']);
        if ($tour) {
            $booking['tour_image'] = get_the_post_thumbnail_url($booking['tour_id'], 'medium');
            $booking['tour_price'] = $booking['tour_data']['price'] ?? get_field('price', $booking['tour_id']);
            $booking['tour_duration'] = get_field('duration', $booking['tour_id']);
            
            // Сохраняем оригинальные данные бронирования
            $original_tour_data = $booking['tour_data'] ?? array();
            
            // Обновляем данные тура актуальными данными о рейсах
            $booking['tour_data']['hotel_mekka'] = get_hotel_short_name($booking['tour_id'], 'hotel_mekka');
            $booking['tour_data']['hotel_medina'] = get_hotel_short_name($booking['tour_id'], 'hotel_medina');
            
            // Добавляем полные данные отелей
            $booking['tour_data']['hotels'] = array(
                'mekka' => get_hotel_data($booking['tour_id'], 'hotel_mekka'),
                'medina' => get_hotel_data($booking['tour_id'], 'hotel_medina')
            );
            
            // Добавляем данные о рейсах
            $booking['tour_data']['flight_type'] = get_field('flight_type', $booking['tour_id']);
            $booking['tour_data']['flight_outbound'] = get_flight_data(get_field('flight_outbound', $booking['tour_id']));
            $booking['tour_data']['flight_inbound'] = get_flight_data(get_field('flight_inbound', $booking['tour_id']));
            $booking['tour_data']['flight_outbound_connecting'] = get_flight_data(get_field('flight_outbound_connecting', $booking['tour_id']));
            $booking['tour_data']['flight_connecting'] = get_flight_data(get_field('flight_connecting', $booking['tour_id']));
            $booking['tour_data']['flight_inbound_connecting'] = get_flight_data(get_field('flight_inbound_connecting', $booking['tour_id']));
            
                // Добавляем данные об услугах
                $booking['tour_data']['services'] = get_field('services', $booking['tour_id']) ?: [];
                $booking['tour_data']['transfers'] = get_field('transfers', $booking['tour_id']);
                $booking['tour_data']['transfer_type'] = get_field('transfer_type', $booking['tour_id']);
                
                // Проверяем истечение времени бронирования (20 минут)
                if ($booking['status'] === 'pending') {
                    $booking_time = strtotime($booking['booking_date']);
                    $expiration_time = $booking_time + (20 * 60); // 20 минут
                    $current_time = time();
                    
                    if ($current_time > $expiration_time) {
                        // Обновляем статус на "expired" в базе данных
                        global $wpdb;
                        $wpdb->update(
                            $wpdb->prefix . 'atlas_bookings',
                            array('status' => 'expired'),
                            array('booking_id' => $booking['booking_id']),
                            array('%s'),
                            array('%s')
                        );
                        $booking['status'] = 'expired';
                    }
                }
        }
        $bookings[] = array_merge(array('booking_id' => $booking_id), $booking);
    }
    
    return array(
        'success' => true,
        'bookings' => $bookings
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

function atlas_kaspi_payment_app($request) {
    $params = $request->get_params();
    $command = sanitize_text_field($params['command'] ?? '');
    
    if ($command === 'check') {
        return atlas_kaspi_check_payment($params);
    } elseif ($command === 'pay') {
        $result = atlas_kaspi_process_payment($params);
        
        if (!is_wp_error($result) && $result['result'] == 0) {
            $order_id = sanitize_text_field($params['account'] ?? '');
            $txn_id = sanitize_text_field($params['txn_id'] ?? '');
            wp_redirect('https://booking.atlas.kz/kaspi-payment-success?txn_id=' . $txn_id . '&order_id=' . $order_id);
            exit;
        }
        
        return $result;
    } else {
        return new WP_Error('invalid_command', 'Invalid command', array('status' => 400));
    }
}

function atlas_kaspi_check_payment($params) {
    $txn_id = sanitize_text_field($params['txn_id'] ?? '');
    $account = sanitize_text_field($params['account'] ?? '');
    $sum = floatval($params['sum'] ?? 0);
    
    error_log('=== atlas_kaspi_check_payment called ===');
    error_log('Check params: txn_id=' . $txn_id . ', account=' . $account . ', sum=' . $sum);
    
    // Проверяем тестовые заказы
    if (strpos($account, 'ATLAS-TEST-') === 0) {
        return atlas_kaspi_handle_test_order($account, $txn_id, 'check');
    }
    
    if (empty($txn_id) || empty($account)) {
        error_log('Invalid parameters for check');
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    error_log('All payments: ' . print_r($payments, true));
    
    // Ищем платеж по txn_id или account
    $payment = null;
    if (isset($payments[$txn_id])) {
        $payment = $payments[$txn_id];
    } else {
        // Ищем по account
        foreach ($payments as $payment_data) {
            if ($payment_data['order_id'] === $account) {
                $payment = $payment_data;
                break;
            }
        }
    }
    
    if ($payment) {
        error_log('Found payment: ' . print_r($payment, true));
        
        // Проверяем статус платежа
        $status = $payment['status'] ?? 'pending';
        
        switch ($status) {
            case 'pending':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 0,
                    'comment' => 'Заказ найден и доступен для оплаты'
                );
            case 'completed':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 3,
                    'comment' => 'Заказ уже оплачен'
                );
            case 'cancelled':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 2,
                    'comment' => 'Заказ отменен'
                );
            case 'processing':
                return array(
                    'txn_id' => $txn_id,
                    'result' => 4,
                    'comment' => 'Платеж в обработке'
                );
            default:
                return array(
                    'txn_id' => $txn_id,
                    'result' => 5,
                    'comment' => 'Другая ошибка провайдера'
                );
        }
    } else {
        error_log('Payment not found for txn_id: ' . $txn_id . ' or account: ' . $account);
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
}

function atlas_kaspi_process_payment($params) {
    $txn_id = sanitize_text_field($params['txn_id'] ?? '');
    $account = sanitize_text_field($params['account'] ?? '');
    $sum = floatval($params['sum'] ?? 0);
    $txn_date = sanitize_text_field($params['txn_date'] ?? '');
    
    error_log('=== atlas_kaspi_process_payment called ===');
    error_log('Process params: txn_id=' . $txn_id . ', account=' . $account . ', sum=' . $sum . ', txn_date=' . $txn_date);
    
    // Проверяем тестовые заказы
    if (strpos($account, 'ATLAS-TEST-') === 0) {
        return atlas_kaspi_handle_test_order($account, $txn_id, 'pay', $sum, $txn_date);
    }
    
    if (empty($txn_id) || empty($account) || $sum <= 0) {
        error_log('Invalid parameters for payment');
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    error_log('All payments in process: ' . print_r($payments, true));
    
    // Ищем платеж по txn_id или account
    $payment = null;
    if (isset($payments[$txn_id])) {
        $payment = $payments[$txn_id];
    } else {
        // Ищем по account
        foreach ($payments as $payment_data) {
            if ($payment_data['order_id'] === $account) {
                $payment = $payment_data;
                break;
            }
        }
    }
    
    if ($payment) {
        error_log('Found payment in process: ' . print_r($payment, true));
        
        // Проверяем статус платежа
        $status = $payment['status'] ?? 'pending';
        
        if ($status === 'completed') {
            $order_id = sanitize_text_field($params['account'] ?? '');
            wp_redirect('https://booking.atlas.kz/kaspi-payment-success?txn_id=' . $txn_id . '&order_id=' . $order_id);
            exit;
        } elseif ($status === 'cancelled') {
            return array(
                'txn_id' => $txn_id,
                'result' => 2,
                'comment' => 'Заказ отменен'
            );
        } elseif ($status === 'processing') {
            return array(
                'txn_id' => $txn_id,
                'result' => 4,
                'comment' => 'Платеж в обработке'
            );
        }
        
        // Обрабатываем платеж
        $payment['status'] = 'completed';
        $payment['completed_at'] = current_time('mysql');
        $payment['kaspi_txn_date'] = $txn_date;
        $payment['processed_amount'] = $sum;
        
        $payments[$txn_id] = $payment;
        update_option('atlas_kaspi_payments', $payments);
        
        error_log('Payment marked as completed');
        
        // Обновляем бронирование пользователя
        if (isset($payment['user_id']) && isset($payment['tour_id'])) {
            $user_bookings = get_user_meta($payment['user_id'], 'atlas_bookings', true);
            if (is_array($user_bookings)) {
                foreach ($user_bookings as $booking_id => $booking) {
                    if ($booking['tour_id'] == $payment['tour_id']) {
                        $user_bookings[$booking_id]['status'] = 'paid';
                        $user_bookings[$booking_id]['payment_id'] = $txn_id;
                        $user_bookings[$booking_id]['paid_at'] = current_time('mysql');
                        error_log('User booking updated: ' . print_r($user_bookings[$booking_id], true));
                        
                        // Обновляем количество мест в туре
                        $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
                        $room_type = isset($booking['tour_data']['roomType']) ? $booking['tour_data']['roomType'] : null;
                        atlas_update_tour_spots($payment['tour_id'], $tourists_count, $room_type);
                        
                        break;
                    }
                }
                update_user_meta($payment['user_id'], 'atlas_bookings', $user_bookings);
            }
        }
        
        error_log('Payment processed successfully');
        return array(
            'txn_id' => $txn_id,
            'prv_txn_id' => 'ATLAS-PAYMENT-' . $txn_id,
            'result' => 0,
            'sum' => $sum,
            'comment' => 'Платеж успешно обработан'
        );
    } else {
        error_log('Payment not found for txn_id: ' . $txn_id . ' or account: ' . $account);
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
}

// Функция для обработки тестовых заказов
function atlas_kaspi_handle_test_order($account, $txn_id, $command, $sum = 0, $txn_date = '') {
    error_log('=== Handling test order: ' . $account . ' ===');
    
    $test_orders = array(
        'ATLAS-TEST-00001' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты'),
        'ATLAS-TEST-00002' => array('status' => 'not_found', 'result' => 1, 'comment' => 'Заказ не найден'),
        'ATLAS-TEST-00003' => array('status' => 'cancelled', 'result' => 2, 'comment' => 'Заказ отменен'),
        'ATLAS-TEST-00004' => array('status' => 'completed', 'result' => 3, 'comment' => 'Заказ уже оплачен'),
        'ATLAS-TEST-00005' => array('status' => 'processing', 'result' => 4, 'comment' => 'Платеж в обработке'),
        'ATLAS-TEST-00006' => array('status' => 'error', 'result' => 5, 'comment' => 'Другая ошибка провайдера'),
        'ATLAS-TEST-00007' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты', 'min_amount' => 1000),
        'ATLAS-TEST-00008' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты', 'max_amount' => 5000000),
        'ATLAS-TEST-00009' => array('status' => 'pending', 'result' => 0, 'comment' => 'Заказ найден и доступен для оплаты', 'delay' => true)
    );
    
    if (!isset($test_orders[$account])) {
        return array(
            'txn_id' => $txn_id,
            'result' => 1,
            'comment' => 'Заказ не найден'
        );
    }
    
    $test_order = $test_orders[$account];
    
    // Проверяем минимальную сумму для ATLAS-TEST-00007
    if (isset($test_order['min_amount']) && $sum < $test_order['min_amount']) {
        return array(
            'txn_id' => $txn_id,
            'result' => 5,
            'comment' => 'Сумма меньше минимальной'
        );
    }
    
    // Проверяем максимальную сумму для ATLAS-TEST-00008
    if (isset($test_order['max_amount']) && $sum > $test_order['max_amount']) {
        return array(
            'txn_id' => $txn_id,
            'result' => 5,
            'comment' => 'Сумма больше максимальной'
        );
    }
    
    // Имитируем задержку для ATLAS-TEST-00009
    if (isset($test_order['delay'])) {
        sleep(2);
    }
    
    if ($command === 'check') {
        return array(
            'txn_id' => $txn_id,
            'result' => $test_order['result'],
            'comment' => $test_order['comment']
        );
    } elseif ($command === 'pay') {
        if ($test_order['status'] === 'pending') {
            return array(
                'txn_id' => $txn_id,
                'prv_txn_id' => 'ATLAS-PAYMENT-' . $txn_id,
                'result' => 0,
                'sum' => $sum,
                'comment' => 'Платеж успешно обработан'
            );
        } else {
            return array(
                'txn_id' => $txn_id,
                'result' => $test_order['result'],
                'comment' => $test_order['comment']
            );
        }
    }
    
    return array(
        'txn_id' => $txn_id,
        'result' => 5,
        'comment' => 'Другая ошибка провайдера'
    );
}

function atlas_kaspi_test_page($request) {
    // Создаем тестовый платеж
    $tran_id = 'KSP' . uniqid();
    $order_id = 'test_' . time();
    $amount = 100000;
    
    $payment_data = array(
        'tran_id' => $tran_id,
        'order_id' => $order_id,
        'amount' => $amount,
        'tour_id' => 33,
        'user_id' => 3,
        'status' => 'pending',
        'created_at' => current_time('mysql')
    );
    
    $payments = get_option('atlas_kaspi_payments', array());
    $payments[$tran_id] = $payment_data;
    update_option('atlas_kaspi_payments', $payments);
    
    // Формируем простую HTML страницу
    $html = '<html><head><title>Kaspi Test</title></head><body>';
    $html .= '<h1>Kaspi Payment Test</h1>';
    $html .= '<p><strong>TranId:</strong> ' . $tran_id . '</p>';
    $html .= '<p><strong>OrderId:</strong> ' . $order_id . '</p>';
    $html .= '<p><strong>Amount:</strong> ' . number_format($amount) . ' ₸</p>';
    $html .= '<p><strong>Status:</strong> ' . $payment_data['status'] . '</p>';
    $html .= '<h3>Test URLs:</h3>';
    $html .= '<p><strong>Check Payment:</strong><br>';
    $html .= 'https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=check&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</p>';
    $html .= '<p><strong>Kaspi URL:</strong><br>';
    $html .= 'https://kaspi.kz/online?TranId=' . $tran_id . '&OrderId=' . $order_id . '&Amount=' . $amount . '&Service=AtlasBooking&returnUrl=https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</p>';
    $html .= '<form action="https://kaspi.kz/online" method="post">';
    $html .= '<input type="hidden" name="TranId" value="' . $tran_id . '">';
    $html .= '<input type="hidden" name="OrderId" value="' . $order_id . '">';
    $html .= '<input type="hidden" name="Amount" value="' . $amount . '">';
    $html .= '<input type="hidden" name="Service" value="AtlasBooking">';
    $html .= '<input type="hidden" name="returnUrl" value="https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '">';
    $html .= '<button type="submit">Test Kaspi Payment</button>';
    $html .= '</form>';
    $html .= '</body></html>';
    
    return new WP_REST_Response($html, 200, array('Content-Type' => 'text/html'));
}

// Функция для обновления количества мест в туре
function atlas_update_tour_spots($tour_id, $spots_to_reduce = 1, $room_type = null) {
    error_log("=== atlas_update_tour_spots ВЫЗВАНА ===");
    error_log("Параметры: tour_id=$tour_id, spots_to_reduce=$spots_to_reduce, room_type=$room_type");
    
    $room_options = get_field('room_options', $tour_id);
    error_log("room_options получены: " . print_r($room_options, true));
    $updated = false;
    
    if (is_array($room_options)) {
        error_log("room_options - массив, начинаем обработку");
        foreach ($room_options as $index => $room) {
            error_log("Обрабатываем комнату $index: " . print_r($room, true));
            
            // Если указан тип комнаты, обновляем только его
            if ($room_type && isset($room['type']) && $room['type'] === $room_type) {
                error_log("Найдена комната нужного типа: {$room['type']}");
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = max(0, $current_spots - $spots_to_reduce);
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                    error_log("Updated spots for tour {$tour_id}, room type {$room_type}: {$current_spots} -> {$new_spots}");
                } else {
                    error_log("spots_left не найден для комнаты типа {$room_type}");
                }
            } elseif (!$room_type) {
                error_log("Тип комнаты не указан, обновляем все");
                // Если тип не указан, обновляем все варианты
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = max(0, $current_spots - $spots_to_reduce);
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                    error_log("Updated all spots for tour {$tour_id}: {$current_spots} -> {$new_spots}");
                }
            } else {
                error_log("Комната типа {$room['type']} не соответствует искомому {$room_type}");
            }
        }
        
        if ($updated) {
            error_log("Обновляем room_options в базе данных");
            $update_result = update_field('room_options', $room_options, $tour_id);
            error_log("Результат update_field: " . ($update_result ? 'SUCCESS' : 'FAILED'));
        } else {
            error_log("Ничего не обновлено в room_options");
        }
    } else {
        error_log("room_options не является массивом");
    }
    
    // Если нет вариантов размещения, обновляем общее поле
    if (!$updated) {
        error_log("Обновляем общее поле spots_left");
        $current_spots = get_field('spots_left', $tour_id);
        if ($current_spots === false || $current_spots === null) {
            $current_spots = 10; // Значение по умолчанию
        }
        
        $new_spots = max(0, $current_spots - $spots_to_reduce);
        $update_result = update_field('spots_left', $new_spots, $tour_id);
        error_log("Updated general spots for tour {$tour_id}: {$current_spots} -> {$new_spots}, update_result: " . ($update_result ? 'SUCCESS' : 'FAILED'));
    }
    
    error_log("=== atlas_update_tour_spots ЗАВЕРШЕНА ===");
    return true;
}

// Функция для возврата мест в тур (при отмене бронирования)
function atlas_return_tour_spots($tour_id, $spots_to_return = 1, $room_type = null) {
    $room_options = get_field('room_options', $tour_id);
    $updated = false;
    
    if (is_array($room_options)) {
        foreach ($room_options as $index => $room) {
            // Если указан тип комнаты, обновляем только его
            if ($room_type && isset($room['type']) && $room['type'] === $room_type) {
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = $current_spots + $spots_to_return;
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                    error_log("Returned spots for tour {$tour_id}, room type {$room_type}: {$current_spots} -> {$new_spots}");
                }
            } elseif (!$room_type) {
                // Если тип не указан, обновляем все варианты
                if (isset($room['spots_left'])) {
                    $current_spots = intval($room['spots_left']);
                    $new_spots = $current_spots + $spots_to_return;
                    $room_options[$index]['spots_left'] = $new_spots;
                    $updated = true;
                }
            }
        }
        
        if ($updated) {
            update_field('room_options', $room_options, $tour_id);
        }
    }
    
    // Если нет вариантов размещения, обновляем общее поле
    if (!$updated) {
        $current_spots = get_field('spots_left', $tour_id);
        if ($current_spots === false || $current_spots === null) {
            $current_spots = 10; // Значение по умолчанию
        }
        
        $new_spots = $current_spots + $spots_to_return;
        update_field('spots_left', $new_spots, $tour_id);
        error_log("Returned general spots for tour {$tour_id}: {$current_spots} -> {$new_spots}");
    }
    
    return true;
}

// Добавляем пункт меню в админку
function atlas_kaspi_admin_menu() {
    add_menu_page(
        'Kaspi Test', 
        'Kaspi Test', 
        'manage_options', 
        'kaspi-test', 
        'atlas_kaspi_admin_page',
        'dashicons-money-alt',
        30
    );
}

// Страница в админке
function atlas_kaspi_admin_page() {
    if (isset($_POST['test_kaspi'])) {
        // Создаем тестовый платеж
        $tran_id = 'KSP' . uniqid();
        $order_id = 'test_' . time();
        $amount = 100000;
        
        $payment_data = array(
            'tran_id' => $tran_id,
            'order_id' => $order_id,
            'amount' => $amount,
            'tour_id' => 33,
            'user_id' => 3,
            'status' => 'pending',
            'created_at' => current_time('mysql')
        );
        
        $payments = get_option('atlas_kaspi_payments', array());
        $payments[$tran_id] = $payment_data;
        update_option('atlas_kaspi_payments', $payments);
        
        echo '<div class="notice notice-success"><p>Тестовый платеж создан: ' . $tran_id . '</p></div>';
    }
    
    ?>
    <div class="wrap">
        <h1>🧪 Kaspi Payment Test</h1>
        
        <div class="card">
            <h2>Создать тестовый платеж</h2>
            <form method="post">
                <p>Нажмите кнопку чтобы создать тестовый платеж для Kaspi</p>
                <input type="submit" name="test_kaspi" class="button button-primary" value="Создать тестовый платеж">
            </form>
        </div>
        
        <div class="card">
            <h2>Тестовые URL</h2>
            <?php
            $payments = get_option('atlas_kaspi_payments', array());
            if (!empty($payments)) {
                $last_payment = end($payments);
                $tran_id = $last_payment['tran_id'];
                $order_id = $last_payment['order_id'];
                $amount = $last_payment['amount'];
                
                echo '<p><strong>Последний платеж:</strong></p>';
                echo '<p>TranId: <code>' . $tran_id . '</code></p>';
                echo '<p>OrderId: <code>' . $order_id . '</code></p>';
                echo '<p>Amount: <code>' . number_format($amount) . ' ₸</code></p>';
                
                echo '<h3>1. Проверить платеж:</h3>';
                echo '<p><code>https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=check&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</code></p>';
                
                echo '<h3>2. Kaspi URL:</h3>';
                echo '<p><code>https://kaspi.kz/online?TranId=' . $tran_id . '&OrderId=' . $order_id . '&Amount=' . $amount . '&Service=AtlasBooking&returnUrl=https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</code></p>';
                
                echo '<h3>3. Тестовая форма:</h3>';
                echo '<form action="https://kaspi.kz/online" method="post" target="_blank">';
                echo '<input type="hidden" name="TranId" value="' . $tran_id . '">';
                echo '<input type="hidden" name="OrderId" value="' . $order_id . '">';
                echo '<input type="hidden" name="Amount" value="' . $amount . '">';
                echo '<input type="hidden" name="Service" value="AtlasBooking">';
                echo '<input type="hidden" name="returnUrl" value="https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '">';
                echo '<input type="submit" class="button button-secondary" value="🚀 Тест Kaspi Payment">';
                echo '</form>';
            } else {
                echo '<p>Нет созданных платежей. Создайте тестовый платеж выше.</p>';
            }
            ?>
        </div>
        
        <div class="card">
            <h2>Все платежи</h2>
            <?php
            if (!empty($payments)) {
                echo '<table class="wp-list-table widefat fixed striped">';
                echo '<thead><tr><th>TranId</th><th>OrderId</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>';
                echo '<tbody>';
                foreach ($payments as $payment) {
                    echo '<tr>';
                    echo '<td>' . $payment['tran_id'] . '</td>';
                    echo '<td>' . $payment['order_id'] . '</td>';
                    echo '<td>' . number_format($payment['amount']) . ' ₸</td>';
                    echo '<td>' . $payment['status'] . '</td>';
                    echo '<td>' . $payment['created_at'] . '</td>';
                    echo '</tr>';
                }
                echo '</tbody></table>';
            } else {
                echo '<p>Нет платежей</p>';
            }
            ?>
        </div>
    </div>
    <?php
}

function atlas_create_kaspi_payment($request) {
    error_log('=== atlas_create_kaspi_payment called ===');
    $params = $request->get_params();
    
    // Отладочная информация
    error_log('Kaspi payment params: ' . print_r($params, true));
    
    $order_id = sanitize_text_field($params['order_id'] ?? '');
    $amount = intval($params['amount'] ?? 0);
    $tour_id = intval($params['tour_id'] ?? 0);
    $token = sanitize_text_field($params['token'] ?? '');
    
    error_log("Parsed params: order_id=$order_id, amount=$amount, tour_id=$tour_id, token=$token");
    
    if (empty($order_id) || $amount <= 0 || $tour_id <= 0 || empty($token)) {
        error_log("Validation failed: order_id=" . (empty($order_id) ? 'empty' : $order_id) . 
                 ", amount=" . $amount . 
                 ", tour_id=" . $tour_id . 
                 ", token=" . (empty($token) ? 'empty' : 'present'));
        return new WP_Error('invalid_params', 'Invalid parameters', array('status' => 400));
    }
    
    // Получаем токены из WordPress опций
    $tokens = get_option('atlas_auth_tokens', array());
    
    if (!isset($tokens[$token])) {
        error_log("Token not found: $token");
        return new WP_Error('invalid_token', 'Invalid token', array('status' => 401));
    }
    
    $token_data = $tokens[$token];
    $user_id = $token_data['user_id'];
    
    error_log("User ID from token: $user_id");
    
    $tran_id = 'KSP' . uniqid();
    
    $payment_data = array(
        'tran_id' => $tran_id,
        'order_id' => $order_id,
        'amount' => $amount,
        'tour_id' => $tour_id,
        'user_id' => $user_id,
        'status' => 'pending',
        'created_at' => current_time('mysql')
    );
    
    $payments = get_option('atlas_kaspi_payments', array());
    $payments[$tran_id] = $payment_data;
    update_option('atlas_kaspi_payments', $payments);
    
    error_log('Payment saved to database: ' . print_r($payment_data, true));
    error_log('All payments after save: ' . print_r($payments, true));
    
    // Делаем POST запрос к Kaspi для получения URL оплаты (JSON формат)
    error_log('Making POST request to Kaspi for payment URL');
    
    // Делаем POST запрос к Kaspi для получения URL оплаты (JSON формат)
    error_log('Making POST request to Kaspi for payment URL');
    
    $kaspi_data = array(
        'TranId' => $tran_id,
        'OrderId' => $order_id,
        'Amount' => $amount * 100,
        'Service' => 'AtlasBooking',
        'returnUrl' => 'https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount,
        'refererHost' => 'api.booking.atlas.kz',
        'GenerateQrCode' => false
    );
    
    error_log('Kaspi request data: ' . print_r($kaspi_data, true));
    
    // Отправляем POST запрос к Kaspi (JSON формат согласно документации)
    error_log('Sending POST request to Kaspi with data: ' . print_r($kaspi_data, true));
    
    $response = wp_remote_post('https://kaspi.kz/online', array(
        'body' => json_encode($kaspi_data),
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
            'User-Agent' => 'Atlas-Hajj/1.0'
        )
    ));
    
    if (is_wp_error($response)) {
        error_log('Kaspi request failed: ' . $response->get_error_message());
        return new WP_Error('kaspi_error', 'Failed to get payment URL from Kaspi', array('status' => 500));
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    
    error_log('Kaspi response code: ' . $response_code);
    error_log('Kaspi response body: ' . $response_body);
    
    if ($response_code === 200) {
        // Парсим JSON ответ от Kaspi
        $kaspi_result = json_decode($response_body, true);
        error_log('Parsed Kaspi response: ' . print_r($kaspi_result, true));
        
        if ($kaspi_result && isset($kaspi_result['code']) && $kaspi_result['code'] === 0) {
            // Успешный ответ от Kaspi
            error_log('Kaspi payment URL received: ' . $kaspi_result['redirectUrl']);
            
            return array(
                'success' => true,
                'payment_url' => $kaspi_result['redirectUrl'],
                'tran_id' => $tran_id,
                'order_id' => $order_id,
                'amount' => $amount
            );
        } else {
            error_log('Kaspi returned error: ' . print_r($kaspi_result, true));
            $error_message = 'Unknown error';
            if (isset($kaspi_result['message'])) {
                $error_message = $kaspi_result['message'];
            } elseif (isset($kaspi_result['comment'])) {
                $error_message = $kaspi_result['comment'];
            }
            return new WP_Error('kaspi_error', 'Kaspi returned error: ' . $error_message, array('status' => 400));
        }
    } else {
        error_log('Kaspi request failed with code: ' . $response_code);
        error_log('Kaspi response headers: ' . print_r(wp_remote_retrieve_headers($response), true));
        return new WP_Error('kaspi_error', 'Failed to get payment URL from Kaspi (HTTP ' . $response_code . ')', array('status' => 500));
    }
}

function atlas_test_kaspi_payment($request) {
    error_log('=== atlas_test_kaspi_payment called ===');
    
    $tran_id = 'KSP' . uniqid();
    $order_id = 'test_' . time();
    $amount = 1000;
    
    error_log('Creating test payment: txn_id=' . $tran_id . ', order_id=' . $order_id . ', amount=' . $amount);
    
    $payment_data = array(
        'tran_id' => $tran_id,
        'order_id' => $order_id,
        'amount' => $amount,
        'tour_id' => 1,
        'user_id' => 1,
        'status' => 'pending',
        'created_at' => current_time('mysql')
    );
    
    $payments = get_option('atlas_kaspi_payments', array());
    $payments[$tran_id] = $payment_data;
    update_option('atlas_kaspi_payments', $payments);
    
    error_log('Test payment saved: ' . print_r($payment_data, true));
    
    $check_url = 'https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=check&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount;
    
    return array(
        'success' => true,
        'test_payment' => $payment_data,
        'check_url' => $check_url,
        'message' => 'Тестовый платеж создан. Используйте check_url для проверки.'
    );
}

function atlas_get_kaspi_payment_status($request) {
    $params = $request->get_params();
    $tran_id = sanitize_text_field($params['tran_id'] ?? '');
    $order_id = sanitize_text_field($params['order_id'] ?? '');
    
    if (empty($tran_id) && empty($order_id)) {
        return new WP_Error('missing_params', 'Transaction ID or Order ID is required', array('status' => 400));
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    
    if (!empty($tran_id)) {
        if (!isset($payments[$tran_id])) {
            return new WP_Error('payment_not_found', 'Payment not found', array('status' => 404));
        }
        $payment = $payments[$tran_id];
    } else {
        $payment = null;
        foreach ($payments as $tran_id_key => $payment_data) {
            if ($payment_data['order_id'] === $order_id) {
                $payment = $payment_data;
                break;
            }
        }
        
        if (!$payment) {
            return new WP_Error('payment_not_found', 'Payment not found', array('status' => 404));
        }
    }
    
    return array(
        'success' => true,
        'payment' => $payment
    );
}

function atlas_get_pilgrimage_types($request) {
    $terms = get_terms(array(
        'taxonomy' => 'pilgrimage_type',
        'hide_empty' => false,
        'orderby' => 'name',
        'order' => 'ASC'
    ));
    
    if (is_wp_error($terms)) {
        return new WP_Error('taxonomy_error', 'Failed to get pilgrimage types', array('status' => 500));
    }
    
    $pilgrimage_types = array();
    foreach ($terms as $term) {
        $pilgrimage_types[] = array(
            'id' => $term->term_id,
            'slug' => $term->slug,
            'name' => $term->name,
            'description' => $term->description,
            'count' => $term->count
        );
    }
    
    return array(
        'success' => true,
        'pilgrimage_types' => $pilgrimage_types
    );
}

function atlas_process_kaspi_webhook($request) {
    $params = $request->get_params();
    $tran_id = sanitize_text_field($params['TranId'] ?? '');
    $order_id = sanitize_text_field($params['OrderId'] ?? '');
    $amount = intval($params['Amount'] ?? 0);
    $status = sanitize_text_field($params['Status'] ?? '');
    
    if (empty($tran_id) || empty($order_id)) {
        return new WP_Error('invalid_webhook', 'Invalid webhook data', array('status' => 400));
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    if (!isset($payments[$tran_id])) {
        return new WP_Error('payment_not_found', 'Payment not found', array('status' => 404));
    }
    
    $payment = $payments[$tran_id];
    
    if ($status === 'success' || $status === 'completed') {
        $payment['status'] = 'completed';
        $payment['completed_at'] = current_time('mysql');
        
        $user_bookings = get_user_meta($payment['user_id'], 'atlas_bookings', true);
        if (is_array($user_bookings)) {
            foreach ($user_bookings as $booking_id => $booking) {
                if ($booking['tour_id'] == $payment['tour_id']) {
                    $user_bookings[$booking_id]['status'] = 'paid';
                    $user_bookings[$booking_id]['payment_id'] = $tran_id;
                    $user_bookings[$booking_id]['paid_at'] = current_time('mysql');
                    
                    // Обновляем количество мест в туре
                    $tourists_count = isset($booking['tour_data']['tourists']) ? count($booking['tour_data']['tourists']) : 1;
                    $room_type = isset($booking['tour_data']['roomType']) ? $booking['tour_data']['roomType'] : null;
                    atlas_update_tour_spots($payment['tour_id'], $tourists_count, $room_type);
                    
                    break;
                }
            }
            update_user_meta($payment['user_id'], 'atlas_bookings', $user_bookings);
        }
    } else {
        $payment['status'] = 'failed';
        $payment['failed_at'] = current_time('mysql');
    }
    
    $payments[$tran_id] = $payment;
    update_option('atlas_kaspi_payments', $payments);
    
    return array(
        'success' => true,
        'message' => 'Webhook processed successfully'
    );
}

add_action('rest_api_init', function() {
    register_rest_route('atlas/v1', '/kaspi/webhook', array(
        'methods' => 'POST',
        'callback' => 'atlas_process_kaspi_webhook',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas/v1', '/kaspi/test', array(
        'methods' => 'GET',
        'callback' => 'atlas_kaspi_test_page',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/pilgrimage-types', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_pilgrimage_types',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('atlas-hajj/v1', '/tour-spots/(?P<tour_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'atlas_get_tour_spots',
        'permission_callback' => '__return_true'
    ));
});

// Функция для получения актуального количества мест в туре
function atlas_get_tour_spots($request) {
    $tour_id = intval($request['tour_id']);
    
    if (!$tour_id) {
        return new WP_Error('invalid_tour_id', 'Invalid tour ID', array('status' => 400));
    }
    
    $tour = get_post($tour_id);
    if (!$tour) {
        return new WP_Error('tour_not_found', 'Tour not found', array('status' => 404));
    }
    
    $room_options = get_field('room_options', $tour_id);
    $room_spots = array();
    $total_spots = 0;
    
    if (is_array($room_options)) {
        foreach ($room_options as $room) {
            $spots = intval($room['spots_left'] ?? 4);
            $total_spots += $spots;
            
            $room_spots[] = array(
                'type' => $room['type'] ?? 'double',
                'spots_left' => $spots,
                'description' => $room['description'] ?? '',
                'price' => $room['price'] ?? 0,
                'old_price' => $room['old_price'] ?? null
            );
        }
    }
    
    // Если нет вариантов размещения, используем общее поле
    if ($total_spots === 0) {
        $spots_left = get_field('spots_left', $tour_id);
        if ($spots_left === false || $spots_left === null) {
            $spots_left = 10; // Значение по умолчанию
        }
    } else {
        $spots_left = $total_spots;
    }
    
    error_log("Tour spots API called for tour {$tour_id}: " . print_r($room_spots, true));
    
    return array(
        'success' => true,
        'tour_id' => $tour_id,
        'spots_left' => $spots_left,
        'room_options' => $room_spots
    );
}

// Функция для получения списка отелей
function atlas_get_hotels($request) {
    $hotels = get_posts(array(
        'post_type' => 'hotel',
        'post_status' => 'publish',
        'numberposts' => -1,
    ));
    
    $hotels_data = array();
    
    if ($hotels) {
        foreach ($hotels as $hotel) {
            $hotels_data[] = array(
                'id' => $hotel->ID,
                'name' => $hotel->post_title,
                'slug' => $hotel->post_name,
                'description' => get_field('description', $hotel->ID),
                'rating' => get_field('rating', $hotel->ID),
                'rating_text' => get_field('rating_text', $hotel->ID),
                'distance' => get_field('distance', $hotel->ID),
                'city' => get_field('city', $hotel->ID),
                'amenities' => get_field('amenities', $hotel->ID) ?: array(),
                'gallery' => get_field('gallery', $hotel->ID) ?: array()
            );
        }
    }
    
    return $hotels_data;
}

function atlas_get_transfers($request) {
    $transfers = get_posts(array(
        'post_type' => 'transfer',
        'post_status' => 'publish',
        'numberposts' => -1,
    ));
    
    $transfers_data = array();
    
    if ($transfers) {
        foreach ($transfers as $transfer) {
            $transfers_data[] = array(
                'id' => $transfer->ID,
                'name' => $transfer->post_title,
                'slug' => $transfer->post_name,
                'description' => get_field('description', $transfer->ID),
                'short_name' => get_field('short_name', $transfer->ID),
                'gallery' => get_field('gallery', $transfer->ID) ?: array()
            );
        }
    }
    
    return $transfers_data;
}

// Валидация дат туров
add_action('acf/validate_value/name=date_end', 'atlas_validate_tour_dates', 10, 4);
function atlas_validate_tour_dates($valid, $value, $field, $input) {
    if (!$valid) {
        return $valid;
    }
    
    // Получаем дату начала из того же repeater'а
    $start_date_field = str_replace('date_end', 'date_start', $field['name']);
    $start_date = $_POST['acf'][$field['parent']][$field['parent_repeater']][$start_date_field] ?? '';
    
    if (!empty($start_date) && !empty($value)) {
        $start_timestamp = strtotime($start_date);
        $end_timestamp = strtotime($value);
        
        if ($end_timestamp < $start_timestamp) {
            $valid = 'Дата окончания не может быть раньше даты начала тура';
        }
    }
    
    return $valid;
}

// JavaScript для валидации дат в админке
add_action('acf/input/admin_footer', 'atlas_tour_dates_validation_script');
function atlas_tour_dates_validation_script() {
    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        // Валидация дат в repeater'е дат туров
        $(document).on('change', 'input[name*="date_start"], input[name*="date_end"]', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            var startDate = $row.find('input[name*="date_start"]').val();
            var endDate = $row.find('input[name*="date_end"]').val();
            
            if (startDate && endDate) {
                var start = new Date(startDate);
                var end = new Date(endDate);
                
                if (end < start) {
                    alert('Дата окончания не может быть раньше даты начала тура');
                    $(this).val('');
                }
            }
        });
        
        // Автоматическое заполнение даты окончания при изменении даты начала
        $(document).on('change blur keyup', 'input[name*="date_start"]', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            updateEndDate($row);
        });
        
        // Автоматическое заполнение при изменении длительности в repeater'е
        $(document).on('change', 'select[name*="duration"]', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            updateEndDate($row);
        });
        
        // Функция для обновления даты окончания
        function updateEndDate($row) {
            var startDateField = $row.find('input[name*="date_start"]');
            var endDateField = $row.find('input[name*="date_end"]');
            var durationField = $row.find('select[name*="duration"]');
            
            var startDate = startDateField.val();
            var duration = durationField.val() || '7';
            
            if (startDate) {
                var start;
                
                // Проверяем формат даты (YYYYMMDD или YYYY-MM-DD)
                if (startDate.length === 8 && /^\d{8}$/.test(startDate)) {
                    // Формат YYYYMMDD
                    var year = startDate.substring(0, 4);
                    var month = startDate.substring(4, 6);
                    var day = startDate.substring(6, 8);
                    start = new Date(year, month - 1, day);
                } else {
                    // Стандартный формат
                    start = new Date(startDate);
                }
                
                start.setDate(start.getDate() + parseInt(duration) - 1);
                var endDateStr = start.getFullYear() + '-' + 
                    String(start.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(start.getDate()).padStart(2, '0');
                
                endDateField.val(endDateStr);
            }
        }
        
        // Отслеживание изменений через MutationObserver
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                        var target = $(mutation.target);
                        if (target.is('input[name*="date_start"]')) {
                            var $row = target.closest('[data-name="tour_dates"] .acf-row');
                            updateEndDate($row);
                        }
                    }
                });
            });
            
            // Наблюдаем за изменениями в repeater'е
            $('[data-name="tour_dates"]').each(function() {
                observer.observe(this, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['value']
                });
            });
        }
        
    });
    </script>
    <?php
}

// Добавляем JavaScript для автоматического расчета времени в пути рейсов
function atlas_flight_duration_calculator() {
    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        // Функция для расчета времени в пути
        function calculateFlightDuration() {
            // Ищем все поля в рамках всего контейнера рейса, а не только в одном .acf-field
            var $container = $(this).closest('.acf-fields, .postbox, .inside');
            
            var departureTime = $container.find('input[name*="departure_time"]').val();
            var arrivalTime = $container.find('input[name*="arrival_time"]').val();
            var durationField = $container.find('input[name*="duration"]');
            
            // Если не нашли поля в контейнере, ищем глобально
            if (!departureTime || !arrivalTime) {
                departureTime = $('input[name*="departure_time"]').val();
                arrivalTime = $('input[name*="arrival_time"]').val();
                durationField = $('input[name*="duration"]');
            }
            
            if (departureTime && arrivalTime) {
                var departure = new Date(departureTime);
                var arrival = new Date(arrivalTime);
                
                if (arrival > departure) {
                    var diffMs = arrival - departure;
                    var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    var diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    var duration = diffHours + ' ч ' + diffMinutes + ' м';
                    durationField.val(duration);
                }
            }
        }
        
        // Обработчики для полей времени - используем правильные селекторы для date_time_picker
        $(document).on('change', 'input[name*="departure_time"], input[name*="arrival_time"]', function() {
            // Добавляем небольшую задержку, чтобы дать время ACF полям обновиться
            setTimeout(function() {
                calculateFlightDuration.call(this);
            }.bind(this), 100);
        });
        
        // Дополнительный обработчик для скрытых полей date_time_picker
        $(document).on('change', '.acf-date-time-picker input[type="hidden"]', function() {
            calculateFlightDuration.call(this);
        });
        
        // Обработчик для изменения значений в date picker
        $(document).on('change', '.acf-date-time-picker input.input', function() {
            calculateFlightDuration.call(this);
        });
        
        // Обработчик для всех input полей в контейнере рейсов
        $(document).on('input change', '.acf-field[data-name="departure_time"] input, .acf-field[data-name="arrival_time"] input', function() {
            calculateFlightDuration.call(this);
        });
        
        // Используем MutationObserver для отслеживания изменений в ACF полях
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                    var target = $(mutation.target);
                    if (target.is('input[name*="departure_time"], input[name*="arrival_time"]')) {
                        calculateFlightDuration.call(target[0]);
                    }
                }
            });
        });
        
        // Наблюдаем за изменениями в полях рейсов
        $('.acf-field[data-name="departure_time"], .acf-field[data-name="arrival_time"]').each(function() {
            observer.observe(this, {
                attributes: true,
                subtree: true,
                attributeFilter: ['value']
            });
        });
        
        // Дополнительный обработчик для ACF событий
        $(document).on('acf/setup_fields', function(e, postbox) {
            $(postbox).find('input[name*="departure_time"], input[name*="arrival_time"]').on('change', function() {
                calculateFlightDuration.call(this);
            });
        });
        
        // Глобальная функция для проверки и расчета времени
        function checkAndCalculateDuration() {
            var departureTime = $('input[name*="departure_time"]').val();
            var arrivalTime = $('input[name*="arrival_time"]').val();
            var durationField = $('input[name*="duration"]');
            
            if (departureTime && arrivalTime && durationField.length) {
                var departure = new Date(departureTime);
                var arrival = new Date(arrivalTime);
                
                if (arrival > departure) {
                    var diffMs = arrival - departure;
                    var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    var diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    var duration = diffHours + ' ч ' + diffMinutes + ' м';
                    durationField.val(duration);
                }
            }
        }
        
        // Периодическая проверка (каждые 2 секунды)
        setInterval(checkAndCalculateDuration, 2000);
    });
    </script>
    
    <?php
}
add_action('admin_footer', 'atlas_flight_duration_calculator');

