$(document).ready(function () {
    // Initial values
    const initialValues = {
        purchasePrice: 900000,
        downPayment: 315000,
        downPaymentPercent: 35,
        interestRate: 6.29,
        amortizationYears: 25,
        amortizationMonths: 0,
        propertyTaxMonthly: 833.33,
        propertyTaxYearly: 10000,
        condoFees: 0,
        heatExpense: 200,
        otherMonthlyExpenses: 0,
        homeExpenses: 1033.33, // Property tax + condo fees + heat + other
        otherExpenses: 0,
        location: 'Toronto, ON',
        paymentFrequency: 'monthly',
        termYears: 5,
        payFaster: false,
        rentalIncome: false
    };

    // Slider ranges
    const minPrice = 100000;
    const maxPrice = 2000000;
    const minInterestRate = 1;
    const maxInterestRate = 15;
    const minPropertyTax = 1000;
    const maxPropertyTax = 25000;
    const minCondoFees = 0;
    const maxCondoFees = 1000;
    const minHeat = 0;
    const maxHeat = 500;
    const minAmortization = 5;
    const maxAmortization = 30;
    const minOtherExpenses = 0;
    const maxOtherExpenses = 1000;

    // Format currency with dollar sign preserved
    function formatCurrency(amount) {
        return '$' + new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Format decimal with dollar sign preserved
    function formatDecimal(amount) {
        return '$' + new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Calculate mortgage payment
    function calculateMortgagePayment(principal, interestRate, years, months = 0) {
        const totalYears = years + (months / 12);
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = totalYears * 12;
        let monthlyPayment = 0;

        if (interestRate === 0) {
            monthlyPayment = principal / numberOfPayments;
        } else {
            monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        return monthlyPayment;
    }

    // Calculate total interest paid over term
    function calculateTotalInterest(principal, interestRate, termYears) {
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = termYears * 12;
        const amortizationYears = parseInt($('#amortization-years').val());
        const amortizationMonths = parseInt($('#amortization-months').val());
        const monthlyPayment = calculateMortgagePayment(principal, interestRate, amortizationYears, amortizationMonths);

        let totalInterest = 0;
        let remainingPrincipal = principal;

        for (let i = 0; i < numberOfPayments; i++) {
            const interestPayment = remainingPrincipal * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;

            totalInterest += interestPayment;
            remainingPrincipal -= principalPayment;
        }

        return totalInterest;
    }

    // Calculate balance at end of term
    function calculateBalanceAtEndOfTerm(principal, interestRate, termYears, amortizationYears, amortizationMonths = 0) {
        const totalAmortizationYears = amortizationYears + (amortizationMonths / 12);
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = termYears * 12;
        const monthlyPayment = calculateMortgagePayment(principal, interestRate, amortizationYears, amortizationMonths);

        let remainingPrincipal = principal;

        for (let i = 0; i < numberOfPayments; i++) {
            const interestPayment = remainingPrincipal * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;

            remainingPrincipal -= principalPayment;
        }

        return remainingPrincipal;
    }

    // Calculate total home expenses
    function calculateTotalHomeExpenses() {
        const propertyTaxMonthly = parseFloat($('#property-tax-monthly').val().replace(/[^0-9.-]+/g, ''));
        const condoFees = parseFloat($('#condo-fees').val().replace(/[^0-9.-]+/g, '')) || 0;
        const heatExpense = parseFloat($('#heat-expense').val().replace(/[^0-9.-]+/g, '')) || 0;
        const otherExpenses = parseFloat($('#other-monthly-expenses').val().replace(/[^0-9.-]+/g, '')) || 0;

        return propertyTaxMonthly + condoFees + heatExpense + otherExpenses;
    }

    // Update Home Price slider position
    function updatePriceSliderPosition(price) {
        const percentage = (price - minPrice) / (maxPrice - minPrice);
        $('.input-section:nth-of-type(1) .slider-track').css('width', (percentage * 100) + '%');
        $('.input-section:nth-of-type(1) .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Down Payment slider position based on percentage
    function updateDownPaymentSliderPosition(percent) {
        // Normalize percent for visual slider (max 100%)
        const normalizedPercent = Math.min(percent, 100);
        $('.input-section:nth-of-type(3) .slider-track').css('width', normalizedPercent + '%');
        $('.input-section:nth-of-type(3) .slider-thumb').css('left', normalizedPercent + '%');
    }

    // Update Interest Rate slider position
    function updateRateSliderPosition(rate) {
        const percentage = (rate - minInterestRate) / (maxInterestRate - minInterestRate);
        $('.rate-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rate-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Property Tax slider position
    function updatePropertyTaxSliderPosition(taxYearly) {
        const percentage = (taxYearly - minPropertyTax) / (maxPropertyTax - minPropertyTax);
        $('.property-tax-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.property-tax-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Heat Expense slider position
    function updateHeatSliderPosition(heat) {
        const percentage = (heat - minHeat) / (maxHeat - minHeat);
        $('.heat-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.heat-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Other Expenses slider position
    function updateOtherExpensesSliderPosition(expenses) {
        const percentage = (expenses - minOtherExpenses) / (maxOtherExpenses - minOtherExpenses);
        $('.other-expenses-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.other-expenses-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Amortization slider position
    function updateAmortizationSliderPosition(years) {
        const percentage = (years - minAmortization) / (maxAmortization - minAmortization);
        $('.amortization-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.amortization-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Condo Fees slider position
    function updateCondoFeesSliderPosition(fees) {
        const percentage = (fees - minCondoFees) / (maxCondoFees - minCondoFees);
        $('.condo-fees-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.condo-fees-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update cost bar percentages with animation
    function updateCostBar(mortgagePayment, homeExpenses) {
        const totalCost = mortgagePayment + homeExpenses;

        // We're using flex values to set the relative sizes
        // Setting them directly allows CSS transitions to animate the change
        $('.mortgage-bar').css('flex', mortgagePayment);
        $('.expenses-bar').css('flex', homeExpenses);
    }

    // Animation function for smooth transitions between values
    function animateValue(element, start, end, duration, isDecimal) {
        // Add highlighting class
        $(element).addClass('value-changing');

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easedProgress = progress * (2 - progress); // Ease out function

            // Calculate current value
            const current = start + easedProgress * (end - start);

            // Format appropriately
            if (isDecimal) {
                $(element).text(formatDecimal(current));
            } else {
                $(element).text(formatCurrency(current));
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

    // Update calculator results with animations
    function updateCalculator() {
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, ''));
        const downPayment = parseFloat($('#down-payment').val().replace(/[^0-9.-]+/g, ''));
        const interestRate = parseFloat($('#rate-input').val().replace(/[^0-9.-]+/g, ''));
        const downPaymentPercent = parseFloat($('#down-payment-percent').val());
        const termYears = parseInt($('#loan-term').val());
        const amortizationYears = parseInt($('#amortization-years').val());
        const amortizationMonths = parseInt($('#amortization-months').val());
        const homeExpenses = calculateTotalHomeExpenses();

        // Calculate mortgage amount (subtract down payment from purchase price)
        const mortgageAmount = purchasePrice - downPayment;

        // Calculate monthly payment
        const monthlyPayment = calculateMortgagePayment(mortgageAmount, interestRate, amortizationYears, amortizationMonths);

        // Calculate total monthly cost
        const totalMonthlyCost = monthlyPayment + homeExpenses;

        // Calculate total interest paid over term
        const totalInterest = calculateTotalInterest(mortgageAmount, interestRate, termYears);

        // Calculate balance at end of term
        const balanceAtEndOfTerm = calculateBalanceAtEndOfTerm(mortgageAmount, interestRate, termYears, amortizationYears, amortizationMonths);

        // Calculate closing costs (estimate at 5% of mortgage amount)
        const closingCosts = mortgageAmount * 0.05;

        // Update UI with animated transitions

        // Get current values for animation
        const currentTotalCost = parseFloat($('.result-amount').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentMortgagePayment = parseFloat($('.payment-value:eq(0)').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentHomeExpenses = parseFloat($('.payment-value:eq(1)').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentMortgageAmount = parseFloat($('#mortgage-tab .totals-value').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentTotalInterest = parseFloat($('.details-value:eq(3)').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentBalance = parseFloat($('.details-value:eq(4)').text().replace(/[^0-9.-]+/g, '')) || 0;

        // Animation duration in milliseconds
        const animationDuration = 800;

        // Animate values with appropriate formatting
        // Main values
        animateValue($('.result-amount'), currentTotalCost, Math.round(totalMonthlyCost), animationDuration, false);
        updateCostBar(monthlyPayment, homeExpenses);

        // Payment details - needs decimal formatting
        animateValue($('.payment-value:eq(0)'), currentMortgagePayment, monthlyPayment, animationDuration, true);
        animateValue($('.payment-value:eq(1)'), currentHomeExpenses, homeExpenses, animationDuration, true);

        // Mortgage amount - needs decimal formatting
        animateValue($('#mortgage-tab .totals-value'), currentMortgageAmount, mortgageAmount, animationDuration, true);

        // Closing costs - needs decimal formatting
        animateValue($('.closing-cost-value:last'), currentMortgageAmount * 0.05, closingCosts, animationDuration, true);

        // Details section - needs decimal formatting
        animateValue($('.details-value:eq(0)'), currentMortgagePayment, monthlyPayment, animationDuration, true);
        animateValue($('.details-value:eq(1)'), currentMortgageAmount, mortgageAmount, animationDuration, true);
        animateValue($('.details-value:eq(3)'), currentTotalInterest, totalInterest, animationDuration, true);
        animateValue($('.details-value:eq(4)'), currentBalance, balanceAtEndOfTerm, animationDuration, true);

        // Update text values that don't need animation
        $('.details-value:eq(5)').text(amortizationYears + (amortizationMonths > 0 ? ' Years ' + amortizationMonths + ' Months' : ' Years'));

        // After updating calculations, refresh position of fixed box with a slight delay for animations
        setTimeout(function () {
            setupFixedResults();
        }, 1000); // 1 second delay to allow animations to complete
    }

    // Initialize input values
    $('#purchase-price').val(formatCurrency(initialValues.purchasePrice));
    $('#down-payment').val(formatCurrency(initialValues.downPayment));
    $('#rate-input').val(initialValues.interestRate + '%');
    $('#location').val(initialValues.location);
    $('#property-tax-monthly').val(formatCurrency(initialValues.propertyTaxMonthly));
    $('#property-tax-yearly').val(formatCurrency(initialValues.propertyTaxYearly));
    $('#condo-fees').val(formatCurrency(initialValues.condoFees));
    $('#heat-expense').val(formatCurrency(initialValues.heatExpense));
    $('#other-monthly-expenses').val(formatCurrency(initialValues.otherMonthlyExpenses));
    $('#amortization-years').val(initialValues.amortizationYears);
    $('#amortization-months').val(initialValues.amortizationMonths);

    // Set select values
    $('#down-payment-percent').val(initialValues.downPaymentPercent);
    $('#loan-term').val(initialValues.termYears);
    $('#payment-frequency').val(initialValues.paymentFrequency);

    // Initialize slider positions
    updatePriceSliderPosition(initialValues.purchasePrice);
    updateDownPaymentSliderPosition(initialValues.downPaymentPercent);
    updateRateSliderPosition(initialValues.interestRate);
    updatePropertyTaxSliderPosition(initialValues.propertyTaxYearly);
    updateHeatSliderPosition(initialValues.heatExpense);
    updateOtherExpensesSliderPosition(initialValues.otherMonthlyExpenses);
    updateAmortizationSliderPosition(initialValues.amortizationYears);
    updateCondoFeesSliderPosition(initialValues.condoFees);

    // Handle tab buttons for Mortgage Amount and Closing Costs
    $('.tab-btn').on('click', function () {
        const tabId = $(this).data('tab');

        // Remove active class from all tabs
        $('.tab-btn').removeClass('active');
        $('.tab-content').removeClass('active');
        
        // Add active class to selected tab
        $(this).addClass('active');
        $('#' + tabId + '-tab').addClass('active');
        
        // Show details section only when mortgage tab is active
        if (tabId === "mortgage") {
            $('.details-section').addClass('active');
        } else {
            $('.details-section').removeClass('active');
        }

        // Force recalculate height and fixed box position after tab change
        setTimeout(function() {
            const windowWidth = $(window).width();
            
            // Update container height based on new content
            if (windowWidth <= 937) {
                const fixedResultsBox = $('.fixed-results-box');
                const resultsBoxContainer = $('.results-box-container');
                const boxHeight = fixedResultsBox.outerHeight();
                
                // Update container height
                resultsBoxContainer.css('height', boxHeight + 'px');
            }
            
            // Update fixed position
            setupFixedResults();
        }, 10);
    });

    // Handle rate button toggle
    $('.rate-btn').on('click', function () {
        $('.rate-btn').removeClass('active');
        $(this).addClass('active');
        updateCalculator();
    });

    // Handle toggle switches
    $('.toggle-switch').on('click', function () {
        $(this).toggleClass('active');
        updateCalculator();
    });

    // Handle amortization years and months inputs
    $('#amortization-years, #amortization-months').on('input', function () {
        // Get the current values
        let years = parseInt($('#amortization-years').val());
        let months = parseInt($('#amortization-months').val());

        // Validate years (between 5 and 30)
        years = Math.max(minAmortization, Math.min(years, maxAmortization));
        $('#amortization-years').val(years);

        // Validate months (between 0 and 11)
        months = Math.max(0, Math.min(months, 11));
        $('#amortization-months').val(months);

        // Update slider position based on years
        updateAmortizationSliderPosition(years);

        // Update calculator
        updateCalculator();
    });

    // Initial calculation
    updateCalculator();

    // Set up fixed position for Total Monthly Cost section
    function setupFixedResults() {
        const resultsBoxContainer = $('.results-box-container');
        const fixedResultsBox = $('.fixed-results-box');
        const leftColumn = $('.left-column');
        const windowHeight = $(window).height();
        const boxHeight = fixedResultsBox.outerHeight();

        // Initial position calculation
        let initialTop = resultsBoxContainer.offset().top;
        let initialLeft = resultsBoxContainer.offset().left;
        let containerWidth = resultsBoxContainer.width();

        // Set the height for the container to maintain space when fixed
        resultsBoxContainer.css('height', boxHeight + 'px');

        // On load, check if we should start fixed
        const scrollTop = $(window).scrollTop();

        // Recalculate visibility on scroll
        function updateFixedState() {
            // Check screen width
            const windowWidth = $(window).width();
            const isMobile = windowWidth <= 768;
            const isMediumScreen = windowWidth <= 937 && windowWidth > 768;

            // Handle mobile or medium screen (tablet landscape)
            if (isMobile || isMediumScreen) {
                // On mobile or medium screen, keep the box in flow and match left column width
                const leftColumnWidth = leftColumn.width();
                
                fixedResultsBox.removeClass('fixed');
                fixedResultsBox.css({
                    position: 'relative',
                    top: 'auto',
                    left: 'auto',
                    width: '100%'
                });
                
                // Ensure the results box container uses the same width as the left column
                resultsBoxContainer.css('width', '100%');
                
                // Set specific column order for mobile only
                if (isMobile) {
                    leftColumn.css('order', '2');
                    $('.right-column').css('order', '1');
                } else if (isMediumScreen) {
                    // For medium screens, don't change the order, just adjust the width
                    leftColumn.css('order', '');
                    $('.right-column').css('order', '');
                }
                
                return;
            } else {
                // Reset order for desktop
                leftColumn.css('order', '');
                $('.right-column').css('order', '');
            }

            // Get current values
            const scrollTop = $(window).scrollTop();
            const availableHeight = windowHeight;
            const resultsBoxTop = resultsBoxContainer.offset().top;

            // Check if box is taller than viewport
            if (boxHeight > availableHeight - 40) { // 40px for padding
                // Box is too tall for viewport, it should scroll with page
                fixedResultsBox.removeClass('fixed');
                fixedResultsBox.css({
                    position: 'relative',
                    top: '0',
                    left: '0'
                });
            } else {
                // Box can fit in viewport
                if (scrollTop + 20 > resultsBoxTop) {
                    // We've scrolled past the top of the box
                    fixedResultsBox.addClass('fixed');
                    fixedResultsBox.css({
                        position: 'fixed',
                        top: '20px',
                        left: initialLeft + 'px',
                        width: containerWidth + 'px'
                    });
                } else {
                    // Box should be in normal flow
                    fixedResultsBox.removeClass('fixed');
                    fixedResultsBox.css({
                        position: 'relative',
                        top: '0',
                        left: '0'
                    });
                }
            }
        }

        // Handle scroll event
        $(window).on('scroll', updateFixedState);

        // Handle resize event
        $(window).on('resize', function() {
            // Recalculate dimensions
            const newWindowHeight = $(window).height();
            const newContainerTop = resultsBoxContainer.offset().top;
            const newContainerLeft = resultsBoxContainer.offset().left;
            const newContainerWidth = resultsBoxContainer.width();
            
            // Check screen width
            const windowWidth = $(window).width();
            const isMobile = windowWidth <= 768;
            const isMediumScreen = windowWidth <= 937 && windowWidth > 768;
            
            if (isMobile || isMediumScreen) {
                // Match width to left column on mobile or medium screens
                resultsBoxContainer.css('width', '100%');
                fixedResultsBox.css('width', '100%');
                
                // Make sure the height is recalculated for the container
                const newBoxHeight = fixedResultsBox.outerHeight();
                resultsBoxContainer.css('height', newBoxHeight + 'px');
            } else {
                // Update variables for desktop
                initialTop = newContainerTop;
                initialLeft = newContainerLeft;
                containerWidth = newContainerWidth;
            }

            // Update fixed state
            updateFixedState();
        });

        // Initial check
        updateFixedState();
    }

    // Initialize fixed results
    setupFixedResults();

    // Set initial tab state (mortgage tab active by default)
    $('#mortgage-tab').addClass('active');
    $('.tab-btn[data-tab="mortgage"]').addClass('active');
    $('.details-section').addClass('active');
    
    // Check if we're on mobile or medium screen and adjust heights accordingly
    function checkMobileView() {
        const windowWidth = $(window).width();
        const isMobile = windowWidth <= 768;
        const isMediumScreen = windowWidth <= 937 && windowWidth > 768;
        
        if (isMobile || isMediumScreen) {
            const fixedResultsBox = $('.fixed-results-box');
            const resultsBoxContainer = $('.results-box-container');
            const leftColumn = $('.left-column');
            
            // Make sure width is 100% on mobile and medium screens
            fixedResultsBox.css('width', '100%');
            resultsBoxContainer.css('width', '100%');
            
            // Update container height
            const boxHeight = fixedResultsBox.outerHeight();
            resultsBoxContainer.css('height', boxHeight + 'px');
            
            // Handle column order based on screen size
            if (isMobile) {
                leftColumn.css('order', '2');
                $('.right-column').css('order', '1');
            } else if (isMediumScreen) {
                // For medium screens, don't change the order, just adjust the width
                leftColumn.css('order', '');
                $('.right-column').css('order', '');
            }
        } else {
            // Reset order for desktop
            $('.left-column').css('order', '');
            $('.right-column').css('order', '');
            
            // Run setupFixedResults to handle desktop layout
            setupFixedResults();
        }
    }
    
    // Run on initial load
    checkMobileView();
    
    // Run on window resize
    $(window).on('resize', checkMobileView);

    // Home Price Slider
    function handleHomeSliderInteraction(e) {
        const sliderElement = $('.input-section:nth-of-type(1) .price-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.input-section:nth-of-type(1) .slider-track').css('width', (percentage * 100) + '%');
        $('.input-section:nth-of-type(1) .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new price based on slider position
        const newPrice = Math.round((minPrice + (maxPrice - minPrice) * percentage) / 1000) * 1000;

        // Update purchase price input
        $('#purchase-price').val(formatCurrency(newPrice));

        // Update down payment based on percentage (now the down payment is directly based on the price)
        const downPaymentPercent = parseFloat($('#down-payment-percent').val());
        const newDownPayment = Math.round(newPrice * (downPaymentPercent / 100));
        $('#down-payment').val(formatCurrency(newDownPayment));

        // Update calculator
        updateCalculator();
    }

    // Heat Slider
    function handleHeatSliderInteraction(e) {
        const sliderElement = $('.heat-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.heat-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.heat-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new heat expense based on slider position
        const newHeat = Math.round(minHeat + (maxHeat - minHeat) * percentage);

        // Update heat input
        $('#heat-expense').val(formatCurrency(newHeat));

        // Update calculator
        updateCalculator();
    }

    // Other Monthly Expenses Slider
    function handleOtherExpensesSliderInteraction(e) {
        const sliderElement = $('.other-expenses-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.other-expenses-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.other-expenses-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new other expenses based on slider position
        const newExpenses = Math.round(minOtherExpenses + (maxOtherExpenses - minOtherExpenses) * percentage);

        // Update other expenses input
        $('#other-monthly-expenses').val(formatCurrency(newExpenses));

        // Update calculator
        updateCalculator();
    }

    // Condo Fees Slider
    function handleCondoFeesSliderInteraction(e) {
        const sliderElement = $('.condo-fees-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.condo-fees-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.condo-fees-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new condo fees based on slider position
        const newCondoFees = Math.round(minCondoFees + (maxCondoFees - minCondoFees) * percentage);

        // Update condo fees input
        $('#condo-fees').val(formatCurrency(newCondoFees));

        // Update calculator
        updateCalculator();
    }

    // Mouse events for heat slider
    $('.heat-slider').on('mousedown', function (e) {
        handleHeatSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.heatslider', handleHeatSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.heatslider', function () {
            $(document).off('mousemove.heatslider mouseup.heatslider');
        });
    });

    // Mouse events for other expenses slider
    $('.other-expenses-slider').on('mousedown', function (e) {
        handleOtherExpensesSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.otherexpenses', handleOtherExpensesSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.otherexpenses', function () {
            $(document).off('mousemove.otherexpenses mouseup.otherexpenses');
        });
    });

    // Mouse events for condo fees slider
    $('.condo-fees-slider').on('mousedown', function (e) {
        handleCondoFeesSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.condoslider', handleCondoFeesSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.condoslider', function () {
            $(document).off('mousemove.condoslider mouseup.condoslider');
        });
    });

    // Down Payment Slider
    function handleDownPaymentSliderInteraction(e) {
        const sliderElement = $('.input-section:nth-of-type(3) .price-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.input-section:nth-of-type(3) .slider-track').css('width', (percentage * 100) + '%');
        $('.input-section:nth-of-type(3) .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new down payment percentage (0-100%)
        const newPercentage = Math.round(percentage * 100);

        // Update down payment percent in dropdown
        $('#down-payment-percent').val(newPercentage);

        // Calculate and update down payment amount
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, ''));
        const newDownPayment = Math.round(purchasePrice * (newPercentage / 100));
        $('#down-payment').val(formatCurrency(newDownPayment));

        // Update calculator
        updateCalculator();
    }

    // Mouse events for down payment slider
    $('.input-section:nth-of-type(3) .price-slider').on('mousedown', function (e) {
        handleDownPaymentSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.dpslider', handleDownPaymentSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.dpslider', function () {
            $(document).off('mousemove.dpslider mouseup.dpslider');
        });
    });

    // Interest Rate Slider
    function handleRateSliderInteraction(e) {
        const sliderElement = $('.rate-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.rate-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rate-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new interest rate (1-15%)
        const newRate = (minInterestRate + (maxInterestRate - minInterestRate) * percentage).toFixed(2);

        // Update interest rate input
        $('#rate-input').val(newRate + '%');

        // Update calculator
        updateCalculator();
    }

    // Mouse events for interest rate slider
    $('.rate-slider').on('mousedown', function (e) {
        handleRateSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.rateslider', handleRateSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.rateslider', function () {
            $(document).off('mousemove.rateslider mouseup.rateslider');
        });
    });

    // Amortization Slider
    function handleAmortizationSliderInteraction(e) {
        const sliderElement = $('.amortization-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.amortization-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.amortization-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new amortization years (5-30)
        const newYears = Math.round(minAmortization + (maxAmortization - minAmortization) * percentage);

        // Update amortization years input
        $('#amortization-years').val(newYears);
        $('#amortization-months').val(0); // Reset months when using slider

        // Update calculator
        updateCalculator();
    }

    // Mouse events for amortization slider
    $('.amortization-slider').on('mousedown', function (e) {
        handleAmortizationSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.amortslider', handleAmortizationSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.amortslider', function () {
            $(document).off('mousemove.amortslider mouseup.amortslider');
        });
    });

    // Home Price Input
    $('#purchase-price').on('input', function () {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);

            // Constrain to min/max
            value = Math.max(minPrice, Math.min(value, maxPrice));

            // Update slider position
            updatePriceSliderPosition(value);

            // Update down payment based on percentage
            const downPaymentPercent = parseFloat($('#down-payment-percent').val());
            const newDownPayment = Math.round(value * (downPaymentPercent / 100));
            $('#down-payment').val(formatCurrency(newDownPayment));

            // Format the input
            $(this).val(formatCurrency(value));

            // Update calculator
            updateCalculator();
        }
    });

    // Down Payment Input
    $('#down-payment').on('input', function () {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);
            const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, ''));

            // Calculate percentage
            const percentage = (value / purchasePrice) * 100;

            // Constrain percentage (1-100%)
            const constrainedPercentage = Math.max(1, Math.min(percentage, 100));

            // Update down payment value based on constrained percentage
            value = Math.round(purchasePrice * (constrainedPercentage / 100));

            // Update slider position
            updateDownPaymentSliderPosition(constrainedPercentage);

            // Update dropdown value (find closest match or add custom option)
            $('#down-payment-percent').val(Math.round(constrainedPercentage));

            // Format the input
            $(this).val(formatCurrency(value));

            // Update calculator
            updateCalculator();
        }
    });

    // Mouse events for home price slider
    $('.input-section:nth-of-type(1) .price-slider').on('mousedown', function (e) {
        handleHomeSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.homeslider', handleHomeSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.homeslider', function () {
            $(document).off('mousemove.homeslider mouseup.homeslider');
        });
    });

    // Handle location input
    $('#location').on('blur', function () {
        updateCalculator();
    });

    // Handle download report button
    $('.download-btn').on('click', function () {
        alert('Report functionality would be implemented here.');
    });

    // Handle select changes for down payment percentage
    $('#down-payment-percent').on('change', function () {
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, ''));
        const downPaymentPercent = parseFloat($(this).val());

        // Down payment is a percentage of purchase price
        const newDownPayment = Math.round(purchasePrice * (downPaymentPercent / 100));

        // Update down payment value
        $('#down-payment').val(formatCurrency(newDownPayment));

        // Update down payment slider
        updateDownPaymentSliderPosition(downPaymentPercent);

        // Update calculator
        updateCalculator();
    });

    // Handle changes to loan term, payment frequency
    $('#loan-term, #payment-frequency').on('change', function () {
        updateCalculator();
    });

    // Format purchase price input with currency
    $('#purchase-price').on('blur', function () {
        const value = parseFloat($(this).val().replace(/[^0-9.-]+/g, ''));
        $(this).val(formatCurrency(value));

        // Update home price slider
        updatePriceSliderPosition(value);

        // Update down payment based on percentage
        const downPaymentPercent = parseFloat($('#down-payment-percent').val());
        const newDownPayment = Math.round(value * (downPaymentPercent / 100));
        $('#down-payment').val(formatCurrency(newDownPayment));

        updateCalculator();
    });

    // Format down payment input with currency
    $('#down-payment').on('blur', function () {
        const value = parseFloat($(this).val().replace(/[^0-9.-]+/g, ''));
        $(this).val(formatCurrency(value));

        // Calculate and update percentage
        const purchasePrice = parseFloat($('#purchase-price').val().replace(/[^0-9.-]+/g, ''));
        const percent = Math.round((value / purchasePrice) * 100);

        // Find closest option
        let closestOption = null;
        let minDifference = Infinity;

        $('#down-payment-percent option').each(function () {
            const optionValue = parseFloat($(this).val());
            const difference = Math.abs(optionValue - percent);

            if (difference < minDifference) {
                minDifference = difference;
                closestOption = optionValue;
            }
        });

        // Update percentage dropdown
        $('#down-payment-percent').val(closestOption);

        // Update down payment slider
        updateDownPaymentSliderPosition(closestOption);

        updateCalculator();
    });

    // Format rate input
    $('#rate-input').on('blur', function () {
        let value = parseFloat($(this).val().replace(/[^0-9.-]+/g, '')) || 0;

        // Constrain to min/max
        value = Math.max(minInterestRate, Math.min(value, maxInterestRate));

        // Update slider position
        updateRateSliderPosition(value);

        // Format the input
        $(this).val(value + '%');

        // Update calculator
        updateCalculator();
    });

    // Format property tax inputs
    $('#property-tax-yearly').on('blur', function () {
        let value = parseFloat($(this).val().replace(/[^0-9.-]+/g, ''));
        value = Math.max(0, value);
        $(this).val(formatCurrency(value));

        // Update monthly value
        const monthlyValue = value / 12;
        $('#property-tax-monthly').val(formatCurrency(monthlyValue));

        // Update property tax slider
        updatePropertyTaxSliderPosition(value);

        updateCalculator();
    });

    $('#property-tax-monthly').on('blur', function () {
        let value = parseFloat($(this).val().replace(/[^0-9.-]+/g, ''));
        value = Math.max(0, value);
        $(this).val(formatCurrency(value));

        // Update yearly value
        const yearlyValue = value * 12;
        $('#property-tax-yearly').val(formatCurrency(yearlyValue));

        // Update property tax slider
        updatePropertyTaxSliderPosition(yearlyValue);

        updateCalculator();
    });

    // Property Tax Slider
    function handlePropertyTaxSliderInteraction(e) {
        const sliderElement = $('.property-tax-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.property-tax-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.property-tax-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new tax based on slider position
        const newYearlyTax = Math.round(minPropertyTax + (maxPropertyTax - minPropertyTax) * percentage);
        const newMonthlyTax = (newYearlyTax / 12).toFixed(2);

        // Update tax inputs
        $('#property-tax-yearly').val(formatCurrency(newYearlyTax));
        $('#property-tax-monthly').val(formatCurrency(newMonthlyTax));

        // Update calculator
        updateCalculator();
    }

    // Mouse events for property tax slider
    $('.property-tax-slider').on('mousedown', function (e) {
        handlePropertyTaxSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.taxslider', handlePropertyTaxSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.taxslider', function () {
            $(document).off('mousemove.taxslider mouseup.taxslider');
        });
    });

    // Format expense inputs with consistent styling
    $('#property-tax-monthly, #property-tax-yearly, #condo-fees, #heat-expense, #other-monthly-expenses').on('blur', function () {
        let value = parseFloat($(this).val().replace(/[^0-9.-]+/g, '')) || 0;

        // Format the value
        $(this).val(formatCurrency(value));

        // Special handling for property tax yearly/monthly sync
        if ($(this).attr('id') === 'property-tax-yearly') {
            const monthlyValue = (value / 12).toFixed(2);
            $('#property-tax-monthly').val(formatCurrency(monthlyValue));
            updatePropertyTaxSliderPosition(value);
        } else if ($(this).attr('id') === 'property-tax-monthly') {
            const yearlyValue = Math.round(value * 12);
            $('#property-tax-yearly').val(formatCurrency(yearlyValue));
            updatePropertyTaxSliderPosition(yearlyValue);
        } else if ($(this).attr('id') === 'heat-expense') {
            updateHeatSliderPosition(value);
        } else if ($(this).attr('id') === 'other-monthly-expenses') {
            updateOtherExpensesSliderPosition(value);
        } else if ($(this).attr('id') === 'condo-fees') {
            updateCondoFeesSliderPosition(value);
        }

        // Update calculator
        updateCalculator();
    });
}); 