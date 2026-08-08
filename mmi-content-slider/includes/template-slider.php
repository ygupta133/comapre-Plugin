<?php
/**
 * Slider Template
 *
 * Available Variables:
 * $heading
 * $posts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $posts ) || is_wp_error( $posts ) ) {
	return;
}
?>

<div class="mmi-content-slider-wrap">

	<?php if ( ! empty( $heading ) ) : ?>
		<h2 class="mmi-content-slider-heading">
			<?php echo esc_html( $heading ); ?>
		</h2>
	<?php endif; ?>

	<div class="mmi-content-slider swiper">

		<div class="swiper-wrapper">

			<?php foreach ( $posts as $post ) : ?>

				<?php

				$image = '';

				if ( ! empty( $post['_embedded']['wp:featuredmedia'][0]['source_url'] ) ) {
					$image = $post['_embedded']['wp:featuredmedia'][0]['source_url'];
				}

				$link = ! empty( $post['link'] ) ? $post['link'] : '#';

				$title = ! empty( $post['title']['rendered'] )
					? wp_strip_all_tags( $post['title']['rendered'] )
					: '';

				$author = '';

				if ( ! empty( $post['_embedded']['author'][0]['name'] ) ) {
					$author = $post['_embedded']['author'][0]['name'];
				}

				$date = '';

				if ( ! empty( $post['date'] ) ) {
					$date = human_time_diff(
						strtotime( $post['date'] ),
						current_time( 'timestamp' )
					) . ' Ago';
				}

				?>

				<div class="swiper-slide">

					<div class="mmi-slider-card">

						<?php if ( $image ) : ?>

							<a href="<?php echo esc_url( $link ); ?>"
								target="_blank"
								rel="noopener noreferrer">

								<img
									src="<?php echo esc_url( $image ); ?>"
									alt="<?php echo esc_attr( $title ); ?>"
									loading="lazy">

							</a>

						<?php endif; ?>

						<div class="mmi-slider-content">

							<div class="mmi-slider-meta">

								<?php if ( $author ) : ?>

									<span class="mmi-author">
										By <?php echo esc_html( $author ); ?>
									</span>

								<?php endif; ?>

								<?php if ( $date ) : ?>

									<span class="mmi-date">
										<?php echo esc_html( $date ); ?>
									</span>

								<?php endif; ?>

							</div>

							<a class="mmi-slider-title"
								href="<?php echo esc_url( $link ); ?>"
								target="_blank"
								rel="noopener noreferrer">

								<?php echo esc_html( $title ); ?>

							</a>

						</div>

					</div>

				</div>

			<?php endforeach; ?>

		</div>

		<div class="swiper-button-prev"></div>

		<div class="swiper-button-next"></div>

		<div class="swiper-pagination"></div>

	</div>

</div>