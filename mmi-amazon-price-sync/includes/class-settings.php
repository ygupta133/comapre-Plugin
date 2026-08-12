<?php
/**
 * Plugin settings — RapidAPI credentials and defaults.
 */

defined( 'ABSPATH' ) || exit;

class MMI_APS_Settings {

	public const OPTION_API_KEY      = 'mmi_aps_rapidapi_key';
	public const OPTION_API_HOST     = 'mmi_aps_rapidapi_host';
	public const OPTION_API_ENDPOINT = 'mmi_aps_api_endpoint';
	public const OPTION_COUNTRY      = 'mmi_aps_country';
	public const OPTION_LANGUAGE     = 'mmi_aps_language';

	public const DEFAULT_HOST     = 'real-time-amazon-data.p.rapidapi.com';
	public const DEFAULT_ENDPOINT = '/product-details';

	public static function init(): void {
		add_filter( 'woocommerce_get_settings_pages', array( __CLASS__, 'add_settings_page' ) );
		add_action( 'woocommerce_admin_field_mmi_aps_constant_notice', array( __CLASS__, 'render_constant_notice_field' ) );
	}

	/**
	 * Render read-only notice when API key is defined in wp-config.php.
	 *
	 * @param array<string,mixed> $value Field definition.
	 */
	public static function render_constant_notice_field( array $value ): void {
		?>
		<tr valign="top">
			<th scope="row" class="titledesc"><?php echo esc_html( $value['title'] ); ?></th>
			<td class="forminp">
				<p class="description">
					<?php esc_html_e( 'API key is defined via MMI_APS_RAPIDAPI_KEY in wp-config.php.', 'mmi-amazon-price-sync' ); ?>
				</p>
			</td>
		</tr>
		<?php
	}

	/**
	 * Register settings tab under WooCommerce.
	 *
	 * @param array $settings Existing settings pages.
	 * @return array
	 */
	public static function add_settings_page( array $settings ): array {
		require_once MMI_APS_PATH . 'includes/class-wc-settings-amazon-price.php';
		$settings[] = new MMI_APS_WC_Settings_Amazon_Price();
		return $settings;
	}

	/**
	 * Get RapidAPI key — wp-config constant takes priority.
	 */
	public static function get_api_key(): string {
		if ( defined( 'MMI_APS_RAPIDAPI_KEY' ) && MMI_APS_RAPIDAPI_KEY ) {
			return trim( (string) MMI_APS_RAPIDAPI_KEY );
		}

		return trim( (string) get_option( self::OPTION_API_KEY, '' ) );
	}

	public static function get_api_host(): string {
		$host = trim( (string) get_option( self::OPTION_API_HOST, self::DEFAULT_HOST ) );
		return $host ?: self::DEFAULT_HOST;
	}

	public static function get_api_endpoint(): string {
		$endpoint = trim( (string) get_option( self::OPTION_API_ENDPOINT, self::DEFAULT_ENDPOINT ) );
		return $endpoint ?: self::DEFAULT_ENDPOINT;
	}

	public static function get_country(): string {
		$country = trim( (string) get_option( self::OPTION_COUNTRY, 'IN' ) );
		return $country ?: 'IN';
	}

	public static function get_language(): string {
		$language = trim( (string) get_option( self::OPTION_LANGUAGE, 'en_IN' ) );
		return $language ?: 'en_IN';
	}
}
