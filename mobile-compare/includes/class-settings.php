<?php
/**
 * Plugin settings — compare page scope.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Settings {

	const OPTION_PAGE_ID = 'mobile_compare_page_id';
	const OPTION_FAB_SITEWIDE = 'mobile_compare_fab_sitewide';

	public static function init(): void {
		// Reserved for future hooks.
	}

	public static function is_fab_sitewide_enabled(): bool {
		return '0' !== (string) get_option( self::OPTION_FAB_SITEWIDE, '1' );
	}

	/**
	 * Compare page post ID (0 = auto-detect by slug "compare").
	 */
	public static function get_page_id(): int {
		$stored = (int) get_option( self::OPTION_PAGE_ID, 0 );
		if ( $stored > 0 && 'publish' === get_post_status( $stored ) ) {
			return $stored;
		}

		$page = get_page_by_path( 'compare' );
		return $page ? (int) $page->ID : 0;
	}

	public static function get_page_url(): string {
		$page_id = self::get_page_id();
		if ( $page_id > 0 ) {
			return trailingslashit( get_permalink( $page_id ) );
		}
		return trailingslashit( home_url( '/compare/' ) );
	}

	/**
	 * Whether compare UI/assets should load on the current request.
	 */
	public static function is_compare_context(): bool {
		$slugs = get_query_var( 'mobile_compare_slugs' );
		if ( ! empty( $slugs ) ) {
			return true;
		}

		$page_id = self::get_page_id();
		if ( $page_id > 0 && is_page( $page_id ) ) {
			return true;
		}

		return is_page( 'compare' );
	}

	/**
	 * Whether the shortcode may render the compare app on the current page.
	 */
	public static function is_shortcode_allowed(): bool {
		return self::is_compare_context();
	}
}
