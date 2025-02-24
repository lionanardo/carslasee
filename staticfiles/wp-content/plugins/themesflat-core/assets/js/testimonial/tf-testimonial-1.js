;(function($) {

    "use strict";

    var testimonial_Carousel = function() {
        if ( $().owlCarousel ) {
            $('.tf-testimonial-carousel').each(function(){
                var
                $this = $(this),
                item = $this.data("column"),
                item2 = $this.data("column2"),
                item3 = $this.data("column3"),
                spacer = Number($this.data("spacer")),
                prev_icon = $this.data("prev_icon"),
                next_icon = $this.data("next_icon"),
                index_active = $this.data("index_active");

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
                
                $('.has-overlay').on('initialized.owl.carousel translate.owl.carousel', function(e){
                    var idx = e.item.index;
                    $(this).find('.owl-item').removeClass('active_overlay');
                    $(this).find('.owl-item').eq(idx+2).addClass('active_overlay');
                });

                $this.find('.owl-carousel').owlCarousel({
                    loop: loop,
                    margin: spacer,
                    nav: arrow,
                    dots: bullets,
                    autoplay: auto,
                    autoplayTimeout: 5000,
                    smartSpeed: 850,
                    autoplayHoverPause: true,
                    navText : ["<i class=\""+prev_icon+"\"></i>","<i class=\""+next_icon+"\"></i>"],
                    responsive: {
                        0:{
                            items:item3
                        },
                        768:{
                            items:item2
                        },
                        1000:{
                            items:item
                        }
                    }
                });
                
            });
        }
    }

    // Mouse Custom Cursor
    var custom_cursor = function() { 
        var tfCursor = jQuery(".tfmouseCursor");
        if (tfCursor.length) {
        if ($("body")) {
            const e = document.querySelector(".cursor-inner");
            let n,
            i = 0,
            o = !1;
            (window.onmousemove = function (s) {
            o ||
                (e.style.transform =
                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                (n = s.clientY),
                (i = s.clientX);
            }),
            $("body").on("mouseenter", "button, a, .cursor-pointer, .owl-dots", function () {
                e.classList.add("cursor-hover");
            }),
            $("body").on("mouseleave", "button, a, .cursor-pointer, .owl-dots", function () {
                ($(this).is("a", "button") &&
                $(this).closest(".cursor-pointer").length) ||
                (e.classList.remove("cursor-hover"));
            }),
            (e.style.visibility = "visible");
        }
        }
    }

    var listCarousel = function() {
        if ( $().owlCarousel ) {
            $('.tf-list-carousel').each(function(){
                var
                $this = $(this),
                tes1 = $this.data("column"),
                tes2 = $this.data("column2"),
                tes3 = $this.data("column3");

                var arrow = false;
                if ($this.data("arrow") == 'yes') {
                    arrow = true;
                } 

                $this.find('.owl-carousel').owlCarousel({
                    margin: 24,
                    autoplayTimeout: 5000,
                    smartSpeed: 850,
                    slideSpeed: 500,
                    nav: arrow,
                    dots: false,
                    navText : ["<i class='icon-autodeal-angle-left'></i>","<i class='icon-autodeal-angle-right'></i>"],
                    responsive: {
                        0: {
                            items: tes3
                        },
                        768: {
                            items: tes2
                        },
                        1000: {
                            items: tes1
                        },
                    }
                });
            });

        }
    }


    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/tf-testimonial-carousel.default', testimonial_Carousel );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/tf-testimonial-carousel.default', custom_cursor );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/tf-list-carousel.default', listCarousel );
    });

})(jQuery);
