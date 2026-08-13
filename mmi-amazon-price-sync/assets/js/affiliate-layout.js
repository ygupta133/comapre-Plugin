(function () {
	'use strict';

	function relocateAffiliateButton() {
		var wrap = document.querySelector('.re_wooinner_cta_wrapper .mmi-aps-affiliate-wrap');
		if (!wrap) {
			return false;
		}

		var priceParagraph = wrap.closest('p.price');
		if (priceParagraph && priceParagraph.parentNode) {
			priceParagraph.parentNode.insertBefore(wrap, priceParagraph.nextSibling);
		}

		var cta = document.querySelector('.re_wooinner_cta_wrapper');
		if (!cta) {
			return true;
		}

		var specsBtn = cta.querySelector('.see-full-spec-btn');
		var buttonArea = cta.querySelector('#woo-button-area');

		if (specsBtn) {
			specsBtn.parentNode.insertBefore(wrap, specsBtn);
			return true;
		}

		if (buttonArea && buttonArea.parentNode) {
			buttonArea.parentNode.insertBefore(wrap, buttonArea);
			return true;
		}

		return true;
	}

	function runRelocate(retries) {
		if (relocateAffiliateButton() || retries <= 0) {
			return;
		}

		window.setTimeout(function () {
			runRelocate(retries - 1);
		}, 300);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			runRelocate(12);
		});
	} else {
		runRelocate(12);
	}
})();
