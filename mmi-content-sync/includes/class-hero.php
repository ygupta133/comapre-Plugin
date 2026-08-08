<?php
/**
 * 91mobiles-style trending hero shortcode.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_Content_Sync_Hero {

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_shortcode( 'mmi_trending_hero', array( __CLASS__, 'render_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
	}

	/**
	 * Register front-end assets.
	 */
	public static function register_assets() {
		wp_register_style(
			'mmi-hero',
			MMI_CONTENT_SYNC_URL . 'assets/css/hero.css',
			array(),
			MMI_CONTENT_SYNC_VERSION
		);

		wp_register_style(
			'swiper',
			'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
			array(),
			'11.0.0'
		);

		wp_register_script(
			'swiper',
			'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
			array(),
			'11.0.0',
			true
		);

		wp_register_script(
			'mmi-hero',
			MMI_CONTENT_SYNC_URL . 'assets/js/hero.js',
			array( 'swiper' ),
			MMI_CONTENT_SYNC_VERSION,
			true
		);
	}

	/**
	 * Shortcode callback.
	 *
	 * @param array<string, string> $atts Shortcode attributes.
	 * @return string
	 */
	public static function render_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'count' => '8',
			),
			$atts,
			'mmi_trending_hero'
		);

		$posts = MMI_Content_Sync_API::get_posts( (int) $atts['count'] );
		if ( count( $posts ) < 4 ) {
			return '';
		}

		wp_enqueue_style( 'swiper' );
		wp_enqueue_style( 'mmi-hero' );
		wp_enqueue_script( 'swiper' );
		wp_enqueue_script( 'mmi-hero' );

		$slides = array();
		for ( $i = 0; $i < count( $posts ); $i += 4 ) {
			$chunk = array_slice( $posts, $i, 4 );
			if ( count( $chunk ) === 4 ) {
				$slides[] = $chunk;
			}
		}

		if ( ! $slides ) {
			return '';
		}

		ob_start();
		include MMI_CONTENT_SYNC_PATH . 'templates/hero-section.php';
		return (string) ob_get_clean();
	}
}
