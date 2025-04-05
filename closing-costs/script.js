$(document).ready(function () {
    // Initial values
    const initialValues = {
        location: 'Toronto, ON',
        province: 'Ontario',
        city: 'Toronto',
        purchasePrice: 888000,
        downPayment: 63800,
        downPaymentPercentage: 7.15,
        amortizationYears: 25,
        amortizationMonths: 0,
        appraisal: 0,
        homeInspection: 0,
        movingCosts: 0,
        titleInsurance: 0,
        legalFees: 0,
        taxAdjustments: 0,
        lenderFee: 0,
        brokerageFee: 0,
        waterTest: 0,
        septicInspection: 0,
        surveyFee: 0,
        isNewlyBuiltHome: false,
        isFirstTimeHomebuyer: false,
        isForeignBuyer: false
    };

    // Define slider ranges
    const minPurchasePrice = 100000;
    const maxPurchasePrice = 5000000;
    const minDownPaymentPercentage = 5;
    const maxDownPaymentPercentage = 50;
    const minAmortization = 5;
    const maxAmortization = 30;

    // Define ancillary cost ranges
    const costRanges = {
        appraisal: { min: 0, max: 800 },
        homeInspection: { min: 0, max: 1000 },
        movingCosts: { min: 0, max: 5000 },
        titleInsurance: { min: 0, max: 1000 },
        legalFees: { min: 0, max: 2500 },
        taxAdjustments: { min: 0, max: 2000 },
        lenderFee: { min: 0, max: 1200 },
        brokerageFee: { min: 0, max: 3000 },
        waterTest: { min: 0, max: 300 },
        septicInspection: { min: 0, max: 500 },
        surveyFee: { min: 0, max: 1000 }
    };

    // Land Transfer Tax Rates (example rates - these would be accurate for actual locations)
    const provincialTaxRates = {
        'Ontario': [
            { threshold: 250000, rate: 0.005 },
            { threshold: 400000, rate: 0.01 },
            { threshold: 2000000, rate: 0.015 },
            { threshold: Infinity, rate: 0.02 }
        ]
    };

    const municipalTaxRates = {
        'Toronto': [
            { threshold: 55000, rate: 0.005 },
            { threshold: 250000, rate: 0.01 },
            { threshold: 400000, rate: 0.015 },
            { threshold: 2000000, rate: 0.02 },
            { threshold: Infinity, rate: 0.025 }
        ]
    };

    // Rebate Information
    const rebates = {
        firstTimeHomeBuyer: {
            'Ontario': { max: 4000, threshold: 368000 },
            'Toronto': { max: 4475, threshold: 400000 }
        },
        newlyBuiltHome: {
            'Ontario': { max: 24000, threshold: 400000 }
        }
    };

    // Format currency
    function formatCurrency(amount) {
        return '$' + new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Format decimal with dollar sign
    function formatDecimal(amount) {
        return '$' + new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Format percentage
    function formatPercentage(percentage) {
        return percentage.toFixed(2) + '%';
    }

    // Calculate Provincial Land Transfer Tax
    function calculateProvincialTax(price, province, isFirstTimeBuyer, isNewlyBuilt) {
        if (!provincialTaxRates[province]) {
            return 0;
        }

        const rates = provincialTaxRates[province];
        let tax = 0;
        let previousThreshold = 0;

        for (const { threshold, rate } of rates) {
            if (price > previousThreshold) {
                tax += Math.min(price - previousThreshold, threshold - previousThreshold) * rate;
            }
            previousThreshold = threshold;
            if (price <= threshold) {
                break;
            }
        }

        // Apply first-time homebuyer rebate if applicable
        if (isFirstTimeBuyer && rebates.firstTimeHomeBuyer[province]) {
            const rebate = rebates.firstTimeHomeBuyer[province];
            if (price <= rebate.threshold) {
                tax = Math.max(0, tax - rebate.max);
            }
        }

        // Apply newly built home rebate if applicable
        if (isNewlyBuilt && rebates.newlyBuiltHome[province]) {
            const rebate = rebates.newlyBuiltHome[province];
            if (price <= rebate.threshold) {
                tax = Math.max(0, tax - rebate.max);
            }
        }

        return Math.round(tax);
    }

    // Calculate Municipal Land Transfer Tax
    function calculateMunicipalTax(price, city, isFirstTimeBuyer) {
        if (!municipalTaxRates[city]) {
            return 0;
        }

        const rates = municipalTaxRates[city];
        let tax = 0;
        let previousThreshold = 0;

        for (const { threshold, rate } of rates) {
            if (price > previousThreshold) {
                tax += Math.min(price - previousThreshold, threshold - previousThreshold) * rate;
            }
            previousThreshold = threshold;
            if (price <= threshold) {
                break;
            }
        }

        // Apply first-time homebuyer rebate if applicable
        if (isFirstTimeBuyer && rebates.firstTimeHomeBuyer[city]) {
            const rebate = rebates.firstTimeHomeBuyer[city];
            if (price <= rebate.threshold) {
                tax = Math.max(0, tax - rebate.max);
            }
        }

        return Math.round(tax);
    }

    // Calculate total rebates
    function calculateTotalRebates(price, province, city, isFirstTimeBuyer, isNewlyBuilt) {
        let totalRebate = 0;

        // Provincial rebates
        if (isFirstTimeBuyer && rebates.firstTimeHomeBuyer[province]) {
            const provincialRebate = rebates.firstTimeHomeBuyer[province];
            if (price <= provincialRebate.threshold) {
                totalRebate += provincialRebate.max;
            }
        }

        // Municipal rebates
        if (isFirstTimeBuyer && rebates.firstTimeHomeBuyer[city]) {
            const municipalRebate = rebates.firstTimeHomeBuyer[city];
            if (price <= municipalRebate.threshold) {
                totalRebate += municipalRebate.max;
            }
        }

        // Newly built home rebates
        if (isNewlyBuilt && rebates.newlyBuiltHome[province]) {
            const newHomeRebate = rebates.newlyBuiltHome[province];
            if (price <= newHomeRebate.threshold) {
                totalRebate += newHomeRebate.max;
            }
        }

        return totalRebate;
    }

    // Calculate CMHC Insurance and PST on Insurance
    function calculateMortgageInsurance(price, downPaymentPercentage) {
        if (downPaymentPercentage >= 20) {
            return { insurance: 0, pst: 0 };
        }

        const loanAmount = price * (1 - downPaymentPercentage / 100);
        let rate = 0;

        if (downPaymentPercentage >= 5 && downPaymentPercentage < 10) {
            rate = 0.04;
        } else if (downPaymentPercentage >= 10 && downPaymentPercentage < 15) {
            rate = 0.031;
        } else if (downPaymentPercentage >= 15 && downPaymentPercentage < 20) {
            rate = 0.028;
        }

        const insurance = loanAmount * rate;
        const pst = insurance * 0.08; // 8% PST on insurance in Ontario

        return { insurance, pst: Math.round(pst) };
    }

    // Animation function for smooth transitions with acceleration
    function animateValue(element, start, end, duration, isDecimal = false, prefix = '') {
        // Add highlighting class
        $(element).addClass('value-changing');

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Use easeOutQuart easing function for acceleration effect
            const easedProgress = 1 - Math.pow(1 - progress, 4);
            
            // Calculate current value
            const current = start + easedProgress * (end - start);

            // Format appropriately
            if (isDecimal) {
                $(element).text(prefix + formatDecimal(current));
            } else {
                $(element).text(prefix + formatCurrency(current));
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Remove highlighting when done
                setTimeout(() => {
                    $(element).removeClass('value-changing');
                }, 200);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Update Purchase Price Slider
    function updatePurchasePriceSlider(price) {
        const percentage = (price - minPurchasePrice) / (maxPurchasePrice - minPurchasePrice);
        $('.price-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.price-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Down Payment Slider
    function updateDownPaymentSlider(percentage) {
        const sliderPercentage = (percentage - minDownPaymentPercentage) / (maxDownPaymentPercentage - minDownPaymentPercentage);
        $('.down-payment-slider .slider-track').css('width', (sliderPercentage * 100) + '%');
        $('.down-payment-slider .slider-thumb').css('left', (sliderPercentage * 100) + '%');
    }

    // Update Amortization Slider
    function updateAmortizationSlider(years) {
        const percentage = (years - minAmortization) / (maxAmortization - minAmortization);
        $('.amortization-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.amortization-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Cost Slider
    function updateCostSlider(costType, value) {
        const range = costRanges[costType];
        if (!range) return;
        
        const percentage = (value - range.min) / (range.max - range.min);
        $(`.${costType}-slider .slider-track`).css('width', (percentage * 100) + '%');
        $(`.${costType}-slider .slider-thumb`).css('left', (percentage * 100) + '%');
    }

    // Handle Cost Slider Interaction
    function handleCostSlider(e, costType) {
        const range = costRanges[costType];
        if (!range) return;
        
        const sliderElement = $(`.${costType}-slider`);
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));
        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $(`.${costType}-slider .slider-track`).css('width', (percentage * 100) + '%');
        $(`.${costType}-slider .slider-thumb`).css('left', (percentage * 100) + '%');

        // Calculate new cost value
        const newValue = Math.round(range.min + (range.max - range.min) * percentage);
        
        // Update cost input
        $(`#${costType}`).val(formatCurrency(newValue));

        // Update calculator
        updateCalculator();
    }

    // Purchase Price Slider Interaction
    function handlePurchasePriceSlider(e) {
        const sliderElement = $('.price-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));
        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.price-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.price-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new price
        const newPrice = Math.round((minPurchasePrice + (maxPurchasePrice - minPurchasePrice) * percentage) / 1000) * 1000;

        // Update price input
        $('#purchase-price').val(formatCurrency(newPrice));

        // Update down payment to maintain the percentage
        const downPaymentPercentage = parseFloat($('.percentage').text()) || initialValues.downPaymentPercentage;
        const newDownPayment = Math.round(newPrice * (downPaymentPercentage / 100));
        $('#down-payment').val(formatCurrency(newDownPayment));

        // Update calculator
        updateCalculator();
    }

    // Down Payment Slider Interaction
    function handleDownPaymentSlider(e) {
        const sliderElement = $('.down-payment-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));
        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.down-payment-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.down-payment-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new down payment percentage
        const newPercentage = minDownPaymentPercentage + (maxDownPaymentPercentage - minDownPaymentPercentage) * percentage;
        
        // Update down payment percentage display
        $('.percentage').text(formatPercentage(newPercentage));
        
        // Calculate down payment amount based on percentage
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.purchasePrice;
        const newDownPayment = Math.round(purchasePrice * (newPercentage / 100));
        
        // Update down payment input
        $('#down-payment').val(formatCurrency(newDownPayment));

        // Update calculator
        updateCalculator();
    }

    // Amortization Slider Interaction
    function handleAmortizationSlider(e) {
        const sliderElement = $('.amortization-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));
        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.amortization-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.amortization-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new amortization period
        const newYears = Math.min(maxAmortization, Math.max(minAmortization, Math.round(minAmortization + (maxAmortization - minAmortization) * percentage)));
        
        // Update amortization inputs
        $('#amortization-years').val(newYears);
        $('#amortization-months').val(0);

        // Update calculator
        updateCalculator();
    }

    // Initialize values and sliders
    function initializeInputs() {
        // Set initial input values
        $('#location').val(initialValues.location);
        $('#purchase-price').val(formatCurrency(initialValues.purchasePrice));
        $('#down-payment').val(formatCurrency(initialValues.downPayment));
        $('.percentage').text(formatPercentage(initialValues.downPaymentPercentage));
        $('#amortization-years').val(initialValues.amortizationYears);
        $('#amortization-months').val(initialValues.amortizationMonths);
        
        // Explicitly set values for all ancillary costs to $0 as shown in the image
        $('#appraisal').val('$0');
        $('#home-inspection').val('$0');
        $('#moving-costs').val('$0');
        $('#title-insurance').val('$0');
        $('#legal-fees').val('$0');
        $('#tax-adjustments').val('$0');
        $('#lender-fee').val('$0');
        $('#brokerage-fee').val('$0');
        
        // Set checkbox states
        $('#newly-built-home').prop('checked', initialValues.isNewlyBuiltHome);
        $('#first-time-homebuyer').prop('checked', initialValues.isFirstTimeHomebuyer);
        $('#foreign-buyer').prop('checked', initialValues.isForeignBuyer);
    }

    // Initialize slider positions
    function initializeSliders() {
        updatePurchasePriceSlider(initialValues.purchasePrice);
        updateDownPaymentSlider(initialValues.downPaymentPercentage);
        updateAmortizationSlider(initialValues.amortizationYears);
        
        // Initialize all cost sliders with explicit values
        updateCostSlider('appraisal', initialValues.appraisal);
        updateCostSlider('home-inspection', initialValues.homeInspection);
        updateCostSlider('moving-costs', initialValues.movingCosts);
        updateCostSlider('title-insurance', initialValues.titleInsurance);
        updateCostSlider('legal-fees', initialValues.legalFees);
        updateCostSlider('tax-adjustments', initialValues.taxAdjustments);
        updateCostSlider('lender-fee', initialValues.lenderFee);
        updateCostSlider('brokerage-fee', initialValues.brokerageFee);

        // Force a redraw of the sliders to ensure they are displayed correctly
        setTimeout(() => {
            $('.slider-track, .slider-thumb').css('transition', 'none');
            $('.slider-track, .slider-thumb').each(function() {
                $(this)[0].offsetHeight; // Force a reflow
            });
            $('.slider-track, .slider-thumb').css('transition', '');
        }, 10);
    }

    // Update calculator with current values
    function updateCalculator() {
        // Get current input values
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.purchasePrice;
        const downPayment = parseFloat($('#down-payment').val().replace(/[^0-9.-]+/g, '')) || initialValues.downPayment;
        const downPaymentPercentage = (downPayment / purchasePrice) * 100;
        
        // Get checkbox values
        const isFirstTimeBuyer = $('#first-time-homebuyer').prop('checked');
        const isNewlyBuiltHome = $('#newly-built-home').prop('checked');
        const isForeignBuyer = $('#foreign-buyer').prop('checked');

        // Calculate taxes
        const provincialTax = calculateProvincialTax(purchasePrice, initialValues.province, isFirstTimeBuyer, isNewlyBuiltHome);
        const municipalTax = calculateMunicipalTax(purchasePrice, initialValues.city, isFirstTimeBuyer);
        const totalRebates = calculateTotalRebates(purchasePrice, initialValues.province, initialValues.city, isFirstTimeBuyer, isNewlyBuiltHome);
        
        // Calculate mortgage insurance
        const mortgageInsurance = calculateMortgageInsurance(purchasePrice, downPaymentPercentage);
        
        // Calculate ancillary costs
        const ancillaryCosts = calculateAncillaryCosts();
        
        // Calculate total closing costs
        const landTransferTax = provincialTax + municipalTax;
        const totalClosingCosts = landTransferTax + mortgageInsurance.pst + ancillaryCosts;

        // Update percentage display
        $('.percentage').text(formatPercentage(downPaymentPercentage));

        // Get current displayed values for animation
        const currentTotalCosts = parseFloat($('.result-amount').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentLandTransfer = parseFloat($('.land-transfer .result-value').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentProvincial = parseFloat($('.breakdown-item:eq(0) .breakdown-value').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentMunicipal = parseFloat($('.breakdown-item:eq(1) .breakdown-value').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentRebates = parseFloat($('.breakdown-item:eq(2) .breakdown-value').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentPST = parseFloat($('.mortgage-insurance .result-value').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentAncillary = parseFloat($('.ancillary-cost .result-value').text().replace(/[^0-9.-]+/g, '')) || 0;

        // Animation duration
        const animationDuration = 800;

        // Animate value updates
        animateValue($('.result-amount'), currentTotalCosts, totalClosingCosts, animationDuration);
        animateValue($('.land-transfer .result-value'), currentLandTransfer, landTransferTax, animationDuration);
        animateValue($('.breakdown-item:eq(0) .breakdown-value'), currentProvincial, provincialTax, animationDuration, false, '+ ');
        animateValue($('.breakdown-item:eq(1) .breakdown-value'), currentMunicipal, municipalTax, animationDuration, false, '+ ');
        animateValue($('.breakdown-item:eq(2) .breakdown-value'), currentRebates, totalRebates, animationDuration);
        animateValue($('.mortgage-insurance .result-value'), currentPST, mortgageInsurance.pst, animationDuration);
        animateValue($('.ancillary-cost .result-value'), currentAncillary, ancillaryCosts, animationDuration);

        // Update result title to "Total Estimated Cost"
        $('.result-header .result-title').text('Total Estimated Cost');
    }

    // Calculate total ancillary costs
    function calculateAncillaryCosts() {
        let total = 0;
        
        // Sum all ancillary costs
        $('#appraisal, #home-inspection, #moving-costs, #title-insurance, #legal-fees, #tax-adjustments, #lender-fee, #brokerage-fee').each(function() {
            const value = parseFloat($(this).val().replace(/[^0-9.-]+/g, '')) || 0;
            total += value;
        });
        
        return total;
    }

    // Initialize fixed results position
    function setupFixedResults() {
        const resultsBoxContainer = $('.results-box-container');
        const fixedResultsBox = $('.fixed-results-box');
        const initialTop = resultsBoxContainer.offset().top;
        const initialLeft = resultsBoxContainer.offset().left;
        const containerWidth = resultsBoxContainer.width();

        // Handle scroll event
        $(window).on('scroll', function() {
            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();
            const boxHeight = fixedResultsBox.outerHeight();

            // Check if window is wide enough for fixed position
            if ($(window).width() <= 992) {
                // On mobile or tablet, keep in normal flow
                fixedResultsBox.removeClass('fixed');
                fixedResultsBox.css({
                    position: 'relative',
                    top: '0',
                    left: '0',
                    width: '100%'
                });
                return;
            }

            // Check if box is too tall for viewport
            if (boxHeight > windowHeight - 40) {
                // Box is too tall, keep in normal flow
                fixedResultsBox.removeClass('fixed');
                fixedResultsBox.css({
                    position: 'relative',
                    top: '0',
                    left: '0'
                });
            } else if (scrollTop + 20 > initialTop) {
                // Fix position when scrolled past initial position
                fixedResultsBox.addClass('fixed');
                fixedResultsBox.css({
                    position: 'fixed',
                    top: '20px',
                    left: initialLeft + 'px',
                    width: containerWidth + 'px'
                });
            } else {
                // Return to normal flow
                fixedResultsBox.removeClass('fixed');
                fixedResultsBox.css({
                    position: 'relative',
                    top: '0',
                    left: '0'
                });
            }
        });

        // Handle resize event
        $(window).on('resize', function() {
            const newLeft = resultsBoxContainer.offset().left;
            const newWidth = resultsBoxContainer.width();

            if (fixedResultsBox.hasClass('fixed')) {
                fixedResultsBox.css({
                    left: newLeft + 'px',
                    width: newWidth + 'px'
                });
            }

            // On mobile or tablet, reset to normal flow
            if ($(window).width() <= 992) {
                fixedResultsBox.removeClass('fixed');
                fixedResultsBox.css({
                    position: 'relative',
                    top: '0',
                    left: '0',
                    width: '100%'
                });
            }
        });
    }

    // Bind event listeners for Purchase Price slider
    $('.price-slider').on('mousedown', function(e) {
        handlePurchasePriceSlider(e);

        $(document).on('mousemove.priceslider', handlePurchasePriceSlider);
        $(document).on('mouseup.priceslider', function() {
            $(document).off('mousemove.priceslider mouseup.priceslider');
        });
    });

    // Bind event listeners for Down Payment slider
    $('.down-payment-slider').on('mousedown', function(e) {
        handleDownPaymentSlider(e);

        $(document).on('mousemove.downpaymentslider', handleDownPaymentSlider);
        $(document).on('mouseup.downpaymentslider', function() {
            $(document).off('mousemove.downpaymentslider mouseup.downpaymentslider');
        });
    });

    // Bind event listeners for Amortization slider
    $('.amortization-slider').on('mousedown', function(e) {
        handleAmortizationSlider(e);

        $(document).on('mousemove.amortizationslider', handleAmortizationSlider);
        $(document).on('mouseup.amortizationslider', function() {
            $(document).off('mousemove.amortizationslider mouseup.amortizationslider');
        });
    });

    // Bind event listeners for all cost sliders
    $('.cost-slider').on('mousedown', function(e) {
        const costType = $(this).attr('class').split(' ')[1].replace('-slider', '');
        if (costRanges[costType]) {
            handleCostSlider(e, costType);
            
            $(document).on(`mousemove.${costType}slider`, function(evt) {
                handleCostSlider(evt, costType);
            });
            
            $(document).on(`mouseup.${costType}slider`, function() {
                $(document).off(`mousemove.${costType}slider mouseup.${costType}slider`);
            });
        }
    });

    // Handle Purchase Price input changes
    $('#purchase-price').on('input', function() {
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseInt(value);
            value = Math.max(minPurchasePrice, Math.min(value, maxPurchasePrice));
            
            $(this).val(formatCurrency(value));
            updatePurchasePriceSlider(value);
            
            // Update down payment to maintain percentage
            const downPaymentPercentage = parseFloat($('.percentage').text());
            const newDownPayment = Math.round(value * (downPaymentPercentage / 100));
            $('#down-payment').val(formatCurrency(newDownPayment));
            
            updateCalculator();
        }
    });

    // Handle Down Payment input changes
    $('#down-payment').on('input', function() {
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseInt(value);
            const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.purchasePrice;
            
            // Calculate percentage and constrain to valid range
            let percentage = (value / purchasePrice) * 100;
            percentage = Math.max(minDownPaymentPercentage, Math.min(percentage, maxDownPaymentPercentage));
            
            // Recalculate down payment based on constrained percentage
            value = Math.round(purchasePrice * (percentage / 100));
            
            $(this).val(formatCurrency(value));
            $('.percentage').text(formatPercentage(percentage));
            updateDownPaymentSlider(percentage);
            
            updateCalculator();
        }
    });

    // Handle Down Payment Percentage Dropdown changes
    $('#down-payment-percentage-dropdown').on('change', function() {
        const percentage = parseFloat($(this).val());
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.purchasePrice;
        
        // Calculate down payment based on selected percentage
        const downPayment = Math.round(purchasePrice * (percentage / 100));
        
        // Update displays
        $('#down-payment').val(formatCurrency(downPayment));
        $('.percentage').text(formatPercentage(percentage));
        updateDownPaymentSlider(percentage);
        
        updateCalculator();
    });

    // Handle Amortization Years input changes
    $('#amortization-years').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);
            value = Math.max(minAmortization, Math.min(value, maxAmortization));
            
            $(this).val(value);
            updateAmortizationSlider(value);
            
            updateCalculator();
        }
    });

    // Handle Amortization Months input changes
    $('#amortization-months').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);
            value = Math.max(0, Math.min(value, 11));
            
            $(this).val(value);
            
            updateCalculator();
        }
    });

    // Handle Ancillary Cost input changes
    $('.cost-input-field input').on('input', function() {
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseInt(value);
            $(this).val(formatCurrency(value));
            
            // Update corresponding slider if exists
            const id = $(this).attr('id');
            if (costRanges[id]) {
                const range = costRanges[id];
                value = Math.max(range.min, Math.min(value, range.max));
                updateCostSlider(id, value);
            }
            
            updateCalculator();
        }
    });

    // Handle checkbox changes
    $('#newly-built-home, #first-time-homebuyer, #foreign-buyer').on('change', function() {
        updateCalculator();
    });

    // Initialize calculator
    initializeInputs();
    initializeSliders();
    
    // Make sure all sliders have proper event handlers
    $('.cost-slider').each(function() {
        // Extract the cost type from the className 
        const classNames = $(this).attr('class').split(' ');
        const sliderClass = classNames.find(c => c.endsWith('-slider'));
        if (!sliderClass) return;
        
        const costType = sliderClass.replace('-slider', '');
        
        // Only proceed if this is a valid cost type
        if (!costRanges[costType]) return;
        
        // Remove any existing handlers to avoid duplicates
        $(this).off('mousedown');
        
        // Add mousedown handler
        $(this).on('mousedown', function(e) {
            e.preventDefault(); // Prevent text selection
            handleCostSlider(e, costType);
            
            // Add document-level mousemove and mouseup handlers
            $(document).on(`mousemove.${costType}slider`, function(evt) {
                evt.preventDefault();
                handleCostSlider(evt, costType);
            });
            
            $(document).on(`mouseup.${costType}slider`, function() {
                $(document).off(`mousemove.${costType}slider mouseup.${costType}slider`);
            });
        });
    });
    
    // Ensure checkboxes have event handlers
    $('#newly-built-home, #first-time-homebuyer, #foreign-buyer').on('change', function() {
        updateCalculator();
    });
    
    // Delay initial calculation for smoother loading animation
    setTimeout(function() {
        updateCalculator();
    }, 500);
    
    setupFixedResults();
}); 