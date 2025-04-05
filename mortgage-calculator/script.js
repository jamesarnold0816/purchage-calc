$(document).ready(function() {
    // Initialize the calculator
    initializeSliders();
    initializeInputs();
    setupEventListeners();
    
    // Hide results initially for animation
    $('.payment-amount .amount, .breakdown-value, .summary-value, .balance-value, .effective-value').css('opacity', '0');
    
    // Calculate mortgage first
    calculateMortgage();
    
    // Show initial values with animation
    setTimeout(function() {
        // Make elements visible with animation
        $('.payment-amount .amount, .breakdown-value, .summary-value, .balance-value, .effective-value')
            .css('opacity', '1')
            .addClass('value-changing');
        
        // Remove animation class after delay
        setTimeout(function() {
            $('.payment-amount .amount, .breakdown-value, .summary-value, .balance-value, .effective-value')
                .removeClass('value-changing');
        }, 1000);
    }, 300);
    
    // Initialize tabs
    $('.tab').on('click', function() {
        $('.tab').removeClass('active');
        $(this).addClass('active');
        
        const tabId = $(this).data('tab');
        $('.tab-pane').removeClass('active');
        $(`#${tabId}-tab-content`).addClass('active');
    });
});

// Format currency values
function formatCurrency(value) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Format currency values with decimals
function formatCurrencyWithDecimals(value) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Format percentage values
function formatPercent(value) {
    return value.toFixed(2) + '%';
}

// Parse currency input
function parseCurrency(value) {
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[$,]/g, ''));
    }
    return value;
}

// Initialize input fields with default values
function initializeInputs() {
    // Set default values
    $('#mortgage-amount').val(formatCurrency(500000));
    $('#rate').val('6.29%');
    $('#amortization-years').val('25 years');
    $('#amortization-months').val('0 months');
    
    // Set active rate type
    $('#fixed-rate').addClass('active');
    $('#variable-rate').removeClass('active');
}

// Initialize all sliders
function initializeSliders() {
    // Setup Mortgage Amount Slider
    setupSlider('.mortgage-amount-slider', 100000, 2000000, parseCurrency($('#mortgage-amount').val()), function(value) {
        $('#mortgage-amount').val(formatCurrency(value));
        calculateMortgage();
        updateResultsWithAnimation();
    });
    
    // Setup Amortization Slider
    setupSlider('.amortization-slider', 5, 30, 25, function(value) {
        $('#amortization-years').val(value + ' years');
        $('#amortization-months').val('0 months');
        calculateMortgage();
        updateResultsWithAnimation();
    });
}

// Setup a generic slider with custom range and callback
function setupSlider(selector, min, max, initialValue, callback) {
    const slider = $(selector);
    const track = slider.find('.slider-track');
    const thumb = slider.find('.slider-thumb');
    
    // Set initial position
    const percentage = ((initialValue - min) / (max - min)) * 100;
    track.css('width', percentage + '%');
    thumb.css('left', percentage + '%');
    
    // Handle slider click and drag
    slider.on('mousedown', function(e) {
        e.preventDefault();
        
        const handleSliderMove = function(event) {
            const sliderWidth = slider.width();
            const sliderOffset = slider.offset().left;
            let position = event.pageX - sliderOffset;
            
            // Constrain position
            position = Math.max(0, Math.min(position, sliderWidth));
            
            // Calculate percentage and value
            const percent = position / sliderWidth * 100;
            const value = min + (max - min) * (percent / 100);
            
            // Round value appropriately
            const roundedValue = (max > 1000) ? Math.round(value / 100) * 100 : Math.round(value);
            
            // Update slider visuals
            track.css('width', percent + '%');
            thumb.css('left', percent + '%');
            
            // Call callback with new value
            callback(roundedValue);
        };
        
        // Initial move
        handleSliderMove(e);
        
        // Setup move and release handlers
        $(document).on('mousemove', handleSliderMove);
        $(document).on('mouseup', function() {
            $(document).off('mousemove', handleSliderMove);
        });
    });
}

