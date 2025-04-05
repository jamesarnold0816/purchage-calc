# Purchase Calculator

A responsive web-based mortgage purchase calculator built with HTML, CSS, JavaScript, and jQuery. This calculator helps users calculate mortgage payments, including interest rates, amortization, and various expenses associated with home purchases.

## Features

- Calculate mortgage payments based on purchase price, down payment, interest rate, and amortization period
- Toggle between fixed and variable rate types
- View detailed breakdown of payments, including:
  - Monthly mortgage payment
  - Home expenses (property tax, condo fees, insurance, etc.)
  - Other expenses
  - Rental income (optional)
- View mortgage details including:
  - Total mortgage amount
  - Closing costs
  - Mortgage insurance
  - Interest paid over term
  - Balance at end of term
  - Effective amortization
- Option to download a detailed report
- Responsive design that works on both desktop and mobile devices

## Files

- `index.html` - The main HTML structure of the calculator
- `styles.css` - CSS styling for the calculator
- `script.js` - JavaScript functionality powered by jQuery
- `arrow-down.svg` - SVG icon for dropdown indicators

## Usage

1. Open `index.html` in a web browser
2. Input your purchase price, down payment, and other relevant information
3. The calculator will automatically update the results based on your inputs
4. Use the toggles and buttons to adjust settings as needed

## Dependencies

- jQuery 3.6.0 (loaded via CDN)

## Implementation Notes

- The calculator includes dummy data for demonstration purposes
- In a production environment, you would implement proper form validation and error handling
- The slider is implemented with a simplified click handler, but in production, you would use a proper slider library

## Screenshot

![Purchase Calculator Screenshot](screenshot.png) (not included)

## License

This project is for demonstration purposes only. 