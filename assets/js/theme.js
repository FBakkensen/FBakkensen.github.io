// Theme toggle, persistence, Mermaid re-theme, reading progress.
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = 'theme';

  function current() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function mermaidThemeVariables(theme) {
    var dark = theme === 'dark';
    return {
      background: 'transparent',
      primaryColor: dark ? '#161B22' : '#F6F8FA',
      primaryBorderColor: dark ? '#30363D' : '#D0D7DE',
      primaryTextColor: dark ? '#E6EDF3' : '#1F2328',
      lineColor: dark ? '#8B949E' : '#656D76',
      textColor: dark ? '#E6EDF3' : '#1F2328',
      secondaryColor: dark ? '#0D1117' : '#FFFFFF',
      tertiaryColor: dark ? '#161B22' : '#F6F8FA',
      nodeTextColor: dark ? '#E6EDF3' : '#1F2328',
      mainBkg: dark ? '#161B22' : '#F6F8FA',
      actorBkg: dark ? '#161B22' : '#F6F8FA',
      actorBorder: dark ? '#30363D' : '#D0D7DE',
      actorTextColor: dark ? '#E6EDF3' : '#1F2328',
      labelBoxBkgColor: dark ? '#0D1117' : '#FFFFFF',
      labelBoxBorderColor: dark ? '#30363D' : '#D0D7DE',
      fontFamily: 'JetBrains Mono, Cascadia Code, Consolas, monospace'
    };
  }
  window.mermaidThemeVariables = mermaidThemeVariables;

  function setIcon(btn) {
    var dark = current() === 'dark';
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function rerenderMermaid() {
    if (!window.mermaid) return;
    var nodes = document.querySelectorAll('.mermaid');
    if (!nodes.length) return;
    nodes.forEach(function (n) {
      n.removeAttribute('data-processed');
      n.innerHTML = n.dataset.source;
    });
    window.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: mermaidThemeVariables(current()) });
    window.mermaid.run({ nodes: nodes });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Mermaid (deferred, renders on load) replaces node contents with SVG; keep the source first.
    document.querySelectorAll('.mermaid').forEach(function (n) { n.dataset.source = n.innerHTML; });

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      setIcon(btn);
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
        setIcon(btn);
        rerenderMermaid();
      });
    }

    var bar = document.getElementById('reading-progress');
    var article = document.querySelector('.post-body');
    if (bar && article) {
      var update = function () {
        var top = article.offsetTop;
        var h = article.offsetHeight - window.innerHeight;
        var p = h > 0 ? (window.scrollY - top) / h : 1;
        bar.style.width = Math.max(0, Math.min(100, Math.round(p * 100))) + '%';
      };
      document.addEventListener('scroll', update, { passive: true });
      update();
    }
  });
})();
