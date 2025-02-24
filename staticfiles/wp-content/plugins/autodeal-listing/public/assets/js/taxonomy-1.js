(function ($) {
    'use strict';

    var filterListingAjax = function () {
        var currentURL = new URL(window.location.href);
        var queryData = currentURL.searchParams.toString();
        var decodedQueryData = decodeURIComponent(queryData);
        var currentTax = '';
        var currentTerm = '';

        var layoutArchiveListing = $('#layout_archive_listing').length > 0 ? $('#layout_archive_listing').val() : '';
        var columnLayout = $('#column_layout').length > 0 ? $('#column_layout').val() : '';
        if ($('#current_tax').length > 0 && $('#current_tax').val() !== '') {
            currentTax = $('#current_tax').val();
        }

        if ($('#current_term').length > 0 && $('#current_term').val() !== '') {
            currentTerm = $('#current_term').val();
        }

        $.ajax({
            type: "GET",
            url: taxonomy_variables.ajax_url,
            data: {
                action: 'filter_archive_listing_ajax',
                queryData: decodedQueryData,
                currentTax: currentTax,
                currentTerm: currentTerm,
                layoutArchiveListing: layoutArchiveListing,
                columnLayout: columnLayout
            },
            beforeSend: function () {
                $('.overlay-filter-tab').show();
            },
            success: function (response) {
                $('.overlay-filter-tab').hide();
                $('.group-card-item-listing').empty();
                if (response.html != '') {
                    $('.group-card-item-listing').html(response.html);
                    $('.pagination-wrap').css('display', 'none');
                }

                if (response.message != '') {
                    $('.group-card-item-listing').html(response.message);
                }

                var total_post = response.total_post ? response.total_post : 0;
                var count_post = response.post_count ? response.post_count : 0;
                if ($('.count-post').length > 0) {
                    $('.count-post').html(count_post);
                }

                var result = '';
                if (total_post > 0) {
                    result = 'Show ' + total_post + ' Cars';
                } else {
                    result = 'Show ' + total_post + ' Car';
                }
                $('.wrap-action-filter-search .btn-apply-filter').html(`<i class="icon-autodeal-icon-1"></i> ${result}`);

                $('.count-total').html(total_post);
                $('.text-total').html((total_post <= 1) ? taxonomy_variables.text_result : taxonomy_variables.text_results);
                $('.btn-clear-filter i').removeClass('far fa-spinner fa-spin');
                favorite();
                removeFavorite();
                viewGalleryMagnificPopup();
                listingInMap();
                ajaxPagination();
                checkViewListing();
                
            },
            error: function () {
                console.log('There was error has occurred');
            }
        });
    }

    var favorite = function () {
        $('.tfcl-listing-favorite').on('click', function (event) {
            event.preventDefault();
            var $messages = $('.tfcl_message');
            if (!$(this).hasClass('on-handle')) {
                var $this = $(this).addClass('on-handle'),
                    listing_id = $this.attr('data-tfcl-car-id'),
                    title_not_favorite = $this.attr('data-tfcl-title-not-favorite'),
                    icon_not_favorite = $this.attr('data-tfcl-icon-not-favorite'),
                    title_favorited = $this.attr('data-tfcl-title-favorited'),
                    icon_favorited = $this.attr('data-tfcl-icon-favorited');
                $.ajax({
                    type: 'post',
                    url: listing_variables.ajax_url,
                    dataType: 'json',
                    data: {
                        'action': 'tfcl_favorite_ajax',
                        'listing_id': listing_id
                    },
                    beforeSend: function () {
                        $this.children('i').removeClass(icon_not_favorite).addClass('far fa-spinner fa-spin');
                    },
                    success: function (response) {
                        if ((typeof (response.added) == 'undefined') || (response.added == -1)) {
                            alert(response.message);
                            $this.children('i').addClass(icon_not_favorite);
                        }
                        if (response.added == 1) {
                            $this.children('i').removeClass(icon_not_favorite).addClass(icon_favorited);
                            $this.attr('data-tooltip', title_favorited);
                            $this.addClass('active');
                        } else if (response.added == 0) {
                            $this.children('i').removeClass(icon_favorited).addClass(icon_not_favorite);
                            $this.attr('data-tooltip', title_not_favorite);
                            $this.removeClass('active');
                        } else if (response.added == -1) {
                            alert(response.message);
                            $this.children('i').addClass(icon_not_favorite);
                        }
                        $this.children('i').removeClass('fa-spinner fa-spin');
                        $this.removeClass('on-handle');
                    },
                    error: function () {
                        $this.children('i').removeClass('fa-spinner fa-spin');
                        $this.removeClass('on-handle');
                    }
                });
            }
        });
    }

    var removeFavorite = function () {
        $('.tfcl-favorite-remove').on('click', function (event) {
            event.preventDefault();
            var $messages = $('.tfcl_message');
            var confirmed = confirm(listing_variables.confirm_remove_listing_favorite);
            if (!$(this).hasClass('on-handle') && confirmed) {
                var $this = $(this).addClass('on-handle'),
                    listing_id = $this.attr('data-tfcl-car-id');
                $.ajax({
                    type: 'post',
                    url: listing_variables.ajax_url,
                    dataType: 'json',
                    data: {
                        'action': 'tfcl_favorite_ajax',
                        'listing_id': listing_id
                    },
                    beforeSend: function () {
                        $this.children('i').addClass('fa-spinner fa-spin');
                    },
                    success: function (response) {
                        if ((typeof (response.added) == 'undefined') || response.added == -1) {
                            $messages.empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
                        } else {
                            $this.closest('.favorite-listing').parent('td').parent('tr').remove();
                            var row_data_length = $('#tfcl_my_favorite > tbody >  tr').length
                            if (row_data_length == 0) {
                                resetToPreviousPage();
                            }
                        }
                    },
                    error: function () {
                        $this.children('i').removeClass('fa-spinner fa-spin');
                        $this.removeClass('on-handle');
                    }
                });
            }
        });
    }

    var onClickViewListingType = function () {
        if ($('.tfcl-taxonomy-archive-header').length > 0) {
            $('a.btn-display-listing-grid').click(function (event) {
                event.preventDefault();
                localStorage.setItem('VIEW_LISTING_TYPE', 'grid');
                checkViewListing();
            });
            $('a.btn-display-listing-list').click(function (event) {
                event.preventDefault();
                localStorage.setItem('VIEW_LISTING_TYPE', 'list');
                checkViewListing();
            });
        }
    }

    var checkViewListing = function () {
        if ($('.tfcl-taxonomy-archive-header').length > 0) {
        var type = localStorage.getItem('VIEW_LISTING_TYPE');
        var dataCol = $('.wrap-tfcl-listing-card').data("col");

        switch (type) {
            case 'grid':
                $('.wrap-tfcl-listing-card.cards-item').removeClass('col-md-6 col-6 style-list');
                $('.wrap-tfcl-listing-card.cards-item').addClass(dataCol);
                $('a.btn-display-listing-grid').addClass('active');
                $('a.btn-display-listing-list').removeClass('active');
                break;
            case 'list':
                $('.wrap-tfcl-listing-card.cards-item').removeClass(dataCol);
                $('.wrap-tfcl-listing-card.cards-item').addClass('col-md-6 col-6 style-list');
                $('a.btn-display-listing-list').addClass('active');
                $('a.btn-display-listing-grid').removeClass('active');
                break;
            default:
                break;
        }
        }
    }

    var ajaxPagination = function () {
        $('.paging-navigation-ajax .page-numbers').each(function () {
            $(this).on('click', function (e) {
                e.preventDefault();
                var href = $(this).attr('href');
                var urlSearchParams = new URLSearchParams(href);
                var pageValue = urlSearchParams.get('paged');
                var currentUrl = window.location.href;
                var urlSearchParams = new URLSearchParams(window.location.search);
                if (pageValue !== null) {
                    urlSearchParams.set('page', pageValue);
                } else {
                    urlSearchParams.set('page', 1);
                }
                var newUrl = currentUrl.split('?')[0] + '?' + urlSearchParams.toString();
                window.history.pushState({ path: newUrl }, '', newUrl);
                filterListingAjax();
            });
        });
        $('.paging-navigation-ajax .pagination-button-data').each(function () {
            var pageNumber = $(this).data('page');
            $(this).text(pageNumber);
        })
    }

    var sortListing = function () {
        $('select#listing_order_by').on('change', function () {
            var selected = $(this).find(":selected").val();
            var currentUrl = window.location.href;

            if (currentUrl.indexOf('?') !== -1) {
                if (currentUrl.indexOf('orderBy=') !== -1) {
                    var regex = /(\?|&)orderBy=[^&]*/;
                    currentUrl = currentUrl.replace(regex, '$1orderBy=' + selected);
                } else {
                    currentUrl += '&orderBy=' + selected;
                }
            } else {
                currentUrl += '?orderBy=' + selected;
            }

            window.history.pushState({ path: currentUrl }, '', currentUrl);

            filterListingAjax();
        })
    }

    var viewGalleryMagnificPopup = function () {
        $('[data-mfp-event]').each(function () {
            var $this = $(this),
                defaults = {
                    type: 'image',
                    closeOnBgClick: true,
                    closeBtnInside: false,
                    mainClass: 'mfp-zoom-in',
                    midClick: true,
                    removalDelay: 500,
                    callbacks: {
                        beforeOpen: function () {
                            // just a hack that adds mfp-anim class to markup
                            switch (this.st.type) {
                                case 'image':
                                    this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                                    break;
                                case 'iframe':
                                    this.st.iframe.markup = this.st.iframe.markup.replace('mfp-iframe-scaler', 'mfp-iframe-scaler mfp-with-anim');
                                    break;
                            }
                        },
                        beforeClose: function () { },
                        close: function () { },
                        change: function () {
                            var _this = this;
                            if (this.isOpen) {
                                this.wrap.removeClass('mfp-ready');
                                setTimeout(function () {
                                    _this.wrap.addClass('mfp-ready');
                                }, 10);
                            }
                        }
                    }
                },
                mfpConfig = $.extend({}, defaults, $this.data("mfp-options"));

            var gallery = $this.data('gallery');
            if ((typeof (gallery) !== "undefined")) {
                var items = [],
                    items_src = [];

                if (gallery && gallery.length !== 0) {
                    for (var i = 0; i < gallery.length; i++) {
                        var src = gallery[i];
                        if (items_src.indexOf(src) < 0) {
                            items_src.push(src);
                            items.push({
                                src: src
                            });
                        }
                    }
                }

                mfpConfig.items = items;
                mfpConfig.gallery = {
                    enabled: true
                };
                mfpConfig.callbacks.beforeOpen = function () {
                    switch (this.st.type) {
                        case 'image':
                            this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                            break;
                        case 'iframe':
                            this.st.iframe.markup = this.st.iframe.markup.replace('mfp-iframe-scaler', 'mfp-iframe-scaler mfp-with-anim');
                            break;
                    }
                };
            }
            $this.magnificPopup(mfpConfig);
        });
    }

    var updateUrl = function(e) {
        var currentURL = new URL(window.location.href);
        var searchForm = e.closest('.search-listing-form');
        var searchField = {};
        if (currentURL.searchParams.has('page')) {
            currentURL.searchParams.delete('page');
        }

        // handle select field
        $('.search-form-content .search-field, .tf-search-condition-tab .search-field, .search-more-options .search-field', searchForm).each(function () {
            var $this = $(this);
            var fieldName = $this.attr('name');
            var currentValue = $this.val();
            var defaultValue = $this.data('default-value');
            if (typeof fieldName !== 'undefined') {
                var hasCustomValue = $this.attr('data-select2-id') === "" ? currentValue !== defaultValue && currentValue !== '' : currentValue !== null && currentValue !== defaultValue;
                if (hasCustomValue) {
                    searchField[fieldName] = currentValue;
                } else {
                    currentURL.searchParams.delete(fieldName);
                }
            }
        });

        $('.archive #tfcl-sort-by-options').each(function () {
            var $this = $(this);
            if ($this.val() != '') {
                searchField['orderBy'] = $this.val();
            }
        })

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

    var executeSearchListing = function () {
        var selectSelectors = ['.search-listing-form select'];
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
                            filterListingAjax();
                        },
                    });
                } else {
                    updateUrl($this);
                    filterListingAjax();
                }
            });
        });

        $('.archive .btn-condition-filter').on('click', function () {
            var newCondition = $(this).data('value');
            var currentURL = window.location.href;
            var conditionIndex = currentURL.indexOf('condition=');
            if (newCondition != 'all') {
                if (conditionIndex !== -1) {                    
                    var existingCondition = currentURL.substring(conditionIndex + 10).split('&')[0];            
                    if (existingCondition !== newCondition) {
                        var updatedUrl = currentURL.replace('condition=' + existingCondition, 'condition=' + encodeURIComponent(newCondition));
                        history.pushState({ path: updatedUrl }, '', updatedUrl);
                    }
                } else {
                    var separator = currentURL.indexOf('?') !== -1 ? '&' : '?';
                    var updatedUrl = currentURL + separator + 'condition=' + encodeURIComponent(newCondition);
                    history.pushState({ path: updatedUrl }, '', updatedUrl);
                }
                setTimeout(() => {
                    filterListingAjax();
                });
            }
            else {
                window.location.href = taxonomy_variables.listing_page_url;
            }
        });

        $('.tfcl-advanced-search-wrap .btn-condition-filter, .listing-list-wrap .btn-condition-filter').on('click', function () {
            var $this = $(this);
            if ($this.closest('.archive').length > 0) {
                return;
            }
            updateUrl($this);
            setTimeout(() => {
                filterListingAjax();
            }, 500);
        });

        $('[name="featured"]').on('change', function () {
            var $this = $(this);
            var searchField = {};
            if ($(this).is(':checked')) {
                searchField['featured'] = true;
            } else {
                searchField['featured'] = false;
            }
            updateUrl($this);
            filterListingAjax();
        });

        var otherFeatures = '';
        $('[name="features"]').on('change', function () {
            var $this = $(this),
                value = $this.attr('value');
            if ($this.is(':checked')) {
                otherFeatures += value + ",";
            }
            updateUrl($this);
            filterListingAjax();
        });

        var timeout;
        $('input[type=range]').on('input', function () {
            var $rangeInput = $(this);
            $rangeInput.trigger('change');
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                updateUrl($rangeInput);
                filterListingAjax();
            }, 500);
        });


        var searchField = {}
        $('.archive #tfcl-sort-by-options').on('change', function () {
            var $this = $(this);
            updateUrl($this);
            var currentURL = window.location.href;
            var urlParams = window.location.search;
            var urlParamsObj = new URLSearchParams(urlParams);

            var numKeys = 0;
            for (const key of urlParamsObj.keys()) {
                numKeys++;
            }

            if (numKeys == 1 && urlParamsObj.has("orderBy")) {
                var current_condition = $('#condition').val();
                urlParamsObj.set('condition', current_condition);
                var newUrl = currentURL.split('?')[0] + '?' + urlParamsObj.toString();
                window.history.pushState({ path: newUrl }, '', newUrl);
            }
            filterListingAjax();
        });


        $('.tf-advanced-search-btn').on('click', function (e) {
            e.preventDefault();
            var btnInArchive = $(this).closest('.archive').length > 0;
            var $this = $(this);
            if (btnInArchive) {
                updateUrl($this);
                filterListingAjax();
            }
        });

    }

    var buttonResetFilter = function () {
        $("body").on("click", ".btn-clear-filter", function () {
            var onlyUrl = window.location.href.replace(window.location.search,'');

            setTimeout(() => {
                filterListingAjax();
            }, 300);

            $(this).closest('body').find('.search-listing-form input:checkbox').removeAttr('checked');
            $(this).closest('body').find('.search-listing-form select option').prop("selected", false);
            $(this).closest('body').find('.search-listing-form .search-field').niceSelect('update');
            window.history.pushState({ path: onlyUrl }, '', onlyUrl);
            var sliderWrappers1 = $('.tfcl-slider-range-price-wrap');
            var sliderWrappers2 = $('.tfcl-slider-range-year-wrap');
            var sliderWrappers3 = $('.tfcl-slider-range-mileage-wrap');
            resetSliderView(sliderWrappers1, 'rangeOne', 'rangeTwo', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
            resetSliderView(sliderWrappers2, 'range-year-one', 'range-year-two', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
            resetSliderView(sliderWrappers3, 'range-mileage-one', 'range-mileage-two', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
            $('.btn-clear-filter i').addClass('far fa-spinner fa-spin');
            $('.wrap-reset-filter').removeClass('active');
        });
    }

    if (document.getElementById('map') && listing_variables.map_service == 'map-box') {
        var geoData = {
            "type": "FeatureCollection",
            "features": []
        };
        mapboxgl.accessToken = listing_variables.api_key_map_box ? listing_variables.api_key_map_box : '';
    }

    var mouseoverListingGoogleMap = function (map, infoWindow, marker, infoObj = [], listingId) {
        $('.tfcl-listing-card').on('mouseover', function () {
            if ($(this).find('.card-image .tfcl-image-map').attr('data-id') == listingId) {
                makeInfoWindowEvent(map, infoWindow, marker, infoObj);
            }
        });
    }

    var mouseoverListingMapBox = function (map, geoData) {
        $('.tfcl-listing-card').on('mouseover', function () {
            for (const feature of geoData.features) {
                if ($(this).find('.tfcl-image-map').attr('data-id') == feature.properties.property_id) {
                    jumpToListing(map, feature);
                    createPopupMap(map, feature);
                }
            }
        });
    }

    var getMarkers = function (res, attribute) {
        return {
            "type": "Feature",
            "properties": {
                "id": res.id,
                "title": attribute['title'],
                "location": attribute['data-location'],
                "image": attribute['data-image'],
                "featured": attribute['data-featured'],
                "year": attribute['data-year'],
                "condition": attribute['data-condition'],
                "mileage": attribute['data-mileage'],
                "fuel": attribute['data-fuel'],
                "trans": attribute['data-trans'],
                "price": attribute['data-price'],
                "price_prefix": attribute['data-price-prefix'],
                "price_suffix": attribute['data-price-suffix'],
                "property_id": attribute['data-id']
            },
            "geometry": {
                "type": "Point",
                "coordinates": res.center
            }
        }
    }

    var createPopupMap = function (map, currentListing) {
        var featuredAttr = currentListing.properties.featured != '' ? '<span class="featured">'+ currentListing.properties.featured +'</span>' : '';
        var dateAttr = currentListing.properties.year != '' ? '<span class="date">'+ currentListing.properties.year +'</span>' : '';
        var popupHtml = '<div class="pop-up-map">'
            + '<div class = "popup-content"> '
            + '<div class="popup-thumb">'+ featuredAttr + dateAttr +' <img loading="lazy" src="' + currentListing.properties.image + '" alt="' + currentListing.properties.title + '"></div>'
            + '<div class="pop-main-content">'
            + '<div class="popup-condition">' + currentListing.properties.condition + '</div>'
            + '<div class="popup-title">' + currentListing.properties.title + '</div>'
            + '<ul class="popup-desc"><li class="mileage">' + currentListing.properties.mileage + '</li><li class="fuel">' + currentListing.properties.fuel + '</li><li class="trans">' + currentListing.properties.trans + '</li></ul>'
            + '<div class="popup-price">' + currentListing.properties.price + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        const popUps = document.getElementsByClassName('mapboxgl-popup');
        if (popUps[0]) popUps[0].remove();

        new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            offset: 5,
            focusAfterOpen: false,
            anchor:'left',
        }).setLngLat(currentListing.geometry.coordinates).setHTML(popupHtml).addTo(map);
    }

    var jumpToListing = function (map, currentListing) {
        map.jumpTo({
            center: currentListing.geometry.coordinates,
            zoom: listing_variables.map_zoom,
            pitch: 0,
            bearing: 0,
            essential: true,
            duration: 3000,
            speed: 1,
        });
    }

    var listingInMap = function () {
        var attributesArray = [];
        var elements = document.querySelectorAll('[data-id]');

        elements.forEach(function (element) {
            var attributes = element.attributes;
            var attributeObject = {};
            for (var i = 0; i < attributes.length; i++) {
                var attributeName = attributes[i].name;
                var attributeValue = attributes[i].value;
                attributeObject[attributeName] = attributeValue;
            }
            attributesArray.push(attributeObject);
        });

        const delay = 100;

        if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
            var mapOptions = {
                center: new google.maps.LatLng(16.076305, 108.221548),
                zoom: parseInt(listing_variables.map_zoom),
            };
            var map = new google.maps.Map(document.getElementById('map'), mapOptions);
            var infoObj = [];
            var markers = [];
            var markerClusterOptions = {
                gridSize: 40,
                maxZoom: 15,
                styles: [{
                    width: 50,
                    height: 50,
                    url: 'data:image/svg+xml;base64,' + window.btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path fill="#D01818" stroke="#D01818" stroke-width="10" stroke-opacity="0.25" d="M15,5c5.524,0,10,4.478,10,10s-4.478,10-10,10S5,20.522,5,15S9.478,5,15,5z"/></svg>'),
                    textColor: '#000',
                    textSize: 12
                }]
            };
        }

        if (document.getElementById('map') && listing_variables.map_service == 'map-box') {
            var map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [108.221548, 16.076305], // [lng, lat]
                zoom: listing_variables.map_zoom,
                minZoom: 1,
                gestureHandling: 'cooperative',
                locations: [],
                draggable: false,
                scrollwheel: true,
                navigationControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                pitchWithRotate: false,
                projection: 'equirectangular'
            });
            
            map.addControl(new mapboxgl.NavigationControl());

            map.on('load', () => {
                if (geoData.features.length == 0) return;
                jumpToListing(map, geoData.features[0]);

                map.loadImage(
                    listing_variables.default_marker_image ? listing_variables.default_marker_image :
                        listing_variables.plugin_url + 'public/assets/image/map/mapbox-marker.png',
                    (error, image) => {
                        if (error) throw error;
                        map.addImage('custom-marker', image);
                    });

                map.addSource('properties', {
                    type: 'geojson',
                    data: geoData,
                    cluster: true,
                    clusterMaxZoom: 6, // Max zoom to cluster points on
                    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                });

                map.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'properties',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': [
                            'step',
                            ['get', 'point_count'],
                            '#D01818',
                            100,
                            '#f1f075',
                            750,
                            '#f28cb1'
                        ],
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            20,
                            100,
                            30,
                            750,
                            40
                        ]
                    }
                });

                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'properties',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': ['get', 'point_count_abbreviated'],
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 12
                    }
                });

                map.addLayer({
                    id: 'unclustered-point',
                    type: 'symbol',
                    source: 'properties',
                    filter: ['!', ['has', 'point_count']],
                    layout: {
                        'icon-image': 'custom-marker',
                        'icon-size': 0.55
                    }
                });

                // inspect a cluster on click
                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: ['clusters']
                    });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('properties').getClusterExpansionZoom(
                        clusterId,
                        (err, zoom) => {
                            if (err) return;

                            map.easeTo({
                                center: features[0].geometry.coordinates,
                                zoom: zoom
                            });
                        }
                    );
                });

                map.on('click', 'unclustered-point', (e) => {
                    createPopupMap(map, e.features[0])
                });

                map.on('mouseenter', 'clusters', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'clusters', () => {
                    map.getCanvas().style.cursor = '';
                });
                map.scrollZoom.disable();
            });
            mouseoverListingMapBox(map, geoData);
        }

        attributesArray.forEach(function (attribute) {
            if (attribute['data-location']) {
                setTimeout(function () {
                    if (document.getElementById('map') && listing_variables.map_service == 'map-box') {
                        $.ajax({
                            type: "GET",
                            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + attribute['data-location'] + ".json?access_token=" + mapboxgl.accessToken,
                            success: function (res) {
                                geoData.features.push(getMarkers(res.features[0], attribute));
                            }
                        });
                    }
                    if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
                        geocoder.geocode({ 'address': attribute['data-location'] }, function (results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                map.setCenter(results[0].geometry.location);
                                map.setOptions({ draggable: true });

                                // Create a marker with custom content, image, and title
                                var marker = new google.maps.Marker({
                                    position: results[0].geometry.location,
                                    map: map,
                                    title: attribute['title'],
                                });
                                markers.push(marker);

                                // Create a custom info window
                                var infoWindow = new google.maps.InfoWindow({
                                    maxWidth: 240,
                                    pixelOffset: new google.maps.Size(0, -10),
                                    content: '<div class="pop-up-map">'
                                        + '<div class = "popup-content"> '
                                        + '<div class="popup-thumb"><img src="' + attribute['data-image'] + '" alt="' + attribute['title'] + '"></div>'
                                        + '<div class="pop-main-content">'
                                        + '<div class="popup-title">' + attribute['title'] + '</div>'
                                        + '<div class="popup-address">' + attribute['data-location'] + '</div>'
                                        + '<div class="popup-price">' + attribute['data-price-prefix'] + attribute['data-price'] + attribute['data-price-postfix'] + '</div>'
                                        + '</div>'
                                        + '</div>'
                                        + '</div>'
                                });
                                clickMarkerEvent(map, infoWindow, marker, infoObj);
                                mouseoverListingGoogleMap(map, infoWindow, marker, infoObj, attribute['data-id']);
                            } else {
                                console.log('Geocode was not successful for the following reason: ' + status);
                            }
                        });
                    }
                }, delay)
            }
        });

        if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
            setTimeout(() => {
                new MarkerClusterer(map, markers, markerClusterOptions);
            }, 1500);
        }
    }

    var resetSliderView = function (sliderWrapper, rangeOneName, rangeTwoName, outputOneClass, outputTwoClass, minRequestClass, maxRequestClass, inclRangeClass) {
        var rangeOne = sliderWrapper.find('input[name="' + rangeOneName + '"]'),
            rangeTwo = sliderWrapper.find('input[name="' + rangeTwoName + '"]'),
            outputOne = sliderWrapper.find('.' + outputOneClass),
            outputTwo = sliderWrapper.find('.' + outputTwoClass),
            minRequest = sliderWrapper.find('.' + minRequestClass),
            maxRequest = sliderWrapper.find('.' + maxRequestClass),
            inclRange = sliderWrapper.find('.' + inclRangeClass),
            currencySign = sliderWrapper.find('.tfcl-range-slider-price').data('sign-currency');

        var rangeOneVal = parseInt(rangeOne.attr('min')),
            rangeTwoVal = parseInt(rangeOne.attr('max')),
            rangeOneMax = parseInt(rangeOne.attr('max')),
            rangeMin = parseInt(rangeOne.attr('min'));

        if (currencySign != '' && typeof currencySign != 'undefined') {
            outputOne.html(currencySign + rangeOneVal);
            outputTwo.html(currencySign + rangeTwoVal);
        } else {
            outputOne.html(rangeOneVal);
            outputTwo.html(rangeTwoVal);
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
        sliderWrapper.find('.range-slider .rangeTwo, .range-slider .range-year-two, .range-slider .range-mileage-two').val(rangeOneMax);
        sliderWrapper.find('.range-slider .rangeOne, .range-slider .range-year-one, .range-slider .range-mileage-one').val(rangeMin);
    }

    $(document).ready(function () {
        onClickViewListingType();
        checkViewListing();
        executeSearchListing();
        ajaxPagination();
        sortListing();
        buttonResetFilter();
    })
}(jQuery));