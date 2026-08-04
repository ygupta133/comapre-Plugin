<?php
/**
 * Minimal template for pretty compare URLs (no ReHub compare assets).
 */

defined( 'ABSPATH' ) || exit;

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php esc_html_e( 'Compare Mobiles', 'mobile-compare' ); ?> — <?php bloginfo( 'name' ); ?></title>
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'mobile-compare-blank-template' ); ?>>
<?php wp_body_open(); ?>
<main class="mobile-compare-blank-main">
	<?php echo do_shortcode( '[mobile_compare]' ); ?>
</main>
<?php wp_footer(); ?>
</body>
</html>
