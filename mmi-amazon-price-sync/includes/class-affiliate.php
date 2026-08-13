<?php
/**
 * Amazon affiliate "Go to Store" button — zero overhead when disabled.
 */

defined( 'ABSPATH' ) || exit;

class MMI_APS_Affiliate {

	/** @var array<int,bool> */
	private static $rendered_products = array();

	public static function maybe_init(): void {
		if ( ! MMI_APS_Settings::is_affiliate_enabled() ) {
			return;
		}

		if ( '' === MMI_APS_Settings::get_affiliate_tag() ) {
			return;
		}

		add_filter( 'woocommerce_get_price_html', array( __CLASS__, 'append_button_to_price_html' ), 50, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_styles' ) );
		add_shortcode( 'mmi_amazon_buy_button', array( __CLASS__, 'render_shortcode' ) );

		if ( MMI_APS_Settings::show_affiliate_on_shop() ) {
			add_action( 'woocommerce_after_shop_loop_item', array( __CLASS__, 'render_loop_button' ), 15 );
		}
	}

	/**
	 * Append Go to Store button after WooCommerce price HTML (works with ReHub + most themes).
	 *
	 * @param string     $html    Price HTML.
	 * @param WC_Product $product Product object.
	 */
	public static function append_button_to_price_html( string $html, $product ): string {
		if ( is_admin() || is_cart() || is_checkout() ) {
			return $html;
		}

		if ( ! $product instanceof WC_Product ) {
			return $html;
		}

		$product_id = $product->get_id();
		if ( isset( self::$rendered_products[ $product_id ] ) ) {
			return $html;
		}

		$button = self::get_button_html( $product_id, 'price' );
		if ( '' === $button ) {
			return $html;
		}

		self::$rendered_products[ $product_id ] = true;
		self::enqueue_styles_force();

		return $html . $button;
	}

	public static function enqueue_styles(): void {
		if ( is_cart() || is_checkout() || is_admin() ) {
			return;
		}

		wp_enqueue_style(
			'mmi-aps-affiliate',
			MMI_APS_URL . 'assets/css/affiliate-button.css',
			array(),
			MMI_APS_VERSION
		);
	}

	public static function render_loop_button(): void {
		global $product;

		if ( ! $product instanceof WC_Product ) {
			return;
		}

		echo self::get_button_html( $product->get_id(), 'loop' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Build affiliate URL for a product ASIN.
	 *
	 * @param int $product_id Product ID.
	 */
	public static function get_affiliate_url( int $product_id ): string {
		$asin = MMI_APS_Product_Meta::get_asin( $product_id );
		if ( '' === $asin ) {
			return '';
		}

		$tag = MMI_APS_Settings::get_affiliate_tag();
		if ( '' === $tag || ! preg_match( '/^[a-z0-9-]{3,40}$/', $tag ) ) {
			return '';
		}

		$url = sprintf(
			'https://www.amazon.in/dp/%s?tag=%s',
			rawurlencode( $asin ),
			rawurlencode( $tag )
		);

		return apply_filters( 'mmi_aps_affiliate_url', $url, $product_id, $asin, $tag );
	}

	/**
	 * Render affiliate button HTML for a product.
	 *
	 * @param int    $product_id Product ID.
	 * @param string $context    single|loop
	 */
	public static function get_button_html( int $product_id, string $context = 'single' ): string {
		$url = self::get_affiliate_url( $product_id );
		if ( '' === $url ) {
			return '';
		}

		$text = MMI_APS_Settings::get_affiliate_button_text();
		$text = apply_filters( 'mmi_aps_affiliate_button_text', $text, $product_id, $context );

		$html  = '<div class="mmi-aps-affiliate-wrap mmi-aps-affiliate-wrap--' . esc_attr( $context ) . '">';
		$html .= '<a href="' . esc_url( $url ) . '" class="mmi-aps-affiliate-btn button alt" target="_blank" rel="nofollow sponsored noopener">';
		$html .= esc_html( $text );
		$html .= '</a>';

		if ( MMI_APS_Settings::show_affiliate_disclosure() ) {
			$html .= '<p class="mmi-aps-affiliate-note">' . esc_html__( 'As an Amazon Associate we earn from qualifying purchases.', 'mmi-amazon-price-sync' ) . '</p>';
		}

		$html .= '</div>';

		return apply_filters( 'mmi_aps_affiliate_button_html', $html, $product_id, $url, $context );
	}

	/**
	 * Shortcode: [mmi_amazon_buy_button] or [mmi_amazon_buy_button id="123"]
	 *
	 * @param array<string,string> $atts Shortcode attributes.
	 */
	public static function render_shortcode( array $atts = array() ): string {
		$atts = shortcode_atts(
			array(
				'id' => 0,
			),
			$atts,
			'mmi_amazon_buy_button'
		);

		$product_id = absint( $atts['id'] );
		if ( ! $product_id && is_product() ) {
			$product_id = get_the_ID();
		}

		if ( ! $product_id ) {
			return '';
		}

		self::enqueue_styles_force();

		return self::get_button_html( $product_id, 'shortcode' );
	}

	private static function enqueue_styles_force(): void {
		if ( ! wp_style_is( 'mmi-aps-affiliate', 'enqueued' ) ) {
			wp_enqueue_style(
				'mmi-aps-affiliate',
				MMI_APS_URL . 'assets/css/affiliate-button.css',
				array(),
				MMI_APS_VERSION
			);
		}
	}
}

/**
 * Public helper — get affiliate URL for a product.
 *
 * @param int $product_id Product ID.
 */
function mmi_aps_get_affiliate_url( int $product_id ): string {
	return MMI_APS_Affiliate::get_affiliate_url( $product_id );
}

/**
 * Public helper — render affiliate button HTML.
 *
 * @param int $product_id Product ID.
 */
function mmi_aps_get_affiliate_button( int $product_id ): string {
	return MMI_APS_Affiliate::get_button_html( $product_id );
}
