/* Shared header and footer for the project pages, so the navigation lives in one place. */
(function () {
  var PAGES = [
    ['index.html', 'Hub', ''],
    ['app.html', 'The app', 'Open the prototype and walk through it yourself.'],
    ['concept.html', 'The concept', 'How it is put together, and what is still open.'],
    ['features.html', 'Features', 'What is in it, screen by screen, and why each piece exists.'],
    ['loops.html', 'Core loops', 'The four loops that bring her back.'],
    ['relationship.html', 'The relationship', 'What the app is to her, and what it will never do.'],
    ['thinking.html', 'The thinking', 'The ideas underneath it.'],
    ['notes.html', 'Leave a note', 'How to tell us what you think.']
  ];
  var here = location.pathname.split('/').pop() || 'index.html';
  var at = 0;
  PAGES.forEach(function (p, i) { if (p[0] === here) at = i; });
  /* reading order runs concept, features, loops, relationship, thinking, and ends at the app */
  var order = [2, 3, 4, 5, 6, 1], next = PAGES[order.indexOf(at) < 0 ? 2 : order[(order.indexOf(at) + 1) % order.length]];

  var head = document.getElementById('site-head'), foot = document.getElementById('site-foot');
  if (head) head.innerHTML = '<div class="wrap site-head"><a class="brand" href="index.html"><img src="assets/logo.svg" alt=""><span>Kin &amp; Rhythm</span></a><nav class="nav" aria-label="Project pages">' +
    PAGES.slice(1).map(function (p) { return '<a href="' + p[0] + '"' + (p[0] === here ? ' class="on" aria-current="page"' : '') + '>' + p[1] + '</a>'; }).join('') + '</nav></div>';
  if (foot) foot.innerHTML = '<div class="wrap site-foot"><a class="next" href="' + next[0] + '"><span><span class="eyebrow">Next</span><span class="display d3">' + next[1] + '</span><span>' + next[2] + '</span></span><img src="assets/icon-next.svg" alt=""></a>' +
    '<p class="note">Working prototype, November 2026. Everything entered in the app stays on the device it was typed on. Kin &amp; Rhythm is for education and inspiration and is not medical advice.</p></div>';

  /* notes: a link under every section, a button on every page, and the answer buttons on the notes page */
  if (typeof noteUrl !== 'function') return;
  var page = PAGES[at][1], ctx = 'Page: ' + here;
  if (here !== 'notes.html') {
    Array.prototype.forEach.call(document.querySelectorAll('main article, main section'), function (el) {
      var h = el.querySelector('h2');
      if (h) h.parentElement.insertAdjacentHTML('beforeend', '<a class="note-link" target="_blank" rel="noopener" href="' + noteUrl('Site › ' + page + ' › ' + h.textContent.trim(), ctx) + '">Leave a note on this</a>');
    });
    document.body.insertAdjacentHTML('beforeend', '<a class="note-fab" target="_blank" rel="noopener" href="' + noteUrl('Site › ' + page, ctx) + '">Leave a note</a>');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-question]'), function (a) { a.href = noteUrl('', ctx, a.getAttribute('data-question')); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-notes]'), function (a) { a.href = APP.notes + a.getAttribute('data-notes'); });
})();
