<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Metabox {

	/**
	 * Field Helper
	 *
	 * @var MMI_CS_Fields
	 */
	private $fields;

	public function __construct() {

		$this->fields = new MMI_CS_Fields();

		add_action( 'add_meta_boxes', array( $this, 'register_metaboxes' ) );
		add_action( 'save_post', array( $this, 'save_metabox' ) );
	}

	/**
 * Register Meta Boxes
 */
public function register_metaboxes() {

	add_meta_box(
		'mmi_cs_general_settings',
		'General Settings',
		array( $this, 'general_settings_callback' ),
		'mmi_slider',
		'normal',
		'high'
	);

	add_meta_box(
		'mmi_cs_display_settings',
		'Display Settings',
		array( $this, 'display_settings_callback' ),
		'mmi_slider',
		'side',
		'high'
	);

	add_meta_box(
		'mmi_cs_slider_settings',
		'Slider Settings',
		array( $this, 'slider_settings_callback' ),
		'mmi_slider',
		'side',
		'default'
	);

	add_meta_box(
		'mmi_cs_shortcode',
		'Shortcode',
		array( $this, 'shortcode_callback' ),
		'mmi_slider',
		'side',
		'low'
	);
}

	/**
	 * General Settings
	 */
	public function general_settings_callback( $post ) {

	wp_nonce_field( 'mmi_cs_save_slider', 'mmi_cs_nonce' );

	$heading  = get_post_meta( $post->ID, '_mmi_cs_heading', true );
	$source   = get_post_meta( $post->ID, '_mmi_cs_source', true );
	$category = get_post_meta( $post->ID, '_mmi_cs_category', true );


	$this->fields->text(
		array(
			'id'          => 'mmi_cs_heading',
			'name'        => 'mmi_cs_heading',
			'label'       => 'Heading',
			'value'       => $heading,
			'placeholder' => 'Featured News',
		)
	);

	$this->fields->url(
		array(
			'id'          => 'mmi_cs_source',
			'name'        => 'mmi_cs_source',
			'label'       => 'Source Website',
			'value'       => $source,
			'placeholder' => 'https://www.mymobileindia.com',
		)
	);

	// Load Categories Button
	?>
	<p>
		<button
			type="button"
			class="button button-secondary"
			id="mmi-cs-load-categories">
			Load Categories
		</button>

		<span
			class="spinner"
			id="mmi-cs-spinner"
			style="float:none;margin-top:4px;">
		</span>
	</p>
	<?php

	$this->fields->select(
		array(
			'id'      => 'mmi_cs_category',
			'name'    => 'mmi_cs_category',
			'label'   => 'Category',
			'value'   => $category,
			'options' => array(
				'' => 'Click "Load Categories"',
			),
		)
	);
    
}

/**
 * Display Settings
 */
public function display_settings_callback( $post ) {

	$card_style = get_post_meta( $post->ID, '_mmi_cs_card_style', true );
	$desktop    = get_post_meta( $post->ID, '_mmi_cs_desktop', true );
	$tablet     = get_post_meta( $post->ID, '_mmi_cs_tablet', true );
	$mobile     = get_post_meta( $post->ID, '_mmi_cs_mobile', true );

	$this->fields->select(
		array(
			'id'      => 'mmi_cs_card_style',
			'name'    => 'mmi_cs_card_style',
			'label'   => 'Card Style',
			'value'   => ! empty( $card_style ) ? $card_style : '91mobiles',
			'options' => array(
				'91mobiles' => '91Mobiles',
				'minimal'   => 'Minimal',
				'large'     => 'Large Card',
			),
		)
	);

	$this->fields->number(
		array(
			'id'    => 'mmi_cs_desktop',
			'name'  => 'mmi_cs_desktop',
			'label' => 'Desktop Cards',
			'value' => ! empty( $desktop ) ? $desktop : 4,
			'min'   => 1,
			'max'   => 6,
		)
	);

	$this->fields->number(
		array(
			'id'    => 'mmi_cs_tablet',
			'name'  => 'mmi_cs_tablet',
			'label' => 'Tablet Cards',
			'value' => ! empty( $tablet ) ? $tablet : 2,
			'min'   => 1,
			'max'   => 4,
		)
	);

	$this->fields->number(
		array(
			'id'    => 'mmi_cs_mobile',
			'name'  => 'mmi_cs_mobile',
			'label' => 'Mobile Cards',
			'value' => ! empty( $mobile ) ? $mobile : 1,
			'min'   => 1,
			'max'   => 2,
		)
	);

}

/**
 * Slider Settings
 */
public function slider_settings_callback( $post ) {

	$this->fields->number(
		array(
			'id'    => 'mmi_cs_posts',
			'name'  => 'mmi_cs_posts',
			'label' => 'Posts Count',
			'value' => 8,
			'min'   => 1,
			'max'   => 20,
		)
	);

	$this->fields->checkbox(
		array(
			'id'      => 'mmi_cs_autoplay',
			'name'    => 'mmi_cs_autoplay',
			'label'   => 'Enable Autoplay',
			'checked' => true,
		)
	);

	$this->fields->checkbox(
		array(
			'id'      => 'mmi_cs_loop',
			'name'    => 'mmi_cs_loop',
			'label'   => 'Enable Loop',
			'checked' => true,
		)
	);

}

	/**
	 * Shortcode
	 */
	public function shortcode_callback( $post ) {
		?>

		<input
			type="text"
			class="widefat"
			readonly
			value="[mmi_slider id=&quot;<?php echo esc_attr( $post->post_name ); ?>&quot;]">

		<?php
	}

/**
 * Save Meta Box Data
 */
public function save_metabox( $post_id ) {

	// Nonce Check.
	if ( ! isset( $_POST['mmi_cs_nonce'] ) ) {
		return;
	}

	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mmi_cs_nonce'] ) ), 'mmi_cs_save_slider' ) ) {
		return;
	}

	// Autosave Check.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	// Permission Check.
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// Post Type Check.
	if ( get_post_type( $post_id ) !== 'mmi_slider' ) {
		return;
	}

	// Heading.
	if ( isset( $_POST['mmi_cs_heading'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_heading',
			sanitize_text_field( wp_unslash( $_POST['mmi_cs_heading'] ) )
		);
	}

	// Source Website.
	if ( isset( $_POST['mmi_cs_source'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_source',
			esc_url_raw( wp_unslash( $_POST['mmi_cs_source'] ) )
		);
	}

	// Category.
	if ( isset( $_POST['mmi_cs_category'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_category',
			absint( wp_unslash( $_POST['mmi_cs_category'] ) )
		);
	}

	// Card Style.
	if ( isset( $_POST['mmi_cs_card_style'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_card_style',
			sanitize_text_field( wp_unslash( $_POST['mmi_cs_card_style'] ) )
		);
	}

	// Desktop Cards.
	if ( isset( $_POST['mmi_cs_desktop'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_desktop',
			absint( wp_unslash( $_POST['mmi_cs_desktop'] ) )
		);
	}

	// Tablet Cards.
	if ( isset( $_POST['mmi_cs_tablet'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_tablet',
			absint( wp_unslash( $_POST['mmi_cs_tablet'] ) )
		);
	}

	// Mobile Cards.
	if ( isset( $_POST['mmi_cs_mobile'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_mobile',
			absint( wp_unslash( $_POST['mmi_cs_mobile'] ) )
		);
	}

	// Posts Count.
	if ( isset( $_POST['mmi_cs_posts'] ) ) {
		update_post_meta(
			$post_id,
			'_mmi_cs_posts',
			absint( wp_unslash( $_POST['mmi_cs_posts'] ) )
		);
	}

	// Autoplay.
	update_post_meta(
		$post_id,
		'_mmi_cs_autoplay',
		isset( $_POST['mmi_cs_autoplay'] ) ? 1 : 0
	);

	// Loop.
	update_post_meta(
		$post_id,
		'_mmi_cs_loop',
		isset( $_POST['mmi_cs_loop'] ) ? 1 : 0
	);
}
}