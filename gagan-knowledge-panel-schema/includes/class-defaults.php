<?php
/**
 * Default plugin settings for Gagan Dhawan entity.
 */

defined( 'ABSPATH' ) || exit;

class GKPS_Defaults {

	/**
	 * @return array<string, mixed>
	 */
	public static function get(): array {
		return array(
			'enabled'          => true,
			'person_name'      => 'Gagan Dhawan',
			'person_url'       => 'https://gagandhawan.me',
			'about_page'       => '/about-gagan-dhawan/',
			'image_url'        => 'https://gagandhawan.me/wp-content/uploads/2022/11/about-gagan-dhawan.jpg',
			'job_title'        => 'Entrepreneur, Author & Founder',
			'description'      => 'Gagan Dhawan is an Indian entrepreneur, author, and founder of ServDharm and The New Me, focused on wellness, spiritual gifting, and sustainable living.',
			'email'            => 'startups@gagandhawan.me',
			'nationality'      => 'India',
			'knows_about'      => "Entrepreneurship\nWellness\nSpiritual Gifting\nPublishing\nPlant-based Nutrition",
			'same_as'          => "https://in.linkedin.com/in/gagandhawan\nhttps://servdharm.com\nhttps://news24online.com/information/servdharm-goes-global-gagan-dhawan-on-how-his-team-reshaped-indias-pooja-samagri-industry/892292/\nhttps://www.republicworld.com/initiatives/from-an-unorganised-market-to-a-global-brand-how-gagan-dhawan-is-building-servdharm-around-indias-devotional-economy-2026-08-06-134133",
			'organizations'    => "ServDharm|https://servdharm.com\nThe New Me|https://gagandhawan.me",
			'output_sitewide'  => true,
			'output_about_only'=> false,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get_settings(): array {
		$stored = get_option( 'gkps_settings', array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return wp_parse_args( $stored, self::get() );
	}

	/**
	 * @param string $raw Multiline or comma-separated URLs.
	 * @return string[]
	 */
	public static function parse_lines( string $raw ): array {
		$lines = preg_split( '/\r\n|\r|\n/', $raw );
		if ( ! is_array( $lines ) ) {
			return array();
		}
		$clean = array();
		foreach ( $lines as $line ) {
			$line = trim( (string) $line );
			if ( '' === $line ) {
				continue;
			}
			$clean[] = esc_url_raw( $line );
		}
		return array_values( array_filter( $clean ) );
	}

	/**
	 * Parse "Name|URL" organization lines.
	 *
	 * @param string $raw Raw textarea.
	 * @return array<int, array{name: string, url: string}>
	 */
	public static function parse_organizations( string $raw ): array {
		$lines = preg_split( '/\r\n|\r|\n/', $raw );
		if ( ! is_array( $lines ) ) {
			return array();
		}
		$orgs = array();
		foreach ( $lines as $line ) {
			$line = trim( (string) $line );
			if ( '' === $line || false === strpos( $line, '|' ) ) {
				continue;
			}
			list( $name, $url ) = array_map( 'trim', explode( '|', $line, 2 ) );
			if ( '' === $name || '' === $url ) {
				continue;
			}
			$orgs[] = array(
				'name' => sanitize_text_field( $name ),
				'url'  => esc_url_raw( $url ),
			);
		}
		return $orgs;
	}
}
