<?php
/**
 * Plugin Name: Mobile Compare
 * Plugin URI:  https://github.com/yogesh/comapre-Plugin
 * Description: Fast 91mobiles-style product comparison for WooCommerce. Independent SPA, optimized for ReHub and large catalogs.
 * Version:     2.1.2
 * Author:      Yogesh
 * Text Domain: mobile-compare
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 7.0
 */

defined( 'ABSPATH' ) || exit;

define( 'MOBILE_COMPARE_VERSION', '2.1.2' );
define( 'MOBILE_COMPARE_FILE', __FILE__ );
define( 'MOBILE_COMPARE_PATH', plugin_dir_path( __FILE__ ) );
define( 'MOBILE_COMPARE_URL', plugin_dir_url( __FILE__ ) );

require_once MOBILE_COMPARE_PATH . 'includes/class-compare-data.php';
require_once MOBILE_COMPARE_PATH . 'includes/class-rewrites.php';
require_once MOBILE_COMPARE_PATH . 'includes/class-rest-api.php';
require_once MOBILE_COMPARE_PATH . 'includes/class-admin.php';
require_once MOBILE_COMPARE_PATH . 'includes/class-assets.php';
require_once MOBILE_COMPARE_PATH . 'includes/class-plugin.php';

/**
 * Bootstrap plugin after WooCommerce loads.
 */
function mobile_compare_init() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		add_action( 'admin_notices', 'mobile_compare_woocommerce_missing_notice' );
		return;
	}

	Mobile_Compare_Plugin::instance();
}
add_action( 'plugins_loaded', 'mobile_compare_init' );

/**
 * Admin notice when WooCommerce is missing.
 */
function mobile_compare_woocommerce_missing_notice() {
	echo '<div class="notice notice-error"><p>';
	echo esc_html__( 'Mobile Compare requires WooCommerce to be installed and active.', 'mobile-compare' );
	echo '</p></div>';
}

/**
 * Activation: create compare page and flush rewrites.
 */
function mobile_compare_activate() {
	Mobile_Compare_Rewrites::register_rules();
	flush_rewrite_rules();

	$existing = get_page_by_path( 'compare' );
	if ( ! $existing ) {
		wp_insert_post(
			array(
				'post_title'   => 'Compare Mobiles',
				'post_name'    => 'compare',
				'post_status'  => 'publish',
				'post_type'    => 'page',
				'post_content' => '[mobile_compare]',
			)
		);
	}
}
register_activation_hook( __FILE__, 'mobile_compare_activate' );

/**
 * Deactivation: flush rewrites.
 */
function mobile_compare_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'mobile_compare_deactivate' );
