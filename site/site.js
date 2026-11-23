/* Shared header and footer for the project pages, so the navigation lives in one place. */
(function () {
  var PAGES = [
    ['index.html', 'Hub', ''],
    ['app.html', 'The app', 'Open the prototype and walk through it yourself.'],
    ['features.html', 'Features', 'What is in it, screen by screen, and why each piece exists.'],
    ['loops.html', 'Core loops', 'The four rhythms that bring her back.'],
    ['relationship.html', 'The relationship', 'What the app is to her, and what it will never do.'],
    ['thinking.html', 'The thinking', 'The ideas underneath it.']
  ];
  var here = location.pathname.split('/').pop() || 'index.html';
  var at = 0;
  PAGES.forEach(function (p, i) { if (p[0] === here) at = i; });
  /* reading order runs features, loops, relationship, thinking, and ends at the app */
  var order = [2, 3, 4, 5, 1], next = PAGES[at === 0 ? 2 : order[(order.indexOf(at) + 1) % order.length]];

  var head = document.getElementById('site-head'), foot = document.getElementById('site-foot');
  if (head) head.innerHTML = '<div class="wrap site-head"><a class="brand" href="index.html"><img src="assets/logo.svg" alt=""><span>Kin &amp; Rhythm</span></a><nav class="nav" aria-label="Project pages">' +
    PAGES.slice(1).map(function (p) { return '<a href="' + p[0] + '"' + (p[0] === here ? ' class="on" aria-current="page"' : '') + '>' + p[1] + '</a>'; }).join('') + '</nav></div>';
  if (foot) foot.innerHTML = '<div class="wrap site-foot"><a class="next" href="' + next[0] + '"><span><span class="eyebrow">Next</span><span class="display d3">' + next[1] + '</span><span>' + next[2] + '</span></span><img src="assets/icon-next.svg" alt=""></a>' +
    '<p class="note">Working prototype, November 2026. Everything entered in the app stays on the device it was typed on. Kin &amp; Rhythm is for education and inspiration and is not medical advice.</p></div>';
})();
