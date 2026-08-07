<?php
/**
 * Main plugin bootstrap.
 */

defined( 'ABSPATH' ) || exit;

final class Mobile_Compare_Plugin {

	/** @var self|null */
	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		Mobile_Compare_Rewrites::init();
		Mobile_Compare_REST_API::init();
		Mobile_Compare_Admin::init();
		Mobile_Compare_Assets::init();
		Mobile_Compare_Theme_Tweaks::init();

		add_shortcode( 'mobile_compare', array( $this, 'render_shortcode' ) );
		add_filter( 'template_include', array( $this, 'maybe_use_compare_template' ) );
		add_filter( 'body_class', array( $this, 'add_body_class' ) );
	}

	/**
	 * Shortcode output — SPA mount point.
	 */
	public function render_shortcode(): string {
		if ( ! Mobile_Compare_Assets::is_compare_context() ) {
			Mobile_Compare_Assets::enqueue();
		}

		return '<div id="mobile-compare-app" class="mobile-compare-root" aria-live="polite"></div>';
	}

	/**
	 * Use minimal template on compare rewrite routes.
	 *
	 * @param string $template Current template path.
	 */
	public function maybe_use_compare_template( string $template ): string {
		$slugs = get_query_var( 'mobile_compare_slugs' );
		if ( empty( $slugs ) ) {
			return $template;
		}

		Mobile_Compare_Assets::enqueue();

		$plugin_template = MOBILE_COMPARE_PATH . 'templates/compare-blank.php';
		if ( file_exists( $plugin_template ) ) {
			return $plugin_template;
		}

		return $template;
	}

	/**
	 * Body class for compare pages — hides duplicate theme titles via CSS.
	 *
	 * @param string[] $classes Body classes.
	 * @return string[]
	 */
	public function add_body_class( array $classes ): array {
		if ( Mobile_Compare_Assets::is_compare_context() ) {
			$classes[] = 'mobile-compare-active';
		}
		return $classes;
	}
}
