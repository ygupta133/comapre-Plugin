<?php
/**
 * Admin settings page.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Admin {

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
	}

	public static function add_menu(): void {
		add_options_page(
			__( 'Mobile Compare', 'mobile-compare' ),
			__( 'Mobile Compare', 'mobile-compare' ),
			'manage_options',
			'mobile-compare',
			array( __CLASS__, 'render_page' )
		);
	}

	public static function register_settings(): void {
		register_setting(
			'mobile_compare_settings',
			'mobile_compare_page_id',
			array(
				'type'              => 'integer',
				'sanitize_callback' => 'absint',
				'default'           => 0,
			)
		);

		register_setting(
			'mobile_compare_settings',
			'mobile_compare_popular_pairs',
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_popular_pairs' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * @param mixed $value Raw option value.
	 */
	public static function sanitize_popular_pairs( $value ): array {
		$lines = array();

		if ( is_string( $value ) ) {
			$lines = preg_split( '/\r\n|\r|\n/', $value );
		} elseif ( is_array( $value ) ) {
			$lines = $value;
		}

		$clean = array();
		foreach ( $lines as $line ) {
			$line = trim( (string) $line );
			if ( '' === $line ) {
				continue;
			}
			$parts = array_map( 'absint', explode( ',', $line ) );
			if ( count( $parts ) >= 2 ) {
				$clean[] = array_slice( $parts, 0, 2 );
			}
		}

		return $clean;
	}

	public static function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$popular_raw = get_option( 'mobile_compare_popular_pairs', array() );
		$compare_page_id = (int) get_option( 'mobile_compare_page_id', 0 );
		$resolved_page_id = Mobile_Compare_Settings::get_page_id();
		$pages = get_pages(
			array(
				'sort_column' => 'post_title',
				'sort_order'  => 'ASC',
			)
		);
		$popular_text = '';
		if ( is_array( $popular_raw ) ) {
			foreach ( $popular_raw as $pair ) {
				if ( is_array( $pair ) && count( $pair ) >= 2 ) {
					$popular_text .= implode( ',', $pair ) . "\n";
				}
			}
		}

		$attributes = Mobile_Compare_Data::get_attribute_map();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Mobile Compare Settings', 'mobile-compare' ); ?></h1>

			<p><?php esc_html_e( 'Fast compare SPA independent of ReHub. Disable ReHub compare in Theme Options for best performance.', 'mobile-compare' ); ?></p>

			<p><?php esc_html_e( 'Compare loads only on the selected page and /compare/phone-vs-phone URLs — not site-wide.', 'mobile-compare' ); ?></p>

			<form method="post" action="options.php" style="margin-top:16px;">
				<?php settings_fields( 'mobile_compare_settings' ); ?>
				<h2><?php esc_html_e( 'Compare Page', 'mobile-compare' ); ?></h2>
				<p class="description"><?php esc_html_e( 'Put shortcode [mobile_compare] only on this page. Other pages will not show compare.', 'mobile-compare' ); ?></p>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="mobile_compare_page_id"><?php esc_html_e( 'Compare page', 'mobile-compare' ); ?></label></th>
						<td>
							<select name="mobile_compare_page_id" id="mobile_compare_page_id">
								<option value="0"><?php esc_html_e( '— Auto (slug: compare) —', 'mobile-compare' ); ?></option>
								<?php foreach ( $pages as $page ) : ?>
									<option value="<?php echo esc_attr( (string) $page->ID ); ?>" <?php selected( $compare_page_id, (int) $page->ID ); ?>>
										<?php echo esc_html( $page->post_title . ' (/' . $page->post_name . '/)' ); ?>
									</option>
								<?php endforeach; ?>
							</select>
							<?php if ( $resolved_page_id ) : ?>
								<p><a href="<?php echo esc_url( get_permalink( $resolved_page_id ) ); ?>" class="button" target="_blank" rel="noopener"><?php esc_html_e( 'Open Compare Page', 'mobile-compare' ); ?></a></p>
							<?php endif; ?>
						</td>
					</tr>
				</table>
				<?php submit_button( __( 'Save Compare Page', 'mobile-compare' ) ); ?>
			</form>

			<h2><?php esc_html_e( 'Mapped Attributes', 'mobile-compare' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Default mapping is used. Contact your developer to customize attribute slugs to match your WooCommerce attributes.', 'mobile-compare' ); ?></p>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Slug', 'mobile-compare' ); ?></th>
						<th><?php esc_html_e( 'Label', 'mobile-compare' ); ?></th>
						<th><?php esc_html_e( 'Group', 'mobile-compare' ); ?></th>
						<th><?php esc_html_e( 'Rule', 'mobile-compare' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $attributes as $attr ) : ?>
						<tr>
							<td><code><?php echo esc_html( $attr['slug'] ?? '' ); ?></code></td>
							<td><?php echo esc_html( $attr['label'] ?? '' ); ?></td>
							<td><?php echo esc_html( $attr['group'] ?? '' ); ?></td>
							<td><?php echo esc_html( $attr['rule'] ?? '' ); ?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>

			<form method="post" action="options.php" style="margin-top:24px;">
				<?php settings_fields( 'mobile_compare_settings' ); ?>
				<h2><?php esc_html_e( 'Popular Comparisons', 'mobile-compare' ); ?></h2>
				<p class="description"><?php esc_html_e( 'One pair per line: product_id,product_id (e.g. 101,205)', 'mobile-compare' ); ?></p>
				<textarea name="mobile_compare_popular_pairs" rows="8" cols="50" class="large-text"><?php echo esc_textarea( $popular_text ); ?></textarea>
				<?php submit_button(); ?>
			</form>

			<h2><?php esc_html_e( 'REST API', 'mobile-compare' ); ?></h2>
			<ul>
				<li><code><?php echo esc_html( rest_url( 'mobile-compare/v1/search?q=galaxy' ) ); ?></code></li>
				<li><code><?php echo esc_html( rest_url( 'mobile-compare/v1/products?ids=1,2' ) ); ?></code></li>
				<li><code><?php echo esc_html( rest_url( 'mobile-compare/v1/popular' ) ); ?></code></li>
			</ul>
		</div>
		<?php
	}
}
