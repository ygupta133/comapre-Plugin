<?php
/**
 * Plugin Name: Gagan Knowledge Panel Schema
 * Plugin URI:  https://gagandhawan.me
 * Description: Person & Organization JSON-LD schema for Google Knowledge Panel — Gagan Dhawan entity.
 * Version:     1.0.0
 * Author:      Gagan Dhawan
 * Text Domain: gagan-knowledge-panel-schema
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

define( 'GKPS_VERSION', '1.0.0' );
define( 'GKPS_FILE', __FILE__ );
define( 'GKPS_PATH', plugin_dir_path( __FILE__ ) );
define( 'GKPS_URL', plugin_dir_url( __FILE__ ) );

require_once GKPS_PATH . 'includes/class-defaults.php';
require_once GKPS_PATH . 'includes/class-admin.php';
require_once GKPS_PATH . 'includes/class-schema.php';

/**
 * Bootstrap plugin.
 */
function gkps_init(): void {
	GKPS_Admin::init();
	GKPS_Schema::init();
}
add_action( 'plugins_loaded', 'gkps_init' );

/**
 * Activation: seed default options.
 */
function gkps_activate(): void {
	$defaults = GKPS_Defaults::get();
	if ( ! get_option( 'gkps_settings' ) ) {
		update_option( 'gkps_settings', $defaults );
	}
}
register_activation_hook( __FILE__, 'gkps_activate' );
