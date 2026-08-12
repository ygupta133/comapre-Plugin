(function ($) {
	'use strict';

	var $btn = $('#mmi-aps-fetch-price');
	if (!$btn.length) {
		return;
	}

	var $asin = $('#mmi_amazon_asin');
	var $spinner = $('#mmi-aps-fetch-spinner');
	var $message = $('#mmi-aps-fetch-message');

	function setMessage(text, type) {
		$message
			.removeClass('mmi-aps-fetch-message--success mmi-aps-fetch-message--error')
			.addClass(type ? 'mmi-aps-fetch-message--' + type : '')
			.text(text || '');
	}

	function updateDisplay(data) {
		$('#mmi-aps-display-price').text(data.price_formatted || '—');
		$('#mmi-aps-display-original-price').text(data.original_formatted || '—');
		$('#mmi-aps-display-title').text(data.title || '—');
		$('#mmi-aps-display-delivery').text(data.delivery || '—');
		$('#mmi-aps-display-last-updated').text(data.last_updated || '—');
	}

	$btn.on('click', function () {
		var asin = ($asin.val() || '').trim().toUpperCase();
		var productId = $btn.data('product-id');

		if (!asin) {
			setMessage(mmiApsAdmin.i18n.noAsin, 'error');
			return;
		}

		$btn.prop('disabled', true);
		$spinner.addClass('is-active');
		setMessage(mmiApsAdmin.i18n.fetching, '');

		$.post(mmiApsAdmin.ajaxUrl, {
			action: 'mmi_aps_fetch_price',
			nonce: mmiApsAdmin.nonce,
			product_id: productId,
			asin: asin
		})
			.done(function (response) {
				if (response.success) {
					updateDisplay(response.data);
					setMessage(response.data.message || mmiApsAdmin.i18n.success, 'success');
				} else {
					setMessage((response.data && response.data.message) || mmiApsAdmin.i18n.error, 'error');
				}
			})
			.fail(function () {
				setMessage(mmiApsAdmin.i18n.error, 'error');
			})
			.always(function () {
				$btn.prop('disabled', false);
				$spinner.removeClass('is-active');
			});
	});
})(jQuery);
