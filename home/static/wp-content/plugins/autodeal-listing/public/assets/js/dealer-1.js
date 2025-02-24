(function ($) {
    'use strict';

    var onChangeOrderByDealer = function () {
        $('#tfcl-sort-by-options').on('change', function () {
            if ($(this).closest('.archive').length > 0) {
                return;
            }
            var newURL = $('#tfcl-sort-by-options').val();
            window.location.href = newURL;
        });
    }

    var onChangeOrderDealerList = function () {
        $('#tfcl-sort-by-order').on('change', function () {
            var newURL = $('#tfcl-sort-by-order').val();
            window.location.href = newURL;
        });
    }

    var replaceUrlParam = function (url, paramName, paramValue) {
        if (paramValue == null) {
            paramValue = '';
        }
        var updatedURL = url.replace(/\/page\/\d+/, '');
        var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
        if (updatedURL.search(pattern) >= 0) {
            return updatedURL.replace(pattern, '$1' + paramValue + '$2');
        }
        updatedURL = updatedURL.replace(/[?#]$/, '');
        return updatedURL + (updatedURL.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
    }

    var toggleView = function () {
        $('.tfcl-dealer-listing-shortcode .tfcl-view-by button').on('click', function (e) {
            e.preventDefault();
            $('.tfcl-dealer-listing-shortcode .tfcl-view-by button').removeClass('active')
            $(this).addClass('active');
            var view = $(this).data('view');
            var newURL = replaceUrlParam(window.location.href, 'view', view);
            window.location.href = newURL;
        })

        $('.filter-dealer-listing-shortcode .tfcl-view-by button').on('click', function (e) {
            e.preventDefault();
            $('.filter-dealer-listing-shortcode .tfcl-view-by button').removeClass('active');
            $(this).addClass('active');

            var view = $(this).data('view');
            var newURL = replaceUrlParam(window.location.href, 'view-by', view);
            window.location.href = newURL;
        })
    }

    var dealerListingCarousel = function () {
        if ($('.interactive-hoverable .hoverable-wrap').length > 0) {
            var thumb = $('.interactive-hoverable .hoverable-wrap');
            thumb.owlCarousel({
                items: 1,
                slideSpeed: 5000,
                nav: false,
                autoplay: true,
                dots: false,
                loop: true,
                touchDrag: false,
                mouseDrag: false,
                responsiveRefreshRate: 200,
            });
        }
    }

    var getListingsByCondition = function (condition, dealer_id) {
        if (dealer_id != '') {
            $.ajax({
                type: "post",
                url: dealer_variables.ajax_url,
                data: {
                    action: 'tfcl_get_all_listing_by_condition_ajax',
                    condition: condition,
                    dealer_id: dealer_id,
                    nonce: dealer_variables.dealer_filter_listing_nonce
                },
                beforeSend: function () {
                    $('#filter-tab-content .overlay-filter-tab').show();
                },
                success: function (response) {
                    $('#filter-tab-content .overlay-filter-tab').hide();
                    $('.filter-dealer-listing-shortcode #filter-tab-content-inner').html(response);
                },
                error: function (xhr, status, error) {
                    console.log(error);
                }
            });
        }
    }

    var filterListListingDealer = function () {
        var defaultCondition = $('#wrapp-dealer-listing-title').data('tabdefault');
        var dealer_id = $('#wrapp-dealer-listing-title').data('dealer');
        $('.wrapp-dealer-listing-title .dealer-tab-title:first-child').addClass('active');
        $('.wrapp-dealer-listing-title .dealer-tab-title').click(function () {
            $('.wrapp-dealer-listing-title .dealer-tab-title').removeClass('active');
            $(this).addClass('active');
            var condition = $(this).data('condition');
            getListingsByCondition(condition, dealer_id);
        });
        getListingsByCondition(defaultCondition, dealer_id);
    }

    var swiperGalleryImages = function () {
        if ($('.swiper-container.carousel-image-box').length > 0) {
            new Swiper(".swiper-container.carousel-image-box", {
                slidesPerView: 1,
                spaceBetween: 30,
                navigation: {
                    clickable: true,
                    nextEl: ".swiper-button-next2",
                    prevEl: ".swiper-button-prev2",
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                    dynamicBullets: true,
                    dynamicMainBullets: 1
                },
            });
        }
    }

    var dealerLocationInMap = function () {
        mapboxgl.accessToken = listing_variables.api_key_map_box ? listing_variables.api_key_map_box : '';
        var location = $('#dealer-location-info').val();
        fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(location) + '.json?access_token=' + mapboxgl.accessToken)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var location = data.features[0].center;
                if (document.getElementById('map-dealer')) {
                    var map = new mapboxgl.Map({
                        container: 'map-dealer',
                        style: 'mapbox://styles/mapbox/streets-v12',
                        center: [location[0], location[1]],
                        zoom: 12
                    });
                }

                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundImage = `url(${listing_variables.default_marker_image ? listing_variables.default_marker_image :
                    listing_variables.plugin_url + 'public/assets/image/map/map-marker.png'})`;
                el.style.width = listing_variables.marker_image_width;
                el.style.height = listing_variables.marker_image_height;
                el.style.backgroundSize = '50%';
                el.style.backgroundRepeat = 'no-repeat';
                var marker = new mapboxgl.Marker({ element: el, draggable: false })
                    .setLngLat([location[0], location[1]])
                    .addTo(map);
            })
            .catch(function (error) {
                console.log('Has an error  ', error);
            });
    }

    var clickViewMoreListing = function () {
        $(document).ready(function () {
            var speed = {duration: 400}; 
            var countList = $(".dealer-inventory-content .row .wrap-tfcl-listing-card").length;
            var numberShow=3;
            $('.dealer-inventory-content .row .wrap-tfcl-listing-card:lt('+numberShow+')').slideDown(speed);
            $('.dealer-inventory-content .view-more-button').click(function () {
                numberShow= (numberShow+5 <= countList) ? numberShow+5 : countList;
                $('.dealer-inventory-content .row .wrap-tfcl-listing-card:lt('+numberShow+')').slideDown(speed);
                if(numberShow == countList){
                    $('.dealer-inventory-content .view-more-button').slideUp(speed);
                }
            });
        });
    }

    $(document).ready(function () {
        dealerListingCarousel();
        onChangeOrderByDealer();
        onChangeOrderDealerList();
        toggleView();
        filterListListingDealer();
        clickViewMoreListing();
        swiperGalleryImages();
        dealerLocationInMap();
    })
})(jQuery);