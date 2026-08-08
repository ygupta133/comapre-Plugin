<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_API {

	/**
	 * Base API URL
	 *
	 * @var string
	 */
	private $base_url = '';

	/**
	 * Constructor
	 */
	public function __construct( $base_url = '' ) {

		if ( ! empty( $base_url ) ) {
			$this->base_url = untrailingslashit( $base_url );
		}
	}

	/**
	 * Set Base URL
	 */
	public function set_base_url( $url ) {

		$this->base_url = untrailingslashit( esc_url_raw( $url ) );
	}

	/**
	 * Get Base URL
	 */
	public function get_base_url() {

		return $this->base_url;
	}

	/**
	 * Get Posts
	 */
	public function get_posts( $args = array() ) {

		if ( empty( $this->base_url ) ) {
			return new WP_Error(
				'mmi_cs_no_url',
				'Source Website URL is missing.'
			);
		}

		$defaults = array(
			'per_page' => 8,
			'page'     => 1,
			'orderby'  => 'date',
			'order'    => 'desc',
			'_embed'   => '1',
		);

		$args = wp_parse_args( $args, $defaults );

		$endpoint = trailingslashit( $this->base_url ) . 'wp-json/wp/v2/posts';

		$url = add_query_arg( $args, $endpoint );

		return $this->request( $url );
	}

	/**
	 * Get Categories
	 */
	public function get_categories() {

		if ( empty( $this->base_url ) ) {
			return new WP_Error(
				'mmi_cs_no_url',
				'Source Website URL is missing.'
			);
		}

		$url = trailingslashit( $this->base_url ) . 'wp-json/wp/v2/categories?per_page=100';

		return $this->request( $url );
	}

	/**
	 * Get Posts by Category
	 *
	 * @param int $category_id
	 * @param int $limit
	 *
	 * @return array|WP_Error
	 */
	public function get_posts_by_category( $category_id, $limit = 8 ) {

		return $this->get_posts(
			array(
				'categories' => absint( $category_id ),
				'per_page'   => absint( $limit ),
				'orderby'    => 'date',
				'order'      => 'desc',
				'_embed'     => 1,
			)
		);
	}

	/**
	 * Get Latest Posts
	 *
	 * @param int $limit
	 *
	 * @return array|WP_Error
	 */
	public function get_latest_posts( $limit = 12 ) {

		return $this->get_posts(
			array(
				'per_page' => absint( $limit ),
				'orderby'  => 'date',
				'order'    => 'desc',
				'_embed'   => 1,
			)
		);
	}

	/**
	 * Generic Request
	 */
	private function request( $url ) {

		// Generate unique cache key based on URL
		$cache_key = 'mmi_cs_' . md5( $url );

		// Return cached data if available
		$cache = get_transient( $cache_key );

		if ( false !== $cache ) {
			return $cache;
		}

		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 20,
				'headers' => array(
					'Accept'     => 'application/json',
					'User-Agent' => 'WordPress/MMI Content Builder',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );

		if ( 200 !== $code ) {

			return new WP_Error(
				'mmi_cs_http_error',
				'API returned HTTP ' . $code
			);
		}

		$body = wp_remote_retrieve_body( $response );

		$data = json_decode( $body, true );

		// Cache for 30 minutes
		set_transient(
			$cache_key,
			$data,
			30 * MINUTE_IN_SECONDS
		);

		return $data;
	}

	/**
	 * Build slide groups for latest hero: 1 featured + 3 sidebar posts.
	 *
	 * @param array<int, array<string, mixed>> $posts API posts.
	 * @return array<int, array<int, array<string, mixed>>>
	 */
	public static function build_latest_groups( $posts ) {
		$groups = array();

		for ( $i = 0; $i < count( $posts ); $i += 4 ) {
			$chunk = array_slice( $posts, $i, 4 );
			if ( count( $chunk ) === 4 ) {
				$groups[] = $chunk;
			}
		}

		return $groups;
	}

	/**
	 * Normalize a REST post item for templates.
	 *
	 * @param array<string, mixed> $post API post.
	 * @return array<string, string>
	 */
	public static function get_post_display( $post ) {
		$title = ! empty( $post['title']['rendered'] )
			? wp_strip_all_tags( $post['title']['rendered'] )
			: '';

		$image = '';
		if ( ! empty( $post['_embedded']['wp:featuredmedia'][0]['source_url'] ) ) {
			$image = $post['_embedded']['wp:featuredmedia'][0]['source_url'];
		}

		$time = '';
		if ( ! empty( $post['date'] ) ) {
			$time = ucwords(
				human_time_diff(
					strtotime( $post['date'] ),
					current_time( 'timestamp' )
				)
			) . ' Ago';
		}

		return array(
			'link'  => ! empty( $post['link'] ) ? $post['link'] : '#',
			'title' => $title,
			'image' => $image,
			'time'  => $time,
		);
	}
}