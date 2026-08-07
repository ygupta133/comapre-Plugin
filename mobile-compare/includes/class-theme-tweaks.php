<?php
/**
 * ReHub / WooCommerce front-end tweaks.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Theme_Tweaks {

	public static function init(): void {
		add_action( 'wp_head', array( __CLASS__, 'print_hide_wishlist_css' ), 99999 );
	}

	/**
	 * Inline CSS loads last in <head> so it beats theme + Customizer rules.
	 */
	public static function print_hide_wishlist_css(): void {
		if ( is_admin() || ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}
		?>
		<style id="mobile-compare-hide-wishlist">
			#woo-button-area .button_action,
			.woo-button-area .button_action,
			.summary .button_action,
			#woo-button-area .rh-sq-icon-btn-big,
			#woo-button-area .heart_thumb_wrap,
			#woo-button-area .cell_wishlist,
			#woo-button-area [id^="wishcount"] {
				display: none !important;
				visibility: hidden !important;
				width: 0 !important;
				height: 0 !important;
				margin: 0 !important;
				padding: 0 !important;
				overflow: hidden !important;
				opacity: 0 !important;
				pointer-events: none !important;
			}
		</style>
		<?php
	}
}
