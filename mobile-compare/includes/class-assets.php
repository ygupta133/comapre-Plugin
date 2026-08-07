<?php
/**
 * Asset loading — only on compare pages.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Assets {

	private static bool $enqueued = false;

	public static function init(): void {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'maybe_enqueue' ), 99 );
	}

	public static function maybe_enqueue(): void {
		if ( Mobile_Compare_Settings::is_compare_context() ) {
			self::enqueue();
		}
	}

	public static function is_compare_context(): bool {
		return Mobile_Compare_Settings::is_compare_context();
	}

	public static function enqueue(): void {
		if ( self::$enqueued ) {
			return;
		}

		self::$enqueued = true;

		$css_path = MOBILE_COMPARE_PATH . 'assets/css/compare.css';
		$js_path  = MOBILE_COMPARE_PATH . 'assets/js/compare-app.js';

		wp_enqueue_style(
			'mobile-compare',
			MOBILE_COMPARE_URL . 'assets/css/compare.css',
			array(),
			MOBILE_COMPARE_VERSION . '-' . ( file_exists( $css_path ) ? filemtime( $css_path ) : MOBILE_COMPARE_VERSION )
		);

		wp_enqueue_script(
			'mobile-compare',
			MOBILE_COMPARE_URL . 'assets/js/compare-app.js',
			array(),
			MOBILE_COMPARE_VERSION . '-' . ( file_exists( $js_path ) ? filemtime( $js_path ) : MOBILE_COMPARE_VERSION ),
			true
		);

		wp_localize_script(
			'mobile-compare',
			'mobileCompareConfig',
			array(
				'restUrl'   => esc_url_raw( rest_url( Mobile_Compare_REST_API::NAMESPACE ) ),
				'restNonce' => wp_create_nonce( 'wp_rest' ),
				'homeUrl'   => esc_url_raw( home_url( '/' ) ),
				'compareUrl'=> esc_url_raw( Mobile_Compare_Settings::get_page_url() ),
				'config'    => Mobile_Compare_REST_API::get_client_config(),
			)
		);

		// Reduce WooCommerce overhead on compare page.
		add_action(
			'wp_enqueue_scripts',
			static function () {
				wp_dequeue_script( 'wc-cart-fragments' );
			},
			100
		);
	}
}
