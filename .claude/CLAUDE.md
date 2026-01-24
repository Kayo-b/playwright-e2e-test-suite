# Playwright Best Practices

## Locator Strategy
- Use getByRole, getByLabel, getByTestId over CSS selectors
- Avoid generic selectors like .class or #id

## Timing
- NEVER use page.waitForTimeout() or fixed waits
- Use built-in locator timeouts and auto-waiting
- Use expect() with proper timeout configurations
- Example: await expect(locator).toBeVisible({ timeout: 5000 })

## Component Loading
- Let Playwright's auto-wait handle timing
- Use actionability checks built into locators
- Use state-based waits: waitForLoadState('domcontentloaded')

## Methods to Avoid
- waitForTimeout (timing issues)
- waitForSelector (use locators instead)
- CSS selectors without semantic meaning
