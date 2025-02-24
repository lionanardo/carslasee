(function ($) {

    var formatPositionSliderField = function () {
        $('.tfcl-range-slider-filter .outputTwo').each(function () {
            var $this = $(this);
            $this.css('transform', 'translateX(-' + $this.outerWidth() + 'px)');
        });
    }
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

        if (rangeOneVal < rangeTwoVal) {
            minRequest.val(rangeOneVal);
            maxRequest.val(rangeTwoVal);
        } else {
            minRequest.val(rangeTwoVal);
            maxRequest.val(rangeOneVal);
        }

        var rangeVal1 = parseInt(minRequest.val()),
        rangeVal2 = parseInt(maxRequest.val());


        if (currencySign != '' && typeof currencySign != 'undefined') {
            outputOne.html(currencySign + rangeVal1);
            outputTwo.html(currencySign + rangeVal2);
        } else {
            outputOne.html(rangeVal1);
            outputTwo.html(rangeVal2);
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

    var changeMileageSlider = function () {
        var sliderWrappers = $('.tfcl-slider-range-mileage-wrap');
        handleEventChangeSlider(sliderWrappers, 'range-mileage-one', 'range-mileage-two', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
    }

    var changeDoorSlider = function () {
        var sliderWrappers = $('.tfcl-slider-range-door-wrap');
        handleEventChangeSlider(sliderWrappers, 'range-door-one', 'range-door-two', 'outputOne', 'outputTwo', 'min-input-request', 'max-input-request', 'incl-range');
    }

    $(document).ready(function () {
        changePriceSlider();
        changeYearSlider();
        changeMileageSlider();
        changeDoorSlider();
        formatPositionSliderField();
    });
})(jQuery);