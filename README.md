# playwright e2e test suite demo

End-to-end testing framework for a social media application utilizing Playwright.

## Overview

This test suite covers critical user workflows including authentication, post interactions, profile management, bookmarks, and navigation. The implementation showcases page object patterns, custom fixtures, and resilient test strategies.

## Key Features

### Self-Healing Test Architecture
- **Dynamic Locator Strategies**: Tests automatically fall back to alternative selectors when primary locators fail
- **Retry Mechanisms**: Built-in retry logic for flaky network requests and asynchronous operations
- **Flexible Element Detection**: Multiple locator methods (role, text, CSS, XPath) ensure tests adapt to UI changes
- **Graceful Degradation**: Tests continue execution even when optional elements are unavailable

### Test Organization
- **Page Object Model**: Reusable page classes encapsulate UI interactions and locators
- **Custom Fixtures**: Shared authentication and page setup reduce test duplication
- **Modular Design**: Isolated test specs for maintainability and parallel execution

### Coverage
- User authentication (login, registration, password reset)
- Post creation, editing, and deletion
- Bookmarks and favorites
- Profile customization
- Search functionality
- Navigation and routing

## Project Structure

```
├── fixtures/          # Custom test fixtures for authentication and pages
├── pages/             # Page object models for each application view
├── tests/             # Test specifications organized by feature
└── playwright.config.ts
```

## Getting Started

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests in UI mode
npx playwright test --ui

# View test report
npx playwright show-report
```

## Configuration

The test suite is configured to run across multiple browsers (Chromium, Firefox, WebKit) with parallel execution enabled. Tests include automatic screenshots on failure and video recording for debugging.
