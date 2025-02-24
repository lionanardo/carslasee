var mainJSTFCL = mainJSTFCL || {};
(function ($) {
    'use strict';
    var decimals = 0,
        decPoint = '.',
        thousandsSep = ',';
    mainJSTFCL = {
        init: function () {
            this.onChangeFilterListingStatus();
            this.showFullNumber();
            searchMoreOptions();
            changeConditionFilter();
            if (main_variables.toggle_lazy_load == 'on') {
                this.lazyLoadImage();
            }
        },
        numberFormat: function (number, decimal) {
            decimal = (typeof decimal !== 'undefined') ? decimal : decimals;

            // Strip all characters but numerical ones.
            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimal) ? 0 : Math.abs(decimal),
                sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep,
                dec = (typeof decPoint === 'undefined') ? '.' : decPoint,
                s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + Math.round(n * k) / k;
                };
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        },
        onChangeFilterListingStatus: function () {
            $('select#post_status').on('change', function () {
                var selected = $(this).find(":selected").val();
                window.location.href = selected;
            })
        },
        lazyLoadImage: function () {
            var lazyloadImages;
            if ("IntersectionObserver" in window) {
                lazyloadImages = document.querySelectorAll("img.lazy");
                var imageObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var image = entry.target;
                            var src = image.dataset.src;

                            image.tagName.toLowerCase() === 'img'
                                ? image.src = src
                                : image.style.backgroundImage = "url(\'" + src + "\')";
                            image.classList.add('loaded');
                            image.classList.remove("lazy");
                            imageObserver.unobserve(image);
                        }
                    });
                });

                lazyloadImages.forEach(function (image) {
                    imageObserver.observe(image);
                });
            } else {
                var lazyloadThrottleTimeout;
                lazyloadImages = document.querySelectorAll("img.lazy");
                function lazyload() {
                    if (lazyloadThrottleTimeout) {
                        clearTimeout(lazyloadThrottleTimeout);
                    }

                    lazyloadThrottleTimeout = setTimeout(function () {
                        var scrollTop = window.pageYOffset;
                        lazyloadImages.forEach(function (img) {
                            if (img.offsetTop < (window.innerHeight + scrollTop)) {
                                var src = img.dataset.src;
                                img.tagName.toLowerCase() === 'img'
                                    ? img.src = src
                                    : img.style.backgroundImage = "url(\'" + src + "\')";
                                img.classList.add('loaded');
                                img.classList.remove("lazy");
                            }
                        });
                        if (lazyloadImages.length == 0) {
                            document.removeEventListener("scroll", lazyload);
                            window.removeEventListener("resize", lazyload);
                            window.removeEventListener("orientationChange", lazyload);
                        }
                    }, 20);
                }

                document.addEventListener("scroll", lazyload);
                window.addEventListener("resize", lazyload);
                window.addEventListener("orientationChange", lazyload);
            }
        },
        showFullNumber: function () {
            $('.sale_phone_text').each(function () {
                var number = $(this).siblings('.full_number_phone').data('fullnumber');
                number = String(number);
                var hidden_part = '*'.repeat(3);
                var masked_phone_number = String(number).substr(0, 5) + hidden_part;
                $(this).text(masked_phone_number);
            });

            $('.show_number_btn').on('click', function (e) {
                e.preventDefault();
                var number = $(this).siblings('.full_number_phone').data('fullnumber');
                number = String(number);
                var textNumberCurrent = $(this).siblings('.sale_phone_text').text();

                if (textNumberCurrent == number) {
                    var hidden_part = '*'.repeat(number.length - 5);
                    var masked_phone_number = number.substr(0, 5) + hidden_part;
                    $(this).siblings('.sale_phone_text').text(masked_phone_number);
                } else {
                    $(this).siblings('.sale_phone_text').text(number);
                }
            });
        },
    }

    var changeConditionFilter = function () {
        // change condition filter
        $('.tf-search-condition-tab .btn-condition-filter').on('click', function (e) {
            e.preventDefault();
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            var conditionFilterVal = $(this).data('value');
            $('#condition').val(conditionFilterVal);
        })
    }

    var searchMoreOptions = function () {
        var searchMoreBtn = $('.tfcl-advanced-search-wrap .tf-search-more-btn');
        var wrap_btn_filter = $('.tfcl-advanced-search-wrap .tf-wrap-search-more-btn');
        var searchOptions = $('.tfcl-form-bottom.search-more-options');

        searchOptions.hide();

        searchMoreBtn.on('click', function (e) {
            e.stopPropagation();
            $(this.parentNode).toggleClass('active');
            $(this).toggleClass('active');
            searchOptions.slideToggle('slow', function () {
                searchOptions.toggleClass('open');
            });
        });

        $('.wrap-action-filter-search .btn-apply-filter').on('click', function (e) {
            searchOptions.slideUp('slow');
            searchMoreBtn.removeClass('active');
            wrap_btn_filter.removeClass('active');
        });

        // click outside
        $(document).on('click', function (e) {
            if (!$(e.target).closest($('.tfcl-advanced-search-wrap')).length) {
                searchOptions.slideUp('slow', function () {
                    searchOptions.removeClass('open');
                });
                searchMoreBtn.removeClass('active');
                wrap_btn_filter.removeClass('active');
            }
        });
    }

    var addIconRemove = function () {
        var selects = $('.search-listing-form select');        

        $(document).ready(function () {
            selects.each(function(){
                var $this = $(this);
                if ( $this.val() != '' ) {
                    var selectedItem = $this.closest('.form-item').find('.nice-select .current');
                    selectedItem.append('<span class="clear-option"></span>');
                }
            })
        });
        selects.on('change', function(e) {
            e.preventDefault(); 
            var $this = $(this);
            if ($this.val() != '') {
                var selectedItem = $this.closest('.form-item').find('.nice-select .current');
                selectedItem.append('<span class="clear-option"></span>');
            }
            $('.wrap-reset-filter').addClass('active');
        }); 
    }

    var resetOptions = function () {
        $('.search-listing-form').on('click', '.current .clear-option', function(e) {  
            e.stopPropagation();       
            var $select = $(this).closest('.form-item').find('select'); 
            $select.val($select.find('option:first').val());
            $select.niceSelect('destroy');
            $select.trigger('change');
            $select.niceSelect();            
        });
     }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/widget', function ($scope) {
            if (main_variables.toggle_lazy_load == 'on') {
                mainJSTFCL.lazyLoadImage();
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', searchMoreOptions);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', changeConditionFilter);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', addIconRemove);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', resetOptions);
    });

    jQuery(document).ready(function () {
        mainJSTFCL.init();
        addIconRemove();
        resetOptions();
    });
})(jQuery);