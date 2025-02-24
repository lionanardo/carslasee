var advancedSearch = advancedSearch || {};

(function ($) {
    'use strict';
    var ajaxUrl = '';
    advancedSearch = {

        init: function () {
            if (typeof (advancedSearchVars) === "undefined") {
                return;
            }

            ajaxUrl = advancedSearchVars.ajaxUrl;
            this.executeAdvancedSearch();
            this.checkValidationSaveAdvancedSearchForm();
            this.onClickSaveAdvancedSearch();
            this.onChangeMake();
            this.showHideSearchFieldFeatures();
            this.onLoadFixed();
            this.onScrollFixed();
        },
        executeAdvancedSearch: function () {
            $('.btn-condition-filter').on('click', function (e) {
                e.preventDefault();
                var currentCondition = $(this).siblings('#condition').val();
                var currentUrl = window.location.href;
                var conditionIndex = currentUrl.indexOf('condition=');
                if (conditionIndex !== -1) {
                    var existingCondition = currentUrl.substring(conditionIndex + 10).split('&')[0];
                    if (existingCondition !== currentCondition) {
                        var updatedUrl = currentUrl.replace('condition=' + existingCondition, 'condition=' + encodeURIComponent(currentCondition));
                        history.pushState({ path: updatedUrl }, '', updatedUrl);
                    }
                } else {
                    var separator = currentUrl.indexOf('?') !== -1 ? '&' : '?';
                    var updatedUrl = currentUrl + separator + 'condition=' + encodeURIComponent(currentCondition);
                    history.pushState({ path: updatedUrl }, '', updatedUrl);
                }
            })

            $('.tf-advanced-search-btn').on('click', function (e) {
                e.preventDefault();
                var btnInArchive = $(this).closest('.archive').length > 0;
                if (btnInArchive) {
                    return;
                }

                var searchForm = $(this).closest('.search-listing-form'),
                    searchUrl = searchForm.data('href'),
                    searchField = {},
                    queryString = '?';

                // loop all field search
                $('.search-form-content .search-field, .tf-search-condition-tab .search-field, .search-more-options .search-field').each(function () {
                    var $this = $(this),
                        fieldName = $this.attr('name'),
                        currentValue = $this.val(),
                        defaultValue = $this.data('default-value');

                    if (typeof fieldName !== 'undefined') {
                        // check has value
                        if (currentValue !== defaultValue && currentValue !== null) {
                            searchField[fieldName] = currentValue;
                        }
                    }
                });

                // make new url with field search
                var currentUrl = window.location.href;
                var searchParams = $.param(searchField);

                // Merge query string of current URL with new query string
                queryString += advancedSearch.mergeQueryStrings(advancedSearch.getQueryString(currentUrl), searchParams);
                window.location.href = searchUrl + queryString;
            });
        },
        getQueryString: function (url) {
            var startIndex = url.indexOf("?");
            return startIndex !== -1 ? url.slice(startIndex + 1) : '';
        },
        mergeQueryStrings: function (existingQueryString, newQueryString) {
            var mergedQueryString = existingQueryString;

            // split current query string to pairs key-value
            var existingParams = existingQueryString.split('&');

            // split new query string to pairs key-value
            var newParams = newQueryString.split('&');

            // create object to save key-value from new query string
            var newParamsObj = {};
            newParams.forEach(function (param) {
                var pair = param.split('=');
                newParamsObj[pair[0]] = pair[1];
            });

            // check each pairs key-value of new query string
            // if not exits key in current query string then add key
            newParams.forEach(function (param) {
                var pair = param.split('=');
                var key = pair[0];

                if (!existingParams.some(function (existingParam) {
                    return existingParam.startsWith(key + '=');
                })) {
                    if (mergedQueryString !== '') {
                        mergedQueryString += '&';
                    }
                    mergedQueryString += param;
                }
            });

            return mergedQueryString;
        },
        checkValidationSaveAdvancedSearchForm: function () {
            var $form = $('#tfcl_save_search_form');
            $form.validate({
                errorElement: "div",
                rules: {
                    title: {
                        required: true,
                        minlength: 3
                    },
                },
                messages: {
                    title: "This field is required",
                }
            });
        },
        onClickSaveAdvancedSearch: function () {
            $("#tfcl_save_search").click(function (e) {
                e.preventDefault();
                var $this = $(this);
                var $form = $('#tfcl_save_search_form');
                if ($form.valid()) {
                    $.ajax({
                        url: ajaxUrl,
                        data: $form.serialize(),
                        method: $form.attr('method'),
                        dataType: 'JSON',
                        beforeSend: function () {
                            $this.children('i').remove();
                            $this.append(' <i class="fa fa-spinner fa-spin"></i>');
                        },
                        success: function (response) {
                            if (response.success) {
                                $this.children('i').removeClass('fa-spinner fa-spin');
                                $this.children('i').addClass('fa-check');
                                $('#save_search_advanced_modal').modal('hide');
                                $form.trigger("reset");
                            }
                        },
                        error: function (xhr, status, error) {
                            $this.children('i').removeClass('fa-spinner fa-spin');
                            $this.children('i').addClass('fa-exclamation-triangle');
                            console.log(error);
                        },
                        complete: function () {
                            $this.children('i').removeClass('fa-spinner fa-spin');
                        }
                    });
                }
            });
        },
        showHideSearchFieldFeatures: function () {
            $('.features-wrap .btn-enable-features').on('click', function (event) {
                event.preventDefault();
                $('.features-list').slideToggle();
                $(this).toggleClass('show');
                if ($(this).hasClass('show')) {
                    $('input[name="enable-search-features"]').attr('value', '1');
                    $(this).find('i').removeClass('fa-chevron-down');
                    $(this).find('i').addClass('fa-chevron-up');
                }
                else {
                    $('input[name="enable-search-features"]').attr('value', '0');
                    $(this).find('i').removeClass('fa-chevron-up');
                    $(this).find('i').addClass('fa-chevron-down');
                }
            });
        },
        getModelsByMake: function (e) {
            var css_class_wrap = '.listing-select-meta-box-wrap';
            var modelSelectMetaBox = $(".search-field.tfcl-listing-models-ajax", css_class_wrap);
            if (e.length) {
                var selectedMake = e.find(":selected").val();
                $.ajax({
                    type: "POST",
                    url: ajaxUrl,
                    data: {
                        'action': 'mapping_make_model_ajax',
                        'make': selectedMake,
                        'type': 1,
                        'is_slug': '1'
                    },
                    beforeSend: function () {
                        modelSelectMetaBox.html('');
                        modelSelectMetaBox.append('<i class="fa-left fa fa-spinner fa-spin"></i>');
                    },
                    success: function (res) {
                        modelSelectMetaBox.empty();
                        modelSelectMetaBox.append(res);
                        modelSelectMetaBox.niceSelect('update');
                        var valSelected = modelSelectMetaBox.attr('data-selected');
                        if (typeof valSelected !== 'undefined') {
                            modelSelectMetaBox.val(valSelected);
                        }
                    },
                });
            }
        },
        onChangeMake: function () {
            $(".tfcl-listing-make-ajax").on('change', function () {
                var element = $(this);
                advancedSearch.getModelsByMake(element);
            });
        },
        onLoadFixed: function () {
            if ($('#map').hasClass('no-fixed')) return;
            if (document.getElementById('map')) {
                $('#map').addClass('fixed').removeAttr('style').css({
                    width: $('.map-container').innerWidth() + 'px',
                });
                window.scrollBy(0, 1);

                var top = $('#map').offset().top - parseFloat($('#map').css('marginTop').replace(/auto/, 0));
                var footTop = $('.fixed-map-stopper').offset().top - parseFloat($('.fixed-map-stopper').css('marginTop').replace(/auto/, 0));
                var maxY = footTop - $('#map').innerHeight();
                var windowTop = $(window).scrollTop();

                if (windowTop >= top) {
                    if (windowTop <= maxY) {
                        $('#map').addClass('fixed').removeAttr('style').css({
                            width: $('.map-container').innerWidth() + 'px',
                            top: $('.map-container').offset().top
                        });
                    } 
                }
            }
        },
        onScrollFixed: function () {
            if ($('#map').hasClass('no-fixed')) return;
            if (document.getElementById('map')) {
                this.onLoadFixed();
                var top = $('#map').offset().top - parseFloat($('#map').css('marginTop').replace(/auto/, 0));
                var footTop = $('.fixed-map-stopper').offset().top - parseFloat($('.fixed-map-stopper').css('marginTop').replace(/auto/, 0));
                var maxY = footTop - $('#map').innerHeight();

                $(window).scroll(function (evt) {
                    var y = $(this).scrollTop();
                    if (y >= top) {
                        if (y <= maxY) {
                            $('#map').addClass('fixed').removeAttr('style').css({
                                width: $('.map-container').innerWidth() + 'px',
                                top: '0px',
                            });
                        } 
                    }
                });
            }
        },
    }

    if (advancedSearchVars.inElementor) {
        $(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/tf_search.default', function () {
                advancedSearch.init();
            })
        })
    } else {
        $(document).ready(function () {
            advancedSearch.init();
        })
    }
})(jQuery);