<?php
/**
 * Latest News Template
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $posts ) ) {
	return;
}

$groups = MMI_CS_API::build_latest_groups( $posts );

if ( empty( $groups ) ) {
	return;
}
?>

<div class="mmi-latest-news">

	<?php if ( ! empty( $heading ) ) : ?>
		<h2 class="mmi-latest-heading">
			<?php echo esc_html( $heading ); ?>
		</h2>
	<?php endif; ?>

	<div class="mmi-latest-desktop">
		<div class="mmi-latest-grid swiper">
			<div class="swiper-wrapper">

				<?php foreach ( $groups as $group ) : ?>
					<?php
					$featured = MMI_CS_API::get_post_display( $group[0] );
					$side     = array_map( array( 'MMI_CS_API', 'get_post_display' ), array_slice( $group, 1, 3 ) );
					?>

					<div class="swiper-slide">
						<div class="mmi-latest-slide">
							<div class="mmi-latest-featured">
								<a href="<?php echo esc_url( $featured['link'] ); ?>">
									<?php if ( $featured['image'] ) : ?>
										<img src="<?php echo esc_url( $featured['image'] ); ?>" alt="<?php echo esc_attr( $featured['title'] ); ?>" loading="lazy">
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
								<div class="mmi-latest-list">
									<?php foreach ( $side as $item ) : ?>
										<a class="mmi-latest-item" href="<?php echo esc_url( $item['link'] ); ?>">
											<?php if ( $item['image'] ) : ?>
												<img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy">
											<?php endif; ?>

											<div class="mmi-latest-content">
												<?php if ( $item['time'] ) : ?>
													<span class="mmi-latest-time"><?php echo esc_html( $item['time'] ); ?></span>
												<?php endif; ?>
												<h4><?php echo esc_html( $item['title'] ); ?></h4>
											</div>
										</a>
									<?php endforeach; ?>
								</div>
							</div>
						</div>
					</div>

				<?php endforeach; ?>

			</div>

			<?php if ( count( $groups ) > 1 ) : ?>
				<div class="mmi-latest-navigation">
					<div class="swiper-button-prev" aria-label="<?php esc_attr_e( 'Previous', 'mmi-content-slider' ); ?>"></div>
					<div class="swiper-button-next" aria-label="<?php esc_attr_e( 'Next', 'mmi-content-slider' ); ?>"></div>
				</div>
			<?php endif; ?>
		</div>
	</div>

	<div class="mmi-latest-mobile swiper">
		<div class="swiper-wrapper">
			<?php foreach ( $posts as $post ) : ?>
				<?php $item = MMI_CS_API::get_post_display( $post ); ?>
				<div class="swiper-slide">
					<a class="mmi-latest-mobile-card" href="<?php echo esc_url( $item['link'] ); ?>">
						<?php if ( $item['image'] ) : ?>
							<img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy">
						<?php endif; ?>

						<div class="mmi-latest-mobile-content">
							<?php if ( $item['time'] ) : ?>
								<span class="mmi-latest-time"><?php echo esc_html( $item['time'] ); ?></span>
							<?php endif; ?>
							<h3 class="mmi-latest-title"><?php echo esc_html( $item['title'] ); ?></h3>
						</div>
					</a>
				</div>
			<?php endforeach; ?>
		</div>

		<?php if ( count( $posts ) > 1 ) : ?>
			<div class="mmi-latest-mobile-nav">
				<div class="swiper-button-prev" aria-label="<?php esc_attr_e( 'Previous', 'mmi-content-slider' ); ?>"></div>
				<div class="swiper-button-next" aria-label="<?php esc_attr_e( 'Next', 'mmi-content-slider' ); ?>"></div>
			</div>
		<?php endif; ?>
	</div>

</div>
