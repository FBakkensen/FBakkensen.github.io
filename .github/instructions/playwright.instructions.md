---
applyTo: '**'
---

# Jekyll Blog Testing & Debugging with Playwright MCP

## Project Context
This is a Jekyll-based blog site hosted on GitHub Pages. The site includes:
- Blog posts with tags and categories
- Navigation system
- Google Analytics integration
- Table of Contents for posts
- Multiple layouts (home, post, page, base)
- Hot reload development server at http://127.0.0.1:4000/

## Testing Strategy with Playwright MCP

When testing or debugging this site, use the Playwright MCP server tools to perform comprehensive edge case validation. **Do NOT write test scripts** - instead, use the MCP tools directly to interact with the browser.

### Test Execution Workflow

1. **Navigate to page**: Use `mcp_playwright_browser_navigate` to load pages
2. **Capture state**: Use `mcp_playwright_browser_snapshot` for accessibility tree (preferred for interactions)
3. **Inspect console**: Use `mcp_playwright_browser_console_messages` to check for JavaScript errors
4. **Validate network**: Use `mcp_playwright_browser_network_requests` to verify all resources load
5. **Take screenshot**: Use `mcp_playwright_browser_take_screenshot` for visual verification
6. **Test interactions**: Use click, hover, type tools to validate functionality
7. **Execute JS**: Use `mcp_playwright_browser_evaluate` for custom validations

### Comprehensive Edge Cases to Test Every Time

#### 1. **Home Page Validation**
- [ ] Navigate to `http://127.0.0.1:4000/`
- [ ] Verify all blog post titles are visible and clickable
- [ ] Check navigation menu renders correctly
- [ ] Validate no console errors (JavaScript)
- [ ] Verify all images load (check network requests)
- [ ] Test responsive design (resize to mobile: 375x667, tablet: 768x1024, desktop: 1920x1080)
- [ ] Verify Google Analytics script loads (if configured)
- [ ] Check that posts are sorted by date (newest first)
- [ ] Hover over links to verify hover states work

#### 2. **Blog Post Page Validation**
- [ ] Navigate to at least 3 different blog posts
- [ ] Verify Table of Contents (TOC) renders if post has headers
- [ ] Click TOC links to verify smooth scrolling/navigation
- [ ] Check code syntax highlighting works
- [ ] Verify post metadata (date, tags, author) displays
- [ ] Test tag links navigate to tag pages
- [ ] Verify "Back to home" or similar navigation works
- [ ] Check for broken internal links
- [ ] Test external links open correctly
- [ ] Verify images in posts load properly
- [ ] Check responsive layout on mobile/tablet/desktop

#### 3. **Tags Page Validation**
- [ ] Navigate to `http://127.0.0.1:4000/tags.html`
- [ ] Verify all tags are listed
- [ ] Click on tags to filter posts
- [ ] Verify filtered results show correct posts
- [ ] Check no console errors during filtering
- [ ] Test with posts that have multiple tags
- [ ] Verify posts with no tags don't break the page

#### 4. **About Page Validation**
- [ ] Navigate to `http://127.0.0.1:4000/about.html`
- [ ] Verify content renders correctly
- [ ] Check all links work
- [ ] Validate no console errors

#### 5. **Navigation Testing**
- [ ] Test all navigation links from header
- [ ] Use browser back button (`mcp_playwright_browser_navigate_back`)
- [ ] Verify active page highlighting in navigation
- [ ] Test navigation on mobile (collapsed menu if applicable)
- [ ] Click logo/home link from different pages

#### 6. **Performance & Network**
- [ ] Check all CSS files load successfully
- [ ] Verify JavaScript files load without errors
- [ ] Validate no 404 errors in network requests
- [ ] Check page load time is reasonable
- [ ] Verify no mixed content warnings (HTTP/HTTPS)

#### 7. **Accessibility Validation**
- [ ] Use `mcp_playwright_browser_snapshot` to check accessibility tree
- [ ] Verify all images have alt text
- [ ] Check heading hierarchy is logical (h1 -> h2 -> h3)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify color contrast is sufficient
- [ ] Check ARIA labels where appropriate

#### 8. **Edge Cases & Error Scenarios**
- [ ] Navigate to non-existent page (404 handling)
- [ ] Test with JavaScript disabled (if possible)
- [ ] Test with very long post titles
- [ ] Test with posts containing special characters
- [ ] Test with posts containing many tags
- [ ] Verify empty search results are handled gracefully
- [ ] Test browser zoom levels (50%, 100%, 150%, 200%)
- [ ] Test with ad blockers enabled (analytics may be blocked)

#### 9. **Cross-Page Journey Testing**
- [ ] Home → Post → Tags → Another Post → Home
- [ ] Verify session state is maintained
- [ ] Check browser history works correctly
- [ ] Test deep linking (direct navigation to post)

#### 10. **Visual Regression**
- [ ] Take screenshots of key pages
- [ ] Compare with previous screenshots (manual or automated)
- [ ] Check for layout shifts or broken CSS
- [ ] Verify fonts load correctly
- [ ] Check for overlapping elements

### When User Requests Testing

Execute the following sequence:

```
1. Install browser (if needed): mcp_playwright_browser_install
2. Navigate to target page(s)
3. For EACH page tested:
   a. Take accessibility snapshot
   b. Check console messages (errors only)
   c. Check network requests (look for failures)
   d. Take screenshot for visual verification
   e. Test interactive elements (clicks, hovers, forms)
   f. Evaluate custom JavaScript if needed
   g. Test responsive layouts (resize browser)
4. Navigate back/forward to test history
5. Test cross-page journeys
6. Report ALL findings with specific details
```

### Reporting Results

After testing, provide:
- ✅ **Passed tests**: List what works correctly
- ❌ **Failed tests**: Describe failures with specifics (selectors, error messages, network status)
- ⚠️ **Warnings**: Non-critical issues (performance, accessibility suggestions)
- 📸 **Screenshots**: Visual evidence of issues
- 🔧 **Recommendations**: Suggested fixes for any issues found

### Quick Commands Reference

```javascript
// Navigate to home
mcp_playwright_browser_navigate({ url: "http://127.0.0.1:4000/" })

// Check console errors
mcp_playwright_browser_console_messages({ onlyErrors: true })

// Capture accessibility snapshot
mcp_playwright_browser_snapshot()

// Take screenshot
mcp_playwright_browser_take_screenshot({ fullPage: true })

// Resize for mobile testing
mcp_playwright_browser_resize({ width: 375, height: 667 })

// Check network requests
mcp_playwright_browser_network_requests()

// Execute custom validation
mcp_playwright_browser_evaluate({
  function: "() => document.querySelectorAll('a[href^=\"http\"]').length"
})
```

### Example Test Session

When asked to "test the site", execute:

1. **Home page comprehensive test**
2. **Pick 3 recent blog posts and test each**
3. **Test tags page**
4. **Test about page**
5. **Test responsive layouts (mobile, tablet, desktop)**
6. **Validate navigation flows**
7. **Check console and network for all pages**
8. **Provide comprehensive report**

## Development Guidelines

When making changes to the site:
- Always test in hot reload environment first
- Validate changes don't break existing functionality
- Check responsive design at multiple breakpoints
- Verify console shows no new errors
- Test on both Chromium and Firefox if possible (use tabs)