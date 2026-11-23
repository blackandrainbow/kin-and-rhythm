/* Skin kit. Lets a brand skin restyle the prototype from outside, without touching the shared files.
   Load order: style.css, kit.css, <skin>/skin.css, data.js, kit.js, <skin>/skin.js, rhythm.js, app.js.
   A skin calls Skin.use({ id, name, line, themes, seasons, art, copy, text }) once. */
var Skin = (function () {
  'use strict';
  var art = {}, text = {};
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

  /* skin-x.html#maya opens on that demo mom, unless a mom is already saved in this browser. */
  function demoLink() {
    var who = location.hash.slice(1), saved = null;
    if (!/^[a-z]+$/.test(who)) return;
    try { saved = JSON.parse(localStorage.getItem('kin-rhythm-v1')); } catch (e) {}
    if (saved && saved.onboarded) return;
    window.addEventListener('load', function () {
      var btn = document.querySelector('.demo [data-act="persona"][data-arg="' + who + '"]');
      if (btn) btn.click();
    });
  }

  function use(cfg) {
    var base = 'brand/skins/' + cfg.id + '/', was = APP.name, root = document.documentElement;
    (cfg.art || []).forEach(function (file) { art['assets/' + file] = base + file; });
    text = Object.assign({}, cfg.text);
    text[was] = cfg.name;

    APP.name = cfg.name;
    APP.line = cfg.line;
    APP.disclaimer = APP.disclaimer.split(was).join(cfg.name);
    PATTERNS.forEach(function (p) { if (cfg.themes && cfg.themes[p.id]) p.theme = cfg.themes[p.id]; });
    Object.keys(cfg.seasons || {}).forEach(function (k) {
      SEASONS[k].color = cfg.seasons[k];
      root.style.setProperty('--season-' + k, cfg.seasons[k]);
    });
    if (cfg.copy) patch(window, cfg.copy);
    DATA.forEach(function (name) { remap(window[name]); });

    demoLink();
    root.setAttribute('data-skin', cfg.id);
    document.title = cfg.name;
    fix(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, fix); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  return { use: use };
})();
