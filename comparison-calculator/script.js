$(document).ready(function () {
    // Initial values
    const initialValues = {
        homePrice: 500000,
        scenarios: [
            {
                id: 1,
                name: "Scenario 1",
                isActive: true,
                isStarred: true,
                isFirstTimeBuyer: true,
                isNewlyBuiltHome: false,
                downPaymentPercentage: 10,
                downPaymentAmount: 50000,
                mortgageInsurance: 13950,
                mortgageAmount: 463950,
                rate: 5.25,
                termType: "fixed",
                termYears: 5,
                amortizationYears: 25,
                amortizationMonths: 0,
                paymentFrequency: "monthly",
                paymentAmount: 2764.76,
                termInterest: 253961.76,
                termPrincipal: 84008.43,
                totalTermPayments: 337970.19,
                balanceEndOfTerm: 773159.57
            },
            {
                id: 2,
                name: "Scenario 2",
                isActive: false,
                isStarred: false,
                isFirstTimeBuyer: false,
                isNewlyBuiltHome: false,
                downPaymentPercentage: 10,
                downPaymentAmount: 50000,
                mortgageInsurance: 13950,
                mortgageAmount: 463950,
                rate: 5.25,
                termType: "fixed",
                termYears: 5,
                amortizationYears: 25,
                amortizationMonths: 0,
                paymentFrequency: "monthly",
                paymentAmount: 2764.76,
                termInterest: 253961.76,
                termPrincipal: 84008.43,
                totalTermPayments: 337970.19,
                balanceEndOfTerm: 773159.57
            },
            {
                id: 3,
                name: "Scenario 3",
                isActive: false,
                isStarred: false,
                isFirstTimeBuyer: false,
                isNewlyBuiltHome: false,
                downPaymentPercentage: 10,
                downPaymentAmount: 50000,
                mortgageInsurance: 13950,
                mortgageAmount: 463950,
                rate: 5.25,
                termType: "fixed",
                termYears: 5,
                amortizationYears: 25,
                amortizationMonths: 0,
                paymentFrequency: "monthly",
                paymentAmount: 2764.76,
                termInterest: 253961.76,
                termPrincipal: 84008.43,
                totalTermPayments: 337970.19,
                balanceEndOfTerm: 773159.57
            }
        ],
        homeExpenses: {
            propertyTax: 0,
            condoFees: 0,
            heat: 0
        }
    };

    // Format currency
    function formatCurrency(amount) {
        return '$' + new Intl.NumberFormat('en-US').format(amount);
    }

    // Format percentage
    function formatPercentage(percentage) {
        return percentage + '%';
    }

    // Calculate mortgage insurance
    function calculateMortgageInsurance(homePrice, downPaymentPercentage) {
        if (downPaymentPercentage >= 20) {
            return 0;
        }

        const loanAmount = homePrice * (1 - downPaymentPercentage / 100);
        let rate = 0;

        if (downPaymentPercentage >= 5 && downPaymentPercentage < 10) {
            rate = 0.04;
        } else if (downPaymentPercentage >= 10 && downPaymentPercentage < 15) {
            rate = 0.031;
        } else if (downPaymentPercentage >= 15 && downPaymentPercentage < 20) {
            rate = 0.028;
        }

        return Math.round(loanAmount * rate);
    }

    // Calculate mortgage amount
    function calculateMortgageAmount(homePrice, downPayment, mortgageInsurance) {
        return homePrice - downPayment + mortgageInsurance;
    }

    // Calculate mortgage payment
    function calculateMortgagePayment(mortgageAmount, interestRate, amortizationYears, frequency) {
        // Convert annual interest rate to monthly
        const monthlyInterestRate = interestRate / 100 / 12;
        
        // Calculate total number of payments
        const totalPayments = amortizationYears * 12;
        
        // Calculate monthly payment using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
        const monthlyPayment = mortgageAmount * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
            (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
        
        // Adjust payment based on frequency
        switch (frequency) {
            case 'biweekly':
                return Math.round((monthlyPayment * 12) / 26 * 100) / 100;
            case 'accelerated':
                return Math.round((monthlyPayment * 12) / 24 * 100) / 100;
            default: // monthly
                return Math.round(monthlyPayment * 100) / 100;
        }
    }

    // Update home price
    function updateHomePrice() {
        const homePrice = parseFloat($('#home-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.homePrice;
        
        // Update all scenarios
        initialValues.scenarios.forEach(scenario => {
            const downPaymentAmount = Math.round(homePrice * (scenario.downPaymentPercentage / 100));
            const mortgageInsurance = calculateMortgageInsurance(homePrice, scenario.downPaymentPercentage);
            const mortgageAmount = calculateMortgageAmount(homePrice, downPaymentAmount, mortgageInsurance);
            
            // Update values in initialValues
            scenario.downPaymentAmount = downPaymentAmount;
            scenario.mortgageInsurance = mortgageInsurance;
            scenario.mortgageAmount = mortgageAmount;
            scenario.paymentAmount = calculateMortgagePayment(
                mortgageAmount,
                scenario.rate,
                scenario.amortizationYears,
                scenario.paymentFrequency
            );
            
            // Update DOM
            $(`#down-payment-${scenario.id}`).val(formatCurrency(downPaymentAmount));
            $(`.mortgage-box[data-scenario="${scenario.id}"] .insurance-label`).text(`+ ${formatCurrency(mortgageInsurance)} Mortgage Insurance`);
            $(`.mortgage-box[data-scenario="${scenario.id}"] .amount`).text(formatCurrency(mortgageAmount));
            $(`.payment-box[data-scenario="${scenario.id}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
        });
    }

    // Update scenario down payment
    function updateScenarioDownPayment(scenarioId) {
        const scenario = initialValues.scenarios.find(s => s.id === scenarioId);
        const homePrice = parseFloat($('#home-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.homePrice;
        
        // Get new down payment amount
        const downPaymentAmount = parseFloat($(`#down-payment-${scenarioId}`).val().replace(/[^0-9.-]+/g, '')) || scenario.downPaymentAmount;
        
        // Calculate new down payment percentage
        const downPaymentPercentage = Math.round((downPaymentAmount / homePrice) * 100 * 100) / 100;
        
        // Update the dropdown to match the percentage
        $(`#down-payment-percentage-${scenarioId}`).val(Math.round(downPaymentPercentage).toString());
        
        // Calculate mortgage insurance and mortgage amount
        const mortgageInsurance = calculateMortgageInsurance(homePrice, downPaymentPercentage);
        const mortgageAmount = calculateMortgageAmount(homePrice, downPaymentAmount, mortgageInsurance);
        
        // Update values in initialValues
        scenario.downPaymentAmount = downPaymentAmount;
        scenario.downPaymentPercentage = downPaymentPercentage;
        scenario.mortgageInsurance = mortgageInsurance;
        scenario.mortgageAmount = mortgageAmount;
        scenario.paymentAmount = calculateMortgagePayment(
            mortgageAmount,
            scenario.rate,
            scenario.amortizationYears,
            scenario.paymentFrequency
        );
        
        // Update DOM
        $(`.mortgage-box[data-scenario="${scenarioId}"] .insurance-label`).text(`+ ${formatCurrency(mortgageInsurance)} Mortgage Insurance`);
        $(`.mortgage-box[data-scenario="${scenarioId}"] .amount`).text(formatCurrency(mortgageAmount));
        $(`.payment-box[data-scenario="${scenarioId}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
    }

    // Update scenario down payment percentage
    function updateScenarioDownPaymentPercentage(scenarioId) {
        const scenario = initialValues.scenarios.find(s => s.id === scenarioId);
        const homePrice = parseFloat($('#home-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.homePrice;
        
        // Get new down payment percentage
        const downPaymentPercentage = parseFloat($(`#down-payment-percentage-${scenarioId}`).val()) || scenario.downPaymentPercentage;
        
        // Calculate new down payment amount
        const downPaymentAmount = Math.round(homePrice * (downPaymentPercentage / 100));
        
        // Calculate mortgage insurance and mortgage amount
        const mortgageInsurance = calculateMortgageInsurance(homePrice, downPaymentPercentage);
        const mortgageAmount = calculateMortgageAmount(homePrice, downPaymentAmount, mortgageInsurance);
        
        // Update values in initialValues
        scenario.downPaymentAmount = downPaymentAmount;
        scenario.downPaymentPercentage = downPaymentPercentage;
        scenario.mortgageInsurance = mortgageInsurance;
        scenario.mortgageAmount = mortgageAmount;
        scenario.paymentAmount = calculateMortgagePayment(
            mortgageAmount,
            scenario.rate,
            scenario.amortizationYears,
            scenario.paymentFrequency
        );
        
        // Update DOM
        $(`#down-payment-${scenarioId}`).val(formatCurrency(downPaymentAmount));
        $(`.mortgage-box[data-scenario="${scenarioId}"] .insurance-label`).text(`+ ${formatCurrency(mortgageInsurance)} Mortgage Insurance`);
        $(`.mortgage-box[data-scenario="${scenarioId}"] .amount`).text(formatCurrency(mortgageAmount));
        $(`.payment-box[data-scenario="${scenarioId}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
    }

    // Apply down payment to all scenarios
    function applyDownPaymentToAll(sourceScenarioId) {
        const sourceScenario = initialValues.scenarios.find(s => s.id === sourceScenarioId);
        const homePrice = parseFloat($('#home-price').val().replace(/[^0-9.-]+/g, '')) || initialValues.homePrice;
        
        // Update all other scenarios
        initialValues.scenarios.forEach(scenario => {
            if (scenario.id !== sourceScenarioId) {
                // Update values in initialValues
                scenario.downPaymentPercentage = sourceScenario.downPaymentPercentage;
                scenario.downPaymentAmount = sourceScenario.downPaymentAmount;
                scenario.mortgageInsurance = sourceScenario.mortgageInsurance;
                scenario.mortgageAmount = sourceScenario.mortgageAmount;
                scenario.paymentAmount = calculateMortgagePayment(
                    scenario.mortgageAmount,
                    scenario.rate,
                    scenario.amortizationYears,
                    scenario.paymentFrequency
                );
                
                // Update DOM
                $(`#down-payment-percentage-${scenario.id}`).val(Math.round(scenario.downPaymentPercentage).toString());
                $(`#down-payment-${scenario.id}`).val(formatCurrency(scenario.downPaymentAmount));
                $(`.mortgage-box[data-scenario="${scenario.id}"] .insurance-label`).text(`+ ${formatCurrency(scenario.mortgageInsurance)} Mortgage Insurance`);
                $(`.mortgage-box[data-scenario="${scenario.id}"] .amount`).text(formatCurrency(scenario.mortgageAmount));
                $(`.payment-box[data-scenario="${scenario.id}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
            }
        });
    }

    // Update amortization for a scenario
    function updateScenarioAmortization(scenarioId, years, months) {
        const scenario = initialValues.scenarios.find(s => s.id === scenarioId);
        
        // Update values in initialValues
        scenario.amortizationYears = years;
        scenario.amortizationMonths = months;
        
        // Recalculate payment
        scenario.paymentAmount = calculateMortgagePayment(
            scenario.mortgageAmount,
            scenario.rate,
            years + (months / 12),
            scenario.paymentFrequency
        );
        
        // Update DOM
        $(`.payment-box[data-scenario="${scenarioId}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
    }

    // Apply amortization to all scenarios
    function applyAmortizationToAll(sourceScenarioId) {
        const sourceScenario = initialValues.scenarios.find(s => s.id === sourceScenarioId);
        
        // Update all other scenarios
        initialValues.scenarios.forEach(scenario => {
            if (scenario.id !== sourceScenarioId) {
                // Update values in initialValues
                scenario.amortizationYears = sourceScenario.amortizationYears;
                scenario.amortizationMonths = sourceScenario.amortizationMonths;
                
                // Recalculate payment
                scenario.paymentAmount = calculateMortgagePayment(
                    scenario.mortgageAmount,
                    scenario.rate,
                    scenario.amortizationYears + (scenario.amortizationMonths / 12),
                    scenario.paymentFrequency
                );
                
                // Update DOM
                $(`.term-box[data-scenario="${scenario.id}"] .amortization-years select`).val(scenario.amortizationYears);
                $(`.term-box[data-scenario="${scenario.id}"] .amortization-months select`).val(scenario.amortizationMonths);
                $(`.payment-box[data-scenario="${scenario.id}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
            }
        });
    }

    // Update rate for a scenario
    function updateScenarioRate(scenarioId, rate) {
        const scenario = initialValues.scenarios.find(s => s.id === scenarioId);
        
        // Update values in initialValues
        scenario.rate = rate;
        
        // Recalculate payment
        scenario.paymentAmount = calculateMortgagePayment(
            scenario.mortgageAmount,
            rate,
            scenario.amortizationYears + (scenario.amortizationMonths / 12),
            scenario.paymentFrequency
        );
        
        // Update DOM
        $(`.payment-box[data-scenario="${scenarioId}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
    }

    // Update payment frequency for a scenario
    function updateScenarioPaymentFrequency(scenarioId, frequency) {
        const scenario = initialValues.scenarios.find(s => s.id === scenarioId);
        
        // Update values in initialValues
        scenario.paymentFrequency = frequency;
        
        // Recalculate payment
        scenario.paymentAmount = calculateMortgagePayment(
            scenario.mortgageAmount,
            scenario.rate,
            scenario.amortizationYears + (scenario.amortizationMonths / 12),
            frequency
        );
        
        // Update DOM
        $(`.payment-box[data-scenario="${scenarioId}"] .payment-amount span`).text(formatCurrency(scenario.paymentAmount));
    }

    // Toggle scenario active state
    function toggleScenarioActive(scenarioId) {
        // Update all scenarios
        initialValues.scenarios.forEach(scenario => {
            if (scenario.id === scenarioId) {
                scenario.isActive = true;
                $(`.scenario-box[data-scenario="${scenario.id}"]`).addClass('active');
            } else {
                scenario.isActive = false;
                $(`.scenario-box[data-scenario="${scenario.id}"]`).removeClass('active');
            }
        });
    }

    // Toggle scenario star
    function toggleScenarioStar(scenarioId) {
        const scenario = initialValues.scenarios.find(s => s.id === scenarioId);
        scenario.isStarred = !scenario.isStarred;
        
        if (scenario.isStarred) {
            $(`.scenario-box[data-scenario="${scenarioId}"] .star-icon`).text('★').addClass('active');
        } else {
            $(`.scenario-box[data-scenario="${scenarioId}"] .star-icon`).text('☆').removeClass('active');
        }
    }

    // Event Handlers
    
    // Home Price input change
    $('#home-price').on('input', function() {
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseFloat(value);
            $(this).val(formatCurrency(value));
            updateHomePrice();
        }
    });

    // Down Payment Percentage dropdown change
    $('[id^="down-payment-percentage-"]').on('change', function() {
        const scenarioId = parseInt($(this).attr('id').split('-')[3]);
        updateScenarioDownPaymentPercentage(scenarioId);
    });

    // Down Payment input change
    $('[id^="down-payment-"]').on('input', function() {
        const scenarioId = parseInt($(this).attr('id').split('-')[2]);
        let value = $(this).val().replace(/[^0-9.-]+/g, '');
        if (value) {
            value = parseFloat(value);
            $(this).val(formatCurrency(value));
            updateScenarioDownPayment(scenarioId);
        }
    });

    // Apply Down Payment to All button click
    $('.down-payment .apply-all').on('click', function() {
        const scenarioId = parseInt($(this).closest('.mortgage-box').attr('data-scenario'));
        applyDownPaymentToAll(scenarioId);
    });

    // Rate input change
    $('.rate-input input').on('input', function() {
        const scenarioId = parseInt($(this).closest('.term-box').attr('data-scenario'));
        let value = $(this).val().replace(/[^0-9.]+/g, '');
        if (value) {
            value = parseFloat(value);
            $(this).val(value + '%');
            updateScenarioRate(scenarioId, value);
        }
    });

    // Amortization Years change
    $('.amortization-years select').on('change', function() {
        const scenarioId = parseInt($(this).closest('.term-box').attr('data-scenario'));
        const years = parseInt($(this).val());
        const months = parseInt($(this).closest('.amortization').find('.amortization-months select').val());
        updateScenarioAmortization(scenarioId, years, months);
    });

    // Amortization Months change
    $('.amortization-months select').on('change', function() {
        const scenarioId = parseInt($(this).closest('.term-box').attr('data-scenario'));
        const months = parseInt($(this).val());
        const years = parseInt($(this).closest('.amortization').find('.amortization-years select').val());
        updateScenarioAmortization(scenarioId, years, months);
    });

    // Apply Amortization to All button click
    $('.amortization .apply-all').on('click', function() {
        const scenarioId = parseInt($(this).closest('.term-box').attr('data-scenario'));
        applyAmortizationToAll(scenarioId);
    });

    // Payment Frequency change
    $('.frequency-dropdown select').on('change', function() {
        const scenarioId = parseInt($(this).closest('.payment-box').attr('data-scenario'));
        const frequency = $(this).val();
        updateScenarioPaymentFrequency(scenarioId, frequency);
    });

    // Scenario box click to make active
    $('.scenario-box').on('click', function() {
        const scenarioId = parseInt($(this).attr('data-scenario'));
        toggleScenarioActive(scenarioId);
    });

    // Scenario star click
    $('.star-icon').on('click', function(e) {
        e.stopPropagation();
        const scenarioId = parseInt($(this).closest('.scenario-box').attr('data-scenario'));
        toggleScenarioStar(scenarioId);
    });

    // Tab clicks
    $('.tab').on('click', function() {
        const tabId = $(this).data('tab');
        
        // Update active tab
        $('.tab').removeClass('active');
        $(this).addClass('active');
        
        // Show relevant content
        $('.tab-content').hide();
        $(`#${tabId}`).show();
    });

    // Comparison Results Tab Button clicks
    $('.tab-btn').on('click', function() {
        // Update active tab button
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // In a more complete implementation, we would show different content
        // based on the selected tab, but for now we'll just highlight the active tab
        
        // Update the comparison header to match the selected tab
        const tabText = $(this).text();
        $('.comparison-header h2').text(tabText);
    });

    // Toggle options click
    $('.toggle-option').on('click', function() {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
    });

    // Show Differences toggle
    $('#show-differences').on('change', function() {
        const showDifferences = $(this).is(':checked');
        
        if (showDifferences) {
            // Find base scenario to compare against
            const baseScenarioId = initialValues.scenarios.findIndex(s => s.isStarred) + 1;
            
            // Get base scenario values
            const baseInterest = initialValues.scenarios[baseScenarioId - 1].termInterest;
            const basePrincipal = initialValues.scenarios[baseScenarioId - 1].termPrincipal;
            const basePayments = initialValues.scenarios[baseScenarioId - 1].totalTermPayments;
            const baseBalance = initialValues.scenarios[baseScenarioId - 1].balanceEndOfTerm;
            
            // Compare other scenarios and show differences
            initialValues.scenarios.forEach(scenario => {
                if (!scenario.isStarred) {
                    const scenarioId = scenario.id;
                    
                    // Calculate differences
                    const interestDiff = scenario.termInterest - baseInterest;
                    const principalDiff = scenario.termPrincipal - basePrincipal;
                    const paymentsDiff = scenario.totalTermPayments - basePayments;
                    const balanceDiff = scenario.balanceEndOfTerm - baseBalance;
                    
                    // Format and display differences with +/- sign
                    const formatDiff = (diff, baseValue) => {
                        const sign = diff >= 0 ? '+' : '';
                        const percentage = ((diff / baseValue) * 100).toFixed(1);
                        return `${formatCurrency(Math.abs(diff))} (${sign}${percentage}%)`;
                    };
                    
                    $(`.scenario${scenarioId} .comparison-item:nth-child(1) .item-value`).text(formatDiff(interestDiff, baseInterest));
                    $(`.scenario${scenarioId} .comparison-item:nth-child(2) .item-value`).text(formatDiff(principalDiff, basePrincipal));
                    $(`.scenario${scenarioId} .comparison-item:nth-child(3) .item-value`).text(formatDiff(paymentsDiff, basePayments));
                    $(`.scenario${scenarioId} .comparison-item:nth-child(4) .item-value`).text(formatDiff(balanceDiff, baseBalance));
                }
            });
        } else {
            // Reset to normal values
            updateComparisonResults();
        }
    });

    // Select Scenario button clicks
    $('.select-scenario-btn').on('click', function() {
        const scenarioBox = $(this).closest('.scenario-comparison-box');
        const scenarioId = parseInt(scenarioBox.attr('class').match(/scenario(\d+)/)[1]);
        
        // Update active state
        toggleScenarioActive(scenarioId);
        
        // Make this the base scenario
        initialValues.scenarios.forEach(s => {
            s.isStarred = (s.id === scenarioId);
        });
        
        // Update star icons
        $('.star-icon').removeClass('active').text('☆');
        $(`.scenario-box[data-scenario="${scenarioId}"] .star-icon`).addClass('active').text('★');
        
        // Update base scenario badge
        $('.base-scenario-badge').remove();
        $('.select-scenario-btn').show();
        
        scenarioBox.append('<div class="base-scenario-badge">Base Scenario</div>');
        scenarioBox.find('.select-scenario-btn').hide();
        
        // Update comparison results
        updateComparisonResults();
    });

    // Create Report button click
    $('.create-report').on('click', function() {
        alert('Report generation would be implemented here.');
    });

    // Add Scenario button click
    $('.add-scenario').on('click', function() {
        alert('Adding a new scenario would be implemented here.');
    });

    // Calculate and update comparison results
    function updateComparisonResults() {
        // Use the values from the image for all scenarios
        initialValues.scenarios.forEach(scenario => {
            // Update the comparison result values using the predefined values from the image
            $(`.scenario${scenario.id} .comparison-item:nth-child(1) .item-value`).text(formatCurrency(scenario.termInterest));
            $(`.scenario${scenario.id} .comparison-item:nth-child(2) .item-value`).text(formatCurrency(scenario.termPrincipal));
            $(`.scenario${scenario.id} .comparison-item:nth-child(3) .item-value`).text(formatCurrency(scenario.totalTermPayments));
            $(`.scenario${scenario.id} .comparison-item:nth-child(4) .item-value`).text(formatCurrency(scenario.balanceEndOfTerm));
            
            // Update chart values
            $(`.chart-bar.scenario${scenario.id} .bar-value`).text(formatCurrency(Math.round(scenario.termInterest)));
            
            // Set bar height proportional to interest amount
            const maxInterest = 250000; // Based on the y-axis values in the chart
            const barHeightPercentage = Math.min(100, (scenario.termInterest / maxInterest) * 100);
            $(`.chart-bar.scenario${scenario.id} .bar`).css('height', `${barHeightPercentage}%`);
        });
    }

    // Initialize the comparison results
    updateComparisonResults();
}); 