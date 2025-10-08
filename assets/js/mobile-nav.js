/**
 * Mobile Navigation Toggle
 * Handles hamburger menu functionality for mobile devices
 */
(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.terminal-nav');

    if (!hamburger || !nav) return;

    // Toggle navigation on hamburger click
    hamburger.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      // Toggle aria-expanded
      this.setAttribute('aria-expanded', !isExpanded);

      // Toggle active class
      this.classList.toggle('active');
      nav.classList.toggle('active');

      // Prevent body scroll when menu is open
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close menu when clicking nav links
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close menu on window resize if going to desktop size
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth >= 768 && nav.classList.contains('active')) {
          hamburger.classList.remove('active');
          nav.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }, 250);
    });
  }
})();
