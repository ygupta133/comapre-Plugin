<?php
/**
 * Latest Shortcode
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Latest_Shortcode {

	public function __construct() {

		add_shortcode(
			'mmi_latest',
			array( $this, 'render' )
		);
	}

	/**
	 * Render Latest News
	 */
	public function render() {

		/**
		 * Change this URL if required.
		 * Later we will move it to Plugin Settings.
		 */
		$source = 'https://www.mymobileindia.com';

		$heading = '';

		$api = new MMI_CS_API( $source );

		$posts = $api->get_latest_posts( 26);

		if ( is_wp_error( $posts ) ) {
			return '<p>' . esc_html( $posts->get_error_message() ) . '</p>';
		}

		ob_start();

		include MMI_CS_PATH . 'includes/template-latest.php';

		return ob_get_clean();
	}
}