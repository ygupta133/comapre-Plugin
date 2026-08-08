<?php
/**
 * Plugin Loader
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Loader {

	/**
	 * Initialize Plugin
	 */
	public static function init() {

		/**
		 * Core Classes
		 * These are required on both Admin and Frontend.
		 */
		require_once MMI_CS_PATH . 'includes/class-api.php';
		require_once MMI_CS_PATH . 'includes/class-shortcode.php';
		require_once MMI_CS_PATH . 'includes/class-latest-shortcode.php';
		require_once MMI_CS_PATH . 'includes/class-frontend-assets.php';

		new MMI_CS_API();
		new MMI_CS_Shortcode();
		new MMI_CS_Latest_Shortcode();
		new MMI_CS_Frontend_Assets();

		/**
		 * Admin Only
		 */
		if ( is_admin() ) {

			require_once MMI_CS_PATH . 'includes/class-fields.php';

			require_once MMI_CS_PATH . 'admin/class-admin.php';
			require_once MMI_CS_PATH . 'admin/class-metabox.php';
			require_once MMI_CS_PATH . 'admin/class-assets.php';
			require_once MMI_CS_PATH . 'admin/class-ajax.php';

			new MMI_CS_Fields();
			new MMI_CS_Admin();
			new MMI_CS_Metabox();
			new MMI_CS_Assets();
			new MMI_CS_Ajax();
		}
	}
}