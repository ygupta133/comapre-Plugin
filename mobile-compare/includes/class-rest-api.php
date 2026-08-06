<?php
/**
 * REST API endpoints for the compare SPA.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_REST_API {

	const NAMESPACE = 'mobile-compare/v1';

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'save_post_product', array( __CLASS__, 'on_product_save' ), 10, 1 );
	}

	public static function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/search',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'search' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'q'     => array(
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit' => array(
						'type'    => 'integer',
						'default' => 12,
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/products',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'products' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'ids' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/products-by-slugs',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'products_by_slugs' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'path' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/popular',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'popular' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/suggested',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'suggested' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'exclude' => array(
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit'   => array(
						'type'    => 'integer',
						'default' => 6,
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/config',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'config' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 */
	public static function search( WP_REST_Request $request ): WP_REST_Response {
		$query  = (string) $request->get_param( 'q' );
		$limit  = min( 20, max( 1, (int) $request->get_param( 'limit' ) ) );
		$items  = Mobile_Compare_Data::search_products( $query, $limit );

		return new WP_REST_Response( array( 'items' => $items ), 200 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 */
	public static function products( WP_REST_Request $request ): WP_REST_Response {
		$ids_raw = (string) $request->get_param( 'ids' );
		$ids     = array_slice(
			array_filter( array_map( 'absint', explode( ',', $ids_raw ) ) ),
			0,
			3
		);

		if ( count( $ids ) < 1 ) {
			return new WP_REST_Response( array( 'message' => 'No valid product IDs.' ), 400 );
		}

		$products = Mobile_Compare_Data::get_products_for_compare( $ids );
		$rows     = Mobile_Compare_Data::build_spec_rows( $products );

		return new WP_REST_Response(
			array(
				'products' => $products,
				'specs'    => $rows,
				'url'      => Mobile_Compare_Data::build_compare_url( $ids ),
			),
			200
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 */
	public static function products_by_slugs( WP_REST_Request $request ): WP_REST_Response {
		$path = (string) $request->get_param( 'path' );
		$ids  = Mobile_Compare_Data::ids_from_slug_path( $path );

		if ( empty( $ids ) ) {
			return new WP_REST_Response( array( 'message' => 'No products found for slugs.' ), 404 );
		}

		$products = Mobile_Compare_Data::get_products_for_compare( $ids );
		$rows     = Mobile_Compare_Data::build_spec_rows( $products );

		return new WP_REST_Response(
			array(
				'products' => $products,
				'specs'    => $rows,
				'ids'      => $ids,
				'url'      => Mobile_Compare_Data::build_compare_url( $ids ),
			),
			200
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 */
	public static function suggested( WP_REST_Request $request ): WP_REST_Response {
		$exclude_raw = (string) $request->get_param( 'exclude' );
		$exclude     = array_filter( array_map( 'absint', explode( ',', $exclude_raw ) ) );
		$limit       = min( 12, max( 1, (int) $request->get_param( 'limit' ) ) );
		$items       = Mobile_Compare_Data::get_suggested_products( $exclude, $limit );

		return new WP_REST_Response( array( 'items' => $items ), 200 );
	}

	public static function popular(): WP_REST_Response {
		return new WP_REST_Response( array( 'pairs' => Mobile_Compare_Data::get_popular_comparisons() ), 200 );
	}

	public static function config(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'maxProducts'    => 3,
				'compareBaseUrl' => home_url( '/compare/' ),
				'attributeMap'   => Mobile_Compare_Data::get_attribute_map(),
				'i18n'           => array(
					'title'              => __( 'Compare Mobiles', 'mobile-compare' ),
					'subtitle'           => __( 'Compare up to 3 smartphones and find the best one for you.', 'mobile-compare' ),
					'selectProduct'      => __( 'Select a product', 'mobile-compare' ),
					'selectLabel'        => __( 'Select Mobiles to Compare', 'mobile-compare' ),
					'searchOrPick'       => __( 'Search or pick a phone', 'mobile-compare' ),
					'compareNow'         => __( 'Compare Now!', 'mobile-compare' ),
					'addToCompare'       => __( 'Add to Compare', 'mobile-compare' ),
					'addedToCompare'     => __( 'Added to Compare', 'mobile-compare' ),
					'popularTitle'       => __( 'Popular Comparisons', 'mobile-compare' ),
					'suggestedTitle'     => __( 'Compare Suggested Mobiles', 'mobile-compare' ),
					'showDifferences'    => __( 'Show only differences', 'mobile-compare' ),
					'highlightBetter'    => __( 'Highlight better specs', 'mobile-compare' ),
					'clearAll'           => __( 'Clear All', 'mobile-compare' ),
					'share'              => __( 'Share', 'mobile-compare' ),
					'fabCompare'         => __( 'Compare', 'mobile-compare' ),
					'addAnotherPhone'    => __( 'Add Another Phone', 'mobile-compare' ),
					'viewDetails'        => __( 'View Details', 'mobile-compare' ),
					'buyNow'             => __( 'Buy Now', 'mobile-compare' ),
					'addPhone'           => __( 'Add Phone', 'mobile-compare' ),
					'startingAt'         => __( 'Starting at', 'mobile-compare' ),
					'loadingCompare'     => __( 'Loading comparison…', 'mobile-compare' ),
					'loadingSearch'      => __( 'Searching…', 'mobile-compare' ),
					'noResults'          => __( 'No phones found', 'mobile-compare' ),
					'available'          => __( 'Available', 'mobile-compare' ),
					'outOfStock'         => __( 'Out of Stock', 'mobile-compare' ),
					'loadError'          => __( 'Could not load comparison. Please try again.', 'mobile-compare' ),
					'linkCopied'         => __( 'Link copied!', 'mobile-compare' ),
				),
			),
			200
		);
	}

	/**
	 * @param int $post_id Post ID.
	 */
	public static function on_product_save( int $post_id ): void {
		if ( 'product' !== get_post_type( $post_id ) ) {
			return;
		}
		Mobile_Compare_Data::invalidate_product_cache( $post_id );
	}
}
