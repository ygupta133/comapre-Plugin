<?php
/**
 * Frontend Assets
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Frontend_Assets {

	public function __construct() {

		add_action(
			'wp_enqueue_scripts',
			array( $this, 'enqueue' )
		);
	}

	public function enqueue() {

		/**
		 * Swiper CSS
		 */
		wp_enqueue_style(
			'swiper',
			MMI_CS_URL . 'assets/css/swiper-bundle.min.css',
			array(),
			'11.2.10'
		);

		/**
		 * Existing Category Slider CSS
		 */
		wp_enqueue_style(
			'mmi-slider',
			MMI_CS_URL . 'assets/css/slider.css',
			array( 'swiper' ),
			MMI_CS_VERSION
		);

		/**
		 * Latest News CSS
		 */
		wp_enqueue_style(
			'mmi-latest',
			MMI_CS_URL . 'assets/css/latest.css',
			array( 'swiper' ),
			MMI_CS_VERSION
		);

		/**
		 * Swiper JS
		 */
		wp_enqueue_script(
			'swiper',
			MMI_CS_URL . 'assets/js/swiper-bundle.min.js',
			array(),
			'11.2.10',
			true
		);

		/**
		 * Existing Category Slider JS
		 */
		wp_enqueue_script(
			'mmi-slider',
			MMI_CS_URL . 'assets/js/slider.js',
			array( 'swiper' ),
			MMI_CS_VERSION,
			true
		);

		/**
		 * Latest News JS
		 */
		wp_enqueue_script(
			'mmi-latest',
			MMI_CS_URL . 'assets/js/latest.js',
			array( 'swiper' ),
			MMI_CS_VERSION,
			true
		);
	}
}