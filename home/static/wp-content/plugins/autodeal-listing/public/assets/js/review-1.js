(function ($) {
    'use strict';

    var onChangeRatingStar = function () {
        $('.star-rating').on('click', 'i:not(.disabled-click)', function () {
            var rating = $(this).data('rating');
            var stars = $(this).parent('.star-rating').children();
            for (let i = 0; i < 5; i++) {
                stars[i].classList.remove('active');
            }
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('active');
            }
        });
    }

    var submitReviewDealer = function () {
        $('.tfcl_submit_dealer_review').click(function (e) {
            e.preventDefault();
            var $this = $(this);
            var rating = $this.parents('form').find('.rating-box > i.active').length;
            var rating_element = document.getElementById('rating-submit');
            rating_element.value = rating;

            var rating_customer_service_element = document.getElementById('rating_customer_service_submit');
            var rating_buying_element_element = document.getElementById('rating_buying_submit');
            var rating_overall_element_element = document.getElementById('rating_overall_submit');
            var rating_speed_element_element = document.getElementById('rating_speed_submit');

            rating_customer_service_element.value = $this.parents('form').find('#rating_customer_service.rating-box > i.active').length;
            rating_buying_element_element.value = $this.parents('form').find('#rating_buying.rating-box > i.active').length;
            rating_overall_element_element.value = $this.parents('form').find('#rating_overall.rating-box > i.active').length;
            rating_speed_element_element.value = $this.parents('form').find('#rating_speed.rating-box > i.active').length;

            var $form = $this.parents('form');
            var reviewField = $this.parents('form').find('#review-content');

            if (reviewField.val().trim() === "") {
                $('#review-message-error').html(review_variables.message_required_review);
                $('#review-message-error').css('display', 'block');
                $('#review-message-error').css('color', '#D01818');
                setTimeout(function () {
                    $('#review-message-error').css('display', 'none');
                }, 1500);
                return;
            } else {
                reviewField.next().html("")
            }

            $.ajax({
                type: 'POST',
                url: review_variables.ajaxUrl,
                data: $form.serialize(),
                dataType: 'json',
                beforeSend: function () {
                    $this.children('i').remove();
                    $this.append('<i class="fa-left fa fa-spinner fa-spin"></i>');
                },
                success: function () {
                    window.location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('The following error occurred: ' + textStatus, errorThrown);
                },
                complete: function () {
                    $this.children('i').removeClass('fa fa-spinner fa-spin');
                    $this.children('i').addClass('fa fa-check');
                }
            });

        });
    }

    var handleEditReviewDealer = function () {
        $('.tfcl-btn-edit-review-dealer').on('click', function (e) {
            e.preventDefault();
            var reviewItem = $(this).closest('.review-item');
            var editForm = reviewItem.find('.tfcl-form-edit-review');
            reviewItem.find('.review-content').toggle();
            reviewItem.find('.rating-wrap').toggle();
            editForm.slideToggle();
        });

        $('.tfcl-btn-update-review-dealer').on('click', function (e) {
            e.preventDefault();
            var $this = $(this);
            var reviewItem = $(this).closest('.review-item');
            var editForm = $this.closest('.tfcl-form-edit-review');
            var commentID = editForm.data('id');
            var reviewContent = editForm.siblings('.review-content');
            var ratingWrap = editForm.siblings('.rating-wrap');
            var newReview = $('#tfcl-edit-review-' + commentID).val().trim();
            var security_nonce = $('#tfcl_security_update_review').val();
            var updateReviewMessage = reviewItem.find('.tfcl_update_review_message');

            var starRatingCustomerServiceEl = reviewItem.find('.rating-wrap .rating-box #dealer_customer_service_rating');
            var starRatingBuyingProcessEl = reviewItem.find('.rating-wrap .rating-box #dealer_buying_rating');
            var starRatingOverallExperienceEl = reviewItem.find('.rating-wrap .rating-box #dealer_overall_rating');
            var starRatingSpeedEl = reviewItem.find('.rating-wrap .rating-box #dealer_speed_rating');

            var ratingCustomerServiceElement = document.getElementById('edit_rating_customer_service');
            var ratingBuyingProcessElement = document.getElementById('edit_rating_buying_process');
            var ratingOverallExperienceElement = document.getElementById('edit_rating_overall_experience');
            var ratingSpeedElement = document.getElementById('edit_rating_speed');

            var newRatingValue = editForm.find('.edit_rating').val();
            ratingCustomerServiceElement.value = editForm.find('#dealer_customer_service_rating.star-rating > i.active').length;
            ratingBuyingProcessElement.value = editForm.find('#dealer_buying_rating.star-rating > i.active').length;
            ratingOverallExperienceElement.value = editForm.find('#dealer_overall_rating.star-rating > i.active').length;
            ratingSpeedElement.value = editForm.find('#dealer_speed_rating.star-rating > i.active').length;

            var data = {
                'action': 'tfcl_update_review_dealer_ajax',
                'tfcl_security_update_review': security_nonce,
                'reviewID': commentID,
                'newReview': newReview,
                'newRating': newRatingValue,
                'newRatingCustomerService': ratingCustomerServiceElement.value,
                'newRatingBuyingProcess': ratingBuyingProcessElement.value,
                'newRatingOverallExperience': ratingOverallExperienceElement.value,
                'newRatingSpeed': ratingSpeedElement.value
            }

            $.ajax({
                type: 'POST',
                url: main_variables.ajaxUrl,
                data: data,
                beforeSend: function () {
                    $this.children('i').remove();
                    $this.append('<i class="fa-left fa fa-spinner fa-spin"></i>');
                },
                success: function (response) {
                    $this.children('i').removeClass('fa fa-spinner fa-spin');

                    if (response.status) {
                        reviewContent.text(response.content);

                        starRatingCustomerServiceEl.find('.star').each(function (index) {
                            if (index < response.ratingCustomerService) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        starRatingBuyingProcessEl.find('.star').each(function (index) {
                            if (index < response.ratingBuyingProcess) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        starRatingOverallExperienceEl.find('.star').each(function (index) {
                            if (index < response.ratingOverallExperience) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        starRatingSpeedEl.find('.star').each(function (index) {
                            if (index < response.ratingSpeed) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        updateReviewMessage.text(response.message).css('color', 'green').fadeIn().delay(4000).fadeOut('slow', function () {
                            $(this).text('');
                        });
                        reviewContent.show();
                        ratingWrap.show();
                        editForm.slideUp();
                        //calcPercentOverallRatingDealerAjax();
                    } else {
                        $this.children('i').removeClass('fa-spinner fa-spin').addClass('fa-exclamation-triangle');
                        updateReviewMessage.text(response.message).css('color', 'red').fadeIn();
                    }
                },
                error: function (xhr, status, error) {
                    $this.children('i').removeClass('fa-spinner fa-spin').addClass('fa-exclamation-triangle');
                    console.log('The following error occurred: ' + status, error);
                },
                complete: function () {
                    $this.children('i').removeClass('fa fa-spinner fa-spin');
                }
            });
        });

        $(document).on('click', '.edit-star-rating-box .star', function () {
            var value_edit_rating = $(this).closest('.review-item').find('.edit_rating');
            $(this).addClass('active');
            $(this).prevAll('.star').addClass('active');
            $(this).nextAll('.star').removeClass('active');
            var rating = $(this).closest('.review-item').find('.edit-start-rating.active').length;
            // set value of input hidden rating
            value_edit_rating.val(rating);
        });
    }

    var calcPercentOverallRatingDealerAjax = function () {
        var dealerId = $('input[name="dealer_id"]').val();
        $.ajax({
            type: 'POST',
            url: review_variables.ajaxUrl,
            data: {
                'action': 'tfcl_calc_overall_rating_dealer_ajax',
                'dealerId': dealerId,
                'tfcl_security_calc_overall_rating': review_variables.calc_overall_rating_ajax_nonce
            },
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (res) {
                $('.overall-number').text(res);
                var overallRating = (res / 5) * 100;
                $('#progress-rating').attr('data-percent', overallRating);
                setTimeout(() => {
                    calcPercentOverallRating(overallRating);
                }, 300);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('The following error occurred: ' + textStatus, errorThrown);
            },
        });
    }

    var submitReviewSingleListing = function () {
        $('.tfcl-submit-listing-rating').click(function (e) {
            e.preventDefault();
            var $this = $(this);
            var rating_comfort_element = document.getElementById('rating_comfort_submit');
            var rating_performance_element = document.getElementById('rating_performance_submit');
            var rating_interior_design_element = document.getElementById('rating_interior_design_submit');
            var rating_speed_element = document.getElementById('rating_speed_submit');

            rating_comfort_element.value = $this.parents('form').find('#rating_comfort_service.star-rating > i.active').length;
            rating_performance_element.value = $this.parents('form').find('#rating_performance.star-rating > i.active').length;
            rating_interior_design_element.value = $this.parents('form').find('#rating_interior_design.star-rating > i.active').length;
            rating_speed_element.value = $this.parents('form').find('#rating_speed.star-rating > i.active').length;

            var $form = $this.parents('form');
            var reviewField = $this.parents('form').find('#review');

            if (reviewField.val().trim() == "") {
                console.log(review_variables.message_required_review);
                e.preventDefault();
                $('#review-message-error').html(review_variables.message_required_review);
                $('#review-message-error').css('display', 'block');
                $('#review-message-error').css('color', '#D01818');
                setTimeout(function () {
                    $('#review-message-error').css('display', 'none');
                }, 1500);
                return;
            } else {
                reviewField.next().html("");
            }

            $.ajax({
                type: 'POST',
                url: review_variables.ajaxUrl,
                data: $form.serialize(),
                dataType: 'json',
                beforeSend: function () {
                    $this.children('i').remove();
                    $this.append('<i class="fa-left fa fa-spinner fa-spin"></i>');
                },
                success: function () {
                    window.location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('The following error occurred: ' + textStatus, errorThrown);
                },
                complete: function () {
                    $this.children('i').removeClass('fa fa-spinner fa-spin');
                    $this.children('i').addClass('fa fa-check');
                }
            });
        });
    }

    var handleEditReviewSingleListing = function () {
        $('.tfcl-btn-edit-review').on('click', function (e) {
            e.preventDefault();
            var reviewItem = $(this).closest('.review-item');
            var editForm = reviewItem.find('.tfcl-form-edit-review');
            reviewItem.find('.review-content').toggle();
            reviewItem.find('.rating-wrap').toggle();
            editForm.slideToggle();
        });

        $('.tfcl-btn-update-review').on('click', function (e) {
            e.preventDefault();
            var $this = $(this);
            var reviewItem = $(this).closest('.review-item');
            var editForm = $this.closest('.tfcl-form-edit-review');
            var commentID = editForm.data('id');
            var reviewContent = editForm.siblings('.review-content');
            var ratingWrap = editForm.siblings('.rating-wrap');
            var newReview = $('#tfcl-edit-review-' + commentID).val().trim();
            var security_nonce = $('#tfcl_security_update_review').val();
            var updateReviewMessage = reviewItem.find('.tfcl_update_review_message');

            var starRatingComfortEl = reviewItem.find('.rating-wrap .rating-box #rating_comfort_service');
            var starRatingPerformanceEl = reviewItem.find('.rating-wrap .rating-box #rating_performance');
            var starRatingInteriorDesignEl = reviewItem.find('.rating-wrap .rating-box #rating_interior_design');
            var starRatingSpeedEl = reviewItem.find('.rating-wrap .rating-box #rating_speed');

            var ratingComfortElement = document.getElementById('edit_rating_comfort');
            var ratingPerformanceElement = document.getElementById('edit_rating_performance');
            var ratingInteriorDesignElement = document.getElementById('edit_rating_interior_design');
            var ratingSpeedElement = document.getElementById('edit_rating_speed');

            var newRatingValue = editForm.find('.edit_rating').val();
            ratingComfortElement.value = editForm.find('#rating_comfort_service.star-rating > i.active').length;
            ratingPerformanceElement.value = editForm.find('#rating_performance.star-rating > i.active').length;
            ratingInteriorDesignElement.value = editForm.find('#rating_interior_design.star-rating > i.active').length;
            ratingSpeedElement.value = editForm.find('#rating_speed.star-rating > i.active').length;

            var data = {
                'action': 'tfcl_update_review_listing_ajax',
                'tfcl_security_update_review': security_nonce,
                'reviewID': commentID,
                'newReview': newReview,
                'newRating': newRatingValue,
                'newRatingComfort': ratingComfortElement.value,
                'newRatingPerformance': ratingPerformanceElement.value,
                'newRatingInteriorDesign': ratingInteriorDesignElement.value,
                'newRatingSpeed': ratingSpeedElement.value
            }

            $.ajax({
                type: 'POST',
                url: main_variables.ajaxUrl,
                data: data,
                beforeSend: function () {
                    $this.children('i').remove();
                    $this.append('<i class="fa-left fa fa-spinner fa-spin"></i>');
                },
                success: function (response) {
                    $this.children('i').removeClass('fa fa-spinner fa-spin');

                    if (response.status) {
                        reviewContent.text(response.content);

                        starRatingComfortEl.find('.star').each(function (index) {
                            if (index < response.ratingComfort) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        starRatingPerformanceEl.find('.star').each(function (index) {
                            if (index < response.ratingPerformance) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        starRatingInteriorDesignEl.find('.star').each(function (index) {
                            if (index < response.ratingInteriorDesign) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        starRatingSpeedEl.find('.star').each(function (index) {
                            if (index < response.ratingSpeed) {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        });

                        updateReviewMessage.text(response.message).css('color', 'green').fadeIn().delay(4000).fadeOut('slow', function () {
                            $(this).text('');
                        });
                        reviewContent.show();
                        ratingWrap.show();
                        editForm.slideUp();
                        //calcPercentOverallRatingListingAjax();
                    } else {
                        $this.children('i').removeClass('fa-spinner fa-spin').addClass('fa-exclamation-triangle');
                        updateReviewMessage.text(response.message).css('color', 'red').fadeIn();
                    }
                },
                error: function (xhr, status, error) {
                    $this.children('i').removeClass('fa-spinner fa-spin').addClass('fa-exclamation-triangle');
                    console.log('The following error occurred: ' + status, error);
                },
                complete: function () {
                    $this.children('i').removeClass('fa fa-spinner fa-spin');
                }
            });
        });

        $(document).on('click', '.edit-star-rating-box .star', function () {
            var value_edit_rating = $(this).closest('.review-item').find('.edit_rating');
            $(this).addClass('active');
            $(this).prevAll('.star').addClass('active');
            $(this).nextAll('.star').removeClass('active');
            var rating = $(this).closest('.review-item').find('.edit-start-rating.active').length;
            // set value of input hidden rating
            value_edit_rating.val(rating);
        });
    }

    var calcPercentOverallRatingListingAjax = function () {
        var listingId = $('input[name="listing_id"]').val();
        $.ajax({
            type: 'POST',
            url: review_variables.ajaxUrl,
            data: {
                'action': 'tfcl_calc_overall_rating_single_listing_ajax',
                'listingId': listingId,
                'tfcl_security_calc_overall_rating': review_variables.calc_overall_rating_ajax_nonce
            },
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (res) {
                $('.overall-rating-number').text(res);
                var overallRating = (res / 5) * 100;
                $('#progress-rating').attr('data-percent', overallRating);
                setTimeout(() => {
                    calcPercentOverallRating(overallRating);
                }, 300);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('The following error occurred: ' + textStatus, errorThrown);
            },
        });
    }

    var calcPercentOverallRating = function (overallRating) {
        var progressCircle = $('#progress-rating');
        var percent = overallRating ? overallRating : progressCircle.data('percent');
        var circumference = 2 * Math.PI * progressCircle.attr('r');
        var dashValue = ((100 - percent) / 100) * circumference;
        progressCircle.css('stroke-dasharray', `${circumference}px ${circumference}px`);
        progressCircle.css('stroke-dashoffset', dashValue);
    }

    var clickViewMore = function () {
        $(document).ready(function () {
            var speed = {duration: 400}; 
            var countList = $(".viewmore-action.reviews-list li").length;
            var numberShow=3;
            $('.viewmore-action.reviews-list li:lt('+numberShow+')').slideDown(speed);
            $('.dealer-customer-review .view-more-button, .listing-reviews .view-more-button').click(function () {
                numberShow= (numberShow+5 <= countList) ? numberShow+5 : countList;
                $('.viewmore-action.reviews-list li:lt('+numberShow+')').slideDown(speed);
                if(numberShow == countList){
                    $('.dealer-customer-review .view-more-button, .listing-reviews .view-more-button').slideUp(speed);
                }
            });
        });
    }

    $(document).ready(function () {
        onChangeRatingStar();
        submitReviewDealer();
        handleEditReviewDealer();
        submitReviewSingleListing();
        handleEditReviewSingleListing();
        calcPercentOverallRating();
        clickViewMore();
    });
})(jQuery);