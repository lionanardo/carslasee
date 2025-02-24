(function ($) {

    var onClickPopUp = function ($scope) {
        $scope.find('.tf-compare-elementor .btn-action-compare').each(function () {
            $(this).on('click', function (e) {
                $(this).closest('.tf-compare-elementor').find('.table-compare').addClass('active');
            });
            $('.table-compare .overlay, .table-compare .close').on('click', function () {
                $(this).closest('.tf-compare-elementor').find('.table-compare').removeClass('active');
            });
        });
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/tf_compare_listing.default', onClickPopUp);
    })
})(jQuery);