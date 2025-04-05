$(document).ready(function () {
    // Initial values
    const initialValues = {
        grossIncome: 90000,
        monthlyDebt: 3300,
        interestRate: 6.29,
        amortizationYears: 25,
        amortizationMonths: 0,
        propertyTaxMonthly: 833.33,
        propertyTaxYearly: 10000,
        condoFees: 1400,
        heatExpense: 200,
        otherMonthlyExpenses: 0,
        homeExpenses: 2433.33, // Property tax + condo fees + heat + other
        stressTestRate: 8.29, // 2% above interest rate 
        affordabilityLevel: 0.5, // 0-1 range, 0 = cautious, 1 = aggressive
        rateTerm: 5,
        rateType: 'fixed',
        rentalIncome: 0,
        hasRentalIncome: false
    };

    // Slider ranges
    const minIncome = 30000;
    const maxIncome = 500000;
    const minMonthlyDebt = 0;
    const maxMonthlyDebt = 10000;
    const minInterestRate = 1;
    const maxInterestRate = 10;
    const minPropertyTax = 1000;
    const maxPropertyTax = 30000;
    const minCondoFees = 0;
    const maxCondoFees = 3000;
    const minHeatExpense = 0;
    const maxHeatExpense = 1000;
    const minOtherExpenses = 0;
    const maxOtherExpenses = 3000;
    const minAmortization = 5;
    const maxAmortization = 30;
    const minRentalIncome = 0;
    const maxRentalIncome = 10000;
    
    // GDS/TDS ratio limits (standard)
    const standardGDSLimit = 39.0; // 39% of gross income
    const standardTDSLimit = 44.0; // 44% of gross income
    // GDS/TDS ratio limits (cautious)
    const cautiousGDSLimit = 30.0; // 30% of gross income
    const cautiousTDSLimit = 35.0; // 35% of gross income

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

    // Calculate maximum mortgage
    function calculateMaximumMortgage(grossIncome, monthlyDebt, interestRate, amortizationYears, amortizationMonths, homeExpenses, affordabilityLevel) {
        // Convert annual income to monthly
        const monthlyIncome = grossIncome / 12;
        
        // Calculate stress test rate (2% higher than regular rate)
        const stressTestRate = Math.max(interestRate + 2, 5.25);
        
        // Determine GDS and TDS limits based on affordability level (0-1 scale)
        const gdsLimit = cautiousGDSLimit + (affordabilityLevel * (standardGDSLimit - cautiousGDSLimit));
        const tdsLimit = cautiousTDSLimit + (affordabilityLevel * (standardTDSLimit - cautiousTDSLimit));
        
        // Calculate monthly maximums
        const gdsMaxPayment = (monthlyIncome * (gdsLimit / 100)) - homeExpenses;
        const tdsMaxPayment = (monthlyIncome * (tdsLimit / 100)) - monthlyDebt - homeExpenses;
        
        // Take the more restrictive of the two limits
        const maxMonthlyPayment = Math.min(gdsMaxPayment, tdsMaxPayment);
        
        // Convert maximum payment to maximum mortgage amount
        // using the stress test rate (assuming worst-case scenario)
        const monthlyRate = stressTestRate / 100 / 12;
        const totalPayments = amortizationYears * 12 + amortizationMonths;
        
        const maximumMortgage = maxMonthlyPayment * 
            (1 - Math.pow(1 + monthlyRate, -totalPayments)) / 
            monthlyRate;
        
        return Math.max(0, Math.round(maximumMortgage));
    }

    // Calculate home expenses
    function calculateTotalHomeExpenses() {
        const propertyTaxMonthly = parseFloat($('#property-tax-monthly').val().replace(/[^0-9.-]+/g, '')) || 0;
        const condoFees = parseFloat($('#condo-fees').val().replace(/[^0-9.-]+/g, '')) || 0;
        const heatExpense = parseFloat($('#heat-expense').val().replace(/[^0-9.-]+/g, '')) || 0;

        return propertyTaxMonthly + condoFees + heatExpense ;
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

    // Update Income slider position
    function updateIncomeSliderPosition(income) {
        const percentage = (income - minIncome) / (maxIncome - minIncome);
        $('.income-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.income-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Monthly Debt slider position
    function updateDebtSliderPosition(debt) {
        const percentage = (debt - minMonthlyDebt) / (maxMonthlyDebt - minMonthlyDebt);
        $('.debt-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.debt-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Interest Rate slider position
    function updateRateSliderPosition(rate) {
        const percentage = (rate - minInterestRate) / (maxInterestRate - minInterestRate);
        $('.rate-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rate-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Affordability slider position
    function updateAffordabilitySliderPosition(level) {
        $('.affordability-slider .slider-track').css('width', (level * 100) + '%');
        $('.affordability-slider .slider-thumb').css('left', (level * 100) + '%');
    }

    // Update Property Tax slider position
    function updatePropertyTaxSliderPosition(value) {
        // Calculate percentage based on the value
        const percentage = Math.min(1, Math.max(0, (value - minPropertyTax) / (maxPropertyTax - minPropertyTax)));
        
        // Update slider position
        $('.property-tax-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.property-tax-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Heat Expense slider position
    function updateHeatSliderPosition(heat) {
        const percentage = (heat - minHeatExpense) / (maxHeatExpense - minHeatExpense);
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

    // Update Rental Income Slider Position
    function updateRentalIncomeSliderPosition(income) {
        const percentage = (income - minRentalIncome) / (maxRentalIncome - minRentalIncome);
        $('.rental-income-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rental-income-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update calculator with current values
    function updateCalculator() {
        const grossIncome = parseFloat($('#gross-income').val().replace(/[^0-9.-]+/g, '')) || 0;
        const monthlyDebt = parseFloat($('#monthly-debt').val().replace(/[^0-9.-]+/g, '')) || 0;
        const interestRate = parseFloat($('#rate-input').val().replace(/[^0-9.-]+/g, '')) || 0;
        const amortizationYears = parseInt($('#amortization-years').val()) || 25;
        const amortizationMonths = parseInt($('#amortization-months').val()) || 0;
        const homeExpenses = calculateTotalHomeExpenses();
        const stressTestRate = interestRate + 2; // 2% higher for stress test
        const affordabilityLevel = parseFloat($('.affordability-slider .slider-thumb').css('left')) / 
                                parseFloat($('.affordability-slider').width());
        
        // Include rental income if active
        let effectiveIncome = grossIncome;
        if (initialValues.hasRentalIncome && $('.toggle-switch').hasClass('active')) {
            const rentalIncome = parseFloat($('#rental-income').val().replace(/[^0-9.-]+/g, '')) || 0;
            effectiveIncome += rentalIncome * 12; // Convert monthly rental to annual
        }

        // Calculate GDS/TDS ratios based on affordability level
        const gdsLimit = cautiousGDSLimit + (affordabilityLevel * (standardGDSLimit - cautiousGDSLimit));
        const tdsLimit = cautiousTDSLimit + (affordabilityLevel * (standardTDSLimit - cautiousTDSLimit));

        // Calculate maximum mortgage
        const maxMortgage = calculateMaximumMortgage(
            effectiveIncome, 
            monthlyDebt, 
            interestRate, 
            amortizationYears, 
            amortizationMonths, 
            homeExpenses, 
            affordabilityLevel
        );

        // Calculate monthly payment at regular interest rate
        const monthlyPayment = calculateMortgagePayment(
            maxMortgage, 
            interestRate, 
            amortizationYears, 
            amortizationMonths
        );

        // Calculate cash left (after all expenses) - for stress test scenario
        const monthlyIncome = effectiveIncome / 12;
        const stressTestPayment = calculateMortgagePayment(
            maxMortgage, 
            stressTestRate, 
            amortizationYears, 
            amortizationMonths
        );
        const cashLeft = monthlyIncome - stressTestPayment - monthlyDebt - homeExpenses;

        // Get current values for animation
        const currentMaxMortgage = parseFloat($('.result-amount').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentMonthlyPayment = parseFloat($('.payment-value:eq(0)').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentHomeExpenses = parseFloat($('.payment-value:eq(2)').text().replace(/[^0-9.-]+/g, '')) || 0;
        const currentCashLeft = parseFloat($('.payment-value:eq(3)').text().replace(/[^0-9.-]+/g, '')) || 0;

        // Animation duration in milliseconds
        const animationDuration = 800;

        // Animate values with appropriate formatting
        animateValue($('.result-amount'), currentMaxMortgage, maxMortgage, animationDuration, false);
        animateValue($('.payment-value:eq(0)'), currentMonthlyPayment, monthlyPayment, animationDuration, true);
        animateValue($('.payment-value:eq(1)'), monthlyDebt, monthlyDebt, animationDuration, true);
        animateValue($('.payment-value:eq(2)'), currentHomeExpenses, homeExpenses, animationDuration, true);
        animateValue($('.payment-value:eq(3)'), currentCashLeft, cashLeft, animationDuration, true);

        // Update GDS/TDS ratio display
        $('.ratio-value:eq(1)').text(gdsLimit.toFixed(2) + '% / ' + tdsLimit.toFixed(2) + '%');
        
        // Update stress test rate display
        $('.ratio-value:eq(0)').text(stressTestRate.toFixed(2) + '%');
        
        // Update the colored bar
        updateColoredBar(
            Math.round(monthlyPayment), 
            Math.round(monthlyDebt), 
            Math.round(homeExpenses), 
            Math.round(cashLeft)
        );

        // After updating calculations, refresh position of fixed box with a slight delay for animations
        setTimeout(function() {
            setupFixedResults();
        }, 1000); // 1 second delay to allow animations to complete
    }

    // Initialize all inputs and sliders
    function initializeInputs() {
        // Set initial input values
        $('#gross-income').val(formatCurrency(initialValues.grossIncome));
        $('#monthly-debt').val(formatCurrency(initialValues.monthlyDebt));
        $('#rate-input').val(initialValues.interestRate.toFixed(2) + '%');
        $('#property-tax-monthly').val(formatCurrency(initialValues.propertyTaxMonthly));
        $('#property-tax-yearly').val(formatCurrency(initialValues.propertyTaxYearly));
        $('#condo-fees').val(formatCurrency(initialValues.condoFees));
        $('#heat-expense').val(formatCurrency(initialValues.heatExpense));
        $('#other-monthly-expenses').val(formatCurrency(initialValues.otherMonthlyExpenses));
        $('#amortization-years').val(initialValues.amortizationYears);
        $('#amortization-months').val(initialValues.amortizationMonths);
    }

    // Initialize all slider positions
    function initializeSliders() {
        // Set initial slider positions based on starting values
        updateIncomeSliderPosition(initialValues.grossIncome);
        updateDebtSliderPosition(initialValues.monthlyDebt);
        updateRateSliderPosition(initialValues.interestRate);
        updatePropertyTaxSliderPosition(initialValues.propertyTaxYearly);
        updateCondoFeesSliderPosition(initialValues.condoFees);
        updateHeatSliderPosition(initialValues.heatExpense);
        updateOtherExpensesSliderPosition(initialValues.otherMonthlyExpenses);
        updateAmortizationSliderPosition(initialValues.amortizationYears);
        
        // Set affordability slider position
        const affordabilityPercentage = initialValues.affordabilityLevel * 100;
        $('.affordability-slider .slider-thumb').css('left', affordabilityPercentage + '%');
        
        // Set rate button active state
        $('.rate-type-buttons button').removeClass('active');
        $('.rate-type-buttons button.' + initialValues.rateType).addClass('active');
        
        // Initialize current values
        currentGDSLimit = cautiousGDSLimit + (standardGDSLimit - cautiousGDSLimit) * initialValues.affordabilityLevel;
        currentTDSLimit = cautiousTDSLimit + (standardTDSLimit - cautiousTDSLimit) * initialValues.affordabilityLevel;
        currentStressTestRate = initialValues.interestRate + 2; // 2% above interest rate
        currentRateType = initialValues.rateType;
        currentAffordabilityLevel = initialValues.affordabilityLevel;
        
        // Initialize colored bar
        updateColoredBar(
            Math.round(4048), 
            Math.round(initialValues.monthlyDebt), 
            Math.round(initialValues.homeExpenses), 
            Math.round(10000)
        );
    }

    // Initialize fixed results
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

    // Income Slider Interaction
    function handleIncomeSliderInteraction(e) {
        const sliderElement = $('.income-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.income-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.income-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new income based on slider position
        const newIncome = Math.round((minIncome + (maxIncome - minIncome) * percentage) / 1000) * 1000;

        // Update income input
        $('#gross-income').val(formatCurrency(newIncome));

        // Update calculator
        updateCalculator();
    }

    // Monthly Debt Slider Interaction
    function handleDebtSliderInteraction(e) {
        const sliderElement = $('.debt-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.debt-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.debt-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new debt based on slider position
        const newDebt = Math.round(minMonthlyDebt + (maxMonthlyDebt - minMonthlyDebt) * percentage);

        // Update debt input
        $('#monthly-debt').val(formatCurrency(newDebt));

        // Update calculator
        updateCalculator();
    }

    // Affordability Slider Interaction
    function handleAffordabilitySliderInteraction(e) {
        const sliderElement = $('.affordability-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.affordability-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.affordability-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Update calculator
        updateCalculator();
    }

    // Bind event listeners for Income slider
    $('.income-slider').on('mousedown', function(e) {
        handleIncomeSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.incomeslider', handleIncomeSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.incomeslider', function() {
            $(document).off('mousemove.incomeslider mouseup.incomeslider');
        });
    });

    // Bind event listeners for Debt slider
    $('.debt-slider').on('mousedown', function(e) {
        handleDebtSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.debtslider', handleDebtSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.debtslider', function() {
            $(document).off('mousemove.debtslider mouseup.debtslider');
        });
    });

    // Bind event listeners for Affordability slider
    $('.affordability-slider').on('mousedown', function(e) {
        handleAffordabilitySliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.affordslider', handleAffordabilitySliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.affordslider', function() {
            $(document).off('mousemove.affordslider mouseup.affordslider');
        });
    });

    // Handle rate button toggle
    $('.rate-btn').on('click', function() {
        $('.rate-btn').removeClass('active');
        $(this).addClass('active');
        updateCalculator();
    });

    // Handle income input changes
    $('#gross-income').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);

            // Constrain to min/max
            value = Math.max(minIncome, Math.min(value, maxIncome));

            // Update slider position
            updateIncomeSliderPosition(value);

            // Format the input
            $(this).val(formatCurrency(value));

            // Update calculator
            updateCalculator();
        }
    });

    // Handle monthly debt input changes
    $('#monthly-debt').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);

            // Constrain to min/max
            value = Math.max(minMonthlyDebt, Math.min(value, maxMonthlyDebt));

            // Update slider position
            updateDebtSliderPosition(value);

            // Format the input
            $(this).val(formatCurrency(value));

            // Update calculator
            updateCalculator();
        }
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

        // Calculate new rate based on slider position (between 1% and 10%)
        const newRate = (minInterestRate + (maxInterestRate - minInterestRate) * percentage).toFixed(2);

        // Update rate input
        $('#rate-input').val(newRate + '%');

        // Update calculator
        updateCalculator();
    }

    // Mouse events for rate slider
    $('.rate-slider').on('mousedown', function (e) {
        handleRateSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.rateslider', handleRateSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.rateslider', function () {
            $(document).off('mousemove.rateslider mouseup.rateslider');
        });
    });

    // Update Rate Slider Position based on input
    function updateRateSliderPosition(rate) {
        // Calculate percentage based on the rate value
        const percentage = (rate - minInterestRate) / (maxInterestRate - minInterestRate);
        
        // Update slider position
        $('.rate-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rate-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update Condo Fees Slider Position based on input
    function updateCondoFeesSliderPosition(value) {
        // Calculate percentage based on the value
        const percentage = Math.min(1, Math.max(0, (value - minCondoFees) / (maxCondoFees - minCondoFees)));
        
        // Update slider position
        $('.condo-fees-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.condo-fees-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Format Rate input with consistent styling
    $('#rate').on('blur', function() {
        let value = parseFloat($(this).val().replace(/[^0-9.-]+/g, '')) || 0;
        
        // Constrain to valid range
        value = Math.min(maxInterestRate, Math.max(minInterestRate, value));
        
        // Format the value
        $(this).val(value.toFixed(2) + '%');
        
        // Update slider position
        updateRateSliderPosition(value);
        
        // Update stress test rate
        currentStressTestRate = value + 2;
        
        // Update calculator
        updateCalculator();
    });

    // Heat Expense Slider Interaction
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
        const newHeat = Math.round(minHeatExpense + (maxHeatExpense - minHeatExpense) * percentage);

        // Update heat expense input
        $('#heat-expense').val(formatCurrency(newHeat));

        // Update calculator
        updateCalculator();
    }

    // Mouse events for heat slider
    $('.heat-slider').on('mousedown', function(e) {
        handleHeatSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.heatslider', handleHeatSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.heatslider', function() {
            $(document).off('mousemove.heatslider mouseup.heatslider');
        });
    });

    // Handle heat expense input changes
    $('#heat-expense').on('input', function() {
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseFloat(value);

            // Constrain to min/max
            value = Math.max(minHeatExpense, Math.min(value, maxHeatExpense));

            // Update slider position
            updateHeatSliderPosition(value);

            // Format the input
            $(this).val(formatCurrency(value));

            // Update calculator
            updateCalculator();
        }
    });

    // Amortization Slider Interaction
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

        // Calculate new amortization based on slider position (5-30 years)
        const newAmortization = Math.round(minAmortization + (maxAmortization - minAmortization) * percentage);

        // Update amortization inputs
        $('#amortization-years').val(newAmortization);
        $('#amortization-months').val(0);

        // Update calculator
        updateCalculator();
    }

    // Mouse events for amortization slider
    $('.amortization-slider').on('mousedown', function(e) {
        handleAmortizationSliderInteraction(e);

        // Enable dragging
        $(document).on('mousemove.amortslider', handleAmortizationSliderInteraction);

        // Remove event on mouse up
        $(document).on('mouseup.amortslider', function() {
            $(document).off('mousemove.amortslider mouseup.amortslider');
        });
    });

    // Handle amortization years input changes
    $('#amortization-years').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);

            // Constrain to min/max
            value = Math.max(minAmortization, Math.min(value, maxAmortization));

            // Update value
            $(this).val(value);

            // Update slider position
            updateAmortizationSliderPosition(value);

            // Update calculator
            updateCalculator();
        }
    });

    // Handle amortization months input changes
    $('#amortization-months').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);

            // Constrain to 0-11
            value = Math.max(0, Math.min(value, 11));

            // Update value
            $(this).val(value);

            // Update calculator
            updateCalculator();
        }
    });

    // Rate input handler (make sure it updates with the rate slider)
    $('#rate-input').on('input', function() {
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseFloat(value);

            // Constrain to min/max
            value = Math.max(minInterestRate, Math.min(value, maxInterestRate));

            // Update slider position
            updateRateSliderPosition(value);

            // Format the input 
            $(this).val(value.toFixed(2) + '%');

            // Update calculator
            updateCalculator();
        }
    });

    // Rental Income Toggle
    $('.toggle-switch').on('click', function() {
        $(this).toggleClass('active');
        
        const isActive = $(this).hasClass('active');
        
        // Show/hide rental income input section
        if (isActive) {
            // Create rental income input if it doesn't exist
            if ($('.rental-income-input').length === 0) {
                const rentalIncomeHTML = `
                    <div class="rental-income-input" style="margin-top: 15px;">
                        <div class="expense-label">Monthly Rental Income</div>
                        <div class="expense-input-field with-info">
                            <input type="text" id="rental-income" value="$0">
                            <span class="info-icon">i</span>
                        </div>
                        <div class="rental-income-slider">
                            <div class="slider-track"></div>
                            <div class="slider-thumb"></div>
                        </div>
                    </div>
                `;
                $('.rental-income-section').append(rentalIncomeHTML);
                
                // Initialize the rental income slider
                $('.rental-income-slider .slider-thumb').css('left', '0%');
                $('.rental-income-slider .slider-track').css('width', '0%');
                
                // Add event listeners
                $('#rental-income').on('input', function() {
                    let value = $(this).val().replace(/[^0-9.-]+/g, '');
                    if (value) {
                        value = parseFloat(value);
                        
                        // Constrain to min/max
                        value = Math.max(minRentalIncome, Math.min(value, maxRentalIncome));
                        
                        // Update slider position
                        updateRentalIncomeSliderPosition(value);
                        
                        // Format the input
                        $(this).val(formatCurrency(value));
                        
                        // Update calculator
                        updateCalculator();
                    }
                });
                
                // Add slider interaction
                $('.rental-income-slider').on('mousedown', function(e) {
                    handleRentalIncomeSliderInteraction(e);
                    
                    // Enable dragging
                    $(document).on('mousemove.rentalslider', handleRentalIncomeSliderInteraction);
                    
                    // Remove event on mouse up
                    $(document).on('mouseup.rentalslider', function() {
                        $(document).off('mousemove.rentalslider mouseup.rentalslider');
                    });
                });
            } else {
                $('.rental-income-input').show();
            }
            
            // Update the hasRentalIncome flag
            initialValues.hasRentalIncome = true;
        } else {
            // Hide the rental income input
            $('.rental-income-input').hide();
            
            // Update the hasRentalIncome flag
            initialValues.hasRentalIncome = false;
            
            // Reset rental income to 0
            initialValues.rentalIncome = 0;
            
            // Update calculator
            updateCalculator();
        }
    });

    // Rental Income Slider Interaction
    function handleRentalIncomeSliderInteraction(e) {
        const sliderElement = $('.rental-income-slider');
        const sliderWidth = sliderElement.width();
        let clickPosition = e.pageX - sliderElement.offset().left;

        // Constrain within the slider bounds
        clickPosition = Math.max(0, Math.min(clickPosition, sliderWidth));

        const percentage = clickPosition / sliderWidth;

        // Update slider visually
        $('.rental-income-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rental-income-slider .slider-thumb').css('left', (percentage * 100) + '%');

        // Calculate new rental income based on slider position
        const newRental = Math.round(minRentalIncome + (maxRentalIncome - minRentalIncome) * percentage);

        // Update rental income input
        $('#rental-income').val(formatCurrency(newRental));
        
        // Update rental income value
        initialValues.rentalIncome = newRental;

        // Update calculator
        updateCalculator();
    }

    // Update Rental Income Slider Position
    function updateRentalIncomeSliderPosition(income) {
        const percentage = (income - minRentalIncome) / (maxRentalIncome - minRentalIncome);
        $('.rental-income-slider .slider-track').css('width', (percentage * 100) + '%');
        $('.rental-income-slider .slider-thumb').css('left', (percentage * 100) + '%');
    }

    // Update the colored bar in the results section
    function updateColoredBar(mortgage, debt, expenses, cash) {
        const total = mortgage + debt + expenses + cash;
        
        $('.bar-section.mortgage').css('flex', mortgage);
        $('.bar-section.debt').css('flex', debt);
        $('.bar-section.expenses').css('flex', expenses);
        $('.bar-section.cash').css('flex', cash);
    }

    // Document ready function
    initializeInputs();
    initializeSliders();
    
    // Calculate initial values
    updateCalculator();
    
    // Setup fixed results positioning
    setupFixedResults();
    
    // Set loan term select value
    $('#loan-term').val(initialValues.rateTerm);
}); 