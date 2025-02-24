var compare = compare || {};
(function ($) {
	'use strict';
	if (typeof compare_variables !== "undefined") {
		var ajax_url = compare_variables.ajax_url,
			compare_button_url = compare_variables.compare_button_url,
			alert_message = compare_variables.alert_message,
			alert_not_found = compare_variables.alert_not_found,
			compare_listings = $('#tfcl-compare-listings'),
			item = $('.tfcl-compare-listing', '#tfcl-compare-listing-listings').length;
	}
	compare = {
		init: function () {
			this.tfcl_register_event_compare();
			this.tfcl_listing_compare();
			this.tfcl_open_compare();
			this.tfcl_close_compare();
			this.tfcl_compare_listing();
			this.tfcl_compare_redirect();
			this.tfcl_check_show_compare_listing();
		},
		tfcl_register_event_compare: function () {
			$(document).on('click', 'a.tfcl-compare-listing', function (e) {
				if (!$(this).hasClass('on-handle')) {
					var item = $('.tfcl-compare-listing', '#tfcl-compare-listing-listings').length;
					e.preventDefault();
					var $this = $(this).addClass('on-handle'),
						listing_inner = $this.closest('.listing-inner').addClass('listing-active-hover'),
						listing_id = $this.data('listing-id');
					$('.tfcl-listing-btn').removeClass('d-none');
					var count_item = $('.tfcl-compare-listing', '#tfcl-compare-listing-listings').length;
					if (count_item == 4) {
						if ($this.children().hasClass('plus')) {
							item--;
							$this.find('i.fa-minus').removeClass('fa-minus').addClass('fa-spinner fa-spin');
						}
						else {
							alert(alert_message);
						}
					}
					else {
						if (!($this.children().hasClass('plus'))) {
							item++;
							$this.find('i.fa-plus').removeClass('fa-plus').addClass('fa-spinner fa-spin minus');
						}
						else {
							item--;
							$this.find('i.fa-minus').removeClass('fa-minus').addClass('fa-spinner fa-spin');
						}
					}
					$.ajax({
						url: ajax_url,
						method: 'post',
						data: {
							action: 'tfcl_compare_add_remove_listing_ajax',
							listing_id: listing_id
						},
						success: function (html) {
							if (($this.children().hasClass('minus'))) {
								$this.find('i.minus').removeClass('fa-spinner fa-spin minus').addClass('fa-minus plus');
								$this.addClass('active');
							} else {
								$this.find('i.fa-spinner').removeClass('fa-spinner fa-spin plus').addClass('fa-plus');
								$this.removeClass('active');
							}
							$('div#tfcl-compare-listing-listings').replaceWith(html);
							compare.tfcl_compare_listing();
							if (item == 0) {
								$('.tfcl-listing-btn').addClass('hidden');
								compare.tfcl_close_compare();
								compare.tfcl_check_show_compare_listing();
							} else {
								compare.tfcl_open_compare();
								compare.tfcl_check_show_compare_listing();
							}
							$this.removeClass('on-handle');
							listing_inner.removeClass('listing-active-hover');
						}
					});
				}
			});
		},
		tfcl_compare_listing: function () {
			$('.tfcl-listing-btn').off('click').on('click', function () {
				var compare_listings = $('#tfcl-compare-listings');
				if (compare_listings.hasClass('listing-open')) {
					compare_listings.removeClass('listing-open');
					$('.tfcl-listing-btn').find('i.fa-angle-right').removeClass('fa-angle-right').addClass('fa-angle-left');
				} else {
					compare_listings.addClass('listing-open');
					$('.tfcl-listing-btn').find('i.fa-angle-left').removeClass('fa-angle-left').addClass('fa-angle-right');
				}
			});
		},
		tfcl_close_compare: function () {
			var compare_listings = $('#tfcl-compare-listings');
			if (compare_listings.hasClass('listing-open')) {
				compare_listings.removeClass('listing-open');
				$('.tfcl-listing-btn').find('i.fa-angle-right').removeClass('fa-angle-right').addClass('fa-angle-left');
			}
		},
		tfcl_open_compare: function () {
			var compare_listings = $('#tfcl-compare-listings');
			compare_listings.addClass('listing-open');
			if ($('.tfcl-listing-btn').find('i.fa-angle-left').length > 0) {
				$('.tfcl-listing-btn').find('i.fa-angle-left').removeClass('fa-angle-left').addClass('fa-angle-right');
			}
		},
		tfcl_listing_compare: function () {
			if (compare_listings) {
				$('div.tfcl-compare-listing').each(function () {
					var listing_id = $(this).attr('data-listing-id'),
						listing = $("a[data-listing-id='" + listing_id + "']");
					$('i.fa-plus', listing).removeClass('fa-plus').addClass('fa-minus plus');
					$('i.plus', listing).parent().addClass('active')
				});

				compare.tfcl_compare_listing();
				if ($('.tfcl-compare-listing').length > 0) {
					compare.tfcl_register_event_compare();
					var $handle = true;
					$(document).on('click', '#tfcl-compare-listing-listings .compare-listing-remove', function (e) {
						var item = $('.tfcl-compare-listing', '#tfcl-compare-listing-listings').length;
						e.preventDefault();
						if ($handle) {
							$handle = false;
							var $this = $(this),
								listing_id = $this.parent().attr('data-listing-id'),
								listing = $("a[data-listing-id='" + listing_id + "']");
							$this.parent().addClass('remove');
							$('i.plus', listing).removeClass('fa-minus plus').addClass('fa-plus');
							listing.removeClass('active');
							item--;
							if (item == 0) {
								$('#tfcl-compare-listing-listings').addClass('d-none');
								$('.tfcl-listing-btn').addClass('d-none');
								compare.tfcl_check_show_compare_listing();
								compare.tfcl_close_compare();
							}
							$.ajax({
								url: ajax_url,
								method: 'post',
								data: {
									action: 'tfcl_compare_add_remove_listing_ajax',
									listing_id: listing_id
								},
								success: function (html) {
									$('div#tfcl-compare-listing-listings').replaceWith(html);
									compare.tfcl_compare_listing();
									if (item == 0) {
										$('.tfcl-listing-btn').addClass('d-none');
										compare.tfcl_close_compare();
									} else {
										compare.tfcl_open_compare();
									}
									$handle = true;
								},
								error: function () {
									$handle = true;
								}
							});
						}
					});
					$(document).on('click', '.tfcl-compare-table .compare-listing-remove', function (e) {
						e.preventDefault();
						if ($handle) {
							$handle = false;
							var $this = $(this),
								listing_id = $this.attr('data-listing-id');
							item--;
							if (item == 0) {
								$('#tfcl-compare-listing-listings').addClass('d-none');
								$('.tfcl-listing-btn').addClass('d-none');
								compare.tfcl_check_show_compare_listing();
								compare.tfcl_close_compare();
							}
							$.ajax({
								url: ajax_url,
								method: 'post',
								data: {
									action: 'tfcl_compare_add_remove_listing_ajax',
									listing_id: listing_id
								},
								success: function (html) {
									resetToPreviousPage();
									$('div#tfcl-compare-listing-listings').replaceWith(html);
									compare.tfcl_compare_listing();
									if (item == 0) {
										$('.tfcl-listing-btn').addClass('d-none');
										compare.tfcl_close_compare();
									} else {
										compare.tfcl_open_compare();
									}
									$handle = true;
								},
								error: function () {
									$handle = true;
								}
							});
						}
					});


				}
			}
		},
		tfcl_compare_redirect: function () {
			// Go to Page Compare
			$(document).on('click', '.tfcl-compare-listing-button', function () {
				if (compare_button_url != "") {
					window.location.href = compare_button_url;
				} else {
					alert(alert_not_found);
				}
				return false;
			});
		},
		tfcl_check_show_compare_listing: function () {
			var item = $('.tfcl-compare-listing', '#tfcl-compare-listing-listings').length;
			var compare_listing_wrap = $('#compare_listing_wrap');
			if (item == 0) {
				compare_listing_wrap.addClass('compare-listing-hidden');
			} else {
				compare_listing_wrap.removeClass('compare-listing-hidden');
			}
		}

	};
	var resetToPreviousPage = function () {
		var currentUrl = window.location.href;
		var regex = /page\/(\d+)/;
		var matches = currentUrl.match(regex);
		var pageValue = matches ? matches[1] : null;
		if (pageValue == 2) {
			var newUrl = currentUrl.replace(/\/page\/(\d+)/, '');
			window.location.href = newUrl;
		} else if (pageValue > 2) {
			var previous_page = pageValue - 1;
			var newUrl = currentUrl.replace(/\/page\/([^\/]+)/, "/page/" + previous_page);
			window.location.href = newUrl;
		} else {
			window.location.reload();
		}
	}
	$(document).ready(function () {
		compare.init();
	});
})(jQuery);