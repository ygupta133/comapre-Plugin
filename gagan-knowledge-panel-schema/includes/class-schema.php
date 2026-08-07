<?php
/**
 * Output Person + Organization JSON-LD schema.
 */

defined( 'ABSPATH' ) || exit;

class GKPS_Schema {

	public static function init(): void {
		add_action( 'wp_head', array( __CLASS__, 'render' ), 99 );
	}

	public static function should_output(): bool {
		if ( is_admin() || wp_doing_ajax() || wp_is_json_request() ) {
			return false;
		}

		$settings = GKPS_Defaults::get_settings();
		if ( empty( $settings['enabled'] ) ) {
			return false;
		}

		if ( ! empty( $settings['output_about_only'] ) ) {
			$about_path = trim( (string) ( $settings['about_page'] ?? '' ), '/' );
			if ( '' === $about_path ) {
				return is_front_page();
			}
			$current = trim( (string) wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH ), '/' );
			$request = isset( $_SERVER['REQUEST_URI'] ) ? trim( (string) wp_parse_url( home_url( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH ), '/' ) : $current;
			return $request === $about_path || is_front_page();
		}

		if ( empty( $settings['output_sitewide'] ) ) {
			return is_front_page() || self::is_about_page();
		}

		return true;
	}

	private static function is_about_page(): bool {
		$settings = GKPS_Defaults::get_settings();
		$about_path = trim( (string) ( $settings['about_page'] ?? '' ), '/' );
		if ( '' === $about_path ) {
			return false;
		}
		$request = isset( $_SERVER['REQUEST_URI'] )
			? trim( (string) wp_parse_url( home_url( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH ), '/' )
			: '';
		return $request === $about_path;
	}

	/**
	 * @return string Person @id.
	 */
	private static function person_id( array $settings ): string {
		$base = untrailingslashit( (string) ( $settings['person_url'] ?? home_url( '/' ) ) );
		return $base . '/#gagan-dhawan';
	}

	public static function render(): void {
		if ( ! self::should_output() ) {
			return;
		}

		$graph = self::build_graph();
		if ( empty( $graph ) ) {
			return;
		}

		$payload = array(
			'@context' => 'https://schema.org',
			'@graph'   => $graph,
		);

		echo '<script type="application/ld+json" id="gagan-knowledge-panel-schema">' . wp_json_encode( $payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT ) . '</script>' . "\n";
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private static function build_graph(): array {
		$settings = GKPS_Defaults::get_settings();
		$person_id = self::person_id( $settings );
		$site_url  = untrailingslashit( (string) ( $settings['person_url'] ?? home_url( '/' ) ) );
		$about_url = $site_url . trailingslashit( (string) ( $settings['about_page'] ?? '/about-gagan-dhawan/' ) );

		$same_as = GKPS_Defaults::parse_lines( (string) ( $settings['same_as'] ?? '' ) );
		$knows   = self::parse_topics( (string) ( $settings['knows_about'] ?? '' ) );
		$orgs    = GKPS_Defaults::parse_organizations( (string) ( $settings['organizations'] ?? '' ) );

		$person = array(
			'@type'       => 'Person',
			'@id'         => $person_id,
			'name'        => (string) ( $settings['person_name'] ?? '' ),
			'url'         => $site_url,
			'description' => (string) ( $settings['description'] ?? '' ),
			'jobTitle'    => (string) ( $settings['job_title'] ?? '' ),
			'mainEntityOfPage' => array(
				'@type' => 'WebPage',
				'@id'   => $about_url,
				'url'   => $about_url,
				'name'  => 'About ' . (string) ( $settings['person_name'] ?? '' ),
			),
		);

		if ( ! empty( $settings['image_url'] ) ) {
			$person['image'] = array(
				'@type' => 'ImageObject',
				'url'   => esc_url_raw( (string) $settings['image_url'] ),
			);
		}

		if ( ! empty( $settings['email'] ) ) {
			$person['email'] = sanitize_email( (string) $settings['email'] );
		}

		if ( ! empty( $settings['nationality'] ) ) {
			$person['nationality'] = array(
				'@type' => 'Country',
				'name'  => sanitize_text_field( (string) $settings['nationality'] ),
			);
		}

		if ( ! empty( $same_as ) ) {
			$person['sameAs'] = $same_as;
		}

		if ( ! empty( $knows ) ) {
			$person['knowsAbout'] = array_map( 'sanitize_text_field', $knows );
		}

		$works_for = array();
		$graph     = array();

		foreach ( $orgs as $org ) {
			$org_id = untrailingslashit( $org['url'] ) . '/#organization';
			$graph[] = array(
				'@type'   => 'Organization',
				'@id'     => $org_id,
				'name'    => $org['name'],
				'url'     => $org['url'],
				'founder' => array( '@id' => $person_id ),
			);
			$works_for[] = array( '@id' => $org_id );
		}

		if ( ! empty( $works_for ) ) {
			$person['worksFor'] = $works_for;
		}

		$graph[] = $person;

		$graph[] = array(
			'@type'     => 'WebSite',
			'@id'       => $site_url . '/#website',
			'url'       => $site_url,
			'name'      => (string) ( $settings['person_name'] ?? '' ),
			'publisher' => array( '@id' => $person_id ),
			'inLanguage'=> 'en-US',
		);

		if ( is_front_page() || self::is_about_page() ) {
			$graph[] = array(
				'@type'           => 'ProfilePage',
				'@id'             => $about_url . '#webpage',
				'url'             => $about_url,
				'name'            => 'About ' . (string) ( $settings['person_name'] ?? '' ),
				'isPartOf'        => array( '@id' => $site_url . '/#website' ),
				'about'           => array( '@id' => $person_id ),
				'mainEntity'      => array( '@id' => $person_id ),
				'inLanguage'      => 'en-US',
			);
		}

		return $graph;
	}

	/**
	 * @param string $raw One topic per line.
	 * @return string[]
	 */
	private static function parse_topics( string $raw ): array {
		$lines = preg_split( '/\r\n|\r|\n/', $raw );
		if ( ! is_array( $lines ) ) {
			return array();
		}
		$topics = array();
		foreach ( $lines as $line ) {
			$line = trim( (string) $line );
			if ( '' !== $line ) {
				$topics[] = sanitize_text_field( $line );
			}
		}
		return $topics;
	}
}
