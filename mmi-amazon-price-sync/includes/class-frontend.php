<?php
/**
 * Frontend price display — show Amazon price without overwriting WC price fields.
 */

defined( 'ABSPATH' ) || exit;

class MMI_APS_Frontend {

	public static function init(): void {
		add_filter( 'woocommerce_product_get_price', array( __CLASS__, 'filter_price' ), 20, 2 );
		add_filter( 'woocommerce_product_get_regular_price', array( __CLASS__, 'filter_regular_price' ), 20, 2 );
		add_filter( 'woocommerce_product_get_sale_price', array( __CLASS__, 'filter_sale_price' ), 20, 2 );
		add_filter( 'woocommerce_product_is_on_sale', array( __CLASS__, 'filter_is_on_sale' ), 20, 2 );

		// Variations inherit parent ASIN meta in a future version; simple products only for v1.
		add_filter( 'woocommerce_variation_prices_price', array( __CLASS__, 'filter_variation_price' ), 20, 3 );
		add_filter( 'woocommerce_variation_prices_regular_price', array( __CLASS__, 'filter_variation_regular_price' ), 20, 3 );
		add_filter( 'woocommerce_variation_prices_sale_price', array( __CLASS__, 'filter_variation_sale_price' ), 20, 3 );
	}

	/**
	 * @param mixed           $price   Current price.
	 * @param WC_Product|null $product Product object.
	 * @return mixed
	 */
	public static function filter_price( $price, $product ) {
		$amazon_price = self::get_amazon_price_for_product( $product );
		if ( null === $amazon_price ) {
			return $price;
		}

		return (string) (int) round( $amazon_price );
	}

	/**
	 * @param mixed           $price   Current regular price.
	 * @param WC_Product|null $product Product object.
	 * @return mixed
	 */
	public static function filter_regular_price( $price, $product ) {
		$amazon_price          = self::get_amazon_price_for_product( $product );
		$amazon_original_price = self::get_amazon_original_for_product( $product );

		if ( null === $amazon_price ) {
			return $price;
		}

		if ( null !== $amazon_original_price && $amazon_original_price > $amazon_price ) {
			return (string) $amazon_original_price;
		}

		return (string) $amazon_price;
	}

	/**
	 * @param mixed           $price   Current sale price.
	 * @param WC_Product|null $product Product object.
	 * @return mixed
	 */
	public static function filter_sale_price( $price, $product ) {
		$amazon_price          = self::get_amazon_price_for_product( $product );
		$amazon_original_price = self::get_amazon_original_for_product( $product );

		if ( null === $amazon_price ) {
			return $price;
		}

		if ( null !== $amazon_original_price && $amazon_original_price > $amazon_price ) {
			return (string) $amazon_price;
		}

		return '';
	}

	/**
	 * @param bool            $on_sale Whether product is on sale.
	 * @param WC_Product|null $product Product object.
	 */
	public static function filter_is_on_sale( bool $on_sale, $product ): bool {
		$amazon_price          = self::get_amazon_price_for_product( $product );
		$amazon_original_price = self::get_amazon_original_for_product( $product );

		if ( null !== $amazon_price && null !== $amazon_original_price && $amazon_original_price > $amazon_price ) {
			return true;
		}

		return $on_sale;
	}

	/**
	 * @param float  $price      Variation price.
	 * @param object $variation  Variation product.
	 * @param object $product    Parent product.
	 */
	public static function filter_variation_price( $price, $variation, $product ) {
		$amazon_price = self::get_amazon_price_for_product( $variation );
		if ( null === $amazon_price ) {
			$amazon_price = self::get_amazon_price_for_product( $product );
		}
		return null !== $amazon_price ? $amazon_price : $price;
	}

	/**
	 * @param float  $price      Variation regular price.
	 * @param object $variation  Variation product.
	 * @param object $product    Parent product.
	 */
	public static function filter_variation_regular_price( $price, $variation, $product ) {
		$target = $variation ?: $product;
		$filtered = self::filter_regular_price( $price, $target );
		if ( (string) $filtered !== (string) $price ) {
			return $filtered;
		}
		return self::filter_regular_price( $price, $product );
	}

	/**
	 * @param float  $price      Variation sale price.
	 * @param object $variation  Variation product.
	 * @param object $product    Parent product.
	 */
	public static function filter_variation_sale_price( $price, $variation, $product ) {
		$target = $variation ?: $product;
		$filtered = self::filter_sale_price( $price, $target );
		if ( '' !== $filtered || self::get_amazon_price_for_product( $target ) ) {
			return $filtered;
		}
		return self::filter_sale_price( $price, $product );
	}

	/**
	 * @param WC_Product|null $product Product.
	 */
	private static function get_amazon_price_for_product( $product ): ?float {
		if ( ! $product instanceof WC_Product ) {
			return null;
		}

		return MMI_APS_Product_Meta::get_amazon_price( $product->get_id() );
	}

	/**
	 * @param WC_Product|null $product Product.
	 */
	private static function get_amazon_original_for_product( $product ): ?float {
		if ( ! $product instanceof WC_Product ) {
			return null;
		}

		return MMI_APS_Product_Meta::get_amazon_original_price( $product->get_id() );
	}
}
