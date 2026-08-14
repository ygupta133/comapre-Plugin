<?php
/**
 * Plugin Name: Yogesh Headless CMS
 * Description: Headless WordPress backend for yogeshwebdeveloper.com React frontend. Custom post types, REST API fields, CORS, WooCommerce ready.
 * Version: 1.0.0
 * Author: Yogesh Gupta
 * Text Domain: yogesh-headless
 */

if (!defined('ABSPATH')) {
    exit;
}

define('YG_HEADLESS_VERSION', '1.0.0');

class Yogesh_Headless {

    public function __construct() {
        add_action('init', [$this, 'register_post_types']);
        add_action('init', [$this, 'register_taxonomies']);
        add_action('rest_api_init', [$this, 'register_rest_fields']);
        add_action('rest_api_init', [$this, 'enable_cors']);
        add_filter('rest_allow_anonymous_comments', '__return_true');
    }

    public function register_post_types() {
        register_post_type('yg_project', [
            'labels' => [
                'name'          => 'Projects',
                'singular_name' => 'Project',
                'add_new_item'  => 'Add New Project',
                'edit_item'     => 'Edit Project',
            ],
            'public'       => true,
            'show_in_rest' => true,
            'rest_base'    => 'projects',
            'menu_icon'    => 'dashicons-portfolio',
            'supports'     => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
            'has_archive'  => true,
            'rewrite'      => ['slug' => 'projects'],
        ]);

        register_post_type('yg_testimonial', [
            'labels' => [
                'name'          => 'Testimonials',
                'singular_name' => 'Testimonial',
                'add_new_item'  => 'Add New Testimonial',
            ],
            'public'       => true,
            'show_in_rest' => true,
            'rest_base'    => 'testimonials',
            'menu_icon'    => 'dashicons-format-quote',
            'supports'     => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'has_archive'  => true,
        ]);
    }

    public function register_taxonomies() {
        register_taxonomy('project_category', 'yg_project', [
            'labels' => [
                'name'          => 'Project Categories',
                'singular_name' => 'Project Category',
            ],
            'public'       => true,
            'show_in_rest' => true,
            'rest_base'    => 'project-categories',
            'hierarchical' => true,
        ]);
    }

    public function register_rest_fields() {
        $project_fields = [
            'tech_stack'   => 'string',
            'project_url'  => 'string',
            'client_name'  => 'string',
        ];

        foreach ($project_fields as $field => $type) {
            register_rest_field('yg_project', $field, [
                'get_callback' => function ($post) use ($field) {
                    return get_post_meta($post['id'], $field, true) ?: '';
                },
                'schema' => ['type' => $type, 'context' => ['view', 'edit']],
            ]);
        }

        register_rest_field('yg_project', 'category_name', [
            'get_callback' => function ($post) {
                $terms = get_the_terms($post['id'], 'project_category');
                if ($terms && !is_wp_error($terms)) {
                    return $terms[0]->name;
                }
                return 'WordPress';
            },
            'schema' => ['type' => 'string'],
        ]);

        register_rest_field('yg_project', 'featured_image_url', [
            'get_callback' => function ($post) {
                $img = get_the_post_thumbnail_url($post['id'], 'large');
                return $img ?: '';
            },
            'schema' => ['type' => 'string'],
        ]);

        $testimonial_fields = [
            'client_role' => 'string',
            'client_country' => 'string',
            'rating' => 'integer',
            'client_image_url' => 'string',
        ];

        foreach ($testimonial_fields as $field => $type) {
            register_rest_field('yg_testimonial', $field, [
                'get_callback' => function ($post) use ($field) {
                    $val = get_post_meta($post['id'], $field, true);
                    return $type === 'integer' ? (int) $val : ($val ?: '');
                },
                'schema' => ['type' => $type],
            ]);
        }

        register_rest_field('post', 'featured_image_url', [
            'get_callback' => function ($post) {
                return get_the_post_thumbnail_url($post['id'], 'large') ?: '';
            },
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
                $mins = max(1, ceil($words / 200));
                return $mins . ' min read';
            },
            'schema' => ['type' => 'string'],
        ]);
    }

    public function enable_cors() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

        add_filter('rest_pre_serve_request', function ($value) {
            $allowed_origins = apply_filters('yg_headless_allowed_origins', [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'https://yogeshwebdeveloper.com',
                'https://www.yogeshwebdeveloper.com',
                'https://ygupta133.github.io',
            ]);

            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

            if (in_array($origin, $allowed_origins, true)) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }

            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');

            return $value;
        });
    }
}

