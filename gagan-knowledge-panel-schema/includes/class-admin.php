<?php
/**
 * Admin settings page.
 */

defined( 'ABSPATH' ) || exit;

class GKPS_Admin {

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( GKPS_FILE ), array( __CLASS__, 'action_links' ) );
	}

	/**
	 * @param string[] $links Plugin links.
	 * @return string[]
	 */
	public static function action_links( array $links ): array {
		$links[] = '<a href="' . esc_url( admin_url( 'options-general.php?page=gagan-knowledge-panel-schema' ) ) . '">' . esc_html__( 'Settings', 'gagan-knowledge-panel-schema' ) . '</a>';
		return $links;
	}

	public static function add_menu(): void {
		add_options_page(
			__( 'Knowledge Panel Schema', 'gagan-knowledge-panel-schema' ),
			__( 'Knowledge Panel Schema', 'gagan-knowledge-panel-schema' ),
			'manage_options',
			'gagan-knowledge-panel-schema',
			array( __CLASS__, 'render_page' )
		);
	}

	public static function register_settings(): void {
		register_setting(
			'gkps_settings_group',
			'gkps_settings',
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => GKPS_Defaults::get(),
			)
		);
	}

	/**
	 * @param mixed $input Raw input.
	 * @return array<string, mixed>
	 */
	public static function sanitize( $input ): array {
		if ( ! is_array( $input ) ) {
			return GKPS_Defaults::get();
		}

		$defaults = GKPS_Defaults::get();

		return array(
			'enabled'           => ! empty( $input['enabled'] ),
			'person_name'       => sanitize_text_field( (string) ( $input['person_name'] ?? $defaults['person_name'] ) ),
			'person_url'        => esc_url_raw( (string) ( $input['person_url'] ?? $defaults['person_url'] ) ),
			'about_page'        => sanitize_text_field( (string) ( $input['about_page'] ?? $defaults['about_page'] ) ),
			'image_url'         => esc_url_raw( (string) ( $input['image_url'] ?? $defaults['image_url'] ) ),
			'job_title'         => sanitize_text_field( (string) ( $input['job_title'] ?? $defaults['job_title'] ) ),
			'description'       => sanitize_textarea_field( (string) ( $input['description'] ?? $defaults['description'] ) ),
			'email'             => sanitize_email( (string) ( $input['email'] ?? $defaults['email'] ) ),
			'nationality'       => sanitize_text_field( (string) ( $input['nationality'] ?? $defaults['nationality'] ) ),
			'knows_about'       => sanitize_textarea_field( (string) ( $input['knows_about'] ?? $defaults['knows_about'] ) ),
			'same_as'           => sanitize_textarea_field( (string) ( $input['same_as'] ?? $defaults['same_as'] ) ),
			'organizations'     => sanitize_textarea_field( (string) ( $input['organizations'] ?? $defaults['organizations'] ) ),
			'output_sitewide'   => ! empty( $input['output_sitewide'] ),
			'output_about_only' => ! empty( $input['output_about_only'] ),
		);
	}

	public static function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$s = GKPS_Defaults::get_settings();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Gagan Knowledge Panel Schema', 'gagan-knowledge-panel-schema' ); ?></h1>
			<p><?php esc_html_e( 'Outputs Person + Organization JSON-LD for Google Knowledge Panel entity signals.', 'gagan-knowledge-panel-schema' ); ?></p>

			<div class="notice notice-info inline" style="margin:12px 0 20px;padding:12px;">
				<p><strong><?php esc_html_e( 'After activating:', 'gagan-knowledge-panel-schema' ); ?></strong></p>
				<ol style="margin-left:18px;">
					<li><?php esc_html_e( 'Add Instagram / Twitter URLs in SameAs (one per line).', 'gagan-knowledge-panel-schema' ); ?></li>
					<li><?php esc_html_e( 'Yoast SEO → Settings → Site features → Schema → set Site represents = Person (optional, avoid duplicate conflicting names).', 'gagan-knowledge-panel-schema' ); ?></li>
					<li><?php esc_html_e( 'Test: validator.schema.org or view page source → search for gagan-knowledge-panel-schema', 'gagan-knowledge-panel-schema' ); ?></li>
					<li><?php esc_html_e( 'Create Wikidata entry and add its URL to SameAs.', 'gagan-knowledge-panel-schema' ); ?></li>
				</ol>
			</div>

			<form method="post" action="options.php">
				<?php settings_fields( 'gkps_settings_group' ); ?>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'Enable schema', 'gagan-knowledge-panel-schema' ); ?></th>
						<td><label><input type="checkbox" name="gkps_settings[enabled]" value="1" <?php checked( ! empty( $s['enabled'] ) ); ?> /> <?php esc_html_e( 'Output JSON-LD on site', 'gagan-knowledge-panel-schema' ); ?></label></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_person_name"><?php esc_html_e( 'Person name', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><input name="gkps_settings[person_name]" id="gkps_person_name" type="text" class="regular-text" value="<?php echo esc_attr( (string) $s['person_name'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_person_url"><?php esc_html_e( 'Official website URL', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><input name="gkps_settings[person_url]" id="gkps_person_url" type="url" class="regular-text" value="<?php echo esc_attr( (string) $s['person_url'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_about_page"><?php esc_html_e( 'About page path', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td>
							<input name="gkps_settings[about_page]" id="gkps_about_page" type="text" class="regular-text" value="<?php echo esc_attr( (string) $s['about_page'] ); ?>" />
							<p class="description"><?php esc_html_e( 'Entity home page, e.g. /about-gagan-dhawan/', 'gagan-knowledge-panel-schema' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_image_url"><?php esc_html_e( 'Profile image URL', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><input name="gkps_settings[image_url]" id="gkps_image_url" type="url" class="large-text" value="<?php echo esc_attr( (string) $s['image_url'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_job_title"><?php esc_html_e( 'Job title', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><input name="gkps_settings[job_title]" id="gkps_job_title" type="text" class="regular-text" value="<?php echo esc_attr( (string) $s['job_title'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_description"><?php esc_html_e( 'Description', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><textarea name="gkps_settings[description]" id="gkps_description" rows="4" class="large-text"><?php echo esc_textarea( (string) $s['description'] ); ?></textarea></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_email"><?php esc_html_e( 'Email', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><input name="gkps_settings[email]" id="gkps_email" type="email" class="regular-text" value="<?php echo esc_attr( (string) $s['email'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_nationality"><?php esc_html_e( 'Nationality', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td><input name="gkps_settings[nationality]" id="gkps_nationality" type="text" class="regular-text" value="<?php echo esc_attr( (string) $s['nationality'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_knows_about"><?php esc_html_e( 'Knows about', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td>
							<textarea name="gkps_settings[knows_about]" id="gkps_knows_about" rows="5" class="large-text"><?php echo esc_textarea( (string) $s['knows_about'] ); ?></textarea>
							<p class="description"><?php esc_html_e( 'One topic per line.', 'gagan-knowledge-panel-schema' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_same_as"><?php esc_html_e( 'SameAs URLs', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td>
							<textarea name="gkps_settings[same_as]" id="gkps_same_as" rows="8" class="large-text code"><?php echo esc_textarea( (string) $s['same_as'] ); ?></textarea>
							<p class="description"><?php esc_html_e( 'LinkedIn, Instagram, Twitter, Wikidata, news articles — one URL per line. Critical for Knowledge Panel.', 'gagan-knowledge-panel-schema' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gkps_organizations"><?php esc_html_e( 'Organizations', 'gagan-knowledge-panel-schema' ); ?></label></th>
						<td>
							<textarea name="gkps_settings[organizations]" id="gkps_organizations" rows="4" class="large-text code"><?php echo esc_textarea( (string) $s['organizations'] ); ?></textarea>
							<p class="description"><?php esc_html_e( 'Format: Name|URL — one per line.', 'gagan-knowledge-panel-schema' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Output scope', 'gagan-knowledge-panel-schema' ); ?></th>
						<td>
							<label><input type="checkbox" name="gkps_settings[output_sitewide]" value="1" <?php checked( ! empty( $s['output_sitewide'] ) ); ?> /> <?php esc_html_e( 'Output on all public pages (recommended)', 'gagan-knowledge-panel-schema' ); ?></label><br />
							<label><input type="checkbox" name="gkps_settings[output_about_only]" value="1" <?php checked( ! empty( $s['output_about_only'] ) ); ?> /> <?php esc_html_e( 'Only homepage + about page (lighter)', 'gagan-knowledge-panel-schema' ); ?></label>
						</td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>

			<h2><?php esc_html_e( 'Validate', 'gagan-knowledge-panel-schema' ); ?></h2>
			<ul>
				<li><a href="https://validator.schema.org/#url=<?php echo esc_attr( urlencode( (string) $s['person_url'] ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Schema.org Validator', 'gagan-knowledge-panel-schema' ); ?></a></li>
				<li><a href="https://search.google.com/test/rich-results?url=<?php echo esc_attr( urlencode( (string) $s['person_url'] ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Google Rich Results Test', 'gagan-knowledge-panel-schema' ); ?></a></li>
			</ul>
		</div>
		<?php
	}
}
