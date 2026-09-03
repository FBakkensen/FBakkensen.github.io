// Highlights the current H2 in the sticky rail.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc-rail a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
    var headings = Array.prototype.slice.call(document.querySelectorAll('.post-body h2[id]'))
      .filter(function (h) { return byId[h.id]; });
    if (!headings.length) return;

    function setCurrent(id) {
      links.forEach(function (a) { a.classList.toggle('is-current', a === byId[id]); });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { observer.observe(h); });
    setCurrent(headings[0].id);
  });
})();
