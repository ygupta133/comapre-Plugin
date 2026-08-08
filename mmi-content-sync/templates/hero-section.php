<?php
/**
 * Hero section template — 91mobiles-style desktop + mobile carousel.
 *
 * @var array<int, array<int, array<string, mixed>>> $slides
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="mmi-hero" data-slide-count="<?php echo esc_attr( (string) count( $slides ) ); ?>">
	<div class="mmi-hero-desktop">
		<?php foreach ( $slides as $index => $slide ) : ?>
			<?php
			$hero = $slide[0];
			$side = array_slice( $slide, 1, 3 );
			?>
			<div class="mmi-hero-slide<?php echo 0 === $index ? ' is-active' : ''; ?>" data-index="<?php echo esc_attr( (string) $index ); ?>">
				<div class="mmi-hero-main">
					<a class="mmi-hero-main-link" href="<?php echo esc_url( $hero['link'] ); ?>">
						<?php if ( $hero['image'] ) : ?>
							<div class="mmi-hero-main-image">
								<img src="<?php echo esc_url( $hero['image'] ); ?>" alt="<?php echo esc_attr( $hero['alt'] ); ?>" loading="lazy" />
							</div>
						<?php endif; ?>
						<div class="mmi-hero-main-body">
							<?php if ( $hero['relative'] ) : ?>
								<span class="mmi-hero-time"><?php echo esc_html( $hero['relative'] ); ?></span>
							<?php endif; ?>
							<h2 class="mmi-hero-title"><?php echo esc_html( $hero['title'] ); ?></h2>
						</div>
					</a>
				</div>

				<div class="mmi-hero-side">
					<?php foreach ( $side as $item ) : ?>
						<a class="mmi-hero-side-item" href="<?php echo esc_url( $item['link'] ); ?>">
							<?php if ( $item['image'] ) : ?>
								<div class="mmi-hero-side-thumb">
									<img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['alt'] ); ?>" loading="lazy" />
								</div>
							<?php endif; ?>
							<div class="mmi-hero-side-content">
								<?php if ( $item['relative'] ) : ?>
									<span class="mmi-hero-time"><?php echo esc_html( $item['relative'] ); ?></span>
								<?php endif; ?>
								<h3 class="mmi-hero-side-title"><?php echo esc_html( $item['title'] ); ?></h3>
							</div>
						</a>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endforeach; ?>

		<?php if ( count( $slides ) > 1 ) : ?>
			<div class="mmi-hero-nav" aria-label="<?php esc_attr_e( 'Trending news navigation', 'mmi-content-sync' ); ?>">
				<button type="button" class="mmi-hero-nav-btn mmi-hero-prev" aria-label="<?php esc_attr_e( 'Previous', 'mmi-content-sync' ); ?>">
					<svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8.5 1.5L1.5 8l7 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
				<button type="button" class="mmi-hero-nav-btn mmi-hero-next" aria-label="<?php esc_attr_e( 'Next', 'mmi-content-sync' ); ?>">
					<svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M1.5 1.5L8.5 8l-7 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
			</div>
		<?php endif; ?>
	</div>

	<div class="mmi-hero-mobile swiper">
		<div class="swiper-wrapper">
			<?php foreach ( $posts as $post ) : ?>
				<div class="swiper-slide">
					<a class="mmi-hero-mobile-card" href="<?php echo esc_url( $post['link'] ); ?>">
						<?php if ( $post['image'] ) : ?>
							<div class="mmi-hero-mobile-image">
								<img src="<?php echo esc_url( $post['image'] ); ?>" alt="<?php echo esc_attr( $post['alt'] ); ?>" loading="lazy" />
							</div>
						<?php endif; ?>
						<div class="mmi-hero-mobile-body">
							<?php if ( $post['relative'] ) : ?>
								<span class="mmi-hero-time"><?php echo esc_html( $post['relative'] ); ?></span>
							<?php endif; ?>
							<h2 class="mmi-hero-title"><?php echo esc_html( $post['title'] ); ?></h2>
						</div>
					</a>
				</div>
			<?php endforeach; ?>
		</div>
		<div class="mmi-hero-mobile-nav">
			<button type="button" class="mmi-hero-nav-btn mmi-hero-mobile-prev" aria-label="<?php esc_attr_e( 'Previous', 'mmi-content-sync' ); ?>">
				<svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M8.5 1.5L1.5 8l7 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
			<button type="button" class="mmi-hero-nav-btn mmi-hero-mobile-next" aria-label="<?php esc_attr_e( 'Next', 'mmi-content-sync' ); ?>">
				<svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M1.5 1.5L8.5 8l-7 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
		</div>
	</div>
</div>
