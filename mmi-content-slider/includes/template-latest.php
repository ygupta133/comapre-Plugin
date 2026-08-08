<?php
/**
 * Latest News Template — 91mobiles-style layout
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $posts ) ) {
	return;
}

$featured    = MMI_CS_API::get_post_display( $posts[0] );
$right_posts = array_slice( $posts, 1 );
$slides      = array();

foreach ( array_chunk( $right_posts, 3 ) as $chunk ) {
	if ( count( $chunk ) === 3 ) {
		$slides[] = array_map( array( 'MMI_CS_API', 'get_post_display' ), $chunk );
	}
}
?>

<div class="mmi-latest-news">

	<?php if ( ! empty( $heading ) ) : ?>
		<h2 class="mmi-latest-heading"><?php echo esc_html( $heading ); ?></h2>
	<?php endif; ?>

	<div class="mmi-latest-grid">

		<div class="mmi-latest-featured">
			<a class="mmi-latest-featured-link" href="<?php echo esc_url( $featured['link'] ); ?>">
				<?php if ( $featured['image'] ) : ?>
					<div class="mmi-latest-featured-media">
						<img src="<?php echo esc_url( $featured['image'] ); ?>" alt="<?php echo esc_attr( $featured['title'] ); ?>" loading="lazy">
					</div>
				<?php endif; ?>

				<div class="mmi-latest-featured-content">
					<?php if ( $featured['time'] ) : ?>
						<span class="mmi-latest-time"><?php echo esc_html( $featured['time'] ); ?></span>
					<?php endif; ?>
					<h3 class="mmi-latest-title"><?php echo esc_html( $featured['title'] ); ?></h3>
				</div>
			</a>
		</div>

		<div class="mmi-latest-right">
			<?php if ( ! empty( $slides ) ) : ?>
				<div class="mmi-latest-slider swiper">
					<div class="swiper-wrapper">
						<?php foreach ( $slides as $group ) : ?>
							<div class="swiper-slide">
								<div class="mmi-latest-list">
									<?php foreach ( $group as $item ) : ?>
										<a class="mmi-latest-item" href="<?php echo esc_url( $item['link'] ); ?>">
											<?php if ( $item['image'] ) : ?>
												<span class="mmi-latest-thumb">
													<img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy">
												</span>
											<?php endif; ?>
											<span class="mmi-latest-content">
												<?php if ( $item['time'] ) : ?>
													<span class="mmi-latest-time"><?php echo esc_html( $item['time'] ); ?></span>
												<?php endif; ?>
												<span class="mmi-latest-item-title"><?php echo esc_html( $item['title'] ); ?></span>
											</span>
										</a>
									<?php endforeach; ?>
								</div>
							</div>
						<?php endforeach; ?>
					</div>
				</div>

				<?php if ( count( $slides ) > 1 ) : ?>
					<div class="mmi-latest-navigation">
						<button type="button" class="mmi-latest-arrow mmi-latest-arrow-prev" aria-label="<?php esc_attr_e( 'Previous', 'mmi-content-slider' ); ?>">
							<svg width="8" height="14" viewBox="0 0 8 14" aria-hidden="true"><path d="M7 1L1 7l6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
						</button>
						<button type="button" class="mmi-latest-arrow mmi-latest-arrow-next" aria-label="<?php esc_attr_e( 'Next', 'mmi-content-slider' ); ?>">
							<svg width="8" height="14" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
						</button>
					</div>
				<?php endif; ?>
			<?php endif; ?>
		</div>

	</div>

</div>