// Setup event listeners for input fields and buttons
function setupEventListeners() {
    // Mortgage amount input change
    $('#mortgage-amount').on('input', function() {
        const value = parseCurrency($(this).val());
        
        if (!isNaN(value)) {
            $(this).val(formatCurrency(value));
            updateSliderFromInput('mortgage-amount', value);
            calculateMortgage();
            updateResultsWithAnimation();
        }
    });
    
    // Rate input change
    $('#rate').on('input', function() {
        let value = $(this).val().replace(/[^\d.]/g, '');
        
        // Ensure proper format for rate (e.g., "5.5")
        if (value) {
            // Remove % if present
            value = value.replace('%', '');
            $(this).val(value + '%');
            
            calculateMortgage();
            updateResultsWithAnimation();
        }
    });
    
    // Payment frequency change
    $('#payment-frequency').on('change', function() {
        calculateMortgage();
        updateResultsWithAnimation();
    });
    
    // Amortization input changes
    $('#amortization-years, #amortization-months').on('input', function() {
        const yearsText = $('#amortization-years').val();
        const monthsText = $('#amortization-months').val();
        
        // Parse years (remove " years" text)
        let years = parseInt(yearsText.replace(/[^\d]/g, '')) || 0;
        // Parse months (remove " months" text)
        let months = parseInt(monthsText.replace(/[^\d]/g, '')) || 0;
        
        // Constrain years to valid range
        years = Math.min(Math.max(years, 1), 30);
        
        // Constrain months to valid range
        months = Math.min(Math.max(months, 0), 11);
        
        // Update the input field values with proper formatting
        $('#amortization-years').val(years + ' years');
        $('#amortization-months').val(months + ' months');
        
        // Update amortization slider
        updateSliderFromInput('amortization-years', years);
        
        calculateMortgage();
        updateResultsWithAnimation();
    });
    
    // Rate type buttons
    $('.rate-button').on('click', function() {
        $('.rate-button').removeClass('active');
        $(this).addClass('active');
        calculateMortgage();
        updateResultsWithAnimation();
    });
    
    // Rate term change
    $('#rate-term').on('change', function() {
        calculateMortgage();
        updateResultsWithAnimation();
    });
    
    // Pay faster toggle
    $('#pay-faster-toggle').on('change', function() {
        if ($(this).is(':checked')) {
            // Show additional payment options (could be expanded)
            alert('Additional payment options would be shown here');
        }
        calculateMortgage();
        updateResultsWithAnimation();
    });
    
    // View schedule link
    $('.view-schedule-link').on('click', function(e) {
        e.preventDefault();
        alert('Amortization schedule would be shown here');
    });
    
    // Get report button
    $('#get-report-btn').on('click', function() {
        alert('Get Report functionality would be implemented here');
    });
    
    // Download App link
    $('.app-note').on('click', function() {
        alert('App download link would be implemented here');
    });
    
    // Settings icon
    $('.settings-icon').on('click', function() {
        alert('Settings functionality would be implemented here');
    });
}

// Update slider position based on input ID and value
function updateSliderFromInput(inputId, value) {
    let slider, min, max;
    
    if (inputId === 'mortgage-amount') {
        slider = $('.mortgage-amount-slider');
        min = 100000;
        max = 2000000;
    } else if (inputId === 'amortization-years') {
        slider = $('.amortization-slider');
        min = 5;
        max = 30;
    } else {
        return; // Unknown input
    }
    
    // Calculate percentage
    const percent = ((value - min) / (max - min)) * 100;
    const constrainedPercent = Math.max(0, Math.min(percent, 100));
    
    // Update slider visuals
    slider.find('.slider-track').css('width', constrainedPercent + '%');
    slider.find('.slider-thumb').css('left', constrainedPercent + '%');
}

