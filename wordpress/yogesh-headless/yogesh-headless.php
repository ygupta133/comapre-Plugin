<?php
/**
 * Plugin Name: Yogesh Headless CMS
 * Description: Headless WordPress backend for yogeshwebdeveloper.com — all website content CPTs + REST API.
 * Version: 1.3.2
 * Author: Yogesh Gupta
 * Text Domain: yogesh-headless
 */

if (!defined('ABSPATH')) {
    exit;
}

define('YG_HEADLESS_VERSION', '1.3.2');

require_once __DIR__ . '/includes/seed-content.php';

class Yogesh_Headless {

    private $cpts = [
        'yg_service'      => ['label' => 'Services',           'icon' => 'dashicons-admin-tools',     'rest' => 'services'],
        'yg_project'      => ['label' => 'Projects',           'icon' => 'dashicons-portfolio',       'rest' => 'projects'],
        'yg_testimonial'  => ['label' => 'Testimonials',       'icon' => 'dashicons-format-quote',    'rest' => 'testimonials'],
        'yg_skill'        => ['label' => 'Skills',             'icon' => 'dashicons-awards',          'rest' => 'skills'],
        'yg_experience'   => ['label' => 'Experience',         'icon' => 'dashicons-businessman',     'rest' => 'experience'],
        'yg_engagement'   => ['label' => 'Engagement Models',  'icon' => 'dashicons-clock',           'rest' => 'engagement'],
        'yg_stat'         => ['label' => 'Stats',              'icon' => 'dashicons-chart-bar',       'rest' => 'stats'],
        'yg_city'         => ['label' => 'Cities',             'icon' => 'dashicons-location',        'rest' => 'cities'],
        'yg_region'       => ['label' => 'Global Regions',     'icon' => 'dashicons-admin-site-alt3', 'rest' => 'regions'],
        'yg_why_choose'   => ['label' => 'Why Choose Me',      'icon' => 'dashicons-yes-alt',         'rest' => 'why-choose'],
        'yg_trust_item'   => ['label' => 'Hero Trust Items',   'icon' => 'dashicons-shield',          'rest' => 'trust-items'],
        'yg_hero'         => ['label' => 'Hero Section',       'icon' => 'dashicons-slides',          'rest' => 'hero'],
        'yg_about'        => ['label' => 'About Page',         'icon' => 'dashicons-admin-users',     'rest' => 'about'],
        'yg_site_seo'     => ['label' => 'Page SEO & Banners', 'icon' => 'dashicons-search',          'rest' => 'site-seo'],
        'yg_site_settings'=> ['label' => 'Site Settings',      'icon' => 'dashicons-admin-settings',  'rest' => 'site-settings'],
        'yg_nav_item'     => ['label' => 'Navigation Menu',    'icon' => 'dashicons-menu',            'rest' => 'nav-items'],
        'yg_footer_item'  => ['label' => 'Footer Links',       'icon' => 'dashicons-admin-links',     'rest' => 'footer-items'],
        'yg_inquiry_type' => ['label' => 'Inquiry Types',      'icon' => 'dashicons-list-view',       'rest' => 'inquiry-types'],
    ];

    public function __construct() {
        add_action('init', [$this, 'register_post_types']);
        add_action('init', [$this, 'register_taxonomies']);
        add_action('init', [$this, 'rename_posts_to_blog']);
        add_action('rest_api_init', [$this, 'register_rest_fields']);
        add_action('rest_api_init', [$this, 'enable_cors']);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
        add_action('save_post', [$this, 'save_meta_boxes']);
        add_filter('manage_yg_service_posts_columns', [$this, 'service_columns']);
        add_action('manage_yg_service_posts_custom_column', [$this, 'service_column_data'], 10, 2);
        add_filter('wpseo_rest_api_post_types', [$this, 'enable_yoast_rest_api']);
        add_action('admin_notices', [$this, 'yoast_admin_notice']);
        add_action('rest_api_init', [$this, 'register_contact_route']);
        add_action('admin_menu', [$this, 'admin_menu']);
        add_action('admin_post_yg_seed_content', [$this, 'handle_seed_content']);
        add_action('template_redirect', [$this, 'maybe_redirect_to_frontend']);
        add_action('admin_bar_menu', [$this, 'fix_view_site_link'], 999);
        add_filter('preview_post_link', [$this, 'filter_preview_link'], 10, 2);
    }

