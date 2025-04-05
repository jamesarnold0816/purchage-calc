$(document).ready(function() {
    // Initialize the calculator
    initializeSliders();
    initializeInputs();
    setupEventListeners();
    
    // Hide results initially for animation
    $('.result-value, .result-amount, .detail-value').css('opacity', '0');
    
    // Calculate required income first
    calculateRequiredIncome();
    setupResultsBoxScroll();
    
    // Show initial values with animation
    setTimeout(function() {
        // Make elements visible with animation
        $('.result-value, .result-amount, .detail-value')
            .css('opacity', '1')
            .addClass('value-changing');
        
        // Remove animation class after delay
        setTimeout(function() {
            $('.result-value, .result-amount, .detail-value')
                .removeClass('value-changing');
        }, 1500);
    }, 300);
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
    $('#monthly-debt').val(formatCurrency(250));
    $('#property-tax-yearly').val(formatCurrency(4000));
    $('#property-tax-monthly').val(formatCurrency(4000 / 12));
    $('#condo-fees').val(formatCurrency(0));
    $('#heat').val(formatCurrency(1200));
    $('#rate').val('5.5');
    $('#amortization-years').val('25');
    $('#amortization-months').val('0');
    
    // Initialize affordability level
    $('.affordability-slider .slider-thumb').css('left', '30%');
    $('.affordability-slider').data('gds', 39);
    $('.affordability-slider').data('tds', 44);
    
    // Set active rate type
    $('.rate-type button:first-child').addClass('active');
}

// Initialize all sliders
function initializeSliders() {
    // Setup Mortgage Amount Slider
    setupSlider('.mortgage-amount-slider', 100000, 2000000, parseCurrency($('#mortgage-amount').val()), function(value) {
        $('#mortgage-amount').val(formatCurrency(value));
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Setup Monthly Debt Slider
    setupSlider('.monthly-debt-slider', 0, 5000, parseCurrency($('#monthly-debt').val()), function(value) {
        $('#monthly-debt').val(formatCurrency(value));
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Setup Heat Slider
    setupSlider('.heat-slider', 0, 5000, parseCurrency($('#heat').val()), function(value) {
        $('#heat').val(formatCurrency(value));
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Setup Amortization Slider
    setupSlider('.amortization-slider', 5, 30, parseInt($('#amortization-years').val()), function(value) {
        $('#amortization-years').val(value);
        $('#amortization-months').val('0');
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Setup Affordability Slider
    $('.affordability-slider').on('mousedown', function(e) {
        e.preventDefault();
        handleAffordabilitySlider(e);
        
        $(document).on('mousemove', handleAffordabilitySlider);
        $(document).on('mouseup', function() {
            $(document).off('mousemove', handleAffordabilitySlider);
        });
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
    
    // Handle slider click
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

// Handle the affordability slider specifically
function handleAffordabilitySlider(e) {
    const slider = $('.affordability-slider');
    const thumb = slider.find('.slider-thumb');
    const sliderWidth = slider.width();
    const sliderOffset = slider.offset().left;
    let position = e.pageX - sliderOffset;
    
    // Constrain position
    position = Math.max(0, Math.min(position, sliderWidth));
    
    // Calculate percentage
    const percent = position / sliderWidth * 100;
    
    // Update slider thumb position
    thumb.css('left', percent + '%');
    
    // Determine affordability level based on position
    let affordabilityLevel;
    if (percent < 25) {
        affordabilityLevel = 'Baseline (39/44%)';
    } else if (percent < 50) {
        affordabilityLevel = 'Standard (42/47%)';
    } else {
        affordabilityLevel = 'Caution (44/49%)';
    }
    
    // Calculate GDS and TDS based on position
    let gds = 39 + (percent / 100) * 5;
    let tds = 44 + (percent / 100) * 5;
    
    // Store values for calculations
    slider.data('gds', gds);
    slider.data('tds', tds);
    
    calculateRequiredIncome();
    updateResultsWithAnimation();
}

// Setup event listeners for input fields and buttons
function setupEventListeners() {
    // Mortgage amount and monthly debt input changes
    $('#mortgage-amount, #monthly-debt').on('input', function() {
        const input = $(this);
        const value = parseCurrency(input.val());
        
        if (!isNaN(value)) {
            input.val(formatCurrency(value));
            
            // Update corresponding slider
            updateSliderFromInput(input.attr('id'), value);
            
            calculateRequiredIncome();
            updateResultsWithAnimation();
        }
    });
    
    // Property tax yearly input change
    $('#property-tax-yearly').on('input', function() {
        const value = parseCurrency($(this).val());
        
        if (!isNaN(value)) {
            $(this).val(formatCurrency(value));
            
            // Update monthly value
            const monthlyValue = value / 12;
            $('#property-tax-monthly').val(formatCurrency(monthlyValue));
            
            calculateRequiredIncome();
            updateResultsWithAnimation();
        }
    });
    
    // Property tax monthly input change
    $('#property-tax-monthly').on('input', function() {
        const value = parseCurrency($(this).val());
        
        if (!isNaN(value)) {
            $(this).val(formatCurrency(value));
            
            // Update yearly value
            const yearlyValue = value * 12;
            $('#property-tax-yearly').val(formatCurrency(yearlyValue));
            
            calculateRequiredIncome();
            updateResultsWithAnimation();
        }
    });
    
    // Condo fees input change
    $('#condo-fees').on('input', function() {
        const value = parseCurrency($(this).val());
        
        if (!isNaN(value)) {
            $(this).val(formatCurrency(value));
            calculateRequiredIncome();
            updateResultsWithAnimation();
        }
    });
    
    // Heat input change
    $('#heat').on('input', function() {
        const value = parseCurrency($(this).val());
        
        if (!isNaN(value)) {
            $(this).val(formatCurrency(value));
            
            // Update heat slider
            updateSliderFromInput('heat', value);
            
            calculateRequiredIncome();
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
            $(this).val(value);
            
            calculateRequiredIncome();
            updateResultsWithAnimation();
        }
    });
    
    // Amortization input changes
    $('#amortization-years, #amortization-months').on('input', function() {
        const years = parseInt($('#amortization-years').val()) || 0;
        const months = parseInt($('#amortization-months').val()) || 0;
        
        // Update amortization slider if years field
        if ($(this).attr('id') === 'amortization-years' && years >= 5 && years <= 30) {
            updateSliderFromInput('amortization-years', years);
        }
        
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Rate type buttons
    $('.rate-type button').on('click', function() {
        $('.rate-type button').removeClass('active');
        $(this).addClass('active');
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Custom ratios link
    $('.custom-ratios').on('click', function() {
        // Implement custom ratios popup/modal here
        alert('Custom ratios functionality would be implemented here');
    });
    
    // Rental income toggle
    $('#rental-toggle').on('change', function() {
        // Implement rental income input visibility toggle
        if ($(this).is(':checked')) {
            // Show rental income input
            alert('Rental income section would be shown here');
        } else {
            // Hide rental income input
        }
        calculateRequiredIncome();
        updateResultsWithAnimation();
    });
    
    // Get report button
    $('#get-report-btn').on('click', function() {
        alert('Get Report functionality would be implemented here');
    });
    
    // Download App link
    $('.app-note').on('click', function() {
        // Implement app download link
        alert('App download link would be implemented here');
    });
}

// Update slider position based on input ID and value
function updateSliderFromInput(inputId, value) {
    let slider, min, max;
    
    if (inputId === 'mortgage-amount') {
        slider = $('.mortgage-amount-slider');
        min = 100000;
        max = 2000000;
    } else if (inputId === 'monthly-debt') {
        slider = $('.monthly-debt-slider');
        min = 0;
        max = 5000;
    } else if (inputId === 'heat') {
        slider = $('.heat-slider');
        min = 0;
        max = 5000;
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

// Setup scrolling behavior for results box
function setupResultsBoxScroll() {
    const resultsBox = $('.fixed-results-box');
    const initialOffset = resultsBox.offset().top;
    
    $(window).on('scroll', function() {
        const scrollTop = $(window).scrollTop();
        const leftColumnHeight = $('.left-column').height();
        const resultsBoxHeight = resultsBox.height();
        
        if (scrollTop > initialOffset - 20) {
            resultsBox.addClass('fixed');
            resultsBox.css('top', '20px');
            
            // Ensure results box doesn't go beyond the left column
            if (scrollTop + resultsBoxHeight > initialOffset + leftColumnHeight) {
                resultsBox.css('top', (initialOffset + leftColumnHeight - resultsBoxHeight - scrollTop) + 'px');
            }
        } else {
            resultsBox.removeClass('fixed');
            resultsBox.css('top', '0');
        }
    });
}

// Calculate and update the required income
function calculateRequiredIncome() {
    // Get input values
    const mortgageAmount = parseCurrency($('#mortgage-amount').val());
    const monthlyDebt = parseCurrency($('#monthly-debt').val());
    const propertyTax = parseCurrency($('#property-tax-yearly').val());
    const condoFees = parseCurrency($('#condo-fees').val());
    const heatCost = parseCurrency($('#heat').val());
    const rate = parseFloat($('#rate').val()) || 5.5;
    const amortizationYears = parseInt($('#amortization-years').val()) || 25;
    const amortizationMonths = parseInt($('#amortization-months').val()) || 0;
    
    // Get GDS and TDS ratios from affordability slider
    const gdsRatio = $('.affordability-slider').data('gds') || 39;
    const tdsRatio = $('.affordability-slider').data('tds') || 44;
    
    // Calculate stress test rate (2% higher than entered rate)
    const stressTestRate = rate + 2;
    
    // Calculate monthly mortgage payment
    const totalAmortizationMonths = (amortizationYears * 12) + amortizationMonths;
    const monthlyInterestRate = stressTestRate / 100 / 12;
    const monthlyMortgagePayment = (mortgageAmount * monthlyInterestRate) / 
                               (1 - Math.pow(1 + monthlyInterestRate, -totalAmortizationMonths));
    
    // Monthly expenses
    const monthlyPropertyTax = propertyTax / 12;
    const monthlyHeatCost = heatCost / 12;
    
    // Calculate housing expenses
    const totalHousingExpense = monthlyMortgagePayment + monthlyPropertyTax + condoFees + monthlyHeatCost;
    
    // Calculate total debt obligations
    const totalDebtExpense = totalHousingExpense + monthlyDebt;
    
    // Calculate required income based on GDS and TDS
    const requiredIncomeGDS = (totalHousingExpense * 100) / gdsRatio * 12;
    const requiredIncomeTDS = (totalDebtExpense * 100) / tdsRatio * 12;
    
    // Use the higher of the two required incomes
    const requiredIncome = Math.max(requiredIncomeGDS, requiredIncomeTDS);
    
    // Calculate actual ratios based on required income
    const actualGDS = (totalHousingExpense * 12 / requiredIncome) * 100;
    const actualTDS = (totalDebtExpense * 12 / requiredIncome) * 100;
    
    // Update results
    $('.result-amount').text(formatCurrency(requiredIncome));
    $('.stress-test-rate').text(stressTestRate.toFixed(2) + '%');
    
    // Update GDS/TDS values in the ratios result item
    const ratiosText = formatPercent(actualGDS) + ' / ' + formatPercent(actualTDS);
    $('.result-item.ratios .result-value').text(ratiosText);
    
    // Update expense breakdown
    const annualMortgagePayment = monthlyMortgagePayment * 12;
    $('.detail-item.monthly-mortgage .detail-value').text(formatCurrency(annualMortgagePayment));
    $('.detail-item.debt-payments .detail-value').text(formatCurrency(monthlyDebt * 12));
    
    // Calculate home expenses total (property tax + condo fees + heat)
    const totalHomeExpenses = propertyTax + (condoFees * 12) + heatCost;
    $('.detail-item.home-expenses .detail-value').text(formatCurrency(totalHomeExpenses));
    
    // Calculate cash left (bonus) - remaining income after expenses
    const totalExpenses = annualMortgagePayment + (monthlyDebt * 12) + totalHomeExpenses;
    const cashLeft = requiredIncome - totalExpenses;
    $('.detail-item.cash-left .detail-value').text(formatCurrency(cashLeft));
}

// Animate updating results
function updateResultsWithAnimation() {
    const resultsBox = $('.fixed-results-box');
    resultsBox.addClass('updating');
    
    setTimeout(function() {
        resultsBox.removeClass('updating');
    }, 1000);
    
    // Highlight changing values
    $('.result-value, .result-amount, .detail-value').addClass('value-changing');
    
    setTimeout(function() {
        $('.result-value, .result-amount, .detail-value').removeClass('value-changing');
    }, 1500);
}

// Function to animate number changes
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.text(formatCurrency(currentValue));
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
} 