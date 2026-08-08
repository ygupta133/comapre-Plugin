<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Ajax {

	/**
	 * API
	 *
	 * @var MMI_CS_API
	 */
	private $api;

	public function __construct() {

		$this->api = new MMI_CS_API();

		add_action(
			'wp_ajax_mmi_cs_load_categories',
			array( $this, 'load_categories' )
		);
	}

	/**
	 * Load Categories
	 */
	public function load_categories() {

		check_ajax_referer(
			'mmi_cs_admin',
			'nonce'
		);

		$url = isset( $_POST['source'] )
			? esc_url_raw( wp_unslash( $_POST['source'] ) )
			: '';

		if ( empty( $url ) ) {
			wp_send_json_error(
				'Website URL is required.'
			);
		}

		$this->api->set_base_url( $url );

		$data = $this->api->get_categories();

		if ( is_wp_error( $data ) ) {

			wp_send_json_error(
				$data->get_error_message()
			);
		}

		$options = array();

foreach ( $data as $category ) {

	if ( empty( $category['id'] ) || empty( $category['name'] ) ) {
		continue;
	}

	$options[] = array(
		'id'   => (int) $category['id'],
		'name' => sanitize_text_field( $category['name'] ),
	);
}

		wp_send_json_success( $options );
	}
}