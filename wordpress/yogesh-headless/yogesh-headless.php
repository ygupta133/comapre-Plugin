<?php
/**
 * Plugin Name: Yogesh Headless CMS
 * Description: Headless WordPress backend for yogeshwebdeveloper.com — all website content CPTs + REST API.
 * Version: 1.2.0
 * Author: Yogesh Gupta
 * Text Domain: yogesh-headless
 */

if (!defined('ABSPATH')) {
    exit;
}

define('YG_HEADLESS_VERSION', '1.2.0');

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
        'yg_site_seo'     => ['label' => 'Page SEO',           'icon' => 'dashicons-search',          'rest' => 'site-seo'],
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
            'route_path' => 'string',
        ]);

        register_rest_field('yg_project', 'category_name', [
            'get_callback' => function ($post) {
                $terms = get_the_terms($post['id'], 'project_category');
                return ($terms && !is_wp_error($terms)) ? $terms[0]->name : 'WordPress';
            },
            'schema' => ['type' => 'string'],
        ]);

        foreach (array_keys($this->cpts) as $type) {
            if (in_array($type, ['yg_stat', 'yg_city', 'yg_trust_item', 'yg_why_choose'], true)) continue;
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
            'yg_site_seo' => ['React Route SEO', [
                ['route_path', 'React Route Path', 'text', '/'],
            ], 'One entry per page. Set Route Path (e.g. /, /about, /services). Use Yoast SEO box below for title, meta description, OG image and schema. Set canonical URL to https://yogeshwebdeveloper.com/your-page'],
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
            'clients_count', 'years_experience', 'route_path',
        ];
        foreach ($all_fields as $field) {
            if (isset($_POST[$field])) {
                $val = $_POST[$field];
                if (in_array($field, ['rating', 'percentage', 'sort_order', 'is_popular'], true)) {
                    update_post_meta($post_id, $field, (int) $val);
                } elseif (in_array($field, ['project_url', 'client_image_url'], true)) {
                    update_post_meta($post_id, $field, esc_url_raw($val));
                } else {
                    update_post_meta($post_id, $field, sanitize_text_field($val));
                }
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
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
