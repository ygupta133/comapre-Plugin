<?php
/**
 * Remote API client for My Mobile India English site.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_Content_Sync_API {

	const DEFAULT_SOURCE = 'https://www.mymobileindia.com';
	const CACHE_KEY      = 'mmi_content_sync_posts';
	const CACHE_TTL      = 300; // 5 minutes.

	/**
	 * Fetch latest posts from the remote WordPress REST API.
	 *
	 * @param int $count Number of posts.
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_posts( $count = 8 ) {
		$count = max( 4, min( 20, (int) $count ) );
		$cache = get_transient( self::CACHE_KEY );

		if ( is_array( $cache ) && count( $cache ) >= $count ) {
			return array_slice( $cache, 0, $count );
		}

		$source = apply_filters( 'mmi_content_sync_source_url', self::DEFAULT_SOURCE );
		$url    = trailingslashit( $source ) . 'wp-json/wp/v2/posts';

		$response = wp_remote_get(
			add_query_arg(
				array(
					'per_page' => $count,
					'_embed'   => '1',
					'orderby'  => 'date',
					'order'    => 'desc',
				),
				$url
			),
			array(
				'timeout' => 15,
				'headers' => array( 'Accept' => 'application/json' ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return is_array( $cache ) ? array_slice( $cache, 0, $count ) : array();
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== $code || ! is_array( $body ) ) {
			return is_array( $cache ) ? array_slice( $cache, 0, $count ) : array();
		}

		$posts = array();
		foreach ( $body as $item ) {
			$normalized = self::normalize_post( $item );
			if ( $normalized ) {
				$posts[] = $normalized;
			}
		}

		if ( $posts ) {
			set_transient( self::CACHE_KEY, $posts, self::CACHE_TTL );
		}

		return array_slice( $posts, 0, $count );
	}

	/**
	 * Normalize a WP REST post object.
	 *
	 * @param array<string, mixed> $item Raw API item.
	 * @return array<string, mixed>|null
	 */
	private static function normalize_post( $item ) {
		if ( empty( $item['id'] ) || empty( $item['link'] ) ) {
			return null;
		}

		$title = isset( $item['title']['rendered'] ) ? wp_strip_all_tags( $item['title']['rendered'] ) : '';
		$image = '';
		$alt   = $title;

		if ( ! empty( $item['_embedded']['wp:featuredmedia'][0]['source_url'] ) ) {
			$media = $item['_embedded']['wp:featuredmedia'][0];
			$image = esc_url_raw( $media['source_url'] );
			if ( ! empty( $media['alt_text'] ) ) {
				$alt = $media['alt_text'];
			}
		}

		$date     = ! empty( $item['date'] ) ? $item['date'] : '';
		$relative = $date ? human_time_diff( strtotime( $date ), current_time( 'timestamp' ) ) . ' ago' : '';

		return array(
			'id'       => (int) $item['id'],
			'title'    => $title,
			'link'     => esc_url_raw( $item['link'] ),
			'image'    => $image,
			'alt'      => $alt,
			'date'     => $date,
			'relative' => $relative,
		);
	}
}
