(function ($) {

    var updateSliderView = function (sliderWrapper, rangeOneName, rangeTwoName, outputOneClass, outputTwoClass, minRequestClass, maxRequestClass, inclRangeClass) {
        var rangeOne = sliderWrapper.find('input[name="' + rangeOneName + '"]'),
            rangeTwo = sliderWrapper.find('input[name="' + rangeTwoName + '"]'),
            outputOne = sliderWrapper.find('.' + outputOneClass),
            outputTwo = sliderWrapper.find('.' + outputTwoClass),
            minRequest = sliderWrapper.find('.' + minRequestClass),
            maxRequest = sliderWrapper.find('.' + maxRequestClass),
            inclRange = sliderWrapper.find('.' + inclRangeClass),
            currencySign = sliderWrapper.find('.tfcl-range-slider-price').data('sign-currency');

        var rangeOneVal = parseInt(rangeOne.val()),
            rangeTwoVal = parseInt(rangeTwo.val()),
            rangeOneMax = parseInt(rangeOne.attr('max')),
            rangeMin = parseInt(rangeOne.attr('min'));

            var rangeVal1 = parseInt(minRequest.val()),
            rangeVal2 = parseInt(maxRequest.val());
    
    
            if (currencySign != '' && typeof currencySign != 'undefined') {
                outputOne.html(currencySign + rangeVal1);
                outputTwo.html(currencySign + rangeVal2);
            } else {
                outputOne.html(rangeVal1);
                outputTwo.html(rangeVal2);
            }

        if (rangeOneVal < rangeTwoVal) {
            minRequest.val(rangeOneVal);
            maxRequest.val(rangeTwoVal);
        } else {
            minRequest.val(rangeTwoVal);
            maxRequest.val(rangeOneVal);
        }

        var outputOnePos = (rangeOneVal - rangeMin) / (rangeOneMax - rangeMin) * 100 + '%',
            outputTwoPos = (rangeTwoVal - rangeMin) / (rangeOneMax - rangeMin) * 100 + '%',
            inclRangePos,
            inclRangeWidth;

        if (rangeOneVal > rangeTwoVal) {
            inclRangeWidth = (rangeOneVal - rangeTwoVal) / (rangeOneMax - rangeMin) * 100 + '%';
            inclRangePos = outputTwoPos;
        } else {
            inclRangeWidth = (rangeTwoVal - rangeOneVal) / (rangeOneMax - rangeMin) * 100 + '%';
            inclRangePos = outputOnePos;
        }

        outputOne.css('left', outputOnePos);
        outputTwo.css('left', outputTwoPos);
        inclRange.css('width', inclRangeWidth);
        inclRange.css('left', inclRangePos);
    }

    var handleEventChangeSlider = function (sliderWrappers, fieldMin, fieldMax, outputMinClass, outputMaxClass, minRequestClass, maxRequestClass, inclRangeClass) {
        sliderWrappers.each(function () {
            var currentSlider = $(this);
            updateSliderView(currentSlider, fieldMin, fieldMax, outputMinClass, outputMaxClass, minRequestClass, maxRequestClass, inclRangeClass);

            currentSlider.find('input[type="range"]').on({
                mouseup: function () {
                    $(this).blur();
                },
                mousedown: function () {
                    updateSliderView(currentSlider, fieldMin, fieldMax, outputMinClass, outputMaxClass, minRequestClass, maxRequestClass, inclRangeClass);
                },
                input: function () {
                    updateSliderView(currentSlider, fieldMin, fieldMax, outputMinClass, outputMaxClass, minRequestClass, maxRequestClass, inclRangeClass);
                }
            });
        });
    }

    var changePriceSlider = function () {
        var sliderWrappers = $('.tfcl-slider-range-price-wrap');
        handleEventChangeSlider(sliderWrappers, 'rangeOne', 'rangeTwo', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
    }

    var changeYearSlider = function () {
        var sliderWrappers = $('.tfcl-slider-range-year-wrap');
        handleEventChangeSlider(sliderWrappers, 'range-year-one', 'range-year-two', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
    }

    var changeDoorSlider = function () {
        var sliderWrappers = $('.tfcl-slider-range-door-wrap');
        handleEventChangeSlider(sliderWrappers, 'range-door-one', 'range-door-two', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
    }

    var loadQuantityListing = function () {
        var currentURL = new URL(window.location.href);
        var queryData = currentURL.searchParams.toString();
        var decodedQueryData = decodeURIComponent(queryData);
        $.ajax({
            type: "GET",
            url: taxonomy_variables.ajax_url,
            data: {
                action: 'get_quantity_listing_ajax',
                queryData: decodedQueryData
            },
            beforeSend: function () {
                $('.tf-search-wrap .tf-advanced-search-btn.filter').text('');
                $('.tf-search-wrap .tf-advanced-search-btn.filter').append('<i class="fa-left fa fa-spinner fa-spin"></i>');
            },
            success: function (response) {
                var btnSearch = $('.tf-search-wrap .tf-advanced-search-btn.filter');
                var numberListing = parseInt(response.total_post);
                var result = '';
                if (numberListing > 1) {
                    result = numberListing + ' Cars';
                } else {
                    result = numberListing + ' Car';
                }
                btnSearch.html(`${result}<i class="icon-autodeal-icon-1"></i>`)

            },
            error: function () {
                console.log('There was error has occurred');
            }
        });
    }

    var changeUrl = function () {
        function updateUrl(e) {
            var currentURL = new URL(window.location.href);
            var searchForm = e.closest('.search-listing-form ');
            var searchField = {};
            // handle select field
            $('.search-form-content .search-field, .tf-search-condition-tab .search-field, .search-more-options .search-field',searchForm).each(function () {
                var $this = $(this);
                var fieldName = $this.attr('name');
                var currentValue = $this.val();
                var defaultValue = $this.data('default-value');


                if (typeof fieldName !== 'undefined') {
                    var hasCustomValue = $this.attr('data-select2-id') === "" ? currentValue !== defaultValue && currentValue !== '' : currentValue !== null && currentValue !== defaultValue;

                    if (hasCustomValue) {
                        searchField[fieldName] = currentValue;
                        console.log(searchField);
                    } else {
                        currentURL.searchParams.delete(fieldName);
                    }
                }
                
            });
            

            // handle range slider
            if (e.closest('.tfcl-range-slider-filter').length > 0) {
                var fieldNameMin = e.siblings('.min-input-request').attr('name');
                var fieldNameMax = e.siblings('.max-input-request').attr('name');
                var currentValueMin = e.siblings('.min-input-request').val();
                var currentValueMax = e.siblings('.max-input-request').val();
                var defaultValueMin = e.closest('.tfcl-range-slider-filter').data('min-default');
                var defaultValueMax = e.closest('.tfcl-range-slider-filter').data('max-default');

                if (currentValueMax == defaultValueMax && currentValueMin == defaultValueMin) {
                    searchField[fieldNameMin] = defaultValueMin;
                    searchField[fieldNameMax] = defaultValueMax;
                }
                if (currentValueMin != defaultValueMin || currentValueMax != defaultValueMax) {
                    searchField[fieldNameMin] = currentValueMin;
                    searchField[fieldNameMax] = currentValueMax;
                }
            }

            // handle features field
            var otherFeatures = $('[name="features"]:checked', searchForm).map(function () {
                return $(this).attr('value');
            }).get().join(',');

            if (otherFeatures !== '') {
                searchField['features'] = otherFeatures;
            } else {
                currentURL.searchParams.delete('features');
            }

            // handle featured field
            var isFeatured = $('[name="featured"]:checked', searchForm).length > 0;

            if (isFeatured) {
                searchField['featured'] = 'true';
            } else {
                currentURL.searchParams.delete('featured');
            }

            // if change at make then reset model
            if (e.attr('name') === 'make') {
                currentURL.searchParams.delete('model');
            }

            // Merge values of searchField into URL
            for (var key in searchField) {
                currentURL.searchParams.set(key, searchField[key]);
            }

            // update url
            history.pushState({}, '', currentURL.toString());
        }

 
        var selectSelectors = ['.tf-search-wrap .search-listing-form select'];
        selectSelectors.forEach(function (selector) {
            $(selector).on('change', function (e) {
           
                e.preventDefault();
                var $this = $(this);
                if ($(this).is('[name=make]')) {
                    var modelSelectMetaBox = $(".search-field.tfcl-listing-models-ajax");
                    $.ajax({
                        type: "POST",
                        url: taxonomy_variables.ajax_url,
                        data: {
                            'action': 'mapping_make_model_ajax',
                            'make': $this.val(),
                            'type': 1,
                            'is_slug': '1'
                        },
                        success: function (res) {
                            modelSelectMetaBox.empty();
                            modelSelectMetaBox.append(res);
                            modelSelectMetaBox.niceSelect('update');
                            var valSelected = modelSelectMetaBox.attr('data-selected');
                            if (typeof valSelected !== 'undefined') {
                                modelSelectMetaBox.val(valSelected);
                            }
                            updateUrl($this);
                            if ($this.closest('.tfcl-search-form-top').length) {
                                loadQuantityListing();
                            }
                        },
                    });
                } else {
                    $("select.search-field.tfcl-listing-models-ajax").find('option').attr("selected",false) ;
                    updateUrl($this);
                    if ($this.closest('.tfcl-search-form-top').length) {
                        loadQuantityListing();
                    }
                }
            });
        });

        $('.tf-search-condition-tab .btn-condition-filter').on('click', function (e) {
            var $this = $(this);
            updateUrl($this);
            loadQuantityListing();
        });

        $('.tf-search-wrap [name="featured"]').on('change', function () {
            var $this = $(this);
            var searchField = {};
            if ($(this).is(':checked')) {
                searchField['featured'] = true;
            } else {
                searchField['featured'] = false;
            }
            updateUrl($this);
            if ($this.closest('.tfcl-search-form-top').length) {
                loadQuantityListing();
            }
        });

        var otherFeatures = '';
        $('.tf-search-wrap [name="features"]').on('change', function () {
            var $this = $(this),
                value = $this.attr('value');
            if ($this.is(':checked')) {
                otherFeatures += value + ",";
            }

            updateUrl($this);
            if ($this.closest('.tfcl-search-form-top').length) {
                loadQuantityListing();
            }
        });

        var timeout;
        $('input[type=range]').on('input', function () {
            var $rangeInput = $(this);
            $rangeInput.trigger('change');
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                updateUrl($rangeInput);
                if ($rangeInput.closest('.tfcl-search-form-top').length) {
                    loadQuantityListing();
                }
            }, 500);
        });
    }
    

    var showHideSearchMoreOptions = function () {
        var search_more_options_desktop = $('.tf-search-wrap .search-more-options.desktop');
        var search_more_options_mobile = $('.tf-search-wrap .search-more-options.mobile');
        search_more_options_desktop.hide();
        search_more_options_mobile.hide();

        $('.tf-search-wrap .tf-search-more-btn').on('click', function (e) {
            e.stopPropagation();

            $(this.parentNode).toggleClass('active');
            $(this).toggleClass('active');

            if (window.matchMedia("(max-width: 480px)").matches) {
                if (search_more_options_mobile.hasClass('open')) {
                    search_more_options_mobile.slideUp(function () {
                        search_more_options_mobile.removeClass('open');
                    });
                } else {
                    search_more_options_mobile.slideDown("slow", function () {
                        search_more_options_mobile.addClass('open');
                    });
                }
                search_more_options_desktop.slideUp("slow", function () {
                    search_more_options_desktop.removeClass('open');
                });
            } else {
                if (search_more_options_desktop.hasClass('open')) {
                    search_more_options_desktop.slideUp(function () {
                        search_more_options_desktop.removeClass('open');
                    });
                } else {
                    search_more_options_desktop.slideDown("slow", function () {
                        search_more_options_desktop.addClass('open');
                    });
                }
                search_more_options_mobile.slideUp("slow", function () {
                    search_more_options_mobile.removeClass('open');
                });
            }
        });

        $(document).on('click', function (e) {
            var elementWrap = $('.tf-search-wrap');
            var btn_filter = $('.tf-search-more-btn', elementWrap);
            var wrap_btn_filter = $('.tf-wrap-search-more-btn', elementWrap);
            var search_more_options = $('.search-more-options', elementWrap);

            if (!$(e.target).closest(elementWrap).length) {
                search_more_options.slideUp("slow", function () {
                    search_more_options.removeClass('open');
                });
                btn_filter.removeClass('active');
                wrap_btn_filter.removeClass('active');
            }
        });
    }

    $(document).ready(function() {
        $('.tf-search-wrap .group-radio-select input[name="selectSearch"]').click(function() {
          var selectedValue = $(this).val();
          if (selectedValue === 'budget') {
            $(this).closest('.tfcl-search-form-top').find('.by-budget-option').addClass('active');
            $(this).closest('.tfcl-search-form-top').find('.by-brand-option').removeClass('active');
          } else {
            $(this).closest('.tfcl-search-form-top').find('.by-brand-option').addClass('active');
            $(this).closest('.tfcl-search-form-top').find('.by-budget-option').removeClass('active');
          }
        });
      });

    $(window).on('elementor/frontend/init', function () {
        $('.tf-search-wrap .search-more-options').hide();
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', changePriceSlider);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', changeYearSlider);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', changeDoorSlider);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', changeUrl);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', showHideSearchMoreOptions);
    })
})(jQuery);