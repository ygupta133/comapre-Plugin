<?php
/**
 * Asset loading — only on compare pages.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Assets {

	private static bool $enqueued = false;

	public static function init(): void {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'maybe_enqueue' ), 99 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'maybe_enqueue_fab' ), 99 );
		add_action( 'wp_footer', array( __CLASS__, 'render_sitewide_fab' ), 99 );
	}

	public static function maybe_enqueue_fab(): void {
		if ( is_admin() || ! self::should_show_sitewide_fab() ) {
			return;
		}

		$css_path = MOBILE_COMPARE_PATH . 'assets/css/compare-fab.css';
		wp_enqueue_style(
			'mobile-compare-fab',
			MOBILE_COMPARE_URL . 'assets/css/compare-fab.css',
			array(),
			MOBILE_COMPARE_VERSION . '-' . ( file_exists( $css_path ) ? filemtime( $css_path ) : MOBILE_COMPARE_VERSION )
		);
	}

	public static function should_show_sitewide_fab(): bool {
		if ( ! Mobile_Compare_Settings::is_fab_sitewide_enabled() ) {
			return false;
		}
		if ( Mobile_Compare_Settings::is_compare_context() ) {
			return false;
		}
		return true;
	}

	public static function render_sitewide_fab(): void {
		if ( ! self::should_show_sitewide_fab() ) {
			return;
		}

		$url   = esc_url( Mobile_Compare_Settings::get_page_url() );
		$label = esc_html__( 'Compare', 'mobile-compare' );
		printf(
			'<a href="%1$s" class="mc-site-fab-compare" aria-label="%2$s"><span class="mc-site-fab-icon" aria-hidden="true">+</span><span class="mc-site-fab-label">%2$s</span></a>',
			$url,
			$label
		);
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
