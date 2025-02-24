(function ($) {
    var listingOwlCarousel = function ($scope) {
        if ($().owlCarousel) {
            $scope.find('.tf-listing-wrap.has-carousel .owl-carousel').each(function () {
                var
                    $this = $(this),
                    item = $this.data("column"),
                    item2 = $this.data("column2"),
                    item3 = $this.data("column3"),
                    item4 = $this.data("column4"),
                    spacing = $this.data("spacing"),
                    prev_icon = $this.data("prev_icon"),
                    next_icon = $this.data("next_icon");

                var loop = false;
                if ($this.data("loop") == 'yes') {
                    loop = true;
                }

                var arrow = false;
                if ($this.data("arrow") == 'yes') {
                    arrow = true;
                }

                var bullets = false;
                if ($this.data("bullets") == 'yes') {
                    bullets = true;
                }

                var auto = false;
                if ($this.data("auto") == 'yes') {
                    auto = true;
                }
                
                $this.owlCarousel({
                    loop: loop,
                    margin: spacing,
                    nav: arrow,
                    dots: bullets,
                    autoplay: auto,
                    autoplayTimeout: 5000,
                    smartSpeed: 850,
                    autoplayHoverPause: true,
                    navText: ["<i class=\"" + prev_icon + "\"></i>", "<i class=\"" + next_icon + "\"></i>"],
                    responsive: {
                        0: {
                            items: item3,
                            margin: 10
                        },
                        768: {
                            items: item2,
                            margin: 20
                        },
                        1000: {
                            items: item4
                        },
                        1400: {
                            items: item
                        }
                    }
                });
            });
        }
    }

    var swiperGalleryImages = function () {
        if ($('.tf-listing-wrap.has-swiper').length) {
            $(this).delay(300).queue(function () {
                new Swiper(".swiper-container.carousel-image-box", {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true,
                    },
                });
                $(this).dequeue();
            });
        }
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


    var ajax_filter_tab = function () {
        
        $('.filter-bar .filter-listing-ajax').off('click').on('click', function (e) {          
            e.preventDefault();  

            var btn = $(this), 
                data = btn.closest('.wrap-listing-post'),        
                listing_slug = $(this).data('slug'),
                price_min = $(this).data('price-min'),
                price_max = $(this).data('price-max'),
                listing_per_page = data.data('listing-per-page'),
                taxonomy_list = data.data('taxonomy-list'),
                show_counter = data.data('show-counter'),
                carousel = data.data('carousel'),
                show_year = data.data('show-year'),
                enable_compare_listing = data.data('enable-compare-listing'),
                enable_favorite_listing = data.data('enable-favorite-listing'),
                swiper_image_box = data.data('swiper-image-box'),                
                limit_swiper_images = data.data('limit-swiper-images'),
                show_mileages = data.data('show-mileages'),
                show_type_fuel = data.data('show-type-fuel'),
                show_transmission = data.data('show-transmission'),
                show_make = data.data('show-make'),
                show_model = data.data('show-model'),
                show_body = data.data('show-body'),
                show_stock_number = data.data('show-stock-number'),
                show_vin_number = data.data('show-vin-number'),
                show_drive_type = data.data('show-drive-type'),
                show_engine_size = data.data('show-engine-size'),
                show_cylinders = data.data('show-cylinders'),
                show_door = data.data('show-door'),
                show_color = data.data('show-color'),
                show_seat = data.data('show-seat'),
                show_city_mpg = data.data('show-city-mpg'),
                show_highway_mpg = data.data('show-highway-mpg'),
                button_text = data.data('button-text'),
                order_by = data.data('order-by'),
                order = data.data('order'),
                style = data.data('style');


            btn.closest('.filter-bar').find('a.filter-listing-ajax').removeClass('active');
            btn.addClass('active'); 

            var loading = '<span class="loading-icon"><span class="dot-flashing"></span></span>';

            if(limit_swiper_images == '') {
                limit_swiper_images = 3;
            }
            $.ajax({
                url: tf_listing_vars.ajax_url,
                method: 'post',
                data: {
                    action: 'tfcl_get_listing_by_taxonomy',
                    listing_slug: listing_slug,
                    price_min: price_min,
                    price_max: price_max,
                    listing_per_page: listing_per_page,
                    taxonomy_list:taxonomy_list,
                    show_counter:show_counter,
                    swiper_image_box:swiper_image_box,
                    show_year:show_year,
                    enable_compare_listing:enable_compare_listing,
                    enable_favorite_listing:enable_favorite_listing,
                    limit_swiper_images:limit_swiper_images,
                    show_mileages:show_mileages,
                    show_type_fuel:show_type_fuel,
                    show_transmission:show_transmission,
                    show_make:show_make,
                    show_model:show_model,
                    show_body:show_body,
                    show_stock_number:show_stock_number,
                    show_vin_number:show_vin_number,
                    show_drive_type:show_drive_type,
                    show_engine_size:show_engine_size,
                    show_cylinders:show_cylinders,
                    show_door:show_door,
                    show_color:show_color,
                    show_seat:show_seat,
                    show_city_mpg:show_city_mpg,
                    show_highway_mpg:show_highway_mpg,
                    button_text:button_text,
                    order_by:order_by,
                    order:order,                    
                    style:style
                },
                beforeSend: function () {
                    btn.closest('.wrap-listing-post').find('.listing').append(loading);
                },
                success: function (response) {                    
                    response = JSON.parse(response);
                    if(carousel == 'yes') {
                       
                        btn.closest('.wrap-listing-post').find('.listing .owl-carousel').html(response.content);
                        var $this = btn.closest('.wrap-listing-post').find('.listing .owl-carousel'),
                            item = $this.data("column"),
                            item2 = $this.data("column2"),
                            item3 = $this.data("column3"),
                            item4 = $this.data("column4"),
                            spacing = $this.data("spacing"),
                            prev_icon = $this.data("prev_icon"),
                            next_icon = $this.data("next_icon");

                        var loop = false;
                        if ($this.data("loop") == 'yes') {
                            loop = true;
                        }
        
                        var arrow = false;
                        if ($this.data("arrow") == 'yes') {
                            arrow = true;
                        }
        
                        var bullets = false;
                        if ($this.data("bullets") == 'yes') {
                            bullets = true;
                        }
        
                        var auto = false;
                        if ($this.data("auto") == 'yes') {
                            auto = true;
                        }

                        $this.owlCarousel('destroy');
                        
                        $this.owlCarousel({
                            loop: loop,
                            margin: spacing,
                            nav: arrow,
                            dots: bullets,
                            autoplay: auto,
                            autoplayTimeout: 5000,
                            smartSpeed: 850,
                            autoplayHoverPause: true,
                            navText: ["<i class=\"" + prev_icon + "\"></i>", "<i class=\"" + next_icon + "\"></i>"],
                            responsive: {
                                0: {
                                    items: item3,
                                    margin: 10
                                },
                                768: {
                                    items: item2,
                                    margin: 20
                                },
                                1000: {
                                    items: item4
                                },
                                1400: {
                                    items: item
                                }
                            }
                        });
                        
                    } else {
                        btn.closest('.wrap-listing-post').find('.listing').html(response.content);
                    }
                   
                    swiperGalleryImages();
                    viewGalleryMagnificPopup();
                    favorite();
                    removeFavorite();
                    

                    btn.closest('.wrap-listing-post').find('.listing .loading-icon').remove();
                }
            });
        });
        
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

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_listing_list.default', ajax_filter_tab);
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_listing_list.default', listingOwlCarousel);

    });
})(jQuery);