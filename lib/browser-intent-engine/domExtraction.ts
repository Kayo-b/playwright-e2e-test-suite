/**
 * Pure, self-contained browser-side extraction logic.
 *
 * Everything in this file executes inside the page via `page.evaluate`, so it must
 * not close over anything outside its own parameters (Playwright serializes the
 * function body and runs it in the browser context). Kept separate from
 * BrowserIntentEngine so the extraction heuristics can be unit tested and reasoned
 * about independently of Playwright wiring.
 */

export interface RawCandidate {
  id: string;
  tag: string;
  inputType: string | null;
  ariaRole: string | null;
  text: string;
  ariaLabel: string | null;
  name: string | null;
  placeholder: string | null;
  href: string | null;
  htmlId: string | null;
  className: string | null;
  disabled: boolean;
  checked: boolean | null;
  contentEditable: boolean;
}

export interface ExtractionParams {
  markerAttribute: string;
  includeSelectors: string[];
  excludeSelectors: string[];
  maxCandidates: number;
  textMaxLength: number;
  requireVisible: boolean;
}

/**
 * Runs in-page. Scans the DOM for interactive elements, stamps each match with a
 * fresh `markerAttribute` value so it can be re-located later via a Playwright
 * locator, and returns a clean structural description of each candidate.
 *
 * IMPORTANT: `page.evaluate` serializes this function via `Function#toString()` and
 * runs it in the browser context -- it does NOT capture module-scope closures, even
 * from this same file. Everything the function needs must be declared inside its
 * own body or passed in through `params`.
 */
export function collectInteractiveElements(params: ExtractionParams): RawCandidate[] {
  const { markerAttribute, includeSelectors, excludeSelectors, maxCandidates, textMaxLength, requireVisible } = params;
  const doc = document;

  // Clear stale markers left by a previous extraction pass on this same page.
  doc.querySelectorAll(`[${markerAttribute}]`).forEach((el) => el.removeAttribute(markerAttribute));

  const defaultInteractiveSelectors = [
    'button',
    'a[href]',
    'input',
    'textarea',
    'select',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[onclick]',
    '[contenteditable="true"]',
  ];
  const selectors = includeSelectors.length > 0 ? includeSelectors : defaultInteractiveSelectors;
  const nodes = new Set<Element>();
  for (const selector of selectors) {
    try {
      doc.querySelectorAll(selector).forEach((el) => nodes.add(el));
    } catch {
      // Skip selectors that are invalid in this document (defensive, config-driven input).
    }
  }

  const isExcluded = (el: Element): boolean =>
    excludeSelectors.some((selector) => {
      try {
        return el.matches(selector);
      } catch {
        return false;
      }
    });

  const isVisible = (el: Element): boolean => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) !== 0;
  };

  /** Best-effort catch-all for elements that only react to JS click listeners. */
  const hasClickHeuristic = (el: Element): boolean => {
    if (el.hasAttribute('onclick')) return true;
    const tabIndexAttr = el.getAttribute('tabindex');
    if (tabIndexAttr !== null && Number(tabIndexAttr) >= 0) {
      if (window.getComputedStyle(el).cursor === 'pointer') return true;
    }
    return false;
  };

  const results: RawCandidate[] = [];
  let counter = 0;

  for (const el of nodes) {
    if (results.length >= maxCandidates) break;
    if (isExcluded(el)) continue;

    const tag = el.tagName.toLowerCase();
    const isNativeInteractive = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'textarea' || tag === 'select';
    const isEditable = el.getAttribute('contenteditable') === 'true';
    const isRoleInteractive = el.hasAttribute('role');
    if (!isNativeInteractive && !isEditable && !isRoleInteractive && !hasClickHeuristic(el)) continue;

    if (requireVisible && !isVisible(el)) continue;
    if ((el as HTMLInputElement).disabled) continue;

    const id = `bie-${counter++}`;
    el.setAttribute(markerAttribute, id);

    const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, textMaxLength);

    results.push({
      id,
      tag,
      inputType: el.getAttribute('type'),
      ariaRole: el.getAttribute('role'),
      text,
      ariaLabel: el.getAttribute('aria-label'),
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder'),
      href: el.getAttribute('href'),
      htmlId: el.id || null,
      className: typeof el.className === 'string' ? el.className : null,
      disabled: Boolean((el as HTMLInputElement).disabled),
      checked: 'checked' in el ? Boolean((el as HTMLInputElement).checked) : null,
      contentEditable: isEditable,
    });
  }

  return results;
}
