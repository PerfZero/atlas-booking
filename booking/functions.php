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
    
    echo '<table class="wp-list-table widefat fixed striped">';
    echo '<thead>';
    echo '<tr>';
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
        echo '<span class="' . $status_class . ' inline">' . esc_html($booking['status']) . '</span>';
        echo '</td>';
        echo '<td class="column-tourists">' . $tourists_count . '</td>';
        echo '<td class="column-actions">';
        echo '<button onclick="showBookingDetails(\'' . esc_js(json_encode($booking, JSON_UNESCAPED_UNICODE)) . '\')" class="button button-secondary">Просмотр</button>';
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
    </script>';
    
    echo '</div>';
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
                'pilgrimage_type' => get_field('pilgrimage_type', $post_id),
                'tour_start_date' => get_field('tour_start_date', $post_id),
                'tour_end_date' => get_field('tour_end_date', $post_id),
                'rating' => get_field('rating', $post_id),
                'reviews_count' => get_field('reviews_count', $post_id),
                'spots_left' => get_field('spots_left', $post_id),
                'features' => get_field('features', $post_id),
                'hotel_mekka' => get_field('hotel_mekka', $post_id),
                'hotel_medina' => get_field('hotel_medina', $post_id),
                'distance_mekka' => get_field('distance_mekka', $post_id),
                'distance_medina' => get_field('distance_medina', $post_id),
                'flight_type' => get_field('flight_type', $post_id),
                'food_type' => get_field('food_type', $post_id),
                'transfer_type' => get_field('transfer_type', $post_id),
                
                // Новые поля для детальной страницы
                'tags' => get_field('tags', $post_id),
                'gallery' => get_field('gallery', $post_id),
                
                // Рейсы
                'flight_outbound' => get_field('flight_outbound', $post_id),
                'flight_inbound' => get_field('flight_inbound', $post_id),
                
                // Детали отелей
                'hotel_mekka_details' => get_field('hotel_mekka_details', $post_id),
                'hotel_medina_details' => get_field('hotel_medina_details', $post_id),
                
                // Варианты размещения
                'room_options' => get_field('room_options', $post_id),
                
                // Что включено в пакет
                'package_includes' => get_field('package_includes', $post_id),
                
                // Хадж набор
                'hajj_kit_male' => get_field('hajj_kit_male', $post_id),
                'hajj_kit_female' => get_field('hajj_kit_female', $post_id)
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
            'pilgrimage_type' => get_field('pilgrimage_type', $post_id),
            'tour_start_date' => get_field('tour_start_date', $post_id),
            'tour_end_date' => get_field('tour_end_date', $post_id),
            'rating' => get_field('rating', $post_id),
            'reviews_count' => get_field('reviews_count', $post_id),
            'spots_left' => get_field('spots_left', $post_id),
            'features' => get_field('features', $post_id),
            'hotel_mekka' => get_field('hotel_mekka', $post_id),
            'hotel_medina' => get_field('hotel_medina', $post_id),
            'distance_mekka' => get_field('distance_mekka', $post_id),
            'distance_medina' => get_field('distance_medina', $post_id),
            'flight_type' => get_field('flight_type', $post_id),
            'food_type' => get_field('food_type', $post_id),
            'transfer_type' => get_field('transfer_type', $post_id),
            
            // Новые поля для детальной страницы
            'tags' => get_field('tags', $post_id),
            'gallery' => get_field('gallery', $post_id),
            
            // Рейсы
            'flight_outbound' => get_field('flight_outbound', $post_id),
            'flight_inbound' => get_field('flight_inbound', $post_id),
            
            // Детали отелей
            'hotel_mekka_details' => get_field('hotel_mekka_details', $post_id),
            'hotel_medina_details' => get_field('hotel_medina_details', $post_id),
            
            // Варианты размещения
            'room_options' => get_field('room_options', $post_id),
            
            // Что включено в пакет
            'package_includes' => get_field('package_includes', $post_id),
            
            // Хадж набор
            'hajj_kit_male' => get_field('hajj_kit_male', $post_id),
            'hajj_kit_female' => get_field('hajj_kit_female', $post_id)
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
        $args['meta_query'][] = array(
            'key' => 'pilgrimage_type',
            'value' => $pilgrimage_type,
            'compare' => '='
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
    
    if ($start_date && $end_date) {
        $args['meta_query'][] = array(
            'relation' => 'OR',
            array(
                'key' => 'tour_start_date',
                'value' => $start_date,
                'compare' => '>=',
                'type' => 'DATE'
            ),
            array(
                'key' => 'tour_end_date',
                'value' => $end_date,
                'compare' => '<=',
                'type' => 'DATE'
            )
        );
    }
    
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
            'pilgrimage_type' => get_field('pilgrimage_type', $post_id),
            'tour_start_date' => get_field('tour_start_date', $post_id),
            'tour_end_date' => get_field('tour_end_date', $post_id),
            'rating' => get_field('rating', $post_id),
            'reviews_count' => get_field('reviews_count', $post_id),
            'spots_left' => get_field('spots_left', $post_id),
            'features' => get_field('features', $post_id),
            'hotel_mekka' => get_field('hotel_mekka', $post_id),
            'hotel_medina' => get_field('hotel_medina', $post_id),
            'distance_mekka' => get_field('distance_mekka', $post_id),
            'distance_medina' => get_field('distance_medina', $post_id),
            'flight_type' => get_field('flight_type', $post_id),
            'food_type' => get_field('food_type', $post_id),
            'transfer_type' => get_field('transfer_type', $post_id),
            
            // Новые поля для детальной страницы
            'tags' => get_field('tags', $post_id),
            'gallery' => get_field('gallery', $post_id),
            
            // Рейсы
            'flight_outbound' => get_field('flight_outbound', $post_id),
            'flight_inbound' => get_field('flight_inbound', $post_id),
            
            // Детали отелей
            'hotel_mekka_details' => get_field('hotel_mekka_details', $post_id),
            'hotel_medina_details' => get_field('hotel_medina_details', $post_id),
            
            // Варианты размещения
            'room_options' => get_field('room_options', $post_id),
            
            // Что включено в пакет
            'package_includes' => get_field('package_includes', $post_id),
            
            // Хадж набор
            'hajj_kit_male' => get_field('hajj_kit_male', $post_id),
            'hajj_kit_female' => get_field('hajj_kit_female', $post_id)
        );
            
            $tours[] = $tour;
        }
    }
    
    wp_reset_postdata();
    
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
    
    $booking_data = array(
        'user_id' => $user_id,
        'tour_id' => $tour_id,
        'tour_title' => $tour->post_title,
        'tour_slug' => $tour->post_name,
        'booking_date' => current_time('mysql'),
        'status' => 'pending',
        'tour_data' => $tour_data
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
            $booking['tour_price'] = get_field('price', $booking['tour_id']);
            $booking['tour_duration'] = get_field('duration', $booking['tour_id']);
        }
        $bookings[] = array_merge(array('booking_id' => $booking_id), $booking);
    }
    
    return array(
        'success' => true,
        'bookings' => $bookings
    );
}

