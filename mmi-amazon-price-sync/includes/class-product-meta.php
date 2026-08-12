<?php
/**
 * WooCommerce product meta — ASIN field, Fetch Price, saved Amazon data.
 */

defined( 'ABSPATH' ) || exit;

class MMI_APS_Product_Meta {

	public static function init(): void {
		add_filter( 'woocommerce_product_data_tabs', array( __CLASS__, 'add_product_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( __CLASS__, 'render_product_panel' ) );
		add_action( 'woocommerce_process_product_meta', array( __CLASS__, 'save_product_meta' ) );

		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_assets' ) );
		add_action( 'wp_ajax_mmi_aps_fetch_price', array( __CLASS__, 'ajax_fetch_price' ) );
	}

	/**
	 * @param array<string,array<string,mixed>> $tabs Product data tabs.
	 * @return array<string,array<string,mixed>>
	 */
	public static function add_product_tab( array $tabs ): array {
		$tabs['mmi_amazon_price'] = array(
			'label'    => __( 'Amazon Price', 'mmi-amazon-price-sync' ),
			'target'   => 'mmi_amazon_price_product_data',
			'class'    => array(),
			'priority' => 75,
		);

		return $tabs;
	}

	public static function render_product_panel(): void {
		global $post;

		$product_id      = $post ? (int) $post->ID : 0;
		$asin            = get_post_meta( $product_id, MMI_APS_Plugin::META_ASIN, true );
		$price           = get_post_meta( $product_id, MMI_APS_Plugin::META_PRICE, true );
		$original_price  = get_post_meta( $product_id, MMI_APS_Plugin::META_ORIGINAL_PRICE, true );
		$last_updated    = get_post_meta( $product_id, MMI_APS_Plugin::META_LAST_UPDATED, true );
		$title           = get_post_meta( $product_id, MMI_APS_Plugin::META_TITLE, true );
		$delivery        = get_post_meta( $product_id, MMI_APS_Plugin::META_DELIVERY, true );
		?>
		<div id="mmi_amazon_price_product_data" class="panel woocommerce_options_panel hidden">
			<div class="options_group">
				<?php
				woocommerce_wp_text_input(
					array(
						'id'          => 'mmi_amazon_asin',
						'label'       => __( 'Amazon ASIN', 'mmi-amazon-price-sync' ),
						'description' => __( '10-character Amazon product ID, e.g. B0H8STM6G2', 'mmi-amazon-price-sync' ),
						'value'       => $asin,
						'desc_tip'    => true,
						'placeholder' => 'B0H8STM6G2',
					)
				);
				?>
				<p class="form-field">
					<label>&nbsp;</label>
					<button type="button" class="button button-primary" id="mmi-aps-fetch-price" data-product-id="<?php echo esc_attr( (string) $product_id ); ?>">
						<?php esc_html_e( 'Fetch Price from Amazon', 'mmi-amazon-price-sync' ); ?>
					</button>
					<span class="spinner" id="mmi-aps-fetch-spinner" style="float:none;margin:0 8px;"></span>
					<span id="mmi-aps-fetch-message" class="mmi-aps-fetch-message"></span>
				</p>
			</div>

			<div class="options_group mmi-aps-synced-data" id="mmi-aps-synced-data">
				<p class="form-field">
					<label><?php esc_html_e( 'Amazon Price', 'mmi-amazon-price-sync' ); ?></label>
					<span class="mmi-aps-readonly" id="mmi-aps-display-price">
						<?php echo $price ? esc_html( self::format_inr( (float) $price ) ) : '—'; ?>
					</span>
				</p>
				<p class="form-field">
					<label><?php esc_html_e( 'Amazon Original Price', 'mmi-amazon-price-sync' ); ?></label>
					<span class="mmi-aps-readonly" id="mmi-aps-display-original-price">
						<?php echo $original_price ? esc_html( self::format_inr( (float) $original_price ) ) : '—'; ?>
					</span>
				</p>
				<p class="form-field">
					<label><?php esc_html_e( 'Product Title (Amazon)', 'mmi-amazon-price-sync' ); ?></label>
					<span class="mmi-aps-readonly mmi-aps-readonly--wide" id="mmi-aps-display-title">
						<?php echo $title ? esc_html( $title ) : '—'; ?>
					</span>
				</p>
				<p class="form-field">
					<label><?php esc_html_e( 'Delivery', 'mmi-amazon-price-sync' ); ?></label>
					<span class="mmi-aps-readonly" id="mmi-aps-display-delivery">
						<?php echo $delivery ? esc_html( $delivery ) : '—'; ?>
					</span>
				</p>
				<p class="form-field">
					<label><?php esc_html_e( 'Last Updated', 'mmi-amazon-price-sync' ); ?></label>
					<span class="mmi-aps-readonly" id="mmi-aps-display-last-updated">
						<?php echo $last_updated ? esc_html( self::format_datetime( (int) $last_updated ) ) : '—'; ?>
					</span>
				</p>
			</div>

			<p class="mmi-aps-panel-note">
				<?php esc_html_e( 'Amazon prices are stored as product meta. The storefront displays the Amazon price automatically without overwriting your WooCommerce regular price.', 'mmi-amazon-price-sync' ); ?>
			</p>
		</div>
		<?php
	}

	/**
	 * @param int $product_id Product ID.
	 */
	public static function save_product_meta( int $product_id ): void {
		if ( ! isset( $_POST['mmi_amazon_asin'] ) ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $product_id ) ) {
			return;
		}

		$asin = strtoupper( sanitize_text_field( wp_unslash( $_POST['mmi_amazon_asin'] ) ) );
		update_post_meta( $product_id, MMI_APS_Plugin::META_ASIN, $asin );
	}

	public static function enqueue_admin_assets( string $hook ): void {
		global $post;

		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		if ( ! $post || 'product' !== $post->post_type ) {
			return;
		}

		wp_enqueue_style(
			'mmi-aps-admin-product',
			MMI_APS_URL . 'assets/css/admin-product.css',
			array(),
			MMI_APS_VERSION
		);

		wp_enqueue_script(
			'mmi-aps-admin-product',
			MMI_APS_URL . 'assets/js/admin-product.js',
			array( 'jquery' ),
			MMI_APS_VERSION,
			true
		);

		wp_localize_script(
			'mmi-aps-admin-product',
			'mmiApsAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'mmi_aps_fetch_price' ),
				'i18n'    => array(
					'fetching'  => __( 'Fetching price from Amazon…', 'mmi-amazon-price-sync' ),
					'success'   => __( 'Price updated successfully.', 'mmi-amazon-price-sync' ),
					'noAsin'    => __( 'Please enter an Amazon ASIN first.', 'mmi-amazon-price-sync' ),
					'error'     => __( 'Failed to fetch price.', 'mmi-amazon-price-sync' ),
				),
			)
		);
	}