    public function get_frontend_url() {
        static $cached = null;
        if ($cached !== null) {
            return $cached;
        }
        $posts = get_posts([
            'post_type'      => 'yg_site_settings',
            'posts_per_page' => 1,
            'post_status'    => 'publish',
        ]);
        $url = '';
        if (!empty($posts)) {
            $url = trim(get_post_meta($posts[0]->ID, 'frontend_url', true));
        }
        if (!$url) {
            $url = apply_filters('yg_headless_frontend_url', 'http://localhost:5173');
        }
        $cached = rtrim(esc_url_raw($url), '/');
        return $cached;
    }

    public function is_redirect_enabled() {
        $posts = get_posts([
            'post_type'      => 'yg_site_settings',
            'posts_per_page' => 1,
            'post_status'    => 'publish',
        ]);
        if (empty($posts)) {
            return true;
        }
        $val = get_post_meta($posts[0]->ID, 'redirect_to_frontend', true);
        return $val === '' || (int) $val === 1;
    }

    public function maybe_redirect_to_frontend() {
        if (!$this->is_redirect_enabled()) {
            return;
        }
        if (is_admin() || wp_doing_ajax() || wp_doing_cron()) {
            return;
        }
        $uri = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';
        if (strpos($uri, '/wp-json') !== false || strpos($uri, 'wp-login.php') !== false) {
            return;
        }
        if (defined('REST_REQUEST') && REST_REQUEST) {
            return;
        }

        $frontend = $this->get_frontend_url();
        if (!$frontend) {
            return;
        }

        $home_path = wp_parse_url(home_url('/'), PHP_URL_PATH);
        $home_path = $home_path ? rtrim($home_path, '/') : '';
        $request_path = wp_parse_url($uri, PHP_URL_PATH);
        $request_path = $request_path ? rtrim($request_path, '/') : '';

        $react_path = '/';
        if ($home_path && strpos($request_path, $home_path) === 0) {
            $react_path = substr($request_path, strlen($home_path)) ?: '/';
        }
        if ($react_path !== '/' && substr($react_path, -1) !== '/') {
            $react_path .= '/';
        }

        $target = $frontend . ($react_path === '/' ? '' : $react_path);
        wp_safe_redirect($target, 302);
        exit;
    }

    public function fix_view_site_link($wp_admin_bar) {
        $frontend = $this->get_frontend_url();
        if (!$frontend) {
            return;
        }
        $wp_admin_bar->add_node([
            'id'   => 'site-name',
            'href' => $frontend . '/',
        ]);
        $wp_admin_bar->add_node([
            'id'   => 'view-site',
            'href' => $frontend . '/',
        ]);
    }

    public function filter_preview_link($link, $post) {
        $frontend = $this->get_frontend_url();
        if (!$frontend || !$post) {
            return $link;
        }
        if ($post->post_type === 'post' && $post->post_name) {
            return $frontend . '/blog';
        }
        return $frontend . '/';
    }

    public function admin_menu() {
        add_management_page(
            'Import Default Content',
            'YG Import Defaults',
            'manage_options',
            'yg-seed-content',
            [$this, 'seed_admin_page']
        );
    }

    public function seed_admin_page() {
        if (!current_user_can('manage_options')) return;
        $seeded = get_option('yg_headless_seeded');
        echo '<div class="wrap"><h1>Yogesh Headless — Default Content</h1>';
        echo '<p>Import default website content into WordPress. <strong>Only empty sections</strong> are filled — your existing content is not overwritten.</p>';
        if ($seeded) {
            echo '<p>Last seeded version: <code>' . esc_html($seeded) . '</code></p>';
        }
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('yg_seed_content');
        echo '<input type="hidden" name="action" value="yg_seed_content" />';
        submit_button('Import Default Content Now');
        echo '</form></div>';
    }

    public function handle_seed_content() {
        if (!current_user_can('manage_options') || !check_admin_referer('yg_seed_content')) {
            wp_die('Unauthorized');
        }
        Yogesh_Headless_Seed::run();
        wp_safe_redirect(admin_url('tools.php?page=yg-seed-content&seeded=1'));
        exit;
    }

