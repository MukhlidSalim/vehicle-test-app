/**
 * Utility to scroll to the first element on the page marked with data-error="true".
 * This provides immediate feedback to the user by focusing the invalid field in the center of the screen,
 * which avoids issues with fixed headers/footers obscuring the error, especially on mobile devices.
 */
export const scrollToFirstError = () => {
  // Give DOM a tick to update data-error attributes
  setTimeout(() => {
    const firstErrorElement = document.querySelector('[data-error="true"]');
    if (firstErrorElement) {
      // Find a focusable element within the error container, or focus the container itself
      const focusable = firstErrorElement.querySelector('input, select, textarea, button, [tabindex]:not([tabindex="-1"])') || firstErrorElement;
      
      // Scroll into view centered to avoid fixed bars
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Apply focus after a slight delay for smooth scrolling to start
      setTimeout(() => {
        if (focusable instanceof HTMLElement) {
          // If it's an input/textarea, focus it directly
          if (['INPUT', 'TEXTAREA', 'SELECT'].includes(focusable.tagName)) {
            focusable.focus({ preventScroll: true });
          } else {
            // For custom divs (like custom drop-downs), we can try focusing if they have tabindex
            if (focusable.hasAttribute('tabindex')) {
              focusable.focus({ preventScroll: true });
            }
          }
        }
      }, 300);
    }
  }, 100);
};
