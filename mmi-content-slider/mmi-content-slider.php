<?php
/**
 * Plugin Name: MMI Content Slider
 * Description: Dynamic reusable content slider with WordPress REST API support.
 * Version: 1.0.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MMI_CS_VERSION', '1.0.3' );
define( 'MMI_CS_PATH', plugin_dir_path( __FILE__ ) );
define( 'MMI_CS_URL', plugin_dir_url( __FILE__ ) );
define( 'MMI_CS_FILE', __FILE__ );

require_once MMI_CS_PATH . 'includes/class-loader.php';

MMI_CS_Loader::init();