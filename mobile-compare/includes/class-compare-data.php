<?php
/**
 * Maps WooCommerce products to compare payloads.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Data {

	const CACHE_GROUP = 'mobile_compare';
	const CACHE_TTL   = DAY_IN_SECONDS;

	/**
	 * Default attribute mapping (override in Settings → Mobile Compare).
	 *
	 * @return array<int, array<string, string>>
	 */
	public static function get_attribute_map(): array {
		$defaults = array(
			array( 'slug' => 'pa_display', 'label' => 'Display', 'group' => 'Display', 'rule' => 'text', 'icon' => 'display' ),
			array( 'slug' => 'pa_processor', 'label' => 'Processor', 'group' => 'Performance', 'rule' => 'text', 'icon' => 'processor' ),
			array( 'slug' => 'pa_ram', 'label' => 'RAM', 'group' => 'Performance', 'rule' => 'higher', 'icon' => 'ram' ),
			array( 'slug' => 'pa_storage', 'label' => 'Storage', 'group' => 'Performance', 'rule' => 'higher', 'icon' => 'storage' ),
			array( 'slug' => 'pa_rear-camera', 'label' => 'Rear Camera', 'group' => 'Camera', 'rule' => 'text', 'icon' => 'camera' ),
			array( 'slug' => 'pa_front-camera', 'label' => 'Front Camera', 'group' => 'Camera', 'rule' => 'text', 'icon' => 'camera' ),
			array( 'slug' => 'pa_battery', 'label' => 'Battery', 'group' => 'Battery', 'rule' => 'higher', 'icon' => 'battery' ),
			array( 'slug' => 'pa_charging', 'label' => 'Charging', 'group' => 'Battery', 'rule' => 'text', 'icon' => 'charging' ),
			array( 'slug' => 'pa_os', 'label' => 'Operating System', 'group' => 'General', 'rule' => 'text', 'icon' => 'os' ),
			array( 'slug' => 'pa_weight', 'label' => 'Weight', 'group' => 'General', 'rule' => 'lower', 'icon' => 'weight' ),
			array( 'slug' => 'pa_5g', 'label' => '5G', 'group' => 'Connectivity', 'rule' => 'boolean', 'icon' => '5g' ),
			array( 'slug' => 'pa_nfc', 'label' => 'NFC', 'group' => 'Connectivity', 'rule' => 'boolean', 'icon' => 'nfc' ),
			array( 'slug' => 'pa_fingerprint', 'label' => 'Fingerprint', 'group' => 'Connectivity', 'rule' => 'text', 'icon' => 'fingerprint' ),
		);

		$stored = get_option( 'mobile_compare_attribute_map', array() );
		if ( ! empty( $stored ) && is_array( $stored ) ) {
			return $stored;
		}

		return $defaults;
	}

	/**
	 * Search products for autocomplete.
	 *
	 * @param string $query   Search string.
	 * @param int    $limit   Max results.
	 */
	public static function search_products( string $query, int $limit = 12 ): array {
		$args = array(
			'status'   => 'publish',
			'limit'    => $limit,
			'orderby'  => 'relevance',
			'return'   => 'ids',
		);

		if ( $query !== '' ) {
			$args['s'] = $query;
		}

		$query_obj = new WC_Product_Query( $args );
		$ids       = $query_obj->get_products();

		$results = array();
		foreach ( $ids as $id ) {
			$product = wc_get_product( $id );
			if ( ! $product ) {
				continue;
			}
			$results[] = self::format_product_summary( $product );
		}

		return $results;
	}

	/**
	 * Batch fetch compare payloads for product IDs.
	 *
	 * @param array<int> $ids Product IDs.
	 */
	public static function get_products_for_compare( array $ids ): array {
		$products = array();
		foreach ( $ids as $id ) {
			$id = absint( $id );
			if ( $id <= 0 ) {
				continue;
			}
			$cached = wp_cache_get( 'product_' . $id, self::CACHE_GROUP );
			if ( false !== $cached ) {
				$products[] = $cached;
				continue;
			}

			$product = wc_get_product( $id );
			if ( ! $product || 'publish' !== $product->get_status() ) {
				continue;
			}

			$data = self::format_product_compare( $product );
			wp_cache_set( 'product_' . $id, $data, self::CACHE_GROUP, self::CACHE_TTL );
			$products[] = $data;
		}

		return $products;
	}

	/**
	 * Resolve product IDs from slug path (e.g. galaxy-m47-5g/vs/nothing-phone-4b).
	 *
	 * @param string $slug_path Slug segments joined by /vs/.
	 */
	public static function ids_from_slug_path( string $slug_path ): array {
		$parts = array_filter( array_map( 'trim', explode( '/vs/', trim( $slug_path, '/' ) ) ) );
		$ids   = array();

		foreach ( $parts as $slug ) {
			$slug = sanitize_title( $slug );
			if ( '' === $slug ) {
				continue;
			}

			$post = get_page_by_path( $slug, OBJECT, 'product' );
			if ( $post ) {
				$ids[] = (int) $post->ID;
				continue;
			}

			// Fallback: query by slug.
			$found = get_posts(
				array(
					'name'        => $slug,
					'post_type'   => 'product',
					'post_status' => 'publish',
					'numberposts' => 1,
					'fields'      => 'ids',
				)
			);
			if ( ! empty( $found ) ) {
				$ids[] = (int) $found[0];
			}
		}

		return array_slice( array_unique( $ids ), 0, 3 );
	}

	/**
	 * Build slug-based compare URL.
	 *
	 * @param array<int> $ids Product IDs.
	 */
	public static function build_compare_url( array $ids ): string {
		$slugs = array();
		foreach ( $ids as $id ) {
			$product = wc_get_product( absint( $id ) );
			if ( $product ) {
				$slugs[] = $product->get_slug();
			}
		}

		if ( empty( $slugs ) ) {
			return home_url( '/compare/' );
		}

		return home_url( '/compare/' . implode( '/vs/', $slugs ) . '/' );
	}

	/**
	 * Popular comparison pairs from settings.
	 */
	public static function get_popular_comparisons(): array {
		$stored = get_option( 'mobile_compare_popular_pairs', array() );
		if ( empty( $stored ) || ! is_array( $stored ) ) {
			return self::get_auto_popular_pairs();
		}

		$pairs = array();
		foreach ( $stored as $pair ) {
			if ( ! is_array( $pair ) || count( $pair ) < 2 ) {
				continue;
			}
			$ids = array_map( 'absint', $pair );
			$products = self::get_products_for_compare( array_slice( $ids, 0, 2 ) );
			if ( count( $products ) >= 2 ) {
				$pairs[] = array(
					'products' => $products,
					'url'      => self::build_compare_url( array_slice( $ids, 0, 2 ) ),
				);
			}
		}

		return $pairs;
	}

	/**
	 * Suggested products (recent, excluding given IDs).
	 *
	 * @param array<int> $exclude_ids IDs to skip.
	 * @param int        $limit       Max results.
	 */
	public static function get_suggested_products( array $exclude_ids = array(), int $limit = 6 ): array {
		$args = array(
			'status'  => 'publish',
			'limit'   => $limit,
			'orderby' => 'date',
			'order'   => 'DESC',
			'exclude' => array_map( 'absint', $exclude_ids ),
			'return'  => 'ids',
		);

		$query_obj = new WC_Product_Query( $args );
		$ids       = $query_obj->get_products();
		$results   = array();

		foreach ( $ids as $id ) {
			$product = wc_get_product( $id );
			if ( $product ) {
				$results[] = self::format_product_summary( $product );
			}
		}

		return $results;
	}

	/**
	 * Build comparison table rows for selected products.
	 *
	 * @param array<array> $products Compare product payloads.
	 */
	public static function build_spec_rows( array $products ): array {
		$map  = self::get_attribute_map();
		$rows = array();

		foreach ( $map as $attr ) {
			$slug  = $attr['slug'] ?? '';
			$label = $attr['label'] ?? $slug;
			$group = $attr['group'] ?? 'General';
			$rule  = $attr['rule'] ?? 'text';
			$icon  = $attr['icon'] ?? '';

			$values = array();
			foreach ( $products as $product ) {
				$values[] = $product['specs'][ $slug ] ?? '-';
			}

			$rows[] = array(
				'slug'   => $slug,
				'label'  => $label,
				'group'  => $group,
				'rule'   => $rule,
				'icon'   => $icon,
				'values' => $values,
			);
		}

		return $rows;
	}

	/**
	 * Clear product cache on save.
	 *
	 * @param int $product_id Product ID.
	 */
	public static function invalidate_product_cache( int $product_id ): void {
		wp_cache_delete( 'product_' . $product_id, self::CACHE_GROUP );
	}

	/**
	 * @param WC_Product $product Product object.
	 */
	private static function format_product_summary( WC_Product $product ): array {
		$image_id = $product->get_image_id();
		$image    = $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : wc_placeholder_img_src();

		return array(
			'id'          => $product->get_id(),
			'name'        => $product->get_name(),
			'slug'        => $product->get_slug(),
			'image'       => $image,
			'price'       => $product->get_price_html(),
			'price_plain' => wp_strip_all_tags( $product->get_price_html() ),
			'url'         => $product->get_permalink(),
			'in_stock'    => $product->is_in_stock(),
		);
	}

	/**
	 * @param WC_Product $product Product object.
	 */
	private static function format_product_compare( WC_Product $product ): array {
		$summary = self::format_product_summary( $product );
		$specs   = array();

		foreach ( self::get_attribute_map() as $attr ) {
			$slug = $attr['slug'] ?? '';
			if ( '' === $slug ) {
				continue;
			}
			$specs[ $slug ] = self::get_attribute_value( $product, $slug );
		}

		$summary['specs']      = $specs;
		$summary['brand']      = self::get_product_brand( $product );
		$summary['buy_url']    = $product->get_permalink();
		$summary['price_raw']  = $product->get_price();
		$summary['in_stock']   = $product->is_in_stock();

		return $summary;
	}

	/**
	 * Read WooCommerce attribute value for a product.
	 *
	 * @param WC_Product $product Product.
	 * @param string     $slug    Attribute slug (pa_*).
	 */
	private static function get_attribute_value( WC_Product $product, string $slug ): string {
		$taxonomy = taxonomy_exists( $slug ) ? $slug : 'pa_' . ltrim( $slug, 'pa_' );

		if ( ! taxonomy_exists( $taxonomy ) ) {
			// Try product meta fallback.
			$meta_key = str_replace( 'pa_', '', $taxonomy );
			$meta     = $product->get_meta( $meta_key );
			return $meta ? (string) $meta : '-';
		}

		$terms = wc_get_product_terms( $product->get_id(), $taxonomy, array( 'fields' => 'names' ) );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			return implode( ', ', $terms );
		}

		// Variation / custom attribute on product object.
		$attributes = $product->get_attributes();
		foreach ( $attributes as $key => $attribute ) {
			$attr_name = is_string( $key ) ? $key : $attribute->get_name();
			if ( $attr_name === $taxonomy || $attr_name === str_replace( 'pa_', '', $taxonomy ) ) {
				if ( $attribute->is_taxonomy() ) {
					$term_names = wc_get_product_terms( $product->get_id(), $attr_name, array( 'fields' => 'names' ) );
					if ( ! empty( $term_names ) && ! is_wp_error( $term_names ) ) {
						return implode( ', ', $term_names );
					}
				} else {
					$options = $attribute->get_options();
					if ( ! empty( $options ) ) {
						return implode( ', ', $options );
					}
				}
			}
		}

		return '-';
	}

	/**
	 * Brand from pa_brand or first category.
	 *
	 * @param WC_Product $product Product.
	 */
	private static function get_product_brand( WC_Product $product ): string {
		if ( taxonomy_exists( 'pa_brand' ) ) {
			$terms = wc_get_product_terms( $product->get_id(), 'pa_brand', array( 'fields' => 'names' ) );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				return $terms[0];
			}
		}

		$categories = wc_get_product_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );
		if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) {
			return $categories[0];
		}

		return '';
	}

	/**
	 * Auto-generate a few popular pairs from recent products.
	 */
	private static function get_auto_popular_pairs(): array {
		$ids = wc_get_products(
			array(
				'status'  => 'publish',
				'limit'   => 12,
				'orderby' => 'date',
				'order'   => 'DESC',
				'return'  => 'ids',
			)
		);

		$pairs = array();
		for ( $i = 0; $i < count( $ids ) - 1 && count( $pairs ) < 6; $i += 2 ) {
			$pair_ids = array( (int) $ids[ $i ], (int) $ids[ $i + 1 ] );
			$products = self::get_products_for_compare( $pair_ids );
			if ( count( $products ) >= 2 ) {
				$pairs[] = array(
					'products' => $products,
					'url'      => self::build_compare_url( $pair_ids ),
				);
			}
		}

		return $pairs;
	}
}
