(function ($) {
    var taxonomyOwlCarousel = function ($scope) {
        if ($().owlCarousel) {
            $scope.find('.tf-taxonomy.has-carousel .owl-carousel').each(function () {
                var $this = $(this),
                    item = $this.data("column"),
                    item1 = $this.data("column1"),
                    item2 = $this.data("column2"),
                    item3 = $this.data("column3"),
                    spacing = $this.data("spacing"),
                    prev_icon = $this.data("prev_icon"),
                    next_icon = $this.data("next_icon");

                var arrow = false;
                if ($this.data("arrow") == 'yes') {
                    arrow = true;
                }

                var loop = false;
                if ($this.data("loop") == 'yes') {
                    loop = true;
                }

                var center = false;
                if ($this.data("center") == 'yes') {
                    center = true;
                }

                var bullets = false;
                if ($this.data("bullets") == 'yes') {
                    bullets = true;
                }

                $this.owlCarousel({
                    margin: spacing,
                    nav: arrow,
                    dots: bullets,
                    autoplayTimeout: 5000,
                    center: center,
                    loop: loop,
                    smartSpeed: 850,
                    autoplayHoverPause: true,
                    navText: ["<i class=\"" + prev_icon + "\"></i>", "<i class=\"" + next_icon + "\"></i>"],
                    responsive: {
                        0: {
                            items: item3,
                            margin: 15
                        },
                        768: {
                            items: item2
                        },
                        1000: {
                            items: item1
                        },
                        1350: {
                            items: item
                        }
                    }
                });

                    

            });
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_taxonomy.default', taxonomyOwlCarousel);
    })

})(jQuery);