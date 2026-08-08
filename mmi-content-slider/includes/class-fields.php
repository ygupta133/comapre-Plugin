<?php
/**
 * Reusable Admin Fields
 *
 * @package MMI_Content_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MMI_CS_Fields {

	/**
	 * Text Field
	 */
	public function text( $args = array() ) {

		$defaults = array(
			'id'          => '',
			'name'        => '',
			'label'       => '',
			'value'       => '',
			'placeholder' => '',
			'description' => '',
		);

		$args = wp_parse_args( $args, $defaults );
		?>

		<p class="mmi-field">

			<label for="<?php echo esc_attr( $args['id'] ); ?>">
				<strong><?php echo esc_html( $args['label'] ); ?></strong>
			</label>

			<input
				type="text"
				id="<?php echo esc_attr( $args['id'] ); ?>"
				name="<?php echo esc_attr( $args['name'] ); ?>"
				value="<?php echo esc_attr( $args['value'] ); ?>"
				placeholder="<?php echo esc_attr( $args['placeholder'] ); ?>"
				class="widefat"
			>

			<?php if ( ! empty( $args['description'] ) ) : ?>
				<p class="description">
					<?php echo esc_html( $args['description'] ); ?>
				</p>
			<?php endif; ?>

		</p>

		<?php
	}

	/**
	 * URL Field
	 */
	public function url( $args = array() ) {

		$defaults = array(
			'id'          => '',
			'name'        => '',
			'label'       => '',
			'value'       => '',
			'placeholder' => 'https://',
			'description' => '',
		);

		$args = wp_parse_args( $args, $defaults );
		?>

		<p class="mmi-field">

			<label for="<?php echo esc_attr( $args['id'] ); ?>">
				<strong><?php echo esc_html( $args['label'] ); ?></strong>
			</label>

			<input
				type="url"
				id="<?php echo esc_attr( $args['id'] ); ?>"
				name="<?php echo esc_attr( $args['name'] ); ?>"
				value="<?php echo esc_attr( $args['value'] ); ?>"
				placeholder="<?php echo esc_attr( $args['placeholder'] ); ?>"
				class="widefat"
			>

			<?php if ( ! empty( $args['description'] ) ) : ?>
				<p class="description">
					<?php echo esc_html( $args['description'] ); ?>
				</p>
			<?php endif; ?>

		</p>

		<?php
	}

	/**
	 * Textarea Field
	 */
	public function textarea( $args = array() ) {

		$defaults = array(
			'id'          => '',
			'name'        => '',
			'label'       => '',
			'value'       => '',
			'rows'        => 4,
			'placeholder' => '',
			'description' => '',
		);

		$args = wp_parse_args( $args, $defaults );
		?>

		<p class="mmi-field">

			<label for="<?php echo esc_attr( $args['id'] ); ?>">
				<strong><?php echo esc_html( $args['label'] ); ?></strong>
			</label>

			<textarea
				id="<?php echo esc_attr( $args['id'] ); ?>"
				name="<?php echo esc_attr( $args['name'] ); ?>"
				rows="<?php echo esc_attr( $args['rows'] ); ?>"
				class="widefat"
				placeholder="<?php echo esc_attr( $args['placeholder'] ); ?>"
			><?php echo esc_textarea( $args['value'] ); ?></textarea>

			<?php if ( ! empty( $args['description'] ) ) : ?>
				<p class="description">
					<?php echo esc_html( $args['description'] ); ?>
				</p>
			<?php endif; ?>

		</p>

		<?php
	}

	/**
	 * Number Field
	 */
	public function number( $args = array() ) {

		$defaults = array(
			'id'    => '',
			'name'  => '',
			'label' => '',
			'value' => '',
			'min'   => '',
			'max'   => '',
		);

		$args = wp_parse_args( $args, $defaults );
		?>

		<p class="mmi-field">

			<label for="<?php echo esc_attr( $args['id'] ); ?>">
				<strong><?php echo esc_html( $args['label'] ); ?></strong>
			</label>

			<input
				type="number"
				id="<?php echo esc_attr( $args['id'] ); ?>"
				name="<?php echo esc_attr( $args['name'] ); ?>"
				value="<?php echo esc_attr( $args['value'] ); ?>"
				min="<?php echo esc_attr( $args['min'] ); ?>"
				max="<?php echo esc_attr( $args['max'] ); ?>"
				class="small-text"
			>

		</p>

		<?php
	}

	/**
	 * Checkbox Field
	 */
	public function checkbox( $args = array() ) {

		$defaults = array(
			'id'      => '',
			'name'    => '',
			'label'   => '',
			'checked' => false,
		);

		$args = wp_parse_args( $args, $defaults );
		?>

		<p class="mmi-field">

			<label>

				<input
					type="checkbox"
					id="<?php echo esc_attr( $args['id'] ); ?>"
					name="<?php echo esc_attr( $args['name'] ); ?>"
					value="1"
					<?php checked( $args['checked'], true ); ?>
				>

				<?php echo esc_html( $args['label'] ); ?>

			</label>

		</p>

		<?php
	}

	/**
	 * Select Field
	 */
	public function select( $args = array() ) {

		$defaults = array(
			'id'          => '',
			'name'        => '',
			'label'       => '',
			'value'       => '',
			'options'     => array(),
			'description' => '',
		);

		$args = wp_parse_args( $args, $defaults );
		?>

		<p class="mmi-field">

			<label for="<?php echo esc_attr( $args['id'] ); ?>">
				<strong><?php echo esc_html( $args['label'] ); ?></strong>
			</label>

			<select
				id="<?php echo esc_attr( $args['id'] ); ?>"
				name="<?php echo esc_attr( $args['name'] ); ?>"
				class="widefat"
				data-selected="<?php echo esc_attr( $args['value'] ); ?>"
			>

				<?php foreach ( $args['options'] as $key => $label ) : ?>

					<option
						value="<?php echo esc_attr( $key ); ?>"
						<?php selected( $args['value'], $key ); ?>
					>
						<?php echo esc_html( $label ); ?>
					</option>

				<?php endforeach; ?>

			</select>

			<?php if ( ! empty( $args['description'] ) ) : ?>
				<p class="description">
					<?php echo esc_html( $args['description'] ); ?>
				</p>
			<?php endif; ?>

		</p>

		<?php
	}
}