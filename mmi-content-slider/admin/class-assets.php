<?php
/**
 * Admin Assets
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Assets {

	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
	}

	/**
	 * Load Admin Assets
	 */
	public function enqueue( $hook ) {

		global $post;

		// Only load on Slider pages.
		if (
			isset( $post->post_type ) &&
			'post.php' === $hook &&
			'mmi_slider' === $post->post_type
		) {

			$this->load_assets();

		} elseif ( 'post-new.php' === $hook && isset( $_GET['post_type'] ) && 'mmi_slider' === $_GET['post_type'] ) {

			$this->load_assets();

		}
	}

	/**
	 * Register CSS & JS
	 */
	private function load_assets() {

	wp_enqueue_style(
		'mmi-cs-admin',
		MMI_CS_URL . 'assets/css/admin.css',
		array(),
		MMI_CS_VERSION
	);

	wp_enqueue_script(
		'mmi-cs-admin',
		MMI_CS_URL . 'assets/js/admin.js',
		array( 'jquery' ),
		MMI_CS_VERSION,
		true
	);

	wp_localize_script(
		'mmi-cs-admin',
		'MMI_CS',
		array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'mmi_cs_admin' ),
		)
	);
}
}