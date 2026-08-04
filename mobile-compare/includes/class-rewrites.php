<?php
/**
 * Pretty URL rewrites for compare routes.
 */

defined( 'ABSPATH' ) || exit;

class Mobile_Compare_Rewrites {

	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register_rules' ) );
		add_filter( 'query_vars', array( __CLASS__, 'register_query_vars' ) );
	}

	public static function register_rules(): void {
		add_rewrite_rule(
			'^compare/(.+)/?$',
			'index.php?mobile_compare_slugs=$matches[1]',
			'top'
		);
	}

	/**
	 * @param array<string> $vars Query vars.
	 * @return array<string>
	 */
	public static function register_query_vars( array $vars ): array {
		$vars[] = 'mobile_compare_slugs';
		return $vars;
	}
}
