<?php
/**
 * Plugin Name: MMI Content Sync
 * Description: Fetches trending news from My Mobile India (English) API and renders a 91mobiles-style hero section with desktop sidebar and mobile carousel.
 * Version: 1.0.0
 * Author: Yogesh
 * Text Domain: mmi-content-sync
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MMI_CONTENT_SYNC_VERSION', '1.0.0' );
define( 'MMI_CONTENT_SYNC_PATH', plugin_dir_path( __FILE__ ) );
define( 'MMI_CONTENT_SYNC_URL', plugin_dir_url( __FILE__ ) );

require_once MMI_CONTENT_SYNC_PATH . 'includes/class-api.php';
require_once MMI_CONTENT_SYNC_PATH . 'includes/class-hero.php';

add_action( 'plugins_loaded', array( 'MMI_Content_Sync_Hero', 'init' ) );
