<?php
/**
 * Standalone admin pages — visible menu + product meta box fallback.
 */

defined( 'ABSPATH' ) || exit;

class MMI_APS_Admin {

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ), 99 );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'add_meta_boxes', array( __CLASS__, 'register_product_meta_box' ), 20 );
		add_action( 'admin_notices', array( __CLASS__, 'maybe_show_setup_notice' ) );
	}

	public static function register_menu(): void {
		add_submenu_page(
			'woocommerce',
			__( 'Amazon Price Sync', 'mmi-amazon-price-sync' ),
			__( 'Amazon Price Sync', 'mmi-amazon-price-sync' ),
			'manage_woocommerce',
			'mmi-amazon-price-sync',
			array( __CLASS__, 'render_settings_page' )
		);
	}

	public static function register_settings(): void {
		register_setting(
			'mmi_aps_settings',
			MMI_APS_Settings::OPTION_API_KEY,
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			)
		);
		register_setting(
			'mmi_aps_settings',
			MMI_APS_Settings::OPTION_API_HOST,
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			)
		);
		register_setting(
			'mmi_aps_settings',
			MMI_APS_Settings::OPTION_API_ENDPOINT,
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			)
		);
		register_setting(
			'mmi_aps_settings',
			MMI_APS_Settings::OPTION_COUNTRY,
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			)
		);
	}

	public static function render_settings_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		$using_constant = defined( 'MMI_APS_RAPIDAPI_KEY' ) && MMI_APS_RAPIDAPI_KEY;
		$api_key        = MMI_APS_Settings::get_api_key();
		$api_host       = MMI_APS_Settings::get_api_host();
		$api_endpoint   = MMI_APS_Settings::get_api_endpoint();
		$country        = MMI_APS_Settings::get_country();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Amazon Price Sync', 'mmi-amazon-price-sync' ); ?></h1>
			<p><?php esc_html_e( 'Connect WooCommerce products to Amazon India prices via RapidAPI. Add an ASIN on each product, then click Fetch Price.', 'mmi-amazon-price-sync' ); ?></p>

			<form method="post" action="options.php">
				<?php settings_fields( 'mmi_aps_settings' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'RapidAPI Key', 'mmi-amazon-price-sync' ); ?></th>
						<td>
							<?php if ( $using_constant ) : ?>
								<p class="description"><?php esc_html_e( 'Defined in wp-config.php via MMI_APS_RAPIDAPI_KEY.', 'mmi-amazon-price-sync' ); ?></p>
							<?php else : ?>
								<input type="password" class="regular-text" name="<?php echo esc_attr( MMI_APS_Settings::OPTION_API_KEY ); ?>" value="<?php echo esc_attr( $api_key ); ?>" autocomplete="off" />
								<p class="description"><?php esc_html_e( 'Your x-rapidapi-key from the RapidAPI dashboard.', 'mmi-amazon-price-sync' ); ?></p>
							<?php endif; ?>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'RapidAPI Host', 'mmi-amazon-price-sync' ); ?></th>
						<td>
							<input type="text" class="regular-text" name="<?php echo esc_attr( MMI_APS_Settings::OPTION_API_HOST ); ?>" value="<?php echo esc_attr( $api_host ); ?>" />
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'API Endpoint Path', 'mmi-amazon-price-sync' ); ?></th>
						<td>
							<input type="text" class="regular-text" name="<?php echo esc_attr( MMI_APS_Settings::OPTION_API_ENDPOINT ); ?>" value="<?php echo esc_attr( $api_endpoint ); ?>" />
							<p class="description"><?php esc_html_e( 'Example: /amazon/product-details', 'mmi-amazon-price-sync' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Amazon Country', 'mmi-amazon-price-sync' ); ?></th>
						<td>
							<input type="text" class="small-text" name="<?php echo esc_attr( MMI_APS_Settings::OPTION_COUNTRY ); ?>" value="<?php echo esc_attr( $country ); ?>" />
							<p class="description"><?php esc_html_e( 'Use IN for Amazon India.', 'mmi-amazon-price-sync' ); ?></p>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>

			<hr />
			<h2><?php esc_html_e( 'How to use', 'mmi-amazon-price-sync' ); ?></h2>
			<ol>
				<li><?php esc_html_e( 'Save your RapidAPI key above.', 'mmi-amazon-price-sync' ); ?></li>
				<li><?php esc_html_e( 'Edit any WooCommerce product.', 'mmi-amazon-price-sync' ); ?></li>
				<li><?php esc_html_e( 'Find the Amazon Price Sync box (right sidebar) or Product Data → Amazon Price tab.', 'mmi-amazon-price-sync' ); ?></li>
				<li><?php esc_html_e( 'Enter ASIN and click Fetch Price from Amazon.', 'mmi-amazon-price-sync' ); ?></li>
			</ol>
		</div>
		<?php
	}

	public static function register_product_meta_box(): void {
		add_meta_box(
			'mmi-aps-product-box',
			__( 'Amazon Price Sync', 'mmi-amazon-price-sync' ),
			array( __CLASS__, 'render_product_meta_box' ),
			'product',
			'side',
			'high'
		);
	}

	public static function render_product_meta_box( WP_Post $post ): void {
		MMI_APS_Product_Meta::render_fields( (int) $post->ID, 'meta-box' );
	}

	public static function maybe_show_setup_notice(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		if ( '' !== MMI_APS_Settings::get_api_key() ) {
			return;
		}

		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || 'woocommerce_page_mmi-amazon-price-sync' === $screen->id ) {
			return;
		}

		$url = admin_url( 'admin.php?page=mmi-amazon-price-sync' );
		echo '<div class="notice notice-warning"><p>';
		printf(
			/* translators: %s: settings page URL */
			wp_kses_post( __( '<strong>MMI Amazon Price Sync:</strong> Add your RapidAPI key in <a href="%s">WooCommerce → Amazon Price Sync</a>.', 'mmi-amazon-price-sync' ) ),
			esc_url( $url )
		);
		echo '</p></div>';
	}
}
