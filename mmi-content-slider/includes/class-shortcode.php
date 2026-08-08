<?php
/**
 * Shortcode Class
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Shortcode {

	public function __construct() {

		add_shortcode(
			'mmi_slider',
			array( $this, 'render_slider' )
		);
	}

	/**
	 * Render Slider
	 */
	public function render_slider( $atts ) {

		$atts = shortcode_atts(
			array(
				'id' => '',
			),
			$atts,
			'mmi_slider'
		);

		if ( empty( $atts['id'] ) ) {
			return '<p>Slider ID missing.</p>';
		}

		$slider = get_page_by_path(
			sanitize_title( $atts['id'] ),
			OBJECT,
			'mmi_slider'
		);

		if ( ! $slider ) {
			return '<p>Slider not found.</p>';
		}

		$heading = get_post_meta(
			$slider->ID,
			'_mmi_cs_heading',
			true
		);

		$source = get_post_meta(
			$slider->ID,
			'_mmi_cs_source',
			true
		);

		$category = get_post_meta(
			$slider->ID,
			'_mmi_cs_category',
			true
		);

		$api = new MMI_CS_API( $source );

		$posts = $api->get_posts_by_category(
			$category,
			8
		);

		if ( is_wp_error( $posts ) ) {
			return '<p>' . esc_html( $posts->get_error_message() ) . '</p>';
		}

		ob_start();

		include MMI_CS_PATH . 'includes/template-slider.php';

		return ob_get_clean();
	}
}