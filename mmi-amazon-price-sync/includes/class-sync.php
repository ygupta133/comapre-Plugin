<?php
/**
 * Bulk and single-product Amazon price sync.
 */

defined( 'ABSPATH' ) || exit;

class MMI_APS_Sync {

	public const OPTION_LAST_RUN     = 'mmi_aps_last_sync_run';
	public const OPTION_LAST_SUMMARY = 'mmi_aps_last_sync_summary';

	/**
	 * Sync one product by ID.
	 *
	 * @param int         $product_id Product ID.
	 * @param string|null $asin       Optional ASIN override.
	 * @return array{success:bool,message?:string,data?:array,product_id?:int}
	 */
	public static function sync_product( int $product_id, ?string $asin = null ): array {
		$asin = null !== $asin ? strtoupper( sanitize_text_field( $asin ) ) : strtoupper( (string) get_post_meta( $product_id, MMI_APS_Plugin::META_ASIN, true ) );

		if ( '' === $asin ) {
			return array(
				'success'    => false,
				'product_id' => $product_id,
				'message'    => __( 'ASIN is missing.', 'mmi-amazon-price-sync' ),
			);
		}

		$result = MMI_APS_API_Client::fetch_product( $asin );
		if ( ! $result['success'] ) {
			return array(
				'success'    => false,
				'product_id' => $product_id,
				'message'    => $result['message'],
			);
		}

		MMI_APS_Product_Meta::save_amazon_data( $product_id, $asin, $result['data'] );

		return array(
			'success'    => true,
			'product_id' => $product_id,
			'data'       => $result['data'],
		);
	}

	/**
	 * Get all published product IDs that have an ASIN.
	 *
	 * @return int[]
	 */
	public static function get_product_ids_with_asin(): array {
		$query = new WP_Query(
			array(
				'post_type'              => 'product',
				'post_status'            => 'publish',
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					array(
						'key'     => MMI_APS_Plugin::META_ASIN,
						'compare' => 'EXISTS',
					),
					array(
						'key'     => MMI_APS_Plugin::META_ASIN,
						'value'   => '',
						'compare' => '!=',
					),
				),
			)
		);

		return array_map( 'intval', $query->posts );
	}

	/**
	 * Sync multiple products with delay between API calls.
	 *
	 * @param int[] $product_ids Product IDs.
	 * @param int   $delay       Seconds to wait between requests.
	 * @return array{success:int,failed:int,total:int,errors:array<int,string>}
	 */
	public static function sync_products( array $product_ids, int $delay = 2 ): array {
		$summary = array(
			'success' => 0,
			'failed'  => 0,
			'total'   => count( $product_ids ),
			'errors'  => array(),
		);

		if ( function_exists( 'set_time_limit' ) ) {
			set_time_limit( 0 );
		}

		$index = 0;
		foreach ( $product_ids as $product_id ) {
			$product_id = (int) $product_id;
			if ( $product_id <= 0 ) {
				continue;
			}

			if ( $index > 0 && $delay > 0 ) {
				sleep( $delay );
			}

			$result = self::sync_product( $product_id );
			if ( $result['success'] ) {
				++$summary['success'];
			} else {
				++$summary['failed'];
				$summary['errors'][ $product_id ] = $result['message'] ?? __( 'Unknown error.', 'mmi-amazon-price-sync' );
			}

			++$index;
		}

		return $summary;
	}

	/**
	 * Sync all products that have an ASIN.
	 *
	 * @return array{success:int,failed:int,total:int,errors:array<int,string>}
	 */
	public static function sync_all( string $source = 'manual' ): array {
		$product_ids = self::get_product_ids_with_asin();
		$delay       = MMI_APS_Settings::get_sync_delay();
		$summary     = self::sync_products( $product_ids, $delay );

		self::store_last_run( $summary, $source );

		return $summary;
	}

	/**
	 * Sync a batch of products (for AJAX progress).
	 *
	 * @param int $offset Start offset.
	 * @param int $limit  Batch size.
	 * @return array{success:int,failed:int,total:int,processed:int,offset:int,next_offset:int,done:bool,errors:array<int,string>}
	 */
	public static function sync_batch( int $offset, int $limit ): array {
		$all_ids    = self::get_product_ids_with_asin();
		$total      = count( $all_ids );
		$batch_ids  = array_slice( $all_ids, $offset, $limit );
		$delay      = MMI_APS_Settings::get_sync_delay();
		$summary    = self::sync_products( $batch_ids, $delay );
		$processed  = count( $batch_ids );
		$next       = $offset + $processed;
		$done       = $next >= $total;

		$progress = get_option( 'mmi_aps_batch_progress', array( 'success' => 0, 'failed' => 0, 'errors' => array() ) );
		if ( ! is_array( $progress ) ) {
			$progress = array( 'success' => 0, 'failed' => 0, 'errors' => array() );
		}
		if ( 0 === $offset ) {
			$progress = array( 'success' => 0, 'failed' => 0, 'errors' => array() );
		}

		$progress['success'] += (int) $summary['success'];
		$progress['failed']  += (int) $summary['failed'];
		$progress['errors']   = array_merge( $progress['errors'], $summary['errors'] );

		if ( $done ) {
			self::store_last_run(
				array(
					'success' => $progress['success'],
					'failed'  => $progress['failed'],
					'total'   => $total,
					'errors'  => $progress['errors'],
				),
				'manual'
			);
			delete_option( 'mmi_aps_batch_progress' );
		} else {
			update_option( 'mmi_aps_batch_progress', $progress, false );
		}

		return array(
			'success'      => $summary['success'],
			'failed'       => $summary['failed'],
			'total'        => $total,
			'processed'    => $processed,
			'offset'       => $offset,
			'next_offset'  => $next,
			'done'         => $done,
			'errors'       => $summary['errors'],
		);
	}

	/**
	 * Persist last sync summary for admin display.
	 *
	 * @param array<string,mixed> $summary Sync summary.
	 * @param string              $source  manual|cron|batch
	 */
	public static function store_last_run( array $summary, string $source ): void {
		update_option(
			self::OPTION_LAST_RUN,
			array(
				'time'   => time(),
				'source' => $source,
			),
			false
		);

		update_option(
			self::OPTION_LAST_SUMMARY,
			array(
				'success' => (int) ( $summary['success'] ?? 0 ),
				'failed'  => (int) ( $summary['failed'] ?? 0 ),
				'total'   => (int) ( $summary['total'] ?? 0 ),
				'errors'  => is_array( $summary['errors'] ?? null ) ? $summary['errors'] : array(),
			),
			false
		);
	}

	/**
	 * @return array{time:int,source:string}|null
	 */
	public static function get_last_run(): ?array {
		$data = get_option( self::OPTION_LAST_RUN );
		return is_array( $data ) ? $data : null;
	}

	/**
	 * @return array{success:int,failed:int,total:int,errors:array<int,string>}|null
	 */
	public static function get_last_summary(): ?array {
		$data = get_option( self::OPTION_LAST_SUMMARY );
		return is_array( $data ) ? $data : null;
	}
}