    public function register_contact_route() {
        register_rest_route('yg/v1', '/contact', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_contact_submission'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function handle_contact_submission($request) {
        $name = sanitize_text_field($request->get_param('name') ?? '');
        $email = sanitize_email($request->get_param('email') ?? '');
        $phone = sanitize_text_field($request->get_param('phone') ?? '');
        $inquiry = sanitize_text_field($request->get_param('inquiryType') ?? '');
        $message = sanitize_textarea_field($request->get_param('message') ?? '');

        if (!$name || !$email || !$message || !$inquiry) {
            return new WP_Error('missing_fields', 'Please fill all required fields.', ['status' => 400]);
        }
        if (!is_email($email)) {
            return new WP_Error('invalid_email', 'Invalid email address.', ['status' => 400]);
        }

        $settings = get_posts(['post_type' => 'yg_site_settings', 'posts_per_page' => 1, 'post_status' => 'publish']);
        $to = !empty($settings)
            ? get_post_meta($settings[0]->ID, 'contact_email_to', true)
            : get_option('admin_email');
        if (!$to) $to = get_option('admin_email');

        $subject = sprintf('[Website Contact] %s — %s', $name, $inquiry);
        $body = "Name: $name\nEmail: $email\nPhone: $phone\nInquiry: $inquiry\n\nMessage:\n$message";
        $headers = ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $name . ' <' . $email . '>'];

        $sent = wp_mail($to, $subject, $body, $headers);
        if (!$sent) {
            return new WP_Error('mail_failed', 'Could not send message. Please email directly.', ['status' => 500]);
        }
        return rest_ensure_response(['success' => true, 'message' => 'Message sent successfully.']);
    }

    public function enable_yoast_rest_api($post_types) {
        $types = array_merge(array_keys($this->cpts), ['post', 'page']);
        return array_values(array_unique(array_merge((array) $post_types, $types)));
    }

    public function yoast_admin_notice() {
        if (!current_user_can('manage_options')) return;
        if (defined('WPSEO_VERSION')) return;
        echo '<div class="notice notice-warning"><p><strong>Yogesh Headless CMS:</strong> Install and activate <a href="https://wordpress.org/plugins/wordpress-seo/" target="_blank">Yoast SEO</a> to manage meta titles, descriptions, Open Graph and schema for your React frontend.</p></div>';
    }