new Yogesh_Headless();

/**
 * Add custom meta boxes in admin for easy editing
 */
add_action('add_meta_boxes', function () {
    add_meta_box('yg_project_meta', 'Project Details', function ($post) {
        $tech = get_post_meta($post->ID, 'tech_stack', true);
        $url = get_post_meta($post->ID, 'project_url', true);
        $client = get_post_meta($post->ID, 'client_name', true);
        wp_nonce_field('yg_project_meta', 'yg_project_nonce');
        echo '<p><label>Tech Stack (comma separated)</label><br>';
        echo '<input type="text" name="tech_stack" value="' . esc_attr($tech) . '" style="width:100%" placeholder="React, WordPress, PHP"></p>';
        echo '<p><label>Project URL</label><br>';
        echo '<input type="url" name="project_url" value="' . esc_attr($url) . '" style="width:100%"></p>';
        echo '<p><label>Client Name</label><br>';
        echo '<input type="text" name="client_name" value="' . esc_attr($client) . '" style="width:100%"></p>';
    }, 'yg_project', 'normal', 'high');

    add_meta_box('yg_testimonial_meta', 'Client Details', function ($post) {
        $role = get_post_meta($post->ID, 'client_role', true);
        $country = get_post_meta($post->ID, 'client_country', true);
        $rating = get_post_meta($post->ID, 'rating', true) ?: 5;
        $image = get_post_meta($post->ID, 'client_image_url', true);
        wp_nonce_field('yg_testimonial_meta', 'yg_testimonial_nonce');
        echo '<p><label>Client Role</label><br>';
        echo '<input type="text" name="client_role" value="' . esc_attr($role) . '" style="width:100%" placeholder="CEO, TechStart India"></p>';
        echo '<p><label>Country</label><br>';
        echo '<input type="text" name="client_country" value="' . esc_attr($country) . '" style="width:100%" placeholder="India"></p>';
        echo '<p><label>Rating (1-5)</label><br>';
        echo '<input type="number" name="rating" value="' . esc_attr($rating) . '" min="1" max="5" style="width:80px"></p>';
        echo '<p><label>Client Photo URL (optional)</label><br>';
        echo '<input type="url" name="client_image_url" value="' . esc_attr($image) . '" style="width:100%"></p>';
        echo '<p><em>Review text goes in the main content editor. Client name = post title.</em></p>';
    }, 'yg_testimonial', 'normal', 'high');
});

add_action('save_post', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if (isset($_POST['yg_project_nonce']) && wp_verify_nonce($_POST['yg_project_nonce'], 'yg_project_meta')) {
        if (isset($_POST['tech_stack'])) update_post_meta($post_id, 'tech_stack', sanitize_text_field($_POST['tech_stack']));
        if (isset($_POST['project_url'])) update_post_meta($post_id, 'project_url', esc_url_raw($_POST['project_url']));
        if (isset($_POST['client_name'])) update_post_meta($post_id, 'client_name', sanitize_text_field($_POST['client_name']));
    }

    if (isset($_POST['yg_testimonial_nonce']) && wp_verify_nonce($_POST['yg_testimonial_nonce'], 'yg_testimonial_meta')) {
        if (isset($_POST['client_role'])) update_post_meta($post_id, 'client_role', sanitize_text_field($_POST['client_role']));
        if (isset($_POST['client_country'])) update_post_meta($post_id, 'client_country', sanitize_text_field($_POST['client_country']));
        if (isset($_POST['rating'])) update_post_meta($post_id, 'rating', (int) $_POST['rating']);
        if (isset($_POST['client_image_url'])) update_post_meta($post_id, 'client_image_url', esc_url_raw($_POST['client_image_url']));
    }
});
