(function () {
  'use strict';

  var KEY = 'kin-rhythm-v1', DAY = 864e5;
  var STEPS = ['welcome', 'brain', 'name', 'stage', 'cup', 'q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'values', 'tender', 'rhythm', 'weight', 'cards', 'reveal', 'bloom'];
  var CHAPTERS = [['You', 1, 4], ['Your pattern', 5, 10], ['What matters', 11, 12], ['Your rhythm', 13, 15], ['Your path', 16, 17]];
  var NEIGHBOUR = { sun: 'wind', wind: 'sun', hearth: 'tide', tide: 'frost', frost: 'tide' };
  var ui = { sheet: null, pause: null, phaseView: null, rhythmView: null, suit: 'major', pick: '', timer: null, lastScreen: '' };
  var state = load();

  /* ---------- state ---------- */
  function fresh() {
    return { v: 1, onboarded: false, step: 0, tab: 'today', name: '', stage: '', cup: [], emptyCup: false, spark: '',
      quiz: [], values: [], tender: '', rhythm: { mode: 'moon', start: '', len: 28 },
      weight: { on: false, entries: [] }, cards: { on: false, deck: '', arrived: false, pulls: {}, notes: {} },
      pattern: '', options: [], phase: 0, tended: {}, capacity: {}, second: [], glimmers: [], pauses: 0,
      staples: {}, heritage: [], allergies: [], coachNotify: false, place: null, dayOffset: 0,
      cues: {}, reps: [], pauseLog: [], rituals: [], moonLoad: '', kin: { name: '', holding: [] } };
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return Object.assign(fresh(), s); } catch (e) {}
    return fresh();
  }
  function save() { if (ui.ephemeral) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function now() { return new Date(Date.now() + state.dayOffset * DAY); }
  function todayKey() { return Rhythm.iso(now()); }
  function pat(id) { id = id || state.pattern; return PATTERNS.filter(function (p) { return p.id === id; })[0] || PATTERNS[0]; }
  function rhythmNow(mode) {
    var set = state.rhythm;
    if (mode) set = { mode: mode, start: state.rhythm.start, len: state.rhythm.len };
    return Rhythm.rhythm(set, now());
  }
  function hasCycle() { return state.rhythm.mode === 'cycle' && !!state.rhythm.start; }
  function place() { return state.place || Rhythm.guessPlace(); }
  function time(d) { return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function lower(s) { return /^I\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  function toggle(arr, v, max) {
    var i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else { if (max && arr.length >= max) arr.shift(); arr.push(v); }
  }
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2400);
  }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / (a.length || 1); }
  function total(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function fmt(isoStr, opts) { return Rhythm.fromISO(isoStr).toLocaleDateString([], opts || { month: 'short', day: 'numeric' }); }
  function hourLabel(h) { return (h % 12 || 12) + (h < 12 ? 'am' : 'pm'); }
  function seasonOf(key) { return Rhythm.rhythm(state.rhythm, Rhythm.addDays(Rhythm.fromISO(key), 0)).season; }

  /* a cue, a count of reps, and how worn-in the path is */
  function cueFor(id) { return state.cues[id] || ANCHOR_CUE[id] || CUES[0]; }
  function repsFor(id) { return state.reps.filter(function (r) { return r.a === id; }); }
  function trail(id) {
    var reps = repsFor(id), n = reps.length, stage = TRAIL[0], next = TRAIL[1];
    TRAIL.forEach(function (t, i) { if (n >= t.min) { stage = t; next = TRAIL[i + 1] || null; } });
    return { n: n, stage: stage.name, next: next, pct: Math.min(100, n / 30 * 100), easing: n >= 8 && reps.slice(-3).every(function (r) { return r.e === 'little'; }) };
  }
  function trailBar(id) {
    var t = trail(id);
    return '<div class="trail"><div class="trail-bar"><i style="width:' + t.pct.toFixed(0) + '%"></i><span style="left:16.7%"></span><span style="left:50%"></span></div>' +
      '<div class="trail-meta"><b>' + t.stage + '</b><span>' + t.n + (t.n === 1 ? ' rep' : ' reps') + (t.next ? ' · ' + (t.next.min - t.n) + ' to a ' + t.next.name.toLowerCase() : '') + '</span></div></div>';
  }

  /* the moon she is in: her latest new moon setting */
  function currentMoon() { return state.rituals.filter(function (r) { return r.kind === 'new'; }).pop() || null; }
  function fullAfter(isoStr) {
    var ev = Rhythm.moonEvents(Rhythm.addDays(Rhythm.fromISO(isoStr), 2));
    return (ev.next.kind === 'full' ? ev.next.date : ev.last.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  /* which moon ritual is due, and which is next */
  function moonState() {
    var d = now(), ev = Rhythm.moonEvents(d), today = Rhythm.startOfDay(d);
    var since = Math.round((today - Rhythm.startOfDay(ev.last.date)) / DAY), until = Math.round((Rhythm.startOfDay(ev.next.date) - today) / DAY);
    function done(e) { return state.rituals.some(function (r) { return r.kind === e.kind && r.date >= Rhythm.iso(Rhythm.addDays(e.date, -5)); }); }
    var due = null, when = '';
    if (until === 0 && !done(ev.next)) { due = ev.next; when = 'Tonight'; }
    else if (since <= 3 && !done(ev.last)) { due = ev.last; when = since === 0 ? 'Tonight' : since === 1 ? 'Last night' : since + ' nights ago'; }
    return { due: due, when: when, next: ev.next, until: until };
  }

  var el = {
    btn: function (text, act, arg, cls) { return '<button class="btn ' + (cls || 'btn-primary') + '" data-act="' + act + '"' + (arg != null ? ' data-arg="' + esc(arg) + '"' : '') + '>' + text + '</button>'; },
    chip: function (text, act, arg, on) { return '<button class="chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-arg="' + esc(arg) + '">' + esc(text) + '</button>'; },
    option: function (title, sub, act, arg, on) {
      return '<button class="option' + (on ? ' on' : '') + '" data-act="' + act + '" data-arg="' + esc(arg) + '"><span class="option-title">' + esc(title) + '</span>' + (sub ? '<span class="option-sub">' + esc(sub) + '</span>' : '') + '</button>';
    },
    label: function (t) { return '<p class="label">' + t + '</p>'; }
  };

  /* ---------- quiz scoring ---------- */
  function computeOptions() {
    var count = {};
    state.quiz.forEach(function (id) { if (id) count[id] = (count[id] || 0) + 1; });
    var ids = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, 3);
    if (!ids.length) ids = ['tide'];
    if (ids.length === 1) ids.push(NEIGHBOUR[ids[0]]);
    state.options = ids;
    return count;
  }

  /* ---------- plan ---------- */
  function sparkName() { return state.spark || state.cup[0] || SPARKS[0]; }
  function anchorIds(phaseIdx) {
    var ids = PLAN[state.pattern][PHASES[phaseIdx].id].slice();
    if (phaseIdx === 0 && state.emptyCup && ids.indexOf('spark') < 0) ids[1] = 'spark';
    return ids;
  }
  function anchor(id) {
    var a = Object.assign({ id: id }, ANCHORS[id]);
    if (id === 'spark') { a.title = 'Your spark, twice this week: ' + lower(sparkName()); a.swaps = state.cup.slice(0, 3); }
    return a;
  }
  function activeIds() {
    var ids = anchorIds(state.phase).filter(function (id) { return state.second.indexOf(id) < 0; });
    return state.moonLoad === 'low' ? ids.slice(0, 1) : ids;
  }
  function isTended(id) { return !!(state.tended[todayKey()] || {})[id]; }
  function capacity() { return state.capacity[todayKey()] || ''; }
  function gentleToday() {
    var c = capacity(), s = rhythmNow().season;
    return c === 'low' || (!c && (s === 'winter' || s === 'autumn'));
  }
  function anchorRow(id, opts) {
    var a = anchor(id), done = isTended(id), second = state.second.indexOf(id) >= 0;
    var gentle = opts && opts.gentle, n = repsFor(id).length;
    return '<div class="anchor' + (done ? ' done' : '') + '">' +
      '<button class="anchor-check" data-act="tend" data-arg="' + id + '" aria-label="Mark as tended">' + (done ? '<img src="assets/icon-check.svg" alt="">' : '') + '</button>' +
      '<button class="anchor-body" data-act="anchorSheet" data-arg="' + id + '">' +
      '<span class="pill pill-' + a.pillar + '">' + PILLARS[a.pillar] + (second ? ' · second nature' : '') + '</span>' +
      '<span class="anchor-title">' + esc(gentle ? a.easier : a.title) + '</span>' +
      '<span class="anchor-sub">' + esc(cueFor(id)) + (n ? ' · ' + n + (n === 1 ? ' rep' : ' reps') : '') + (gentle ? ' · smaller today' : '') + '</span>' +
      '</button><img src="assets/icon-next.svg" class="chev" alt=""></div>';
  }

  /* ---------- cards ---------- */
  function cardInfo(i) {
    if (i < 22) { var m = MAJORS[i]; return { name: m[0], word: m[1], mind: m[2], body: m[3], spirit: m[4], where: 'Major Arcana' }; }
    var s = SUITS[Math.floor((i - 22) / 14)], r = RANKS[(i - 22) % 14], ri = (i - 22) % 14;
    return { name: r[0] + ' of ' + s.name, word: r[1], mind: r[2], body: s.body[ri < 7 ? 0 : 1], spirit: r[3], where: 'On ' + s.where };
  }
  function dailyCard() {
    var k = todayKey(), hsh = 7;
    for (var i = 0; i < k.length; i++) hsh = (hsh * 31 + k.charCodeAt(i)) % 9973;
    return hsh % 78;
  }
  function deck() { return DECKS.filter(function (d) { return d.id === state.cards.deck; })[0] || DECKS[0]; }
  function cardFace(i) {
    var c = cardInfo(i);
    return '<div class="tarot deck-' + deck().id + '"><span class="tarot-where">' + esc(c.where) + '</span><img src="assets/sunburst.svg" alt=""><span class="tarot-name">' + esc(c.name) + '</span><span class="tarot-word">' + esc(c.word) + '</span></div>';
  }

  /* ---------- theme + chrome ---------- */
  function applyTheme() {
    var phone = $('phone'), claimed = state.pattern && (state.onboarded || STEPS[state.step] === 'bloom');
    phone.classList.toggle('unclaimed', !claimed);
    var t = claimed ? pat().theme : null;
    ['canvas', 'surface', 'subtle', 'primary', 'deep', 'accent', 'tint'].forEach(function (k) {
      if (t) phone.style.setProperty('--' + k, t[k]); else phone.style.removeProperty('--' + k);
    });
  }

  /* ---------- skin hooks ----------
     A brand skin (window.SKIN, set before this file loads) may reorder a view's blocks, add blocks of its own
     and draw its own top bar. With no skin, every view renders in its default order. */
  var SKIN = window.SKIN || {};
  function arrange(view, blocks, order) {
    var mine = (SKIN.blocks || {})[view] || {}, ctx;
    return ((SKIN.layout || {})[view] || order).map(function (k) {
      return mine[k] ? mine[k](ctx || (ctx = skinCtx())) : blocks[k] || '';
    }).join('');
  }
  /* what a skin's own block is given to draw from */
  function skinCtx() {
    var d = now(), r = rhythmNow(), pl = place(), sun = Rhythm.sun(d, pl.lat, pl.lng), ms = moonState(), cm = currentMoon(), ins = insights();
    return {
      app: APP, date: d, name: state.name, pattern: pat(), season: SEASONS[r.season], rhythm: r, moon: r.moon,
      sun: sun && { rise: time(sun.rise), golden: time(sun.golden), set: time(sun.set) },
      ritual: { due: ms.due, next: MOON_RITUALS[ms.next.kind], kind: ms.next.kind, date: ms.next.date, until: ms.until },
      kin: { witness: state.kin.name, word: cm && cm.witness ? cm.word : '', holding: state.kin.holding },
      glimmers: state.glimmers.length, tiles: latestTiles, week: function () { return weekStrip(hasCycle() ? 'cycle' : 'moon'); },
      kept: { days: ins.n, reps: state.reps.length, pauses: state.pauses }, insight: ins.list[0] || null,
      values: state.values, esc: esc, lower: lower
    };
  }

  function renderTop() {
    var top = $('top');
    if (state.onboarded && SKIN.top) { top.innerHTML = SKIN.top(skinCtx()); return; }
    if (state.onboarded) {
      top.innerHTML = '<div class="top-brand"><img src="assets/logo.svg" alt=""><span>' + APP.name + '</span></div><span class="top-date">' + now().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + '</span>';
      return;
    }
    if (state.step === 0) { top.innerHTML = ''; return; }
    var chapter = '', segs = CHAPTERS.map(function (c) {
      var fill = state.step > c[2] ? 100 : state.step < c[1] ? 0 : Math.round((state.step - c[1] + 1) / (c[2] - c[1] + 1) * 100);
      if (state.step >= c[1] && state.step <= c[2]) chapter = c[0];
      return '<span class="progress-seg"><i style="width:' + fill + '%"></i></span>';
    }).join('');
    top.innerHTML = '<button class="icon-btn" data-act="back" aria-label="Back"><img src="assets/icon-back.svg" alt=""></button><div class="progress-wrap"><p class="label">' + chapter + '</p><div class="progress">' + segs + '</div></div>';
  }

  function renderTabs() {
    var tabs = $('tabs');
    tabs.hidden = !state.onboarded;
    if (!state.onboarded) return;
    function tab(id, label) { return '<button class="tab' + (state.tab === id ? ' on' : '') + '" data-act="tab" data-arg="' + id + '"><img src="assets/icon-' + id + '.svg" alt=""><span>' + label + '</span></button>'; }
    tabs.innerHTML = tab('today', 'Today') + tab('rhythm', 'Almanac') +
      '<button class="tab-pause" data-act="pauseOpen" aria-label="Pause"><img src="assets/icon-pause.svg" alt=""><span>Pause</span></button>' +
      tab('plan', 'Path') + tab('you', 'You');
  }

  function setFoot(html) { var f = $('foot'); f.hidden = !html; f.innerHTML = html || ''; }

  /* ---------- onboarding screens ---------- */
  function obHead(label, title, lead) {
    return (label ? el.label(label) : '') + '<h1 class="display">' + title + '</h1>' + (lead ? '<p class="lead">' + lead + '</p>' : '');
  }

  var ob = {
    welcome: function () {
      setFoot(el.btn('Begin', 'next') + '<p class="foot-note">About four minutes. No wrong answers.</p>');
      return '<div class="ob welcome"><div class="welcome-art"><img src="assets/sprig-sage.svg" class="sprig-l" alt=""><img src="assets/logo.svg" class="welcome-logo" alt=""><img src="assets/sprig-sage.svg" class="sprig-r" alt=""></div>' +
        el.label(APP.name) + '<h1 class="display xl">Before we talk about food, let\'s find your rhythm.</h1>' +
        '<p class="lead">You are not behind, and you are not broken. Most plans ask you to change how you eat while you are running on empty. We start somewhere else.</p>' +
        '<ol class="trio"><li><b>What fills your cup</b><span>The small things that make you feel like you.</span></li><li><b>The pattern you have been living in</b><span>Six honest moments. A state, not a label.</span></li><li><b>A path you choose</b><span>Matched to your body\'s rhythm, at your pace.</span></li></ol></div>';
    },
    brain: function () {
      setFoot(el.btn('Continue', 'next'));
      return '<div class="ob">' + obHead('First, some good news', 'Your brain has already rebuilt itself once.', 'Becoming a mother reshapes the brain more than almost anything else in adult life. The fog people call mom brain is a renovation, not a decline.') +
        '<div class="card soft"><p>It also proves what everything here rests on: <b>your brain can change.</b> The way you get through a hard day is a well-worn path. It is not who you are, and a new path can be worn in beside it.</p></div>' +
        '<ol class="trio"><li><b>Small and repeated</b><span>A few seconds, tied to something you already do.</span></li><li><b>Felt, not forced</b><span>What you stop to savor is what sticks.</span></li><li><b>Never reset</b><span>A missed day does not grow the path over. It is still there tomorrow.</span></li></ol></div>';
    },
    name: function () {
      setFoot(el.btn('Continue', 'next'));
      return '<div class="ob">' + obHead('', 'What should we call you?', 'Just a first name. This stays on your phone.') +
        '<input class="field" id="f-name" data-bind="name" type="text" autocomplete="given-name" placeholder="Your first name" value="' + esc(state.name) + '"></div>';
    },
    stage: function () {
      setFoot('');
      return '<div class="ob">' + obHead('', 'Where is your body right now?', 'This tells us which rhythm to follow with you. Every answer has a path.') +
        '<div class="options">' + STAGES.map(function (s) { return el.option(s.label, s.sub, 'pick', 'stage|' + s.id, state.stage === s.id); }).join('') + '</div></div>';
    },
    cup: function () {
      setFoot(el.btn('Continue', 'next', null, 'btn-primary' + (state.cup.length || (state.emptyCup && state.spark) ? '' : ' is-quiet')));
      var groups = CUP.map(function (g) {
        return '<p class="group-label">' + g.label + '</p><div class="chips">' + g.options.map(function (o) { return el.chip(o, 'cup', o, state.cup.indexOf(o) >= 0); }).join('') + '</div>';
      }).join('');
      var empty = '<div class="chips solo">' + el.chip('Honestly, nothing right now', 'emptyCup', '1', state.emptyCup) + '</div>';
      if (state.emptyCup) empty += '<div class="card soft"><p class="card-title">That is honest, and very common.</p><p class="small">It usually means the cup has been empty for a while. Pick one tiny spark to try. That is where your path will start.</p><div class="options tight">' +
        SPARKS.map(function (s) { return el.option(s, '', 'spark', s, state.spark === s); }).join('') + '</div></div>';
      return '<div class="ob">' + obHead('', 'What fills your cup?', 'Tap anything that helps you feel like yourself. A few is plenty.') + (state.emptyCup ? '' : groups) + empty + '</div>';
    },
    quiz: function (i) {
      setFoot('');
      var q = QUIZ[i], ids = PATTERNS.map(function (p) { return p.id; }), shift = (i * 2) % 5;
      ids = ids.slice(shift).concat(ids.slice(0, shift));
      return '<div class="ob">' + obHead('Moment ' + (i + 1) + ' of ' + QUIZ.length, q.q, i === 0 ? 'Pick the one that is most true lately, not the one you wish were true.' : '') +
        '<div class="options">' + ids.map(function (id) { return el.option(q.a[id], '', 'quiz', i + '|' + id, state.quiz[i] === id); }).join('') + '</div></div>';
    },
    values: function () {
      setFoot(el.btn('Continue', 'next', null, 'btn-primary' + (state.values.length ? '' : ' is-quiet')));
      return '<div class="ob">' + obHead('', 'What is this for?', 'Choose up to two. When a day gets hard, this is what we will point you back to.') +
        '<div class="options">' + VALUES.map(function (v) { return el.option(v, '', 'value', v, state.values.indexOf(v) >= 0); }).join('') + '</div></div>';
    },
    tender: function () {
      setFoot('');
      return '<div class="ob">' + obHead('', 'When is the hardest part of your day?', 'We call it your feminine hour: the hour to stop pushing and soften instead. We will be closest to hand then.') +
        '<div class="options">' + TENDER.map(function (t) { return el.option(t.label, '', 'pick', 'tender|' + t.id, state.tender === t.id); }).join('') + '</div></div>';
    },
    rhythm: function () {
      var m = Rhythm.moon(now());
      if (state.stage === 'cycling' || state.stage === 'irregular') {
        setFoot(el.btn('Use my cycle', 'cycleSave') + el.btn('I would rather follow the moon', 'moonOnly', null, 'btn-ghost'));
        return '<div class="ob">' + obHead('', 'Let\'s find your inner season.', 'Your cycle moves through four seasons, each with its own energy. Knowing where you are changes what a good day looks like.') +
          '<label class="field-label" for="f-start">First day of your last period</label><input class="field" id="f-start" type="date" max="' + todayKey() + '" value="' + esc(state.rhythm.start) + '">' +
          '<label class="field-label">Usual cycle length</label><div class="stepper"><button data-act="len" data-arg="-1" aria-label="Shorter">−</button><span><b>' + state.rhythm.len + '</b> days</span><button data-act="len" data-arg="1" aria-label="Longer">+</button></div>' +
          '<p class="small muted">Not sure, or it changes a lot? A rough guess is fine. On the months it goes its own way, we follow the moon with you.</p></div>';
      }
      setFoot(el.btn('Follow the moon', 'moonOnly'));
      return '<div class="ob center">' + obHead('', 'You will keep time by the moon.', 'When there is no cycle to follow, the moon offers the same four seasons: dark, waxing, full and waning. Rest, begin, shine, gather in.') +
        '<img src="' + m.art + '" class="moon-xl" alt=""><p class="display sm">' + m.name + '</p><p class="small muted">Tonight, ' + m.lit + '% lit.</p></div>';
    },
    weight: function () {
      setFoot('');
      return '<div class="ob">' + obHead('', 'Do you want to keep an eye on your weight?', 'Some moms do and many don\'t. Either is a complete answer. We never show it on your main screen, there is no goal number, and you can change your mind any time.') +
        '<div class="options">' + el.option('No scale for me', 'We will follow energy, rest and rhythm instead.', 'weightPick', 'off', false) + el.option('Yes, privately', 'A quiet log in your profile, only when you choose to add to it.', 'weightPick', 'on', false) + '</div></div>';
    },
    cards: function () {
      setFoot(el.btn(state.cards.deck ? 'Send me this deck' : 'Choose a deck', 'cardsYes', null, 'btn-primary' + (state.cards.deck ? '' : ' is-quiet')) + el.btn('Not for me', 'cardsNo', null, 'btn-ghost'));
      return '<div class="ob">' + obHead('Optional', 'Would you like a daily card ritual?', 'Choose a deck and we post it to you. Until it arrives we turn a card for you each morning. After that you pull your own and tell us what you drew. One card, one small anchor for mind, body and spirit.') +
        '<div class="decks">' + DECKS.map(function (d) {
          return '<button class="deck' + (state.cards.deck === d.id ? ' on' : '') + '" data-act="deck" data-arg="' + d.id + '"><img src="' + d.art + '" alt=""><b>' + d.name + '</b><span>' + d.note + '</span></button>';
        }).join('') + '</div><p class="small muted">The hope is that one day the card is enough, and you need us a little less.</p></div>';
    },
    reveal: function () {
      var count = computeOptions();
      if (state.options.indexOf(ui.pick) < 0) ui.pick = state.options[0];
      setFoot(el.btn('This is me right now', 'choosePath'));
      return '<div class="ob">' + obHead('Here is what we heard', 'Which of these sounds like right now?', 'These are not personalities. They are ways a body gets through a hard season. Each one comes with its own path, and you can change your mind later.') +
        '<div class="paths">' + state.options.map(function (id) {
          var p = pat(id), n = count[id] || 0;
          return '<button class="path' + (ui.pick === id ? ' on' : '') + '" data-act="pickPath" data-arg="' + id + '"><img src="' + p.art + '" class="path-art" alt="">' +
            '<span class="path-body"><span class="label">' + p.state + '</span><span class="path-name">' + p.name + '</span><span class="path-line">' + p.line + '</span>' +
            '<span class="path-dir">The path: ' + lower(p.direction) + '</span>' + (n ? '<span class="match">' + n + ' of ' + QUIZ.length + ' moments</span>' : '<span class="match">Often travels with the first</span>') + '</span></button>';
        }).join('') + '</div></div>';
    },
    bloom: function () {
      var p = pat(), r = rhythmNow(), s = SEASONS[r.season];
      setFoot(el.btn('Step in', 'finish'));
      return '<div class="ob bloom">' + '<img src="' + p.art + '" class="hero-art" alt="">' + el.label('You have been living in') + '<h1 class="display xl">' + p.name + '</h1><p class="lead">' + p.line + '</p>' +
        '<div class="card"><div class="fact"><p class="label">What it looks like</p><p>' + p.looks + '</p></div><div class="fact"><p class="label">Its gift</p><p>' + p.gift + '</p></div><div class="fact"><p class="label">What your body is asking for</p><p>' + p.asks + '</p></div></div>' +
        '<div class="card tinted"><p class="label">Your path</p><p class="display sm">' + p.direction + '</p><p>' + p.vision + '</p></div>' +
        '<p class="section-title">You begin in the Rest phase</p><div class="card flush">' + anchorIds(0).map(function (id) { var a = anchor(id); return '<div class="mini-anchor"><span class="pill pill-' + a.pillar + '">' + PILLARS[a.pillar] + '</span><span>' + esc(a.title) + '</span></div>'; }).join('') + '</div>' +
        '<div class="card row-card"><img src="' + s.art + '" alt=""><div><p class="label">Today</p><p><b>' + s.name + '.</b> ' + s.asks + '</p></div></div>' +
        '<p class="small muted center">' + (state.name ? esc(state.name) + ', this' : 'This') + ' is a season you are in. It is not who you are.</p></div>';
    }
  };

  /* ---------- Today ---------- */
  function viewToday() {
    var d = now(), r = rhythmNow(), s = SEASONS[r.season], p = pat(), hr = d.getHours(), key = todayKey();
    var hello = hr < 5 ? 'Still up' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    var pl = place(), sun = Rhythm.sun(d, pl.lat, pl.lng), sunLine = '';
    if (sun) sunLine = d < sun.rise ? 'First light is at ' + time(sun.rise) + '.' : d < sun.golden ? 'The light turns gold around ' + time(sun.golden) + '. Be outside for one minute of it.' : d < sun.set ? 'It is golden hour. Go and stand in it.' : 'The sun set at ' + time(sun.set) + '. The day is allowed to end.';
    var romance = s.romance[d.getDate() % s.romance.length];
    var t = TENDER.filter(function (x) { return x.id === state.tender; })[0];
    var nudge = t && state.dayOffset === 0 && hr >= t.from && hr <= t.to ? '<button class="nudge" data-act="pauseOpen"><img src="assets/icon-spark.svg" alt=""><span><b>This is your feminine hour.</b> Soften here, instead of pushing. Pause is right beside you.</span></button>' : '';

    var cap = capacity(), gentle = gentleToday();
    var capRow = '<div class="cap"><p class="small">How much do you have today?</p><div class="seg">' + [['low', 'Not much'], ['okay', 'Enough'], ['good', 'Plenty']].map(function (c) {
      return '<button class="' + (cap === c[0] ? 'on' : '') + '" data-act="capacity" data-arg="' + c[0] + '">' + c[1] + '</button>';
    }).join('') + '</div></div>';

    var ms = moonState(), ids = activeIds(), nextK = MOON_RITUALS[ms.next.kind];
    var anchors = ids.length ? ids.map(function (id) { return anchorRow(id, { gentle: gentle }); }).join('') :
      '<div class="card tinted"><p><b>Every anchor in this phase is second nature.</b> You may be ready for what comes next. The full moon is a good night to decide.</p></div>';
    var cm = currentMoon(), kinLine = cm && cm.witness ? '<p class="small muted">' + esc(cm.witness) + ' is holding “' + esc(cm.word) + '” with you.</p>' : '';
    var fullNear = (ms.due && ms.due.kind === 'full') || (ms.next.kind === 'full' && ms.until <= 1);
    var askKin = fullNear ? state.kin.holding.map(function (h) { return '<div class="nudge still"><img src="assets/icon-spark.svg" alt=""><span><b>Ask ' + esc(h.name) + '</b> how “' + esc(h.word) + '” went. The moon is full, and you are her witness.</span></div>'; }).join('') : '';
    var closing = cap ? '<div class="closing"><img src="assets/sunburst.svg" alt=""><div><p><b>That is your ten seconds.</b> The rest happens out there, not in here.</p>' +
      (ms.due ? '' : '<p class="small muted">Next ritual: ' + nextK.name.toLowerCase() + ', ' + (ms.until === 1 ? 'tomorrow' : ms.next.date.toLocaleDateString([], { weekday: 'long' })) + '.</p>') + kinLine + '</div></div>' :
      '<p class="hint">One tap is enough. Nothing here keeps score.</p>';

    var cards = '';
    if (state.cards.on) {
      var pulled = state.cards.pulls[key], dk = deck();
      if (pulled == null) {
        cards = state.cards.arrived ?
          '<div class="card ritual"><img src="' + dk.art + '" class="deck-back" alt=""><div><p class="label">Card ritual</p><p class="card-title">What did you pull today?</p><p class="small">Shuffle, breathe, turn one card. Then tell us what you drew.</p>' + el.btn('Log my card', 'cardPicker', null, 'btn-small') + '</div></div>' :
          '<div class="card ritual"><img src="' + dk.art + '" class="deck-back" alt=""><div><p class="label">Card ritual</p><p class="card-title">Your ' + dk.name + ' deck is on its way.</p><p class="small">Until it lands, we will turn one for you.</p>' + el.btn('Turn today\'s card', 'cardTurn', null, 'btn-small') + '</div></div>';
      } else {
        var c = cardInfo(pulled), note = state.cards.notes[key];
        cards = '<div class="card ritual drawn">' + cardFace(pulled) + '<div class="lens"><p class="label">Today\'s lens</p>' +
          '<p><b>Mind</b>' + c.mind + '</p><p><b>Body</b>' + c.body + '</p><p><b>Spirit</b>' + c.spirit + '</p></div></div>' +
          (note ? '<p class="quote">“' + esc(note) + '”</p>' : '<div class="inline-form"><input class="field" id="f-cardnote" type="text" placeholder="What is it asking of you?"><button class="btn btn-small" data-act="cardNote">Keep</button></div>');
      }
    }

    var mine = state.glimmers.map(function (g, i) { return g.date === key ? tile(i) : ''; }).join('');
    var glimmer = '<div class="card glimmer"><p class="label">One small beautiful thing</p><p class="small">' + romance + '</p>' +
      (mine ? '<div class="tiles mini">' + mine + '</div>' : '') +
      (ui.draftImg ? '<div class="draft"><img src="' + ui.draftImg + '" alt=""><button class="link" data-act="draftDrop">Take it again</button></div>' : '') +
      '<div class="inline-form"><label class="snap" for="f-photo" aria-label="Take a photo"><img src="assets/icon-camera.svg" alt=""></label><input id="f-photo" type="file" accept="image/*" capture="environment" hidden>' +
      '<input class="field" id="f-glimmer" type="text" placeholder="' + (ui.draftImg ? 'A few words, if you like' : 'Snap it, or say it') + '"><button class="btn btn-small" data-act="glimmer">Keep</button></div>' +
      (state.glimmers.length ? '<button class="link" data-act="grid">Open your glimmer grid · ' + state.glimmers.length + '</button>' : '') + '</div>';

    return '<div class="page">' + arrange('today', {
      greet: '<div class="greet"><h1 class="display">' + hello + (state.name ? ', ' + esc(state.name) : '') + '.</h1><p class="lead">' + sunLine + '</p></div>',
      strip: '<button class="rhythm-strip" data-act="tab" data-arg="rhythm"><img src="' + r.moon.art + '" alt=""><span><span class="label">' + s.name + ' · ' + (r.mode === 'cycle' ? r.label.toLowerCase() : r.moon.name.toLowerCase()) + '</span><span class="strip-text">Today asks for ' + lower(s.asks) + '</span></span><img src="assets/icon-next.svg" class="chev" alt=""></button>',
      moon: ms.due ? moonCall(ms) : '',
      kin: askKin,
      nudge: nudge,
      touch: '<p class="section-title">Today\'s touch <span>' + (state.moonLoad === 'low' ? 'One anchor this moon' : 'Ten seconds') + '</span></p>' + capRow + anchors + closing,
      cards: cards ? '<p class="section-title">Ritual</p>' + cards : '',
      glimmer: '<p class="section-title">Romance the ordinary</p>' + glimmer,
      why: state.values.length ? '<p class="why">You are here for <b>' + state.values.map(lower).join('</b> and <b>') + '</b>.</p>' : ''
    }, ['greet', 'strip', 'moon', 'kin', 'nudge', 'touch', 'cards', 'glimmer', 'why']) + '</div>';
  }

  function weekStrip(mode) {
    var d = now(), set = mode === 'cycle' ? state.rhythm : { mode: 'moon' }, week = '<div class="week">';
    for (var i = 0; i < 7; i++) {
      var dd = Rhythm.addDays(d, i), rr = Rhythm.rhythm(set, dd);
      week += '<div class="day' + (i === 0 ? ' today' : '') + '"><span>' + dd.toLocaleDateString([], { weekday: 'narrow' }) + '</span><b>' + dd.getDate() + '</b><i style="background:' + SEASONS[rr.season].color + '"></i><img src="' + rr.moon.art + '" alt=""></div>';
    }
    return week + '</div>';
  }

  /* ---------- Rhythm ---------- */
  function viewRhythm() {
    var mode = hasCycle() ? (ui.rhythmView || 'cycle') : 'moon';
    var r = rhythmNow(mode), s = SEASONS[r.season], p = pat(), d = now();
    var grad = r.stops.map(function (x) { return SEASONS[x[0]].color + ' ' + (x[1] * 360).toFixed(1) + 'deg ' + (x[2] * 360).toFixed(1) + 'deg'; }).join(',');
    var seg = hasCycle() ? '<div class="seg wide"><button class="' + (mode === 'cycle' ? 'on' : '') + '" data-act="rhythmView" data-arg="cycle">My cycle</button><button class="' + (mode === 'moon' ? 'on' : '') + '" data-act="rhythmView" data-arg="moon">The moon</button></div>' : '';
    var wheel = '<div class="wheel"><div class="wheel-ring" style="background:conic-gradient(' + grad + ')"></div>' + wheelDots(mode, r) + '<div class="wheel-marker" style="transform:rotate(' + (r.progress * 360).toFixed(1) + 'deg)"><i></i></div>' +
      '<div class="wheel-center"><img src="' + r.moon.art + '" alt=""><p class="display sm">' + s.name + '</p><p class="small muted">' + r.label + ' ' + r.sub + '</p></div></div>';
    var legend = '<div class="legend">' + SEASON_ORDER.map(function (id) { return '<span class="legend-item' + (id === r.season ? ' on' : '') + '"><img src="' + SEASONS[id].art + '" alt="">' + SEASONS[id].word + '</span>'; }).join('') + '</div>';

    var tender = p.tender, tenderNote;
    if (tender.season === r.season) tenderNote = '<div class="card tinted"><p class="label">For you, in ' + p.name + '</p><p>' + tender.text + '</p></div>';
    else {
      var set = mode === 'cycle' ? state.rhythm : { mode: 'moon' }, n = Rhythm.daysUntil(set, d, tender.season);
      tenderNote = '<div class="card tinted"><p class="label">Your gentle season</p><p><b>' + SEASONS[tender.season].name + '</b>' + (n ? ', about ' + n + ' day' + (n === 1 ? '' : 's') + ' away. ' : '. ') + tender.text + '</p></div>';
    }

    var pl = place(), sun = Rhythm.sun(d, pl.lat, pl.lng);
    var sky = '<div class="card"><div class="sky-head"><img src="' + r.moon.art + '" alt=""><div><p class="label">The sky today</p><p class="card-title">' + r.moon.name + '</p><p class="small muted">' + r.moon.lit + '% lit</p></div></div>' +
      (sun ? '<div class="kv"><span><img src="assets/icon-sunrise.svg" alt="">First light</span><b>' + time(sun.rise) + '</b></div><div class="kv"><span><img src="assets/icon-golden.svg" alt="">Golden hour</span><b>' + time(sun.golden) + '</b></div><div class="kv"><span><img src="assets/icon-sunset.svg" alt="">Sunset</span><b>' + time(sun.set) + '</b></div>' : '') +
      (pl.guessed ? '<p class="small muted">Estimated from your time zone. <button class="link" data-act="locate">Use my location</button></p>' : '<p class="small muted">Set for your location.</p>') + '</div>';

    var actions = mode === 'cycle' ?
      (r.estimated ? '<p class="hint">We are estimating from your last logged period. Tell us when the next one starts and this stays true.</p>' : '') + el.btn('My period started today', 'periodToday', null, 'btn-outline') :
      ((state.stage === 'cycling' || state.stage === 'irregular') ? el.btn('Follow my cycle instead', 'rhythmSheet', null, 'btn-outline') : '');

    return '<div class="page">' + arrange('rhythm', {
      head: '<h1 class="display">Your almanac</h1><p class="lead">A record of your own weather. It gets truer the longer you keep it.</p>',
      seg: seg,
      wheel: wheel + legend + '<p class="hint">Each light on the ring is a day you checked in. Bigger means you had more to give.</p>',
      notes: almanacNotes(),
      glimmers: glimmerSection(),
      moons: moonSection(),
      season: '<p class="section-title">This season</p><div class="card season"><p class="label">' + (mode === 'cycle' ? s.cycle : s.moon) + '</p><p class="display sm">' + s.name + ' asks for ' + lower(s.asks) + '</p>' +
        '<div class="fact"><p class="label">Energy</p><p>' + s.energy + '</p></div><div class="fact"><p class="label">Nourish</p><p>' + s.nourish + '</p></div><div class="fact"><p class="label">Move</p><p>' + s.move + '</p></div></div>' + tenderNote,
      week: '<p class="section-title">The week ahead</p>' + weekStrip(mode),
      sky: '<p class="section-title">Sun and moon</p>' + sky + actions
    }, ['head', 'seg', 'wheel', 'notes', 'glimmers', 'moons', 'season', 'week', 'sky']) + '</div>';
  }

  /* ---------- Path ---------- */
  function viewPlan() {
    var p = pat(), view = ui.phaseView == null ? state.phase : ui.phaseView, ph = PHASES[view];
    var phases = '<div class="phases">' + PHASES.map(function (x, i) {
      return '<button class="phase' + (i === view ? ' on' : '') + (i === state.phase ? ' current' : '') + '" data-act="phaseView" data-arg="' + i + '"><img src="' + SEASONS[x.season].art + '" alt=""><span>' + x.name + '</span></button>';
    }).join('') + '</div>';
    var isCurrent = view === state.phase;
    var next = PHASES[(state.phase + 1) % 4];
    var phaseCard = '<div class="card flush"><div class="card-pad"><p class="label">Phase ' + (view + 1) + ' of 4' + (isCurrent ? ' · you are here' : view < state.phase ? ' · walked' : ' · ahead') + '</p><p class="display sm">' + ph.name + '</p><p class="small">' + ph.line + '</p></div>' +
      anchorIds(view).map(function (id) { return anchorRow(id); }).join('') + '</div>' +
      (isCurrent ? el.btn(state.phase === 3 ? 'Begin the circle again' : 'I am ready for ' + next.name, 'phaseNext', null, 'btn-outline') + '<p class="hint">Most of the time this is decided at the full moon gathering. There is no rush.</p>' : '');

    var staples = STAPLES.map(function (st) {
      var n = (state.staples[st.id] || []).length;
      return '<button class="list-row" data-act="stapleSheet" data-arg="' + st.id + '"><span><b>' + st.title + '</b><span class="small muted">' + (n ? n + ' things in it now' : 'Tap to build yours') + '</span></span><img src="assets/icon-next.svg" class="chev" alt=""></button>';
    }).join('');
    var practices = PRACTICES.map(function (x) {
      return '<details class="practice"><summary>' + x.title + '</summary><p class="small">' + x.summary + '</p><ul>' + x.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></details>';
    }).join('');
    var second = state.second.length ? state.second.map(function (id) { return '<div class="mini-anchor"><span class="pill pill-' + ANCHORS[id].pillar + '">' + PILLARS[ANCHORS[id].pillar] + '</span><span>' + esc(anchor(id).title) + '</span></div>'; }).join('') : '<p class="small muted pad">When an anchor stops needing effort, it moves here. That is the whole goal: needing us less.</p>';

    return '<div class="page">' +
      '<div class="plan-head"><img src="' + p.art + '" alt=""><div>' + el.label('Your path') + '<h1 class="display">' + p.direction + '</h1><p class="small">You have been living in <b>' + p.name + '</b>. ' + p.asks + '</p></div></div>' +
      '<div class="card"><div class="fact"><p class="label">The old path</p><p>' + p.looks + '</p></div><div class="fact"><p class="label">The one you are wearing in</p><p>' + p.vision + '</p></div><p class="small muted pad-top">Every rep wears the new path in a little more. A missed day does not grow it over.</p></div>' +
      '<p class="section-title">The recovery circle</p>' + phases + phaseCard +
      '<p class="section-title">How to eat and move, for now</p><div class="card"><div class="fact"><p class="label">Nourish</p><p>' + p.nourish + '</p></div><div class="fact"><p class="label">Move</p><p>' + p.move + '</p></div></div>' +
      '<p class="section-title">Add before you take away</p><div class="card flush">' + staples + '</div>' +
      '<p class="section-title">Practices</p><div class="card flush">' + practices + '</div>' +
      '<p class="section-title">Second nature</p><div class="card flush">' + second + '</div>' +
      el.btn('See my other paths', 'pathsSheet', null, 'btn-ghost') + '</div>';
  }

  /* ---------- You ---------- */
  function viewYou() {
    var p = pat(), dk = deck();
    function chips(list, act, sel) { return '<div class="chips">' + list.map(function (x) { return el.chip(x, act, x, sel.indexOf(x) >= 0); }).join('') + '</div>'; }
    var weight = state.weight.on ?
      '<p class="small">A number is information. It is not a grade.</p>' + state.weight.entries.slice(-4).reverse().map(function (w) { return '<div class="kv"><span>' + Rhythm.fromISO(w.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) + '</span><b>' + w.value + ' lb</b></div>'; }).join('') +
      '<div class="inline-form"><input class="field" id="f-weight" type="number" inputmode="decimal" placeholder="Today, in lb"><button class="btn btn-small" data-act="weightAdd">Add</button></div><button class="link" data-act="weightToggle">Stop tracking and hide this</button>' :
      '<p class="small">Not tracking. That is a complete answer.</p><button class="link" data-act="weightToggle">Turn on a private log</button>';
    var ritual = state.cards.on ?
      '<div class="row"><img src="' + dk.art + '" class="deck-thumb" alt=""><div><p class="card-title">' + dk.name + '</p><p class="small muted">' + (state.cards.arrived ? 'With you. You pull, we listen.' : 'On its way. About three weeks.') + '</p></div></div><button class="link" data-act="cardsToggle">Turn the card ritual off</button>' :
      '<p class="small">Off. Breath and body rituals are always under Pause.</p><button class="link" data-act="cardsToggle">Choose a deck</button>';
    var glimmers = state.glimmers.length ? '<div class="tiles">' + latestTiles(6) + '</div><button class="link" data-act="grid">Open the whole grid</button>' : '<p class="small muted">The small beautiful things you keep will gather here.</p>';
    var r = rhythmNow();
    return '<div class="page">' +
      '<div class="profile"><img src="' + p.art + '" alt=""><div><h1 class="display">' + esc(state.name || 'You') + '</h1><p class="small">Living in <b>' + p.name + '</b>, walking toward ' + lower(p.direction) + '.</p></div></div>' +
      '<div class="card"><p class="label">Your pattern</p><p class="card-title">' + p.name + ' · ' + lower(p.state) + '</p><p class="small">' + p.line + ' It is a state, not an identity, and it can change.</p><p class="mantra">“' + p.anchorLine + '”</p><div class="link-row"><button class="link" data-act="pathsSheet">Change my path</button><button class="link" data-act="retake">Retake the six moments</button></div></div>' +
      '<div class="card"><p class="label">Kin</p>' + kinCard() + '</div>' +
      '<div class="card"><p class="label">What this is for</p>' + chips(VALUES, 'value', state.values) + '</div>' +
      '<div class="card"><p class="label">What fills your cup</p>' + (state.cup.length ? '<div class="chips">' + state.cup.map(function (c) { return '<span class="chip on static">' + esc(c) + '</span>'; }).join('') + '</div>' : '<p class="small">Starting with one spark: ' + lower(sparkName()) + '.</p>') + '</div>' +
      '<div class="card"><p class="label">Rhythm</p><p class="card-title">' + (hasCycle() ? 'Following your cycle' : 'Following the moon') + '</p><p class="small muted">' + SEASONS[r.season].name + ' today.' + (hasCycle() ? ' ' + state.rhythm.len + '-day cycle, last period ' + Rhythm.fromISO(state.rhythm.start).toLocaleDateString([], { month: 'short', day: 'numeric' }) + '.' : '') + '</p><button class="link" data-act="rhythmSheet">Change</button></div>' +
      '<div class="card"><p class="label">Card ritual</p>' + ritual + '</div>' +
      '<div class="card"><p class="label">Weight</p>' + weight + '</div>' +
      '<div class="card"><p class="label">Your table</p><p class="small">So ideas fit the food your family already loves.</p>' + chips(HERITAGE, 'heritage', state.heritage) + '<p class="small pad-top">Leave out</p>' + chips(ALLERGIES, 'allergy', state.allergies) + '</div>' +
      '<div class="card"><p class="label">Glimmer grid</p>' + glimmers + '</div>' +
      '<div class="card tinted"><p class="label">Coaching</p><p class="card-title">A real person, when you want one.</p><p class="small">One-to-one sessions are opening soon, and after them small circles of moms on the same path, gathering at each full moon. Until then, everything here is yours to use at your own pace.</p>' + el.btn(state.coachNotify ? 'We will let you know' : 'Tell me when it opens', 'coach', null, 'btn-small' + (state.coachNotify ? ' is-done' : '')) + '</div>' +
      '<p class="small muted center">You have paused ' + state.pauses + ' time' + (state.pauses === 1 ? '' : 's') + '. Each one was the practice.</p>' +
      '<p class="fine">' + APP.disclaimer + '</p></div>';
  }

  function kinCard() {
    var cm = currentMoon(), k = state.kin;
    var witness = k.name ?
      '<p class="card-title">' + esc(k.name) + ' is your witness</p><p class="small">' + (cm && cm.witness ? 'She is holding “' + esc(cm.word) + '” with you this moon. ' : '') + 'Her only job is to ask how it went. No app, no reports, no scores.</p><div class="link-row">' + (cm ? '<button class="link" data-act="kinMsg" data-arg="now">Send her this moon\'s card</button>' : '') + '<button class="link" data-act="kinClear">Change</button></div>' :
      '<p class="card-title">Choose a witness</p><p class="small">One person who knows what this moon is for. She does not need the app. Her only job is to ask you about it at the full moon.</p><div class="inline-form"><input class="field" id="f-kin" type="text" autocomplete="off" placeholder="Her first name"><button class="btn btn-small" data-act="kinSet">Choose</button></div>';
    var held = k.holding.map(function (h, i) { return '<div class="hold"><span>' + esc(h.name) + '</span><b>“' + esc(h.word) + '”</b><button class="link" data-act="holdDrop" data-arg="' + i + '">Release</button></div>'; }).join('');
    return witness + '<p class="label pad-top">Who you are holding</p>' + (held || '<p class="small muted">When a friend tells you her word, keep it here. At the full moon we remind you to ask her about it.</p>') +
      '<div class="inline-form two"><input class="field" id="f-hname" type="text" autocomplete="off" placeholder="Her name"><input class="field" id="f-hword" type="text" autocomplete="off" placeholder="Her word"><button class="btn btn-small" data-act="holdAdd">Keep</button></div>';
  }

  /* ---------- sheets ---------- */
  function openSheet(html, tall) {
    ui.sheet = html;
    $('sheet-body').className = 'sheet' + (tall ? ' tall' : '');
    $('sheet-body').innerHTML = '<button class="sheet-close" data-act="closeSheet" aria-label="Close"><img src="assets/icon-close.svg" alt=""></button>' + html;
    $('sheet').hidden = false;
  }
  function closeSheet() { clearTimeout(ui.timer); ui.sheet = null; ui.pause = null; ui.ritual = null; $('sheet').hidden = true; }

  function sheetAnchor(id) {
    var a = anchor(id), second = state.second.indexOf(id) >= 0;
    var cues = [ANCHOR_CUE[id]].concat(CUES.filter(function (c) { return c !== ANCHOR_CUE[id]; }));
    openSheet('<span class="pill pill-' + a.pillar + '">' + PILLARS[a.pillar] + '</span><h2 class="display">' + esc(a.title) + '</h2>' + trailBar(id) +
      '<div class="fact"><p class="label">When</p><p class="small">Tie it to something you already do, so you never have to remember.</p><div class="chips">' + cues.map(function (c) { return el.chip(c, 'cue', id + '|' + c, cueFor(id) === c); }).join('') + '</div></div>' +
      '<div class="fact"><p class="label">Why this, for you</p><p>' + a.why + '</p></div>' +
      '<div class="card tinted"><p class="label">On a low day</p><p>' + a.easier + '. That counts in full.</p></div>' +
      (a.swaps.length ? '<div class="fact"><p class="label">Make it yours</p><ul class="bullets">' + a.swaps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>' : '') +
      el.btn(isTended(id) ? 'Tended today' : 'I tended this today', 'tend', id, isTended(id) ? 'btn-primary is-done' : 'btn-primary') +
      el.btn(second ? 'Bring it back into my anchors' : 'This is second nature now', 'second', id, 'btn-ghost'));
  }

  function sheetStaple(id) {
    var st = STAPLES.filter(function (s) { return s.id === id; })[0], cur = state.staples[id] || [];
    var adds = st.blocks.filter(function (b) { return b.tip && cur.indexOf(b.label) < 0; }).slice(0, 3);
    openSheet(el.label('Add before you take away') + '<h2 class="display">' + st.title + '</h2><p class="small">Tap what already goes in. Nothing comes out.</p>' +
      '<div class="chips">' + st.blocks.map(function (b) { return el.chip(b.label, 'stapleBlock', id + '|' + b.label, cur.indexOf(b.label) >= 0); }).join('') + '</div>' +
      (adds.length ? '<p class="section-title">Easy things to add</p>' + adds.map(function (b) { return '<div class="add"><span class="pill pill-nourish">' + b.role + '</span><p>' + b.tip + '</p></div>'; }).join('') : '<div class="card tinted"><p>This one is already doing a lot for you. Leave it exactly as it is.</p></div>'));
  }

  function sheetPaths() {
    openSheet(el.label('Your paths') + '<h2 class="display">Which sounds like right now?</h2><p class="small">Patterns shift as life does. Changing path is not starting over. Your second-nature anchors come with you.</p><div class="paths">' +
      (state.options.length ? state.options : [state.pattern]).map(function (pid) {
        var p = pat(pid);
        return '<button class="path' + (state.pattern === pid ? ' on' : '') + '" data-act="switchPath" data-arg="' + pid + '"><img src="' + p.art + '" class="path-art" alt=""><span class="path-body"><span class="label">' + p.state + '</span><span class="path-name">' + p.name + '</span><span class="path-line">' + p.line + '</span><span class="path-dir">The path: ' + lower(p.direction) + '</span></span></button>';
      }).join('') + '</div>' + el.btn('Show me all five', 'allPaths', null, 'btn-ghost'), true);
  }

  function sheetRhythm() {
    openSheet(el.label('Rhythm') + '<h2 class="display">What should we follow?</h2>' +
      '<label class="field-label" for="f-start">First day of your last period</label><input class="field" id="f-start" type="date" max="' + todayKey() + '" value="' + esc(state.rhythm.start) + '">' +
      '<label class="field-label">Usual cycle length</label><div class="stepper"><button data-act="len" data-arg="-1">−</button><span><b>' + state.rhythm.len + '</b> days</span><button data-act="len" data-arg="1">+</button></div>' +
      el.btn('Follow my cycle', 'cycleSave') + el.btn('Follow the moon', 'moonOnly', null, 'btn-ghost'));
  }

  function sheetCardPicker() {
    var tabs = [['major', 'Major']].concat(SUITS.map(function (s) { return [s.id, s.name]; }));
    var list = [];
    if (ui.suit === 'major') MAJORS.forEach(function (m, i) { list.push([i, m[0]]); });
    else { var si = SUITS.map(function (s) { return s.id; }).indexOf(ui.suit); RANKS.forEach(function (r, i) { list.push([22 + si * 14 + i, r[0]]); }); }
    openSheet(el.label('Card ritual') + '<h2 class="display">What did you pull?</h2><div class="seg wide scroll">' + tabs.map(function (t) { return '<button class="' + (ui.suit === t[0] ? 'on' : '') + '" data-act="suit" data-arg="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="chips grid">' + list.map(function (c) { return el.chip(c[1], 'cardLog', c[0], false); }).join('') + '</div>', true);
  }

  function sheetDecks() {
    openSheet(el.label('Card ritual') + '<h2 class="display">Choose your deck</h2><div class="decks">' + DECKS.map(function (d) {
      return '<button class="deck' + (state.cards.deck === d.id ? ' on' : '') + '" data-act="deckOn" data-arg="' + d.id + '"><img src="' + d.art + '" alt=""><b>' + d.name + '</b><span>' + d.note + '</span></button>';
    }).join('') + '</div>');
  }

  /* ---------- a rep: do it, feel it, notice the effort ---------- */
  function sheetSavor(id) {
    var a = anchor(id), n = 10;
    openSheet('<div class="savor"><span class="pill pill-' + a.pillar + '">' + PILLARS[a.pillar] + '</span><h2 class="display">' + esc(gentleToday() ? a.easier : a.title) + '</h2>' +
      '<div class="savor-ring"><span id="sv">10</span></div><p class="center">Stay with it for ten seconds. Let yourself feel that you did it. This is the part that wires it in.</p>' +
      '<p class="label center">How much did that take out of you?</p><div class="seg wide">' + EFFORT.map(function (e) { return '<button data-act="effort" data-arg="' + id + '|' + e[0] + '">' + e[1] + '</button>'; }).join('') + '</div>' +
      el.btn('Skip', 'effort', id + '|', 'btn-ghost') + '</div>');
    ui.timer = setInterval(function () {
      var s = $('sv'); n--;
      if (!s || n <= 0) { clearInterval(ui.timer); if (s) s.textContent = 'Kept'; return; }
      s.textContent = n;
    }, 1000);
  }
  function sheetSecond(id) {
    openSheet(el.label('Wearing in') + '<h2 class="display">This one hardly takes effort any more.</h2><p>“' + esc(anchor(id).title) + '” has felt easy three times running. That is what a worn-in path feels like. If it is yours now, it can leave your daily list and make room.</p>' +
      el.btn('It is second nature now', 'second', id) + el.btn('Not yet', 'closeSheet', null, 'btn-ghost'));
  }

  /* ---------- almanac: her own data, handed back ---------- */
  function wheelDots(mode, r) {
    var set = mode === 'cycle' ? state.rhythm : { mode: 'moon' }, out = '';
    for (var k = 0; k < 40; k++) {
      var date = Rhythm.addDays(now(), -k), rr = Rhythm.rhythm(set, date), c = state.capacity[Rhythm.iso(date)];
      if (k > 0 && rr.progress > r.progress) break;
      if (c) out += '<span class="wheel-dot ' + c + '" style="transform:rotate(' + (rr.progress * 360).toFixed(1) + 'deg)"><i></i></span>';
    }
    return out;
  }
  function insights() {
    var out = [], score = { low: 0, okay: 1, good: 2 }, keys = Object.keys(state.capacity).filter(function (k) { return state.capacity[k]; });
    if (keys.length < 7) return { n: keys.length, list: out };
    var by = {};
    keys.forEach(function (k) { var s = seasonOf(k); (by[s] = by[s] || []).push(score[state.capacity[k]]); });
    var seas = Object.keys(by).filter(function (s) { return by[s].length >= 3; }).map(function (s) { return { s: s, avg: mean(by[s]) }; }).sort(function (a, b) { return b.avg - a.avg; });
    if (seas.length >= 2 && seas[0].avg - seas[seas.length - 1].avg >= 0.4) out.push(['Your seasons', 'Your fullest days tend to fall in <b>' + SEASONS[seas[0].s].name + '</b>, and your thinnest in <b>' + SEASONS[seas[seas.length - 1].s].name + '</b>. Put the hard things where the energy is.']);
    var best = null;
    Object.keys(ANCHORS).forEach(function (id) {
      var on = {}, w = [], wo = [];
      repsFor(id).forEach(function (r) { on[r.d] = 1; });
      keys.forEach(function (k) { (on[k] ? w : wo).push(score[state.capacity[k]] > 0 ? 1 : 0); });
      if (w.length >= 4 && wo.length >= 4 && mean(w) - mean(wo) >= 0.2 && (!best || mean(w) - mean(wo) > best.diff)) best = { id: id, diff: mean(w) - mean(wo), w: w, wo: wo };
    });
    if (best) out.push(['What goes together', 'On days you kept “' + esc(anchor(best.id).title.toLowerCase()) + '”, you had enough or plenty <b>' + total(best.w) + ' times out of ' + best.w.length + '</b>. On other days, ' + total(best.wo) + ' out of ' + best.wo.length + '.']);
    if (state.pauseLog.length >= 3) {
      var hours = {}, top = null;
      state.pauseLog.forEach(function (x) { hours[x.h] = (hours[x.h] || 0) + 1; if (top == null || hours[x.h] > hours[top]) top = x.h; });
      out.push(['Your feminine hour', 'You reach for Pause most around <b>' + hourLabel(+top) + '</b>. That is the hour to soften. Have something kind ready for yourself then.']);
    }
    var val = { lot: 2, some: 1, little: 0 };
    Object.keys(ANCHORS).some(function (id) {
      var e = repsFor(id).map(function (r) { return val[r.e]; }), h = Math.floor(e.length / 2);
      if (e.length >= 6 && mean(e.slice(0, h)) - mean(e.slice(h)) >= 0.5) { out.push(['Wearing in', '“' + esc(anchor(id).title) + '” is taking less out of you than it did. That is a path wearing in.']); return true; }
      return false;
    });
    return { n: keys.length, list: out.slice(0, 3) };
  }
  function almanacNotes() {
    var ins = insights(), html = '<p class="section-title">What it is noticing <span>' + ins.n + ' day' + (ins.n === 1 ? '' : 's') + ' kept</span></p>';
    if (!ins.list.length) return html + '<div class="card soft"><p><b>Your almanac is still gathering.</b></p><p class="small">' + (ins.n < 7 ? 'After about a week of ten-second touches it starts handing things back: where your energy lives, what goes with a good day, when you need the most care.' : 'Nothing stands out yet, which is information too. Keep going.') + '</p><div class="gather"><i style="width:' + Math.min(100, ins.n / 7 * 100).toFixed(0) + '%"></i></div></div>';
    html += ins.list.map(function (x) { return '<div class="card insight"><p class="label">' + x[0] + '</p><p>' + x[1] + '</p></div>'; }).join('');
    return html + '<div class="stats"><span><b>' + state.reps.length + '</b>reps</span><span><b>' + state.pauses + '</b>pauses</span><span><b>' + state.glimmers.length + '</b>glimmers</span></div>';
  }
  function moonCall(ms) {
    var k = MOON_RITUALS[ms.due.kind];
    return '<div class="moon-call"><img src="' + k.art + '" alt=""><div><p class="label">' + ms.when + '</p><p class="display sm">' + k.call + '</p><p class="small">' + k.sub + '</p>' + el.btn('Begin', 'ritual', ms.due.kind, 'btn-small') + '</div></div>';
  }
  function moonSection() {
    var ms = moonState(), n = MOON_RITUALS[ms.next.kind], html = '<p class="section-title">Moon rituals <span>Twice a moon</span></p>';
    html += ms.due ? moonCall(ms) : '<div class="card row-card"><img src="' + n.art + '" alt=""><div><p class="label">Next</p><p class="card-title">' + n.name + '</p><p class="small muted">' + ms.next.date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) + ', in ' + ms.until + ' day' + (ms.until === 1 ? '' : 's') + '</p><button class="link" data-act="ritual" data-arg="' + ms.next.kind + '">Do it early</button></div></div>';
    var pages = state.rituals.map(function (r, i) {
      return '<button class="list-row" data-act="ritualPage" data-arg="' + i + '"><span><b>' + (r.kind === 'new' ? 'New moon' : 'Full moon') + ' · ' + fmt(r.date) + '</b><span class="small muted">' + (r.kind === 'new' ? '“' + esc(r.word || 'Begin') + '” · for ' + esc(lower(r.wish)) : 'Gathered' + (r.notice ? ' · “' + esc(r.notice) + '”' : '')) + '</span></span><img src="assets/icon-next.svg" class="chev" alt=""></button>';
    }).reverse().slice(0, 6).join('');
    return html + '<div class="card flush">' + (pages || '<p class="small muted pad">Your moon pages collect here, one at each new and full moon. Each new moon leaves you a card to print and keep.</p>') + '</div>';
  }

  /* ---------- glimmers: a photo or a line, gathered into a grid ---------- */
  function tile(i) {
    var g = state.glimmers[i], s = seasonOf(g.date);
    return '<button class="tile ' + s + '" data-act="glimmerOpen" data-arg="' + i + '">' + (g.img ? '<img src="' + g.img + '" alt="' + esc(g.text) + '">' : '<span>' + esc(g.text) + '</span>') + '<i style="background:' + SEASONS[s].color + '"></i></button>';
  }
  function latestTiles(n) { return state.glimmers.map(function (g, i) { return i; }).slice(-n).reverse().map(tile).join(''); }
  function glimmerSection() {
    var n = state.glimmers.length, html = '<p class="section-title">Glimmer grid <span>' + n + ' kept</span></p>';
    if (!n) return html + '<div class="card soft"><p class="small">Nothing kept yet. One photo or one line from Today starts it.</p></div>';
    return html + '<div class="tiles">' + latestTiles(6) + '</div><button class="link" data-act="grid">Open the whole grid</button>';
  }
  function sheetGrid() {
    var n = state.glimmers.length;
    openSheet(el.label('Glimmer grid') + '<h2 class="display">' + n + ' small beautiful thing' + (n === 1 ? '' : 's') + '.</h2><p class="small">Proof, in your own pictures, that the ordinary days are full. No feed, no likes. Only yours.</p>' +
      (n ? '<div class="tiles">' + latestTiles(n) + '</div>' + el.btn('Print this grid', 'printGrid', null, 'btn-outline') : '<div class="card soft"><p class="small">Nothing kept yet. One photo or one line from Today starts it.</p></div>'), true);
  }
  function sheetGlimmer(i) {
    var g = state.glimmers[i], s = seasonOf(g.date), m = Rhythm.moon(Rhythm.addDays(Rhythm.fromISO(g.date), 0));
    openSheet('<div class="glim">' + (g.img ? '<img src="' + g.img + '" class="glim-img" alt="">' : '') + (g.text ? '<p class="quote big">“' + esc(g.text) + '”</p>' : '') +
      '<p class="label">' + fmt(g.date, { weekday: 'long', month: 'long', day: 'numeric' }) + '</p><p class="small muted">' + SEASONS[s].name + ' · ' + m.name.toLowerCase() + '</p></div>' +
      el.btn('Back to the grid', 'grid', null, 'btn-outline') + '<button class="link" data-act="glimmerDrop" data-arg="' + i + '">Let this one go</button>', true);
  }
  function readPhoto(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var side = Math.min(img.width, img.height), c = document.createElement('canvas');
        c.width = c.height = 360;
        c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 360, 360);
        done(c.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- the keepsake: something to hold when the phone is away ---------- */
  function keepsake(r) {
    var t = pat(r.pattern).theme, p = pat(r.pattern);
    return '<div class="keepsake" style="--primary:' + t.primary + ';--accent:' + t.accent + ';--tint:' + t.tint + ';--surface:' + t.surface + '">' +
      '<img src="assets/moon-0.svg" class="keep-moon" alt=""><p class="label">New moon · ' + fmt(r.date, { month: 'long', day: 'numeric' }) + '</p>' +
      '<p class="keep-word">' + esc(r.word || 'Begin') + '</p><p class="keep-line">This moon is for <b>' + esc(lower(r.wish)) + '</b>.</p>' +
      (r.obstacle ? '<p class="keep-line">When <b>' + esc(r.obstacle) + '</b>, I will <b>' + esc(r.plan || PLANS[0]) + '</b>.</p>' : '') +
      '<div class="keep-anchors">' + r.anchors.map(function (id) { return '<p class="keep-anchor"><span>' + esc(cueFor(id)) + '</span>' + esc(lower(anchor(id).title)) + '</p>'; }).join('') + '</div>' +
      '<p class="mantra">“' + p.anchorLine + '”</p><p class="keep-foot">' + APP.name + (r.witness ? ' · held with ' + esc(r.witness) : '') + '</p></div>';
  }
  function sheetKeepsake(r, fresh) {
    ui.keep = r;
    openSheet(el.label(fresh ? 'Your moon card' : 'Moon page') + keepsake(r) + '<p class="small center pad-top">Print it, or copy it out by hand. Put it where you will see it: the fridge, the mirror, the car. Then let the phone go.</p>' +
      (r.witness ? el.btn('Send it to ' + esc(r.witness), 'kinMsg', 'card') : '') + el.btn('Print my moon card', 'print', null, r.witness ? 'btn-outline' : 'btn-primary') + el.btn(fresh ? 'Done' : 'Close', 'closeSheet', null, 'btn-ghost'), true);
  }

  /* ---------- the two moon rituals ---------- */
  var RITUAL_STEPS = { new: ['arrive', 'wish', 'obstacle', 'plan', 'load', 'word', 'witness'], full: ['arrive', 'evidence', 'held', 'notice', 'pattern', 'next', 'close'] };
  function ritualRender() {
    var r = ui.ritual, d = r.d, k = MOON_RITUALS[r.kind], p = pat(), ids = anchorIds(state.phase), steps = RITUAL_STEPS[r.kind], step = steps[r.i], html = '';
    function opts(key, list) { return '<div class="options">' + list.map(function (o) { return el.option(o[1], o[2] || '', 'rit', key + '|' + o[0], d[key] === o[0]); }).join('') + '</div>'; }
    if (step === 'arrive') {
      html = '<div class="pause-end"><img src="' + k.art + '" class="still" alt=""><p class="label">' + k.name + '</p><h2 class="display">Take one slow breath.</h2><p>' + k.open + '</p></div>' + el.btn('Begin', 'ritNext') + '<p class="hint">About five minutes. Then the phone goes away.</p>';
    } else if (step === 'wish') {
      var wishes = state.values.concat(VALUES.filter(function (v) { return state.values.indexOf(v) < 0; }).slice(0, 2));
      html = el.label('The wish') + '<h2 class="display">What is this moon for?</h2><p class="small">Not a goal. A direction.</p>' + opts('wish', wishes.map(function (v) { return [v, v]; })) +
        '<div class="inline-form"><input class="field" id="f-rit" type="text" placeholder="Or in your own words"><button class="btn btn-small" data-act="ritText" data-arg="wish">Use this</button></div>';
    } else if (step === 'obstacle') {
      html = el.label('The obstacle') + '<h2 class="display">What usually gets in the way?</h2><p class="small">Naming it now is what makes the plan hold. Picturing only the good part does not.</p>' + opts('obstacle', OBSTACLES.map(function (o) { return [o, cap1(o)]; }));
    } else if (step === 'plan') {
      html = el.label('The plan') + '<h2 class="display">When ' + esc(d.obstacle || OBSTACLES[0]) + ', I will…</h2>' + opts('plan', PLANS.map(function (o) { return [o, cap1(o)]; }));
    } else if (step === 'load') {
      html = el.label('The load') + '<h2 class="display">How much do you have for these two weeks?</h2><p class="small">Honest beats ambitious.</p>' + opts('load', [['low', 'Not much', 'One anchor only. That is a full plan.'], ['okay', 'Enough', 'Both anchors, smaller on low days.'], ['good', 'Plenty', 'Both anchors, in full.']]);
    } else if (step === 'word') {
      html = el.label('The word') + '<h2 class="display">One word to carry.</h2><div class="chips grid">' + WORDS.map(function (w) { return el.chip(w, 'rit', 'word|' + w, d.word === w); }).join('') + '</div>';
    } else if (step === 'witness') {
      html = el.label('The witness') + '<h2 class="display">Who will hold this with you?</h2><p class="small">One person. She does not need the app or any instructions. Her only job is to ask you about it at the full moon. A wish that someone else knows about is easier to keep.</p>' +
        '<input class="field" id="f-rit" type="text" autocomplete="off" placeholder="Her first name" value="' + esc(state.kin.name) + '">' + el.btn('She will hold it', 'ritWitness') + el.btn('Keep this one to myself', 'rit', 'witness|', 'btn-ghost');
    } else if (step === 'evidence') {
      var from = state.rituals.filter(function (x) { return x.kind === 'new'; }).map(function (x) { return x.date; }).pop() || Rhythm.iso(Rhythm.addDays(now(), -15));
      var last = state.rituals.filter(function (x) { return x.kind === 'new'; }).pop();
      function since(list, key) { return list.filter(function (x) { return x[key] >= from; }).length; }
      var days = Object.keys(state.capacity).filter(function (x) { return x >= from && state.capacity[x]; }).length;
      html = el.label('The evidence') + '<h2 class="display">Here is what you did.</h2>' + (last ? '<p class="small">This moon was for ' + esc(lower(last.wish)) + '.</p>' : '') +
        '<div class="card"><div class="kv first"><span>Reps on the new path</span><b>' + since(state.reps, 'd') + '</b></div><div class="kv"><span>Times you paused instead</span><b>' + since(state.pauseLog, 'd') + '</b></div><div class="kv"><span>Days you checked in</span><b>' + days + '</b></div><div class="kv"><span>Small beautiful things kept</span><b>' + since(state.glimmers, 'date') + '</b></div></div>' +
        '<p class="small">Every one of these is a vote for who you are becoming. None of them can be taken back.</p>' + el.btn('Continue', 'ritNext');
    } else if (step === 'held') {
      html = el.label('The anchors') + '<h2 class="display">How did each one hold?</h2><p class="small">All three answers are useful.</p>' + ids.map(function (id) {
        return '<div class="held"><p><b>' + esc(anchor(id).title) + '</b></p>' + trailBar(id) + '<div class="seg wide">' + [['held', 'Held'], ['some', 'Sometimes'], ['not', 'Not this moon']].map(function (o) { return '<button class="' + (d.held[id] === o[0] ? 'on' : '') + '" data-act="ritHeld" data-arg="' + id + '|' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
      }).join('') + el.btn('Continue', 'ritNext');
    } else if (step === 'notice') {
      var ins = insights().list[0];
      html = el.label('The noticing') + '<h2 class="display">What did you notice about yourself?</h2>' + (ins ? '<div class="card insight"><p class="label">From your almanac</p><p>' + ins[1] + '</p></div>' : '') +
        '<input class="field" id="f-rit" type="text" placeholder="One line is plenty">' + el.btn('Continue', 'ritText', 'notice');
    } else if (step === 'pattern') {
      html = el.label('The pattern') + '<h2 class="display">Does ' + p.name + ' still sound like right now?</h2><p class="small">' + p.line + '</p>' + opts('pattern', [['yes', 'Yes, still here', 'Then the path is still the right one.'], ['soft', 'It is softening', 'That is the work, working.'], ['else', 'Something else has taken over', 'Patterns shift. We will look at your other paths.']]);
    } else if (step === 'next') {
      var nx = PHASES[(state.phase + 1) % 4], list = [['stay', 'Stay in ' + PHASES[state.phase].name, 'Same anchors. More reps.'], ['on', state.phase === 3 ? 'Begin the circle again' : 'Move on to ' + nx.name, nx.line]];
      if (state.phase > 0) list.push(['back', 'Go back to Rest', 'Always allowed. Sometimes it is the wise move.']);
      html = el.label('The next stretch') + '<h2 class="display">Where to from here?</h2>' + opts('next', list);
    } else {
      var g = latestTiles(6), nextNew = Rhythm.moonEvents(now()).next;
      html = '<div class="pause-end"><img src="assets/sunburst.svg" alt=""><h2 class="display">Gathered.</h2><p>You looked at all of it and did not flinch. That is the practice.</p></div>' +
        (g ? '<div class="card"><p class="label">What you kept this moon</p><div class="tiles">' + g + '</div></div>' : '') +
        '<p class="small center pad-top">Until the ' + (nextNew.kind === 'new' ? 'new' : 'next') + ' moon, ten seconds a day is plenty.</p>' + el.btn(d.pattern === 'else' ? 'Look at my other paths' : 'Back to my life', d.pattern === 'else' ? 'allPaths' : 'closeSheet') +
        (currentMoon() && currentMoon().witness ? el.btn('Tell ' + esc(currentMoon().witness) + ' one thing', 'kinMsg', 'full', 'btn-outline') : '');
    }
    var bar = '<div class="progress">' + steps.map(function (x, i) { return '<span class="progress-seg"><i style="width:' + (i <= r.i ? 100 : 0) + '%"></i></span>'; }).join('') + '</div>';
    openSheet('<div class="pause ritual-flow">' + bar + html + '</div>', true);
  }
  function ritualAdvance() {
    var r = ui.ritual, d = r.d, steps = RITUAL_STEPS[r.kind], rec = { date: todayKey(), kind: r.kind, pattern: state.pattern };
    r.i++;
    if (r.kind === 'new' && r.i >= steps.length) {
      var ids = anchorIds(state.phase).filter(function (id) { return state.second.indexOf(id) < 0; });
      if (!ids.length) ids = anchorIds(state.phase);
      Object.assign(rec, { wish: d.wish || state.values[0] || VALUES[5], obstacle: d.obstacle || '', plan: d.plan || '', load: d.load || 'okay', word: d.word || 'Begin', witness: d.witness || '', anchors: d.load === 'low' ? ids.slice(0, 1) : ids });
      state.moonLoad = rec.load; state.rituals.push(rec); save(); render();
      return sheetKeepsake(rec, true);
    }
    if (r.kind === 'full' && steps[r.i] === 'close') {
      Object.assign(rec, { held: d.held, notice: d.notice || '', answer: d.pattern || '' });
      if (d.next === 'on') state.phase = (state.phase + 1) % 4; else if (d.next === 'back') state.phase = 0;
      state.rituals.push(rec); save(); render();
    }
    ritualRender();
  }

  /* demo history, so the almanac has something to say */
  function seedHistory(s, days) {
    var seed = 17, today = new Date(), th = (TENDER.filter(function (t) { return t.id === s.tender; })[0] || TENDER[2]).from;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var base = { winter: 0.25, spring: 0.7, summer: 0.85, autumn: 0.4 };
    for (var k = days; k >= 1; k--) {
      var date = Rhythm.addDays(today, -k), key = Rhythm.iso(date), season = Rhythm.rhythm(s.rhythm, date).season, kept = 0;
      var ph = k > days / 2 && s.phase > 0 ? s.phase - 1 : s.phase;
      PLAN[s.pattern][PHASES[ph].id].forEach(function (id, j) {
        if (rnd() < 0.66 - j * 0.14) { var prog = 1 - k / days; s.reps.push({ d: key, a: id, e: rnd() < prog * 0.9 ? 'little' : rnd() < 0.6 ? 'some' : 'lot' }); kept++; }
      });
      var sc = base[season] + kept * 0.2 + (rnd() - 0.5) * 0.3;
      if (rnd() < 0.86) s.capacity[key] = sc > 0.85 ? 'good' : sc > 0.48 ? 'okay' : 'low';
      if (rnd() < 0.2) { s.pauseLog.push({ d: key, h: th + (rnd() < 0.7 ? 0 : 1), m: 'reach' }); s.pauses++; }
      if (rnd() < 0.3) { var gi = s.glimmers.length % SEED_GLIMMERS.length; s.glimmers.push({ date: key, text: SEED_GLIMMERS[gi], img: SEED_GLIMMER_ART[gi] || '' }); }
    }
    var ev = Rhythm.moonEvents(today), lastNew = ev.last.kind === 'new' ? ev.last.date : new Date(ev.last.date.getTime() - 14.77 * DAY);
    if ((today - lastNew) / DAY < days) s.rituals.push({ date: Rhythm.iso(lastNew), kind: 'new', pattern: s.pattern, wish: s.values[0], obstacle: OBSTACLES[1], plan: PLANS[0], load: 'okay', word: 'Soften', anchors: PLAN[s.pattern][PHASES[s.phase].id].slice() });
    s.moonLoad = 'okay';
  }

  /* ---------- Pause ---------- */
  function pauseRender() {
    var s = ui.pause, p = pat(), html = '';
    clearTimeout(ui.timer);
    if (s.step === 0) {
      html = el.label('Pause') + '<h2 class="display">What is happening right now?</h2><p class="small">No need to explain it. Just the closest one.</p><div class="options">' +
        MOMENTS.map(function (m) { return el.option(m.label, '', 'pauseMoment', m.id, false); }).join('') + '</div>';
    } else if (s.step === 1) {
      var r = RITUALS[s.moment.ritual];
      html = el.label(r.name) + '<p class="small center">' + r.note + '</p>';
      if (r.kind === 'breath') html += '<div class="breath"><div class="breath-ring" id="b-ring"><span id="b-label">Ready</span></div><p class="small muted" id="b-count">' + r.rounds + ' slow rounds</p></div>';
      else html += '<div class="breath"><div class="breath-ring slow"><span>' + (s.sub + 1) + ' of ' + r.steps.length + '</span></div></div><p class="step-text">' + r.steps[s.sub] + '</p>' + el.btn(s.sub < r.steps.length - 1 ? 'Next' : 'Done', 'pauseStep');
      html += el.btn('Skip ahead', 'pauseNext', null, 'btn-ghost');
    } else if (s.step === 2) {
      html = s.thought ?
        el.label('Notice it') + '<h2 class="display">“I notice I am having the thought that ' + lower(esc(s.thought)) + '.”</h2><p>Say it once, slowly. A thought is weather passing through. It is not an order, and it is not the truth about you.</p>' + el.btn('Continue', 'pauseNext') :
        el.label('Notice it') + '<h2 class="display">Is one thought louder than the rest?</h2><p class="small">You do not have to argue with it. Just name it.</p><div class="options">' + THOUGHTS.map(function (t) { return el.option(t, '', 'pauseThought', t, false); }).join('') + el.option('No thought. Just a feeling.', '', 'pauseNext', '', false) + '</div>';
    } else if (s.step === 3) {
      var v = state.values[0] ? lower(state.values[0]) : 'what matters to you';
      var choices = s.moment.choices.slice();
      if (s.moment.id === 'reach' && state.cup[0]) choices[2] = 'Ten minutes of ' + lower(state.cup[0]) + ', then decide';
      if (s.moment.id === 'heavy' && state.kin.name) choices[0] = 'Text ' + state.kin.name;
      html = el.label('Choose') + '<h2 class="display">What would the you who cares about ' + v + ' do next?</h2><p class="small">Every option here is a good one.</p><div class="options">' + choices.map(function (c) { return el.option(c, '', 'pauseChoice', c, false); }).join('') + '</div>';
    } else {
      html = '<div class="pause-end"><img src="assets/sunburst.svg" alt=""><h2 class="display">You paused.</h2><p>That is the whole practice. Whatever comes next, you chose it.</p><p class="mantra">“' + p.anchorLine + '”</p></div>' + el.btn('Back to my day', 'closeSheet');
    }
    openSheet('<div class="pause">' + html + '</div>', true);
    if (s.step === 1 && RITUALS[s.moment.ritual].kind === 'breath') breathe(RITUALS[s.moment.ritual]);
  }

  function breathe(r) {
    var ring = $('b-ring'), label = $('b-label'), count = $('b-count'), round = 0;
    function phase(text, secs, big, then) {
      if (!ui.pause || !$('b-ring')) return;
      label.textContent = text;
      ring.style.transitionDuration = secs + 's';
      ring.classList.toggle('big', big);
      ui.timer = setTimeout(then, secs * 1000);
    }
    function cycle() {
      if (round >= r.rounds) { ui.pause.step = 2; pauseRender(); return; }
      round++;
      count.textContent = 'Round ' + round + ' of ' + r.rounds;
      phase('Breathe in', r.inS, true, function () {
        if (r.holdS) phase('Hold', r.holdS, true, out); else out();
      });
    }
    function out() { phase('Breathe out', r.outS, false, cycle); }
    ui.timer = setTimeout(cycle, 900);
  }

  /* ---------- render ---------- */
  function render() {
    applyTheme(); renderTop(); renderTabs();
    var view = $('view'), screen, html;
    if (!state.onboarded) {
      var id = STEPS[state.step];
      screen = 'ob' + state.step;
      html = id.charAt(0) === 'q' && id.length === 2 ? ob.quiz(+id.charAt(1)) : ob[id]();
    } else {
      setFoot('');
      screen = state.tab;
      html = state.tab === 'today' ? viewToday() : state.tab === 'rhythm' ? viewRhythm() : state.tab === 'plan' ? viewPlan() : viewYou();
    }
    var keep = screen === ui.lastScreen ? view.scrollTop : 0;
    view.innerHTML = html;
    view.classList.toggle('enter', screen !== ui.lastScreen);
    view.scrollTop = keep;
    ui.lastScreen = screen;
    renderDemo();
    save();
  }

  function renderDemo() {
    $('demo-date').textContent = state.dayOffset === 0 ? 'Today' : now().toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · reset';
    var b = $('demo-deck');
    b.disabled = !state.cards.on;
    b.textContent = !state.cards.on ? 'No deck chosen' : state.cards.arrived ? 'Deck delivered · undo' : 'Deliver the deck';
  }

  function go(n) { state.step = Math.max(0, Math.min(STEPS.length - 1, state.step + n)); render(); }

  /* ---------- actions ---------- */
  var acts = {
    next: function () {
      var id = STEPS[state.step];
      if (id === 'cup' && !state.cup.length && !(state.emptyCup && state.spark)) return toast('Pick one, or tap “nothing right now”');
      if (id === 'values' && !state.values.length) return toast('Choose one that matters');
      go(1);
    },
    back: function () { go(-1); },
    pick: function (arg) { var p = arg.split('|'); state[p[0]] = p[1]; go(1); },
    cup: function (v) { toggle(state.cup, v); render(); },
    emptyCup: function () { state.emptyCup = !state.emptyCup; if (state.emptyCup) state.cup = []; else state.spark = ''; render(); },
    spark: function (v) { state.spark = v; render(); },
    quiz: function (arg) { var p = arg.split('|'); state.quiz[+p[0]] = p[1]; go(1); },
    value: function (v) { toggle(state.values, v, 2); render(); },
    len: function (n) {
      var f = $('f-start'); if (f && f.value) state.rhythm.start = f.value;
      state.rhythm.len = Math.max(21, Math.min(40, state.rhythm.len + +n));
      if (ui.sheet) sheetRhythm(); else render();
    },
    cycleSave: function () {
      var f = $('f-start');
      if (!f || !f.value) return toast('Add a date, or follow the moon');
      state.rhythm.start = f.value; state.rhythm.mode = 'cycle'; ui.rhythmView = 'cycle';
      if (state.onboarded) { closeSheet(); render(); } else go(1);
    },
    moonOnly: function () { state.rhythm.mode = 'moon'; if (state.onboarded) { closeSheet(); render(); } else go(1); },
    weightPick: function (v) { state.weight.on = v === 'on'; go(1); },
    deck: function (id) { state.cards.deck = id; render(); },
    cardsYes: function () { if (!state.cards.deck) return toast('Tap a deck to choose it'); state.cards.on = true; go(1); },
    cardsNo: function () { state.cards.on = false; go(1); },
    pickPath: function (id) { ui.pick = id; render(); },
    choosePath: function () { state.pattern = ui.pick; go(1); },
    finish: function () { state.onboarded = true; state.tab = 'today'; state.phase = 0; render(); },

    tab: function (id) { state.tab = id; ui.phaseView = null; render(); },
    capacity: function (c) { state.capacity[todayKey()] = capacity() === c ? '' : c; render(); },
    tend: function (id) {
      var k = todayKey();
      if (!isTended(id)) return sheetSavor(id);
      delete state.tended[k][id];
      state.reps = state.reps.filter(function (r) { return !(r.d === k && r.a === id); });
      if (ui.sheet) closeSheet();
      render();
    },
    effort: function (arg) {
      var p = arg.split('|'), id = p[0], k = todayKey();
      state.tended[k] = state.tended[k] || {}; state.tended[k][id] = true;
      state.reps.push({ d: k, a: id, e: p[1] || 'some' });
      closeSheet(); render();
      var t = trail(id);
      if (t.easing && state.second.indexOf(id) < 0) sheetSecond(id); else toast('Rep ' + t.n + '. The path is wearing in.');
    },
    cue: function (arg) { var p = arg.split('|'); state.cues[p[0]] = p[1]; save(); sheetAnchor(p[0]); },

    kinSet: function () { var f = $('f-kin'); if (!f || !f.value.trim()) return toast('Add her first name'); state.kin.name = f.value.trim(); toast(state.kin.name + ' is your witness.'); render(); },
    kinClear: function () { state.kin.name = ''; render(); },
    holdAdd: function () { var n = $('f-hname'), w = $('f-hword'); if (!n.value.trim() || !w.value.trim()) return toast('Her name and her word'); state.kin.holding.push({ name: n.value.trim(), word: w.value.trim() }); render(); },
    holdDrop: function (i) { state.kin.holding.splice(+i, 1); render(); },
    kinMsg: function (kind) {
      var r = kind === 'card' ? ui.keep : currentMoon(), name = (r && r.witness) || state.kin.name, text;
      if (!r || !name) return toast('Set a moon and choose a witness first');
      if (!r.witness) { r.witness = name; save(); }
      if (kind === 'full') {
        var last = state.rituals.filter(function (x) { return x.kind === 'full'; }).pop();
        text = 'The full moon is here. Thank you for holding “' + r.word + '” with me.' + (last && last.notice ? ' One thing I noticed this moon: ' + last.notice + '.' : '') + ' Ask me about it when you see me.';
      } else {
        text = 'My word for this moon is “' + r.word + '”. It is for ' + lower(r.wish) + '.' + (r.obstacle ? ' When ' + r.obstacle + ', I will ' + r.plan + '.' : '') + ' Will you ask me how it went at the full moon, ' + fullAfter(r.date) + '? That is all you need to do.';
      }
      ui.kinText = text;
      openSheet(el.label('To ' + esc(name)) + '<h2 class="display">Your words, ready to send.</h2><div class="bubble">' + esc(text) + '</div><p class="small">She does not need the app. A text is enough, and so is saying it out loud.</p>' +
        el.btn('Send to ' + esc(name), 'kinShare') + el.btn('Copy the words', 'kinCopy', null, 'btn-ghost'));
    },
    kinShare: function () { if (navigator.share) navigator.share({ text: ui.kinText }).catch(function () {}); else acts.kinCopy(); },
    kinCopy: function () {
      if (navigator.clipboard) navigator.clipboard.writeText(ui.kinText).then(function () { toast('Copied. Paste it into a message.'); }, function () { toast('Press and hold the words to copy them'); });
      else toast('Press and hold the words to copy them');
    },
    ritWitness: function () { var f = $('f-rit'); if (!f || !f.value.trim()) return toast('Add her first name, or keep it to yourself'); state.kin.name = f.value.trim(); ui.ritual.d.witness = state.kin.name; ritualAdvance(); },

    ritual: function (kind) { ui.ritual = { kind: kind, i: 0, d: { held: {} } }; ritualRender(); },
    ritNext: function () { ritualAdvance(); },
    rit: function (arg) { var p = arg.split('|'); ui.ritual.d[p[0]] = p[1]; ritualAdvance(); },
    ritText: function (key) { var f = $('f-rit'); if (f && f.value.trim()) ui.ritual.d[key] = f.value.trim(); else if (key === 'wish') return toast('Pick one, or write your own'); ritualAdvance(); },
    ritHeld: function (arg) { var p = arg.split('|'); ui.ritual.d.held[p[0]] = p[1]; ritualRender(); },
    ritualPage: function (i) {
      var r = state.rituals[+i];
      if (r.kind === 'new') return sheetKeepsake(r, false);
      var words = { held: 'Held', some: 'Sometimes', not: 'Not this moon' };
      openSheet(el.label('Full moon · ' + fmt(r.date, { month: 'long', day: 'numeric' })) + '<h2 class="display">Gathered.</h2>' + (r.notice ? '<p class="quote">“' + esc(r.notice) + '”</p>' : '') +
        '<div class="card">' + Object.keys(r.held || {}).map(function (id, j) { return '<div class="kv' + (j ? '' : ' first') + '"><span>' + esc(anchor(id).title) + '</span><b>' + words[r.held[id]] + '</b></div>'; }).join('') + '</div>');
    },
    print: function () { $('print').innerHTML = keepsake(ui.keep); window.print(); },
    toRitual: function () {
      var ms = moonState();
      if (!state.onboarded) return toast('Finish onboarding, or pick a mom, first');
      if (ms.due) return toast('A ritual is already waiting on Today');
      state.dayOffset += ms.until; state.tab = 'today'; closeSheet(); render();
    },
    anchorSheet: function (id) { sheetAnchor(id); },
    second: function (id) { toggle(state.second, id); closeSheet(); toast(state.second.indexOf(id) >= 0 ? 'Second nature. Well done.' : 'Back in your anchors'); render(); },
    closeSheet: function () { closeSheet(); render(); },

    cardTurn: function () { state.cards.pulls[todayKey()] = dailyCard(); render(); },
    cardPicker: function () { sheetCardPicker(); },
    suit: function (id) { ui.suit = id; sheetCardPicker(); },
    cardLog: function (i) { state.cards.pulls[todayKey()] = +i; closeSheet(); render(); },
    cardNote: function () { var f = $('f-cardnote'); if (f && f.value.trim()) { state.cards.notes[todayKey()] = f.value.trim(); render(); } },
    glimmer: function () {
      var f = $('f-glimmer'), text = f ? f.value.trim() : '';
      if (!text && !ui.draftImg) return toast('Snap it, or say it');
      state.glimmers.push({ date: todayKey(), text: text, img: ui.draftImg || '' });
      var photos = state.glimmers.filter(function (g) { return g.img && g.img.indexOf('data:') === 0; });
      if (photos.length > 60) photos[0].img = '';
      ui.draftImg = ''; toast('Kept. It is in your grid.'); render();
    },
    draftDrop: function () { ui.draftImg = ''; render(); },
    grid: function () { sheetGrid(); },
    glimmerOpen: function (i) { sheetGlimmer(+i); },
    glimmerDrop: function (i) { state.glimmers.splice(+i, 1); save(); render(); sheetGrid(); },
    printGrid: function () {
      $('print').innerHTML = '<div class="print-grid"><p class="label">' + APP.name + '</p><p class="display">Small beautiful things</p><div class="tiles">' + latestTiles(24) + '</div></div>';
      window.print();
    },

    rhythmView: function (m) { ui.rhythmView = m; render(); },
    periodToday: function () { state.rhythm.start = todayKey(); toast('Logged. Welcome to inner winter.'); render(); },
    rhythmSheet: function () { sheetRhythm(); },
    locate: function () {
      if (!navigator.geolocation) return toast('Location is not available here');
      navigator.geolocation.getCurrentPosition(function (pos) { state.place = { lat: pos.coords.latitude, lng: pos.coords.longitude }; render(); }, function () { toast('No problem. We will keep estimating.'); });
    },

    phaseView: function (i) { ui.phaseView = +i; render(); },
    phaseNext: function () { state.phase = (state.phase + 1) % 4; ui.phaseView = null; toast(state.phase === 0 ? 'The circle turns. Back to rest.' : 'Welcome to ' + PHASES[state.phase].name + '.'); render(); },
    stapleSheet: function (id) { sheetStaple(id); },
    stapleBlock: function (arg) { var p = arg.split('|'); state.staples[p[0]] = state.staples[p[0]] || []; toggle(state.staples[p[0]], p[1]); save(); sheetStaple(p[0]); },
    pathsSheet: function () { sheetPaths(); },
    allPaths: function () { ui.ritual = null; state.options = PATTERNS.map(function (p) { return p.id; }); sheetPaths(); },
    switchPath: function (id) { state.pattern = id; closeSheet(); toast('Now walking: ' + pat().direction.toLowerCase()); render(); },
    retake: function () { state.onboarded = false; state.step = STEPS.indexOf('q0'); state.quiz = []; render(); },

    heritage: function (v) { toggle(state.heritage, v); render(); },
    allergy: function (v) { toggle(state.allergies, v); render(); },
    weightToggle: function () { state.weight.on = !state.weight.on; render(); },
    weightAdd: function () { var f = $('f-weight'), v = f && parseFloat(f.value); if (v > 0) { state.weight.entries.push({ date: todayKey(), value: v }); render(); } },
    cardsToggle: function () { if (state.cards.on) { state.cards.on = false; render(); } else sheetDecks(); },
    deckOn: function (id) { state.cards.deck = id; state.cards.on = true; closeSheet(); toast('Your deck is on its way.'); render(); },
    coach: function () { state.coachNotify = !state.coachNotify; render(); },

    pauseOpen: function () { ui.pause = { step: 0, moment: null, sub: 0, thought: '' }; pauseRender(); },
    pauseMoment: function (id) { ui.pause.moment = MOMENTS.filter(function (m) { return m.id === id; })[0]; ui.pause.step = 1; pauseRender(); },
    pauseStep: function () { var r = RITUALS[ui.pause.moment.ritual]; if (ui.pause.sub < r.steps.length - 1) ui.pause.sub++; else ui.pause.step = 2; pauseRender(); },
    pauseThought: function (t) { ui.pause.thought = t; pauseRender(); },
    pauseNext: function () { ui.pause.step++; pauseRender(); },
    pauseChoice: function () { ui.pause.step = 4; state.pauses++; state.pauseLog.push({ d: todayKey(), h: now().getHours(), m: ui.pause.moment.id }); save(); pauseRender(); },

    /* presenter controls */
    demoToggle: function () { $('demo').classList.toggle('open'); },
    fresh: function () { closeSheet(); state = fresh(); ui.lastScreen = ''; render(); },
    day: function (n) { state.dayOffset = +n === 0 ? 0 : state.dayOffset + +n; render(); },
    deckArrive: function () { state.cards.arrived = !state.cards.arrived; delete state.cards.pulls[todayKey()]; render(); },
    persona: function (id) {
      var p = PERSONAS[id], s = fresh();
      closeSheet();
      Object.assign(s, { onboarded: true, name: p.name, stage: p.stage, pattern: p.pattern, options: p.options, cup: p.cup, emptyCup: !p.cup.length, spark: p.cup.length ? '' : SPARKS[0], values: p.values, tender: p.tender, phase: p.phase, heritage: p.heritage });
      s.rhythm = p.rhythm.mode === 'cycle' ? { mode: 'cycle', len: p.rhythm.len, start: Rhythm.iso(Rhythm.addDays(new Date(), -p.rhythm.dayAgo)) } : { mode: 'moon', start: '', len: 28 };
      s.cards = { on: p.cards.on, deck: p.cards.deck, arrived: p.cards.arrived, pulls: {}, notes: {} };
      s.weight = { on: p.weight, entries: [] };
      seedHistory(s, p.history);
      if (p.kin) { s.kin = { name: p.kin, holding: p.holding.slice() }; s.rituals.forEach(function (r) { if (r.kind === 'new') r.witness = p.kin; }); }
      state = s; ui.lastScreen = ''; ui.rhythmView = null; render();
    }
  };

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) { if (e.target.id === 'sheet') { closeSheet(); render(); } return; }
    var fn = acts[t.getAttribute('data-act')];
    if (fn) fn(t.getAttribute('data-arg'), t);
  });
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'f-photo' || !e.target.files[0]) return;
    readPhoto(e.target.files[0], function (url) { ui.draftImg = url; render(); });
  });
  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-bind');
    if (k) { state[k] = e.target.value.trim(); save(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    var map = { 'f-name': 'next', 'f-glimmer': 'glimmer', 'f-cardnote': 'cardNote', 'f-weight': 'weightAdd', 'f-kin': 'kinSet', 'f-hword': 'holdAdd' };
    if (e.target.id === 'f-rit' && ui.ritual) { var st = RITUAL_STEPS[ui.ritual.kind][ui.ritual.i]; return st === 'witness' ? acts.ritWitness() : acts.ritText(st); }
    if (map[e.target.id]) acts[map[e.target.id]]();
  });

  /* ---------- showcase links ----------
     app.html#as=maya&tab=rhythm&open=grid opens a demo mom on one screen, for the project pages.
     Nothing is saved in this mode, so it never overwrites what a visitor has entered on this device. */
  function showcase() {
    var q = {};
    location.hash.slice(1).split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) q[p[0]] = decodeURIComponent(p[1] || ''); });
    if (!q.as) return false;
    ui.ephemeral = true;
    if (q.chrome === '0') document.body.classList.add('embed');
    if (PERSONAS[q.as]) acts.persona(q.as);
    else {
      state = fresh();
      if (q.step) {
        Object.assign(state, { name: 'Maya', stage: 'cycling', cup: ['The family table', 'Fiction'], values: ['Calm evenings'], tender: 'crunch', quiz: ['hearth', 'hearth', 'tide', 'hearth', 'sun', 'hearth'], step: Math.max(0, STEPS.indexOf(q.step)) });
        computeOptions(); ui.pick = state.options[0];
        if (q.step === 'bloom') state.pattern = state.options[0];
      }
    }
    if (q.day === 'ritual') { var ms = moonState(); if (!ms.due) state.dayOffset += ms.until; } else if (q.day) state.dayOffset = +q.day || 0;
    if (q.cap) state.capacity[todayKey()] = q.cap;
    if (q.tab) state.tab = q.tab;
    render();
    var open = {
      pause: function () { acts.pauseOpen(); if (q.moment) acts.pauseMoment(q.moment); },
      grid: sheetGrid, setting: function () { acts.ritual('new'); }, gathering: function () { acts.ritual('full'); },
      card: function () { var m = currentMoon(); if (m) sheetKeepsake(m, false); }, kin: function () { acts.kinMsg('now'); },
      anchor: function () { sheetAnchor(activeIds()[0]); }, savor: function () { sheetSavor(activeIds()[0]); }
    }[q.open];
    if (open) open();
    var sel = { glimmer: '.card.glimmer', ritual: '.card.ritual', notes: '.card.insight', moons: '.moon-call, .card.row-card', kin: '.hold', touch: '.cap', phases: '.phases', tiles: '.tiles' }[q.focus];
    var v = $('view'), t = sel && v.querySelector(sel);
    if (t) v.scrollTop += t.getBoundingClientRect().top - v.getBoundingClientRect().top - 16;
    return true;
  }

  if (!showcase()) render();
})();