    public function register_post_types() {
        foreach ($this->cpts as $slug => $config) {
            register_post_type($slug, [
                'labels' => [
                    'name'          => $config['label'],
                    'singular_name' => rtrim($config['label'], 's'),
                    'add_new_item'  => 'Add New',
                    'edit_item'     => 'Edit',
                ],
                'public'       => true,
                'show_in_rest' => true,
                'rest_base'    => $config['rest'],
                'menu_icon'    => $config['icon'],
                'supports'     => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'page-attributes'],
                'has_archive'  => false,
            ]);
        }
    }

    public function rename_posts_to_blog() {
        global $wp_post_types;
        if (isset($wp_post_types['post'])) {
            $wp_post_types['post']->labels->name = 'Blog Posts';
            $wp_post_types['post']->labels->singular_name = 'Blog Post';
            $wp_post_types['post']->menu_icon = 'dashicons-edit';
        }
    }

    public function register_taxonomies() {
        register_taxonomy('project_category', 'yg_project', [
            'labels' => ['name' => 'Project Categories', 'singular_name' => 'Project Category'],
            'public' => true, 'show_in_rest' => true, 'rest_base' => 'project-categories', 'hierarchical' => true,
        ]);
    }

    public function register_rest_fields() {
        $this->register_meta_rest('yg_service', [
            'icon' => 'string', 'features' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_project', [
            'tech_stack' => 'string', 'project_url' => 'string', 'client_name' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_testimonial', [
            'client_role' => 'string', 'client_country' => 'string', 'rating' => 'integer',
            'client_image_url' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_skill', ['percentage' => 'integer', 'sort_order' => 'integer']);
        $this->register_meta_rest('yg_experience', [
            'year_range' => 'string', 'company' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_engagement', [
            'icon' => 'string', 'is_popular' => 'boolean', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_stat', ['stat_value' => 'string', 'stat_label' => 'string', 'sort_order' => 'integer']);
        $this->register_meta_rest('yg_city', ['sort_order' => 'integer']);
        $this->register_meta_rest('yg_region', [
            'flag_emoji' => 'string', 'points' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_why_choose', ['sort_order' => 'integer']);
        $this->register_meta_rest('yg_trust_item', ['sort_order' => 'integer']);
        $this->register_meta_rest('yg_hero', [
            'badge_text' => 'string', 'headline' => 'string', 'headline_highlight' => 'string',
            'subtitle' => 'string', 'cta_primary' => 'string', 'cta_secondary' => 'string',
            'years_badge' => 'string', 'projects_count' => 'string', 'clients_count' => 'string',
        ]);
        $this->register_meta_rest('yg_about', [
            'subtitle' => 'string', 'years_experience' => 'string',
        ]);
        $this->register_meta_rest('yg_site_seo', [
            'route_path' => 'string', 'banner_title' => 'string', 'banner_subtitle' => 'string',
            'breadcrumb_label' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_site_settings', [
            'site_name' => 'string', 'site_tagline' => 'string', 'cta_text' => 'string',
            'footer_bio' => 'string', 'footer_copyright' => 'string',
            'phone' => 'string', 'phone_us' => 'string', 'phone_uk' => 'string', 'phone_au' => 'string',
            'email' => 'string', 'location' => 'string',
            'whatsapp_url' => 'string', 'whatsapp_message' => 'string', 'chat_welcome' => 'string', 'upwork_url' => 'string', 'linkedin_url' => 'string',
            'twitter_url' => 'string', 'instagram_url' => 'string',
            'availability_bullets' => 'string', 'contact_intro' => 'string',
            'contact_success_message' => 'string', 'contact_form_title' => 'string',
            'contact_heading' => 'string', 'contact_availability_bullets' => 'string',
            'seo_locations_heading' => 'string', 'privacy_url' => 'string', 'terms_url' => 'string',
            'contact_email_to' => 'string', 'frontend_url' => 'string', 'redirect_to_frontend' => 'integer',
        ]);
        $this->register_meta_rest('yg_nav_item', ['url' => 'string', 'sort_order' => 'integer']);
        $this->register_meta_rest('yg_footer_item', [
            'link_type' => 'string', 'url' => 'string', 'sort_order' => 'integer',
        ]);
        $this->register_meta_rest('yg_inquiry_type', ['sort_order' => 'integer']);

        register_rest_field('yg_project', 'category_name', [
            'get_callback' => function ($post) {
                $terms = get_the_terms($post['id'], 'project_category');
                return ($terms && !is_wp_error($terms)) ? $terms[0]->name : 'WordPress';
            },
            'schema' => ['type' => 'string'],
        ]);

        foreach (array_keys($this->cpts) as $type) {
            if (in_array($type, ['yg_stat', 'yg_city', 'yg_trust_item', 'yg_why_choose', 'yg_nav_item', 'yg_footer_item', 'yg_inquiry_type', 'yg_site_settings', 'yg_site_seo'], true)) continue;
            register_rest_field($type, 'featured_image_url', [
                'get_callback' => function ($post) {
                    return get_the_post_thumbnail_url($post['id'], 'large') ?: '';
                },
                'schema' => ['type' => 'string'],
            ]);
        }

        register_rest_field('post', 'featured_image_url', [
            'get_callback' => fn($post) => get_the_post_thumbnail_url($post['id'], 'large') ?: '',
            'schema' => ['type' => 'string'],
        ]);
        register_rest_field('post', 'category_name', [
            'get_callback' => function ($post) {
                $cats = get_the_category($post['id']);
                return !empty($cats) ? $cats[0]->name : 'Blog';
            },
            'schema' => ['type' => 'string'],
        ]);
        register_rest_field('post', 'read_time', [
            'get_callback' => function ($post) {
                $words = str_word_count(strip_tags($post['content']['rendered'] ?? ''));
                return max(1, ceil($words / 200)) . ' min read';
            },
            'schema' => ['type' => 'string'],
        ]);
    }

    private function register_meta_rest($post_type, $fields) {
        foreach ($fields as $field => $type) {
            register_rest_field($post_type, $field, [
                'get_callback' => function ($post) use ($field, $type) {
                    $val = get_post_meta($post['id'], $field, true);
                    if ($type === 'integer') return (int) $val;
                    if ($type === 'boolean') return (bool) $val;
                    return $val ?: ($type === 'integer' ? 0 : '');
                },
                'schema' => ['type' => $type],
            ]);
        }
    }

    public function enable_cors() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function ($value) {
            $allowed = apply_filters('yg_headless_allowed_origins', [
                'http://localhost:5173', 'http://127.0.0.1:5173',
                'http://localhost:5174', 'http://localhost:5175',
                'http://192.168.1.7:5173',
                'https://yogeshwebdeveloper.com', 'https://www.yogeshwebdeveloper.com',
                'https://ygupta133.github.io',
            ]);
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            if (in_array($origin, $allowed, true)) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
            return $value;
        });
    }

    public function add_meta_boxes() {
        $boxes = [
            'yg_service' => ['Service Details', [
                ['icon', 'Icon (code/wordpress/react/laravel/ai/php/ecommerce/plugin)', 'text'],
                ['features', 'Features (comma separated)', 'text'],
                ['sort_order', 'Sort Order', 'number'],
            ]],
            'yg_project' => ['Project Details', [
                ['tech_stack', 'Tech Stack (comma separated)', 'text'],
                ['project_url', 'Project URL', 'url'],
                ['client_name', 'Client Name', 'text'],
                ['sort_order', 'Sort Order', 'number'],
            ]],
            'yg_testimonial' => ['Client Details', [
                ['client_role', 'Client Role', 'text'],
                ['client_country', 'Country', 'text'],
                ['rating', 'Rating (1-5)', 'number'],
                ['client_image_url', 'Photo URL (optional)', 'url'],
                ['sort_order', 'Sort Order', 'number'],
            ]],
            'yg_skill' => ['Skill Details', [
                ['percentage', 'Percentage (0-100)', 'number'],
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = Skill name'],
            'yg_experience' => ['Experience Details', [
                ['year_range', 'Year Range (e.g. 2019 - 2023)', 'text'],
                ['company', 'Company', 'text'],
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = Job Title. Content = Description'],
            'yg_engagement' => ['Engagement Details', [
                ['icon', 'Icon (clock/user/briefcase)', 'text'],
                ['is_popular', 'Most Popular? (1=yes)', 'number'],
                ['sort_order', 'Sort Order', 'number'],
            ]],
            'yg_stat' => ['Stat Details', [
                ['stat_value', 'Value (e.g. 14+)', 'text'],
                ['stat_label', 'Label (e.g. Years Experience)', 'text'],
                ['sort_order', 'Sort Order', 'number'],
            ]],
            'yg_city' => ['City Details', [
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = City name'],
            'yg_region' => ['Region Details', [
                ['flag_emoji', 'Flag Emoji (e.g. 🇺🇸)', 'text'],
                ['points', 'Points (comma separated)', 'text'],
                ['sort_order', 'Sort Order', 'number'],
            ]],
            'yg_why_choose' => ['Item Details', [
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = item text'],
            'yg_trust_item' => ['Item Details', [
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = item text'],
            'yg_hero' => ['Hero Content', [
                ['badge_text', 'Badge Text', 'text', '14+ Years of Experience'],
                ['headline', 'Headline', 'text', 'Best Freelance Web Developer'],
                ['headline_highlight', 'Headline Highlight (green)', 'text', 'Near Delhi'],
                ['subtitle', 'Subtitle', 'textarea'],
                ['cta_primary', 'Primary Button Text', 'text', 'Get Free Consultation'],
                ['cta_secondary', 'Secondary Button Text', 'text', 'View My Work'],
                ['years_badge', 'Years Badge on Photo', 'text', '14+ Years Experience'],
                ['projects_count', 'Projects Count Badge', 'text', '250+'],
                ['clients_count', 'Clients Count Badge', 'text', '150+'],
            ], 'Add only ONE hero entry. Set Featured Image for photo.'],
            'yg_about' => ['About Details', [
                ['subtitle', 'Subtitle', 'text', 'Freelance Web Developer from Delhi, India'],
                ['years_experience', 'Years Badge', 'text', '14+'],
            ], 'Title = section title. Content = bio text. Featured Image = your photo.'],
            'yg_site_seo' => ['Page SEO & Banner', [
                ['route_path', 'React Route Path', 'text', '/'],
                ['banner_title', 'Page Banner Title', 'text', 'About Me'],
                ['banner_subtitle', 'Page Banner Subtitle', 'textarea'],
                ['breadcrumb_label', 'Breadcrumb Label', 'text', 'About Me'],
            ], 'One entry per React route. Use Yoast SEO for meta title, description, OG image. Canonical = your live frontend URL.'],
            'yg_site_settings' => ['Global Site Settings', [
                ['frontend_url', 'React Frontend URL (View Site opens this)', 'text', 'http://localhost:5173'],
                ['redirect_to_frontend', 'Redirect WP homepage to React? (1=yes, 0=no)', 'number', '1'],
                ['site_name', 'Site Name (Header)', 'text', 'Yogesh Gupta'],
                ['site_tagline', 'Tagline (Header)', 'text', 'Freelance Web Developer'],
                ['cta_text', 'Header CTA Button', 'text', 'Hire Me'],
                ['footer_bio', 'Footer About Text', 'textarea'],
                ['footer_copyright', 'Copyright Name', 'text', 'Yogesh Gupta. All Rights Reserved.'],
                ['phone', 'Phone (India)', 'text', '+91 98765 43210'],
                ['phone_us', 'Phone (USA/Canada — virtual number)', 'text', '+1 555 000 0000'],
                ['phone_uk', 'Phone (UK/Europe — virtual number)', 'text', '+44 20 0000 0000'],
                ['phone_au', 'Phone (Australia — virtual number)', 'text', '+61 2 0000 0000'],
                ['email', 'Email', 'text', 'hello@yogeshwebdeveloper.com'],
                ['location', 'Location', 'text', 'Delhi, India'],
                ['whatsapp_url', 'WhatsApp URL', 'text', 'https://wa.me/919876543210'],
                ['whatsapp_message', 'WhatsApp Pre-filled Message', 'text', 'Hi Yogesh, I would like to discuss a project.'],
                ['chat_welcome', 'Chatbot Welcome Message', 'textarea'],
                ['upwork_url', 'Upwork URL', 'text'],
                ['linkedin_url', 'LinkedIn URL', 'text'],
                ['twitter_url', 'Twitter/X URL', 'text'],
                ['instagram_url', 'Instagram URL', 'text'],
                ['availability_bullets', 'Footer Availability (comma separated)', 'text'],
                ['contact_heading', 'Contact Page Heading', 'text', 'Get In Touch'],
                ['contact_intro', 'Contact Intro Text', 'textarea'],
                ['contact_form_title', 'Contact Form Title', 'text', 'Send Me a Message'],
                ['contact_success_message', 'Form Success Message', 'textarea'],
                ['contact_availability_bullets', 'Contact Availability (comma separated)', 'text'],
                ['contact_email_to', 'Contact Form Emails Go To', 'text'],
                ['seo_locations_heading', 'Footer SEO Locations Heading', 'text'],
                ['privacy_url', 'Privacy Policy URL', 'text', '#'],
                ['terms_url', 'Terms URL', 'text', '#'],
            ], 'Add only ONE Site Settings entry.'],
            'yg_nav_item' => ['Menu Link', [
                ['url', 'URL Path (e.g. /about)', 'text', '/'],
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = menu label'],
            'yg_footer_item' => ['Footer Link', [
                ['link_type', 'Type (service|hire|useful|seo)', 'text', 'service'],
                ['url', 'URL Path', 'text', '/services'],
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = link label'],
            'yg_inquiry_type' => ['Inquiry Option', [
                ['sort_order', 'Sort Order', 'number'],
            ], 'Title = dropdown option text'],
        ];

        foreach ($boxes as $post_type => $config) {
            add_meta_box('yg_meta_' . $post_type, $config[0], function ($post) use ($config, $post_type) {
                wp_nonce_field('yg_meta_' . $post_type, 'yg_meta_nonce_' . $post_type);
                if (!empty($config[2])) {
                    echo '<p><em>' . esc_html($config[2]) . '</em></p>';
                }
                foreach ($config[1] as $field) {
                    $key = $field[0];
                    $label = $field[1];
                    $type = $field[2];
                    $placeholder = $field[3] ?? '';
                    $val = get_post_meta($post->ID, $key, true);
                    echo '<p><label><strong>' . esc_html($label) . '</strong></label><br>';
                    if ($type === 'textarea') {
                        echo '<textarea name="' . esc_attr($key) . '" style="width:100%" rows="3">' . esc_textarea($val) . '</textarea>';
                    } else {
                        echo '<input type="' . esc_attr($type === 'number' ? 'number' : 'text') . '" name="' . esc_attr($key) . '" value="' . esc_attr($val) . '" style="width:100%" placeholder="' . esc_attr($placeholder) . '">';
                    }
                    echo '</p>';
                }
            }, $post_type, 'normal', 'high');
        }
    }

    public function save_meta_boxes($post_id) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        $types = array_keys($this->cpts);
        $post_type = get_post_type($post_id);
        if (!in_array($post_type, $types, true)) return;
        $nonce_key = 'yg_meta_nonce_' . $post_type;
        if (!isset($_POST[$nonce_key]) || !wp_verify_nonce($_POST[$nonce_key], 'yg_meta_' . $post_type)) return;

        $all_fields = [
            'icon', 'features', 'sort_order', 'tech_stack', 'project_url', 'client_name',
            'client_role', 'client_country', 'rating', 'client_image_url', 'percentage',
            'year_range', 'company', 'is_popular', 'stat_value', 'stat_label',
            'flag_emoji', 'points', 'badge_text', 'headline', 'headline_highlight',
            'subtitle', 'cta_primary', 'cta_secondary', 'years_badge', 'projects_count',
            'clients_count', 'years_experience', 'route_path', 'banner_title', 'banner_subtitle',
            'breadcrumb_label', 'site_name', 'site_tagline', 'cta_text', 'footer_bio', 'footer_copyright',
            'phone', 'email', 'location', 'phone_us', 'phone_uk', 'phone_au',
            'whatsapp_url', 'whatsapp_message', 'chat_welcome', 'upwork_url', 'linkedin_url', 'twitter_url',
            'instagram_url', 'availability_bullets', 'contact_intro', 'contact_success_message',
            'contact_form_title', 'contact_heading', 'contact_availability_bullets', 'seo_locations_heading',
            'privacy_url', 'terms_url', 'contact_email_to', 'url', 'link_type', 'frontend_url', 'redirect_to_frontend',
        ];
        $textarea_fields = ['footer_bio', 'contact_intro', 'contact_success_message', 'banner_subtitle', 'subtitle', 'chat_welcome'];
        $url_fields = ['project_url', 'client_image_url', 'whatsapp_url', 'upwork_url', 'linkedin_url', 'twitter_url', 'instagram_url', 'privacy_url', 'terms_url', 'frontend_url'];
        foreach ($all_fields as $field) {
            if (!isset($_POST[$field])) continue;
            $val = $_POST[$field];
            if (in_array($field, ['rating', 'percentage', 'sort_order', 'is_popular', 'redirect_to_frontend'], true)) {
                update_post_meta($post_id, $field, (int) $val);
            } elseif (in_array($field, $url_fields, true)) {
                update_post_meta($post_id, $field, esc_url_raw($val));
            } elseif (in_array($field, $textarea_fields, true)) {
                update_post_meta($post_id, $field, sanitize_textarea_field($val));
            } else {
                update_post_meta($post_id, $field, sanitize_text_field($val));
            }
        }
    }

    public function service_columns($cols) {
        $cols['icon'] = 'Icon';
        return $cols;
    }

    public function service_column_data($col, $post_id) {
        if ($col === 'icon') echo esc_html(get_post_meta($post_id, 'icon', true));
    }
}

new Yogesh_Headless();

register_activation_hook(__FILE__, function () {
    flush_rewrite_rules();
    Yogesh_Headless_Seed::run();
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