// Calculate mortgage payment and related values
function calculateMortgage() {
    // Get input values
    const mortgageAmount = parseCurrency($('#mortgage-amount').val());
    const rateText = $('#rate').val();
    const rate = parseFloat(rateText.replace(/[^\d.]/g, '')) || 6.29;
    const amortizationYearsText = $('#amortization-years').val();
    const amortizationMonthsText = $('#amortization-months').val();
    
    // Parse amortization values
    const amortizationYears = parseInt(amortizationYearsText.replace(/[^\d]/g, '')) || 25;
    const amortizationMonths = parseInt(amortizationMonthsText.replace(/[^\d]/g, '')) || 0;
    
    // Total amortization in months
    const totalAmortizationMonths = (amortizationYears * 12) + amortizationMonths;
    
    // Get payment frequency
    const paymentFrequency = $('#payment-frequency').val();
    
    // Get term length in years
    const termYears = parseInt($('#rate-term').val()) || 5;
    
    // Calculate monthly interest rate (annual rate / 12 / 100)
    const monthlyInterestRate = rate / 12 / 100;
    
    // Calculate monthly payment using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    // Where P = payment, L = loan amount, c = monthly interest rate, n = number of payments
    const monthlyPayment = (mortgageAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalAmortizationMonths)) / 
                         (Math.pow(1 + monthlyInterestRate, totalAmortizationMonths) - 1);
    
    // Calculate payment amounts for different frequencies
    let paymentAmount, paymentFrequencyText;
    
    switch(paymentFrequency) {
        case 'biweekly':
            paymentAmount = (monthlyPayment * 12) / 26;
            paymentFrequencyText = 'Bi-weekly';
            break;
        case 'accelerated':
            paymentAmount = (monthlyPayment * 12) / 24;
            paymentFrequencyText = 'Accelerated Bi-weekly';
            break;
        case 'weekly':
            paymentAmount = (monthlyPayment * 12) / 52;
            paymentFrequencyText = 'Weekly';
            break;
        case 'acc-weekly':
            paymentAmount = (monthlyPayment * 12) / 48;
            paymentFrequencyText = 'Accelerated Weekly';
            break;
        default:
            paymentAmount = monthlyPayment;
            paymentFrequencyText = 'Monthly';
    }
    
    // Calculate principal and interest portion of the first payment
    const firstPaymentInterest = mortgageAmount * monthlyInterestRate;
    const firstPaymentPrincipal = monthlyPayment - firstPaymentInterest;
    
    // Calculate term values (over the selected term)
    const numPaymentsInTerm = termYears * 12;
    
    // Calculate term summary values using simplified approach
    // For more accuracy, an amortization schedule would be calculated
    let termPrincipal = 0;
    let termInterest = 0;
    let remainingBalance = mortgageAmount;
    
    for (let i = 0; i < numPaymentsInTerm; i++) {
        const monthlyInterest = remainingBalance * monthlyInterestRate;
        const monthlyPrincipal = monthlyPayment - monthlyInterest;
        
        termPrincipal += monthlyPrincipal;
        termInterest += monthlyInterest;
        remainingBalance -= monthlyPrincipal;
    }
    
    // Calculate total interest over the full amortization period
    const totalPayments = monthlyPayment * totalAmortizationMonths;
    const totalInterest = totalPayments - mortgageAmount;
    
    // Calculate the breakdown percentages for the chart
    const principalPercentage = (firstPaymentPrincipal / monthlyPayment) * 100;
    const interestPercentage = (firstPaymentInterest / monthlyPayment) * 100;
    
    // Update the UI with calculated values
    updateCalculatorResults({
        paymentAmount: paymentAmount,
        paymentFrequency: paymentFrequencyText,
        principalPercentage: principalPercentage,
        interestPercentage: interestPercentage,
        firstPaymentPrincipal: firstPaymentPrincipal,
        firstPaymentInterest: firstPaymentInterest,
        totalPayment: paymentAmount,
        termLength: termYears,
        termPrincipal: termPrincipal,
        termInterest: termInterest,
        termTotalPayments: termPrincipal + termInterest,
        balanceEndOfTerm: remainingBalance,
        amortizationPeriod: amortizationYears + (amortizationMonths > 0 ? ' years ' + amortizationMonths + ' months' : ' years'),
        totalPrincipal: mortgageAmount,
        totalInterest: totalInterest,
        totalCost: mortgageAmount + totalInterest
    });
}

// Update the calculator results in the UI
function updateCalculatorResults(results) {
    // Update main payment amount and frequency
    $('.payment-amount .amount').text(formatCurrency(results.paymentAmount));
    $('.payment-amount .frequency').text(results.paymentFrequency);
    
    // Update payment breakdown chart
    $('.principal-bar').css('width', results.principalPercentage + '%');
    $('.interest-bar').css('width', results.interestPercentage + '%');
    
    // Update payment breakdown values
    $('.breakdown-item.principal .breakdown-value').text(formatCurrencyWithDecimals(results.firstPaymentPrincipal));
    $('.breakdown-item.interest .breakdown-value').text(formatCurrencyWithDecimals(results.firstPaymentInterest));
    $('.total-payment .total-value').text(formatCurrencyWithDecimals(results.totalPayment));
    
    // Update term summary values
    $('.term-summary .summary-item:nth-child(1) .summary-value').text(results.termLength + ' years');
    $('.term-summary .summary-item:nth-child(2) .summary-value').text(formatCurrency(results.termPrincipal));
    $('.term-summary .summary-item:nth-child(3) .summary-value').text(formatCurrency(results.termInterest));
    $('.term-summary .summary-item:nth-child(4) .summary-value').text(formatCurrency(results.termTotalPayments));
    $('.term-summary .summary-item:nth-child(5) .summary-value').text(formatCurrencyWithDecimals(results.balanceEndOfTerm));
    
    // Update total summary values
    $('.total-summary .summary-item:nth-child(1) .summary-value').text(results.amortizationPeriod);
    $('.total-summary .summary-item:nth-child(2) .summary-value').text(formatCurrency(results.totalPrincipal));
    $('.total-summary .summary-item:nth-child(3) .summary-value').text(formatCurrency(results.totalInterest));
    $('.total-summary .summary-item:nth-child(4) .summary-value').text(formatCurrency(results.totalCost));
    
    // Update balance at end of term and effective amortization
    $('.balance-value').text(formatCurrencyWithDecimals(results.balanceEndOfTerm));
    $('.effective-value').text(results.amortizationPeriod);
}

// Animate updating results
function updateResultsWithAnimation() {
    // Add animation class to highlight changing values
    $('.payment-amount .amount, .breakdown-value, .summary-value, .balance-value, .effective-value')
        .addClass('value-changing');
    
    // Remove the animation class after a delay
    setTimeout(function() {
        $('.payment-amount .amount, .breakdown-value, .summary-value, .balance-value, .effective-value')
            .removeClass('value-changing');
    }, 1000);
} 