	public static function ajax_fetch_price(): void {
		check_ajax_referer( 'mmi_aps_fetch_price', 'nonce' );

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$asin       = isset( $_POST['asin'] ) ? strtoupper( sanitize_text_field( wp_unslash( $_POST['asin'] ) ) ) : '';

		if ( ! $product_id || ! current_user_can( 'edit_post', $product_id ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'mmi-amazon-price-sync' ) ) );
		}

		if ( '' === $asin ) {
			wp_send_json_error( array( 'message' => __( 'ASIN is required.', 'mmi-amazon-price-sync' ) ) );
		}

		$result = MMI_APS_API_Client::fetch_product( $asin );

		if ( ! $result['success'] ) {
			wp_send_json_error( array( 'message' => $result['message'] ) );
		}

		$data = $result['data'];

		update_post_meta( $product_id, MMI_APS_Plugin::META_ASIN, $asin );
		update_post_meta( $product_id, MMI_APS_Plugin::META_PRICE, $data['price'] );
		update_post_meta( $product_id, MMI_APS_Plugin::META_ORIGINAL_PRICE, $data['original_price'] ? $data['original_price'] : '' );
		update_post_meta( $product_id, MMI_APS_Plugin::META_TITLE, $data['title'] );
		update_post_meta( $product_id, MMI_APS_Plugin::META_CURRENCY, $data['currency'] );
		update_post_meta( $product_id, MMI_APS_Plugin::META_DELIVERY, $data['delivery'] );
		update_post_meta( $product_id, MMI_APS_Plugin::META_LAST_UPDATED, time() );

		wp_send_json_success(
			array(
				'message'        => __( 'Price fetched and saved.', 'mmi-amazon-price-sync' ),
				'asin'           => $asin,
				'price'          => $data['price'],
				'price_formatted'=> self::format_inr( (float) $data['price'] ),
				'original_price' => $data['original_price'],
				'original_formatted' => $data['original_price'] ? self::format_inr( (float) $data['original_price'] ) : '—',
				'title'          => $data['title'] ?: '—',
				'delivery'       => $data['delivery'] ?: '—',
				'last_updated'   => self::format_datetime( time() ),
			)
		);
	}

	/**
	 * Format amount as INR for admin display.
	 */
	public static function format_inr( float $amount ): string {
		return '₹' . number_format( $amount, 0 === fmod( $amount, 1 ) ? 0 : 2 );
	}

	/**
	 * Format Unix timestamp for admin display.
	 */
	public static function format_datetime( int $timestamp ): string {
		return wp_date( 'j M Y, g:i A', $timestamp );
	}

	/**
	 * Get stored Amazon price for a product.
	 *
	 * @param int $product_id Product ID.
	 */
	public static function get_amazon_price( int $product_id ): ?float {
		$price = get_post_meta( $product_id, MMI_APS_Plugin::META_PRICE, true );
		if ( '' === $price || null === $price ) {
			return null;
		}
		return (float) $price;
	}

	/**
	 * Get stored Amazon original price for a product.
	 *
	 * @param int $product_id Product ID.
	 */
	public static function get_amazon_original_price( int $product_id ): ?float {
		$price = get_post_meta( $product_id, MMI_APS_Plugin::META_ORIGINAL_PRICE, true );
		if ( '' === $price || null === $price ) {
			return null;
		}
		return (float) $price;
	}
}
