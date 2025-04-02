document.addEventListener('DOMContentLoaded', function () {
    const mainContainer = document.getElementById('page-content');
    const navElement = document.querySelector('nav');
  
    if (!mainContainer || !navElement) {
      console.error('Essential DOM elements missing.');
      return;
    }
  
    // Attach listeners universally:
    attachNavListeners(navElement, mainContainer);
  
    // Re-bind any JavaScript events on the loaded content.
    initializePageScripts(); 
  });
  
  function attachNavListeners(nav, container) {
    nav.addEventListener('click', function (event) {
      const target = event.target.closest('a');
      if (target && target.tagName === 'A') {
        const url = target.getAttribute('href');
  
        if (url && !url.startsWith('http') && !url.startsWith('#')) {
          event.preventDefault();
          loadPage(url, container);
        }
      }
    });
  }
  
  async function loadPage(url, container) {
    container.classList.add('fade-out');
  
    container.addEventListener('transitionend', async function handler() {
      container.removeEventListener('transitionend', handler);
  
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response error');
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
  
        // Replace content
        const newContent = doc.getElementById('page-content');
        if (newContent) {
          container.innerHTML = newContent.innerHTML;
        } else {
          throw new Error('Content missing in fetched page');
        }
  
        // Update page title
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.innerText;
  
        // Update history
        window.history.pushState({ path: url }, '', url);
  
        container.offsetHeight;
        container.classList.remove('fade-out');
  
        // IMPORTANT: Re-initialize events after new content loads
        initializePageScripts(); 
  
      } catch (error) {
        console.error('Error loading page:', error);
        window.location.href = url;
      }
    });
  }
  
  // Handle back/forward navigation robustly
  window.addEventListener('popstate', function (event) {
    const url = event.state?.path || window.location.pathname;
    fetchAndReplaceContent(url);
  });
  
  async function fetchAndReplaceContent(url) {
    const container = document.getElementById('page-content');
    container.classList.add('fade-out');
  
    container.addEventListener('transitionend', async function handler() {
      container.removeEventListener('transitionend', handler);
  
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response error');
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
  
        const newContent = doc.getElementById('page-content');
        if (newContent) container.innerHTML = newContent.innerHTML;
  
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.innerText;
  
        container.offsetHeight;
        container.classList.remove('fade-out');
  
        // Re-initialize events after content swap
        initializePageScripts();
  
      } catch (error) {
        console.error('Error during popstate:', error);
        window.location.href = url;
      }
    });
  }
  
  // This function runs every time the content is loaded or swapped
  function initializePageScripts() {
    // Re-bind all event listeners needed on page elements
    // Example: buttons, dynamic elements, etc.
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        console.log('Button clicked:', button.textContent);
      });
    });
  
    // Add additional JS event bindings here as needed
  }