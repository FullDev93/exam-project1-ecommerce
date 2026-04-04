# Mix Shope

Mix Shope is a vanilla front-end e-commerce project that provides the base structure for a small storefront experience. The project includes separate pages for browsing, cart flow, checkout, authentication, product details, and order success, with shared CSS and JavaScript assets organized for straightforward development and extension.

## Project Overview

The repository is set up as a static multi-page storefront. It uses reusable CSS layers, page-specific JavaScript entry files, and lightweight project tooling for formatting and linting.

## Pages

- [Home](./index.html)
- [Cart](./cart/index.html)
- [Checkout](./checkout/index.html)
- [Product](./product/index.html)
- [Success](./success/index.html)
- [Login](./account/login.html)
- [Register](./account/register.html)

## How To Run

Because this is a vanilla multi-page project, you can run it in either of these ways:

### Option 1: Open directly

Open `index.html` in the browser.

### Option 2: Run with a local static server

If you prefer local hosting, use any static server such as VS Code Live Server.

Example with VS Code:

1. Open the project folder in VS Code.
2. Start a local server with Live Server or a similar extension.
3. Open the served `index.html` page.

## Development Tooling

After installing dependencies, these commands are available:

```bash
npm install
npm run format
npm run format:check
npm run lint
npm run lint:fix
npm run lint:css
npm run lint:css:fix
```

## Folder Structure

```text
.
|-- account/
|   |-- login.html
|   `-- register.html
|-- assets/
|   |-- icons/
|   `-- images/
|-- cart/
|   `-- index.html
|-- checkout/
|   `-- index.html
|-- css/
|   |-- base.css
|   |-- components.css
|   |-- pages.css
|   `-- variables.css
|-- js/
|   |-- api.js
|   |-- app.js
|   |-- cart.js
|   |-- checkout.js
|   |-- config.js
|   |-- home.js
|   |-- login.js
|   |-- product.js
|   |-- register.js
|   |-- storage.js
|   |-- success.js
|   |-- ui.js
|   `-- validation.js
|-- product/
|   `-- index.html
|-- success/
|   `-- index.html
|-- index.html
|-- package.json
`-- README.md
```

## Technologies Used

- HTML5 for the page structure
- CSS3 for layout, components, and shared design tokens
- Vanilla JavaScript for page logic and shared utilities
- npm for project tooling and dependency management
- Prettier for code formatting
- ESLint for JavaScript linting
- Stylelint for CSS linting
- EditorConfig and Git attributes for consistent line endings and editor behavior
