<?php
/**
 * Seed WooCommerce sample phones for Mobile Compare development.
 *
 * Idempotent: safe to run multiple times.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit( 1 );
}

if ( ! class_exists( 'WooCommerce' ) ) {
	WP_CLI::error( 'WooCommerce must be active before seeding.' );
}

$attribute_defs = array(
	'pa_display'    => 'Display',
	'pa_processor'  => 'Processor',
	'pa_ram'        => 'RAM',
	'pa_storage'    => 'Storage',
	'pa_battery'    => 'Battery',
	'pa_weight'     => 'Weight',
	'pa_5g'         => '5G',
);

foreach ( $attribute_defs as $slug => $label ) {
	$taxonomy = wc_attribute_taxonomy_name( str_replace( 'pa_', '', $slug ) );
	if ( ! taxonomy_exists( $taxonomy ) ) {
		$attr_id = wc_create_attribute(
			array(
				'name'         => $label,
				'slug'         => str_replace( 'pa_', '', $slug ),
				'type'         => 'select',
				'order_by'     => 'menu_order',
				'has_archives' => false,
			)
		);
		if ( is_wp_error( $attr_id ) ) {
			WP_CLI::warning( $attr_id->get_error_message() );
		}
		register_taxonomy( $taxonomy, array( 'product' ), array() );
	}
}

$products = array(
	array(
		'name'   => 'Galaxy S24',
		'slug'   => 'galaxy-s24',
		'price'  => '79999',
		'attrs'  => array(
			'pa_display'   => '6.2 inch AMOLED',
			'pa_processor' => 'Snapdragon 8 Gen 3',
			'pa_ram'       => '8GB',
			'pa_storage'   => '256GB',
			'pa_battery'   => '4000mAh',
			'pa_weight'    => '167g',
			'pa_5g'        => 'Yes',
		),
	),
	array(
		'name'   => 'iPhone 15',
		'slug'   => 'iphone-15',
		'price'  => '89999',
		'attrs'  => array(
			'pa_display'   => '6.1 inch OLED',
			'pa_processor' => 'Apple A16 Bionic',
			'pa_ram'       => '6GB',
			'pa_storage'   => '128GB',
			'pa_battery'   => '3349mAh',
			'pa_weight'    => '171g',
			'pa_5g'        => 'Yes',
		),
	),
);

foreach ( $products as $item ) {
	$existing = get_page_by_path( $item['slug'], OBJECT, 'product' );
	if ( $existing ) {
		WP_CLI::log( "Product already exists: {$item['slug']}" );
		continue;
	}

	$product = new WC_Product_Simple();
	$product->set_name( $item['name'] );
	$product->set_slug( $item['slug'] );
	$product->set_regular_price( $item['price'] );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'visible' );
	$product_id = $product->save();

	foreach ( $item['attrs'] as $taxonomy => $value ) {
		$term_slug = sanitize_title( $value );
		if ( ! term_exists( $term_slug, $taxonomy ) ) {
			wp_insert_term( $value, $taxonomy, array( 'slug' => $term_slug ) );
		}
		wp_set_object_terms( $product_id, array( $term_slug ), $taxonomy, false );
	}

	WP_CLI::success( "Created product: {$item['name']} (#{$product_id})" );
}

$compare_page = get_page_by_path( 'compare' );
if ( ! $compare_page ) {
	wp_insert_post(
		array(
			'post_title'   => 'Compare Mobiles',
			'post_name'    => 'compare',
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => '[mobile_compare]',
		)
	);
	WP_CLI::success( 'Created compare page.' );
}

WP_CLI::success( 'Seed complete.' );
