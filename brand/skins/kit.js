/* Skin kit. Lets a brand skin restyle and rearrange the prototype without forking it.
   Load order: style.css, kit.css, <skin>/skin.css, data.js, kit.js, <skin>/skin.js, rhythm.js, app.js.
   A skin calls Skin.use({ id, name, line, patterns, seasons, art, layout, blocks, top, copy, text }) once.

   - patterns: what each pattern is allowed to change, laid over the skin's own tokens from skin.css.
     A skin that lists only accent and tint keeps its own canvas and primary whatever her pattern is.
   - layout / blocks / top: handed to app.js through window.SKIN (see "skin hooks" there). */
var Skin = (function () {
  'use strict';
  var art = {}, text = {}, base = '';
  var TOKENS = ['canvas', 'surface', 'subtle', 'primary', 'deep', 'accent', 'tint'];
  var DATA = ['PATTERNS', 'SEASONS', 'DECKS', 'MOON_RITUALS', 'SEED_GLIMMER_ART'];
  var ATTRS = ['placeholder', 'aria-label'];

  /* Deep-merge copy onto the data.js globals. Arrays are addressed by item id, or by index. */
  function patch(target, changes) {
    Object.keys(changes).forEach(function (k) {
      var list = Array.isArray(target), v = changes[k];
      var into = list ? (target.filter(function (x) { return x && x.id === k; })[0] || target[k]) : target[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && into && typeof into === 'object') patch(into, v);
      else if (!list || /^\d+$/.test(k)) target[k] = v;
    });
  }

  /* Point any art path held in data at the skin's own file. */
  function remap(node) {
    if (!node || typeof node !== 'object') return;
    Object.keys(node).forEach(function (k) {
      if (typeof node[k] === 'string') { if (art[node[k]]) node[k] = art[node[k]]; }
      else remap(node[k]);
    });
  }

  /* Paths and lines written inside app.js, rhythm.js and the page are swapped as they reach the DOM. */
  function word(raw) {
    var key = raw.trim();
    return key && Object.prototype.hasOwnProperty.call(text, key) ? raw.replace(key, function () { return text[key]; }) : raw;
  }
  function fixEl(el) {
    if (el.tagName === 'IMG') { var src = el.getAttribute('src'); if (art[src]) el.setAttribute('src', art[src]); }
    ATTRS.forEach(function (a) { var v = el.getAttribute(a); if (v) { var w = word(v); if (w !== v) el.setAttribute(a, w); } });
  }
  function fixText(n) { var w = word(n.nodeValue); if (w !== n.nodeValue) n.nodeValue = w; }
  function fix(node) {
    if (node.nodeType === 3) return fixText(node);
    if (node.nodeType !== 1) return;
    fixEl(node);
    Array.prototype.forEach.call(node.querySelectorAll('img, [placeholder], [aria-label]'), fixEl);
    var walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), n;
    while ((n = walk.nextNode())) fixText(n);
  }

  /* The skin's own seven tokens, read from skin.css so they are written once. */
  function ownTokens() {
    var phone = document.getElementById('phone'), was = phone.className, out = {};
    phone.className = 'phone';
    var cs = getComputedStyle(phone);
    TOKENS.forEach(function (k) { out[k] = cs.getPropertyValue('--' + k).trim(); });
    phone.className = was;
    return out;
  }

  /* Demo links. skin-x.html#maya opens on that demo mom, unless a mom is already saved in this browser.
     skin-x.html#maya/almanac, /patterns, /card or /pause then opens that screen; /still also hides the Demo pill. */
  var SCREENS = { today: [['tab', 'today']], almanac: [['tab', 'rhythm']], patterns: [['tab', 'today'], ['pathsSheet'], ['allPaths']], card: [['tab', 'today'], ['ritualPage']], pause: [['tab', 'today'], ['pauseOpen']] };
  function saved() { try { return JSON.parse(localStorage.getItem('kin-rhythm-v1')) || {}; } catch (e) { return {}; } }
  function newMoon(s) { var i = -1; (s.rituals || []).forEach(function (r, n) { if (r.kind === 'new') i = n; }); return i; }
  function press(act, arg) {
    var b = document.createElement('button');
    b.setAttribute('data-act', act); if (arg != null) b.setAttribute('data-arg', arg);
    b.hidden = true; document.body.appendChild(b); b.click(); b.remove();
  }
  function demoLink() {
    var parts = location.hash.slice(1).split('/'), who = parts[0], screen = parts[1], was = saved();
    if (!/^[a-z]+$/.test(who)) return;
    if (parts.indexOf('still') > 0) document.documentElement.setAttribute('data-still', '');
    window.addEventListener('load', function () {
      if (!was.onboarded || (screen === 'card' && newMoon(was) < 0)) press('persona', who);     /* the moon card needs a mom who has set a moon */
      (SCREENS[screen] || []).forEach(function (step) { press(step[0], step[0] === 'ritualPage' ? String(newMoon(saved())) : step[1]); });
    });
  }

  function use(cfg) {
    var was = APP.name, root = document.documentElement, own = ownTokens();
    base = 'brand/skins/' + cfg.id + '/';
    Object.keys(cfg.art || {}).forEach(function (k) { art['assets/' + k] = base + cfg.art[k]; });
    text = Object.assign({}, cfg.text);
    text[was] = cfg.name;

    APP.name = cfg.name;
    APP.line = cfg.line;
    APP.disclaimer = APP.disclaimer.split(was).join(cfg.name);
    PATTERNS.forEach(function (p) { p.theme = Object.assign({}, own, (cfg.patterns || {})[p.id]); });
    Object.keys(cfg.seasons || {}).forEach(function (k) {
      SEASONS[k].color = cfg.seasons[k];
      root.style.setProperty('--season-' + k, cfg.seasons[k]);
    });
    if (cfg.copy) patch(window, cfg.copy);
    DATA.forEach(function (name) { remap(window[name]); });
    window.SKIN = { layout: cfg.layout, blocks: cfg.blocks, top: cfg.top };

    demoLink();
    root.setAttribute('data-skin', cfg.id);
    document.title = cfg.name;
    fix(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, fix); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* A skin's own file, for use inside its blocks. */
  function file(name) { return base + name; }

  /* The greeting app.js would give at this hour, for skins that draw their own header. */
  function hello(date) { var h = date.getHours(); return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

  return { use: use, file: file, hello: hello };
})();
