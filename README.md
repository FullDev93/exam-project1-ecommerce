# Mix Shope

Mix Shope is a responsive e-commerce front-end built with Vanilla JavaScript, HTML, and CSS. It uses the Noroff Online Shop API to load product data and supports the main shopping flow: browse products, view product details, register, log in, add products to the cart, complete checkout, and view a success page.

Live Demo: TODO

Repository: https://github.com/FullDev93/exam-project1-ecommerce

## Features

- Responsive homepage with carousel
- Product grid from API
- Product details page
- Register and login forms
- Token-based login state
- Add to cart for logged-in users
- LocalStorage cart
- Cart quantity controls
- Checkout form
- Success page
- Loading, error, and empty states
- Accessibility and SEO basics

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Noroff API
- Figma for design
- GitHub Projects for planning
- GitHub Pages for deployment

## Pages Overview

- Home: `index.html`
- Product details: `product/index.html`
- Login: `account/login.html`
- Register: `account/register.html`
- Cart: `cart/index.html`
- Checkout: `checkout/index.html`
- Success: `success/index.html`

## API Reference

- Online Shop API: https://docs.noroff.dev/docs/v2/basic/online-shop
- Authentication API: https://docs.noroff.dev/docs/v2/authentication
- Swagger: https://v2.api.noroff.dev/docs/static/index.html

## How To Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/FullDev93/exam-project1-ecommerce.git
   ```

2. Open the project folder.
3. Open `index.html` in the browser.

You can also use a local development server if available, such as VS Code Live Server.

## Project Planning

GitHub Projects was used for Kanban and Roadmap planning during the project. Tasks were organized into issues and tracked through the project board.

Project Board: TODO

## Design

Figma was used for the style guide and high-fidelity prototypes before and during development.

Figma Design: TODO

## Credits

- Noroff API for product and authentication endpoints
- Google Fonts for the Inter and Poppins font families
- Unsplash for placeholder and carousel images

## Development Tooling

The project includes formatting and linting tools for maintaining code quality.

```bash
npm install
npm run format
npm run format:check
npm run lint
npm run lint:fix
npm run lint:css
npm run lint:css:fix
```

## GitHub live demo

https://fulldev93.github.io/exam-project1-ecommerce/
