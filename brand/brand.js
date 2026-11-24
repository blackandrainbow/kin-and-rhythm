/* Brand presentation. Colours, fonts, names and art are read from the skin files themselves,
   so this page shows whatever the skins currently are. */

var BRAND = {};
/* Each skins/<id>/skin.js loads after this file and registers itself here instead of skinning a prototype. */
var Skin = { use: function (cfg) { BRAND[cfg.id] = cfg; } };

(function () {
  'use strict';
  var TOKENS = ['canvas', 'surface', 'subtle', 'primary', 'deep', 'accent', 'tint'];
  var ROOT = ['--font-display', '--font-sans', '--font-mono', '--ink', '--ink-2', '--ink-3', '--desk'];
  var PATTERNS = { sun: 'Sun', wind: 'Wind', hearth: 'Hearth', tide: 'Tide', frost: 'Frost' };
  var SEASONS = { winter: 'Inner Winter', spring: 'Inner Spring', summer: 'Inner Summer', autumn: 'Inner Autumn' };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  function lum(hex) {
    var h = hex.replace('#', ''), c = [0, 2, 4].map(function (i) { var v = parseInt(h.substr(i, 2), 16) / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return ((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(1); }

  /* Switch one skin stylesheet on for an instant and read its tokens off a probe element. */
  function read(id) {
    var link = document.querySelector('link[data-skin="' + id + '"]'), probe = document.getElementById('probe'), out = { root: {}, base: {}, unclaimed: {} };
    link.media = 'all';
    var rs = getComputedStyle(document.documentElement);
    ROOT.forEach(function (k) { out.root[k] = rs.getPropertyValue(k).trim(); });
    [['base', 'phone'], ['unclaimed', 'phone unclaimed']].forEach(function (s) {
      probe.className = s[1];
      var cs = getComputedStyle(probe);
      TOKENS.forEach(function (k) { out[s[0]][k] = cs.getPropertyValue('--' + k).trim(); });
    });
    probe.className = '';
    link.media = 'not all';
    return out;
  }

  function swatch(name, hex, small) {
    var f = el('figure', 'swatch' + (small ? ' small' : '')), chip = el('i');
    chip.style.background = hex;
    f.appendChild(chip);
    if (!small) { var cap = el('figcaption'); cap.appendChild(el('b', '', name)); cap.appendChild(el('span', '', hex.toUpperCase())); f.appendChild(cap); }
    else f.title = name + ' ' + hex.toUpperCase();
    return f;
  }
  function checks(theme, ink, ink3) {
    return 'Text on canvas ' + ratio(ink, theme.canvas) + ' · muted text on subtle ' + ratio(ink3, theme.subtle) + ' · primary on surface ' + ratio(theme.primary, theme.surface) + ' · button text ' + ratio(theme.surface, theme.primary);
  }

  /* Where a piece of art lives: the skin's own file when it has one, the shared asset otherwise. */
  function art(cfg, name) {
    if (/\.\w+$/.test(name)) return 'skins/' + cfg.id + '/' + name;
    var own = cfg.art[name + '.svg'];
    return own ? 'skins/' + cfg.id + '/' + own : '../assets/' + name + '.svg';
  }

  var seen = {};
  function tokens(cfg) {
    if (seen[cfg.id]) return seen[cfg.id];
    var fonts = el('link'); fonts.rel = 'stylesheet'; fonts.href = cfg.fonts; document.head.appendChild(fonts);
    return (seen[cfg.id] = read(cfg.id));
  }

  function play(section) {
    var id = section.getAttribute('data-play'), cfg = BRAND[id];
    if (!cfg) return;
    var t = tokens(cfg), ink = t.root['--ink'], ink3 = t.root['--ink-3'];
    ROOT.forEach(function (k) { if (t.root[k]) section.style.setProperty(k, t.root[k]); });
    TOKENS.forEach(function (k) { section.style.setProperty('--' + k, t.base[k]); });

    each(section.querySelectorAll('[data-fill="name"]'), function (n) { n.textContent = cfg.name; });
    each(section.querySelectorAll('[data-fill="line"]'), function (n) { n.textContent = cfg.line; });
    each(section.querySelectorAll('[data-fill="display"]'), function (n) { n.textContent = t.root['--font-display'].split(',')[0].replace(/['"]/g, ''); });
    each(section.querySelectorAll('[data-fill="sans"]'), function (n) { n.textContent = t.root['--font-sans'].split(',')[0].replace(/['"]/g, ''); });

    each(section.querySelectorAll('[data-palette]'), function (box) {
      var kind = box.getAttribute('data-palette');
      if (kind === 'base' || kind === 'unclaimed') {
        TOKENS.forEach(function (k) { box.appendChild(swatch(k, t[kind][k])); });
        box.parentNode.insertBefore(el('p', 'checks', checks(t[kind], ink, ink3)), box.nextSibling);
      } else if (kind === 'ink') {
        [['ink', ink], ['ink-2', t.root['--ink-2']], ['ink-3', ink3]].forEach(function (p) { box.appendChild(swatch(p[0], p[1])); });
      } else if (kind === 'patterns') {
        Object.keys(PATTERNS).forEach(function (p) {
          /* a pattern may change only what the skin's policy lists; everything else stays the skin's own */
          var line = el('div', 'pattern-row'), pic = el('img'), change = cfg.patterns[p], th = Object.assign({}, t.base, change);
          pic.src = art(cfg, 'pattern-' + p); pic.alt = '';
          line.appendChild(pic);
          var body = el('div'), chips = el('div', 'swatch-row policy');
          Object.keys(change).forEach(function (k) { chips.appendChild(swatch(k, change[k])); });
          body.appendChild(el('b', '', PATTERNS[p])); body.appendChild(chips); body.appendChild(el('p', 'checks', checks(th, ink, ink3)));
          line.appendChild(body); box.appendChild(line);
        });
      } else if (kind === 'seasons') {
        Object.keys(SEASONS).forEach(function (s) { box.appendChild(swatch(SEASONS[s], cfg.seasons[s])); });
      }
    });

    each(section.querySelectorAll('[data-art]'), function (box) {
      box.getAttribute('data-art').split(' ').forEach(function (name) {
        var pic = el('img', name.replace(/\..*$/, '').split('-')[0]); pic.src = art(cfg, name); pic.alt = ''; box.appendChild(pic);
      });
    });
  }

  window.addEventListener('load', function () {
    each(document.querySelectorAll('[data-color]'), function (n) { n.style.background = n.getAttribute('data-color'); n.title = n.getAttribute('data-color'); });
    each(document.querySelectorAll('[data-play]'), play);
    document.documentElement.classList.add('ready');
  });
})();
