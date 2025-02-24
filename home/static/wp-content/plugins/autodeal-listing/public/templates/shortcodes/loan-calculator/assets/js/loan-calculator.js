(function ($) {
    var loanCalculator = function () {
        var totalAmount, downPayment, amortizationPeriod, interestRate;
        totalAmount = $('#total_amount').val().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        downPayment = $('#down_payment').val().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        amortizationPeriod = $('#amortization_period').val().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        interestRate = $('#interest_rate').val().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        $('#total_amount').val(totalAmount);
        $('#down_payment').val(downPayment);
        $('#amortization_period').val(amortizationPeriod);
        $('#interest_rate').val(interestRate);
        $('#loan_calculator_form').submit(function (e) {
            e.preventDefault();
            $(this).validate({
                errorElement: "span",
                rules: {
                    total_amount: {
                        required: true,
                    },
                    amortization_period: {
                        required: true,
                    },
                    interest_rate: {
                        required: true,
                    },
                },
            });
            totalAmount = parseFloat($('#total_amount').val().replace(/,/g, ''), 10);
            downPayment = parseFloat($('#down_payment').val().replace(/,/g, ''), 10);
            amortizationPeriod = parseFloat($('#amortization_period').val().replace(/,/g, ''), 10);
            interestRate = parseFloat($('#interest_rate').val().replace(/,/g, ''), 10);
            totalAmount = downPayment ? totalAmount - downPayment : totalAmount;
            var monthlyPayment = '';
            if (totalAmount && amortizationPeriod && interestRate) {
                monthlyPayment = totalAmount * ((interestRate / 100) / 12) / (1 - (Math.pow((1 + (((interestRate / 100) / 12))), -amortizationPeriod)));
                $('.loan-calculator-form .group-calculator').addClass('active')
                $('.loan-calculator-form .group-calculator').removeAttr('hidden');
                $('.loan-calculator-form #monthly-payment-value').text(Math.round(monthlyPayment * 100) / 100);
            } else {
                $('.loan-calculator-form #monthly-payment-value').text(0);
            }
            $('.loan-calculator-form #down-payment-value').text(downPayment);
        });
    }

    var addCommaInputNumber = function () {
        $(".loan-calculator-form input[type='text']").keyup(function (event) {
            // skip for arrow keys
            if (event.which >= 37 && event.which <= 40) {
                event.preventDefault();
            }
            $(this).val(function (index, value) {
                return value
                    .replace(/\D/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            });
        });
    }

    var handleResetLoanCalculatorForm = function () {
        $('#btn_loan_reset').click(function () {
            $('#total_amount').val('');
            $('#down_payment').val('');
            $('#amortization_period').val('');
            $('#interest_rate').val('');
        })
    }

    $(document).ready(function () {
        loanCalculator();
        addCommaInputNumber();
        handleResetLoanCalculatorForm();
    })
})(jQuery);