function atlas_kaspi_payment_app($request) {
    $params = $request->get_params();
    $command = sanitize_text_field($params['command'] ?? '');
    
    if ($command === 'check') {
        return atlas_kaspi_check_payment($params);
    } elseif ($command === 'pay') {
        return atlas_kaspi_process_payment($params);
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
    
    if (empty($txn_id) || empty($account) || $sum <= 0) {
        error_log('Invalid parameters for check');
        return new WP_Error('invalid_params', 'Invalid parameters for check', array('status' => 400));
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    error_log('All payments: ' . print_r($payments, true));
    
    if (isset($payments[$txn_id])) {
        $payment = $payments[$txn_id];
        error_log('Found payment: ' . print_r($payment, true));
        error_log('Comparing: order_id=' . $payment['order_id'] . ' vs account=' . $account . ', amount=' . $payment['amount'] . ' vs sum=' . $sum);
        
        if ($payment['order_id'] === $account && $payment['amount'] == $sum) {
            error_log('Payment validation successful');
            return array(
                'txn_id' => $txn_id,
                'result' => 0,
                'comment' => 'Заказ найден и доступен для оплаты',
                'sum' => $payment['amount']
            );
        } else {
            error_log('Payment validation failed: order_id mismatch or amount mismatch');
        }
    } else {
        error_log('Payment not found for txn_id: ' . $txn_id);
    }
    
    error_log('Returning error response');
    return array(
        'txn_id' => $txn_id,
        'result' => 1,
        'comment' => 'Заказ не найден или недоступен для оплаты'
    );
}

function atlas_kaspi_process_payment($params) {
    $txn_id = sanitize_text_field($params['txn_id'] ?? '');
    $account = sanitize_text_field($params['account'] ?? '');
    $sum = floatval($params['sum'] ?? 0);
    $txn_date = sanitize_text_field($params['txn_date'] ?? '');
    
    error_log('=== atlas_kaspi_process_payment called ===');
    error_log('Process params: txn_id=' . $txn_id . ', account=' . $account . ', sum=' . $sum . ', txn_date=' . $txn_date);
    
    if (empty($txn_id) || empty($account) || $sum <= 0) {
        error_log('Invalid parameters for payment');
        return new WP_Error('invalid_params', 'Invalid parameters for payment', array('status' => 400));
    }
    
    $payments = get_option('atlas_kaspi_payments', array());
    error_log('All payments in process: ' . print_r($payments, true));
    
    if (isset($payments[$txn_id])) {
        $payment = $payments[$txn_id];
        error_log('Found payment in process: ' . print_r($payment, true));
        error_log('Comparing in process: order_id=' . $payment['order_id'] . ' vs account=' . $account . ', amount=' . $payment['amount'] . ' vs sum=' . $sum);
        
        if ($payment['order_id'] === $account && $payment['amount'] == $sum) {
            $payment['status'] = 'completed';
            $payment['completed_at'] = current_time('mysql');
            $payment['kaspi_txn_date'] = $txn_date;
            
            $payments[$txn_id] = $payment;
            update_option('atlas_kaspi_payments', $payments);
            
            error_log('Payment marked as completed');
            
            $user_bookings = get_user_meta($payment['user_id'], 'atlas_bookings', true);
            if (is_array($user_bookings)) {
                foreach ($user_bookings as $booking_id => $booking) {
                    if ($booking['tour_id'] == $payment['tour_id']) {
                        $user_bookings[$booking_id]['status'] = 'paid';
                        $user_bookings[$booking_id]['payment_id'] = $txn_id;
                        $user_bookings[$booking_id]['paid_at'] = current_time('mysql');
                        error_log('User booking updated: ' . print_r($user_bookings[$booking_id], true));
                        break;
                    }
                }
                update_user_meta($payment['user_id'], 'atlas_bookings', $user_bookings);
            }
            
            error_log('Payment processed successfully');
            return array(
                'txn_id' => $txn_id,
                'result' => 0,
                'comment' => 'Платеж успешно обработан'
            );
        } else {
            error_log('Payment validation failed in process: order_id mismatch or amount mismatch');
        }
    } else {
        error_log('Payment not found in process for txn_id: ' . $txn_id);
    }
    
    error_log('Payment processing failed');
    return array(
        'txn_id' => $txn_id,
        'result' => 1,
        'comment' => 'Ошибка обработки платежа'
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
        'Amount' => $amount,
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
});

