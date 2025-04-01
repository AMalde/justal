document.addEventListener('DOMContentLoaded', function () {
    // Progressive enhancement: check if fetch is supported
    if (typeof fetch === 'undefined') {
      console.warn('Fetch API not supported. Falling back to normal navigation.');
      return;
    }
  
    // Grab the main container
    const mainContainer = document.getElementById('page-content');
    if (!mainContainer) {
      console.error('No element with id="page-content" found. Aborting JS enhancements.');
      return;
    }
  
    // Attach a click listener to the nav
    const navElement = document.querySelector('nav');
    if (!navElement) {
      console.warn('No <nav> element found. Aborting JS link interception.');
      return;
    }
  
    navElement.addEventListener('click', function (event) {
      const target = event.target;
      if (target.tagName.toLowerCase() === 'a') {
        const url = target.getAttribute('href');
  
        // Basic check for relative/internal links
        if (url && !url.startsWith('http') && !url.startsWith('#')) {
          event.preventDefault();
          loadPage(url);
        }
      }
    });
  
    async function loadPage(url) {
      try {
        // Fade out content
        mainContainer.classList.add('fade-out');
  
        // Wait for transition to complete before fetching
        mainContainer.addEventListener('transitionend', async function handler() {
          mainContainer.removeEventListener('transitionend', handler);
  
          let response;
          try {
            response = await fetch(url);
          } catch (fetchErr) {
            console.error('Fetch failed:', fetchErr);
            fallbackToFullPageLoad(url);
            return;
          }
  
          if (!response.ok) {
            console.error(`HTTP error: ${response.status} for ${url}`);
            fallbackToFullPageLoad(url);
            return;
          }
  
          let text;
          try {
            text = await response.text();
          } catch (readErr) {
            console.error('Failed to read response text:', readErr);
            fallbackToFullPageLoad(url);
            return;
          }
  
          const parser = new DOMParser();
          let doc;
          try {
            doc = parser.parseFromString(text, 'text/html');
          } catch (parseErr) {
            console.error('DOM parsing failed:', parseErr);
            fallbackToFullPageLoad(url);
            return;
          }
  
          // Grab title & main content
          const newTitleEl = doc.querySelector('title');
          const newMainEl = doc.querySelector('#page-content');
  
          if (newTitleEl) {
            document.title = newTitleEl.innerText.trim();
          } else {
            console.warn('No <title> found in the fetched page.');
          }
  
          if (newMainEl) {
            mainContainer.innerHTML = newMainEl.innerHTML;
          } else {
            console.error('#page-content not found in fetched page. Falling back.');
            fallbackToFullPageLoad(url);
            return;
          }
  
          // Update browser history
          window.history.pushState({ path: url }, '', url);
  
          // Force reflow then remove fade-out for fade-in
          mainContainer.offsetHeight;
          mainContainer.classList.remove('fade-out');
        });
      } catch (err) {
        console.error('Unexpected error in loadPage:', err);
        fallbackToFullPageLoad(url);
      }
    }
  
    function fallbackToFullPageLoad(url) {
      window.location.href = url;
    }
  
    // Handle back/forward navigation
    window.addEventListener('popstate', function (event) {
      const url = event.state?.path || window.location.pathname;
      fetchAndReplaceContent(url);
    });
  
    async function fetchAndReplaceContent(url) {
      try {
        mainContainer.classList.add('fade-out');
        mainContainer.addEventListener('transitionend', async function handler() {
          mainContainer.removeEventListener('transitionend', handler);
  
          let response;
          try {
            response = await fetch(url);
          } catch (fetchErr) {
            console.error('Fetch failed during popstate:', fetchErr);
            fallbackToFullPageLoad(url);
            return;
          }
  
          if (!response.ok) {
            console.error(`HTTP error: ${response.status} for ${url} during popstate.`);
            fallbackToFullPageLoad(url);
            return;
          }
  
          let text;
          try {
            text = await response.text();
          } catch (readErr) {
            console.error('Failed to read response text during popstate:', readErr);
            fallbackToFullPageLoad(url);
            return;
          }
  
          const parser = new DOMParser();
          let doc;
          try {
            doc = parser.parseFromString(text, 'text/html');
          } catch (parseErr) {
            console.error('DOM parsing failed during popstate:', parseErr);
            fallbackToFullPageLoad(url);
            return;
          }
  
          const newTitleEl = doc.querySelector('title');
          const newMainEl = doc.querySelector('#page-content');
  
          if (newTitleEl) {
            document.title = newTitleEl.innerText.trim();
          }
          if (newMainEl) {
            mainContainer.innerHTML = newMainEl.innerHTML;
          } else {
            console.error('#page-content missing in fetched page during popstate. Falling back.');
            fallbackToFullPageLoad(url);
            return;
          }
  
          mainContainer.offsetHeight;
          mainContainer.classList.remove('fade-out');
        });
      } catch (err) {
        console.error('Unexpected error in fetchAndReplaceContent:', err);
        fallbackToFullPageLoad(url);
      }
    }
  });