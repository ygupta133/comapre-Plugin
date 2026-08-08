<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Admin {

	public function __construct() {
		add_action( 'init', array( $this, 'register_slider_post_type' ) );
	}

	/**
	 * Register Slider Custom Post Type
	 */
	public function register_slider_post_type() {

		$labels = array(
			'name'               => 'MMI Sliders',
			'singular_name'      => 'MMI Slider',
			'add_new'            => 'Add New',
			'add_new_item'       => 'Add New Slider',
			'edit_item'          => 'Edit Slider',
			'new_item'           => 'New Slider',
			'view_item'          => 'View Slider',
			'search_items'       => 'Search Sliders',
			'not_found'          => 'No Sliders Found',
			'menu_name'          => 'MMI Sliders',
		);

		register_post_type( 'mmi_slider', array(

			'labels' => $labels,

			'public' => false,

			'show_ui' => true,

			'show_in_menu' => true,

			'menu_position' => 56,

			'menu_icon' => 'dashicons-images-alt2',

			'supports' => array(
				'title'
			),

		) );

	}
}