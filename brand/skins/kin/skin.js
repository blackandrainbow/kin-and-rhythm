/* Kinhold: the kin play. Runs after data.js and kit.js, before rhythm.js and app.js. */
Skin.use({
  id: 'kin',
  name: 'Kinhold',
  line: 'Ten seconds for you. One friend who asks.',
  fonts: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700;800&display=swap',
  desk: '#17151C',

  /* Pattern policy: one element. Cobalt, tomato and butter stay; her pattern colours her own chip and her sticker's block. */
  patterns: {
    sun: { accent: '#FFC233' },
    wind: { accent: '#7FB2FF' },
    hearth: { accent: '#FF7FA6' },
    tide: { accent: '#3CCFAE' },
    frost: { accent: '#B79CFF' }
  },
  seasons: { winter: '#4B6FD6', spring: '#2FA36B', summer: '#F2B01E', autumn: '#E8642C' },

  art: {
    'logo.svg': 'logo.png', 'sunburst.svg': 'sunburst.png',
    'pattern-sun.svg': 'pattern-sun.png', 'pattern-wind.svg': 'pattern-wind.png', 'pattern-hearth.svg': 'pattern-hearth.png', 'pattern-tide.svg': 'pattern-tide.png', 'pattern-frost.svg': 'pattern-frost.png',
    'moon-0.svg': 'moon-0.svg', 'moon-1.svg': 'moon-1.svg', 'moon-2.svg': 'moon-2.svg', 'moon-3.svg': 'moon-3.svg', 'moon-4.svg': 'moon-4.svg', 'moon-5.svg': 'moon-5.svg', 'moon-6.svg': 'moon-6.svg', 'moon-7.svg': 'moon-7.svg',
    'deck-hedgerow.svg': 'deck-hedgerow.png', 'deck-nightsky.svg': 'deck-nightsky.png', 'deck-hearth.svg': 'deck-hearth.png',
    'season-winter.svg': 'season-winter.svg', 'season-spring.svg': 'season-spring.svg', 'season-summer.svg': 'season-summer.svg', 'season-autumn.svg': 'season-autumn.svg',
    'icon-today.svg': 'icon-today.svg', 'icon-rhythm.svg': 'icon-rhythm.svg', 'icon-pause.svg': 'icon-pause.svg', 'icon-plan.svg': 'icon-plan.svg', 'icon-you.svg': 'icon-you.svg',
    'icon-back.svg': 'icon-back.svg', 'icon-next.svg': 'icon-next.svg', 'icon-close.svg': 'icon-close.svg', 'icon-check.svg': 'icon-check.svg', 'icon-check-ink.svg': 'icon-check-ink.svg',
    'icon-spark.svg': 'icon-spark.svg', 'icon-camera.svg': 'icon-camera.svg', 'icon-sunrise.svg': 'icon-sunrise.svg', 'icon-golden.svg': 'icon-golden.svg', 'icon-sunset.svg': 'icon-sunset.svg'
  },

  /* Today leads with her people and her tiny good things. The almanac opens on the glimmer grid. */
  layout: {
    today: ['people', 'good', 'moon', 'kin', 'nudge', 'touch', 'glimmer', 'cards', 'why'],
    rhythm: ['head', 'glimmers', 'notes', 'seg', 'wheel', 'moons', 'season', 'week', 'sky']
  },
  blocks: {
    today: {
      people: function (c) {
        var k = c.kin, chips = '';
        function chip(name, line, cls) { return '<button class="kin-chip ' + cls + '" data-act="tab" data-arg="you"><span class="av" aria-hidden="true">' + c.esc(name.charAt(0).toUpperCase()) + '</span><span><b>' + c.esc(name) + '</b><i>' + line + '</i></span></button>'; }
        if (k.witness) chips += chip(k.witness, k.word ? 'holds “' + c.esc(k.word) + '”' : 'your person', 'a');
        k.holding.forEach(function (h) { chips += chip(h.name, 'you hold “' + c.esc(h.word) + '”', 'b'); });
        chips += '<button class="kin-chip add" data-act="tab" data-arg="you"><span class="av" aria-hidden="true">+</span><span><b>' + (k.witness ? 'Add' : 'Pick your person') + '</b><i>one is plenty</i></span></button>';
        return '<section class="kin-hero"><p class="label">Your people</p><h1 class="display">' +
          (k.witness ? c.esc(k.witness) + '\'s got you.' : 'Who\'s got you?') + '</h1><div class="kin-row">' + chips + '</div></section>';
      },
      good: function (c) {
        return '<section class="good"><div class="good-head"><p class="label">Tiny good things</p><button class="good-count" data-act="grid">' + c.glimmers + ' kept</button></div>' +
          (c.glimmers ? '<div class="tiles">' + c.tiles(4) + '</div>' : '<p class="small">Snap one small good thing today. It starts your grid.</p>') + '</section>';
      }
    }
  },
  top: function (c) {
    return '<div class="hey"><span class="hey-me" aria-hidden="true">' + c.esc((c.name || 'You').charAt(0).toUpperCase()) + '</span><span class="hey-txt"><b>Hey' + (c.name ? ' ' + c.esc(c.name) : '') + '</b><i>' +
      c.date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) + '</i></span><img src="assets/logo.svg" alt=""></div>';
  },

  /* Lines held in data.js */
  copy: {
    MOON_RITUALS: {
      new: { name: 'New moon reset', call: 'New moon. Let\'s set up the next two weeks.', sub: 'Five minutes. You leave with a note for the fridge.',
        open: 'Dark sky, clean slate. Pick what the next two weeks are for. One thing. Not twelve.' },
      full: { name: 'Full moon catch-up', call: 'Full moon. Let\'s see what actually happened.', sub: 'Five minutes. Nobody is grading this.',
        open: 'Lights on. We look at what is there, and nobody gets graded.' }
    },
    MOMENTS: {
      reach: { label: 'I\'m reaching for a snack or a drink, and I\'m not hungry' },
      snap: { label: 'I\'m about to lose it' },
      spin: { label: 'My brain won\'t shut up' },
      flat: { label: 'I\'m stuck on the couch, scrolling' },
      heavy: { label: 'It\'s all too much' }
    },
    DECKS: {
      hedgerow: { note: 'Garden. Leaves, sprouts and fresh air.' },
      nightsky: { note: 'Night. A moon, a star and a deep blue.' },
      hearth: { note: 'Kitchen. A lit window and a warm house.' }
    }
  },

  /* Lines written inside app.js, matched whole */
  text: {
    'Before we talk about food, let\'s find your rhythm.': 'You\'re not behind. You\'re tired. Different problem.',
    'You are not behind, and you are not broken. Most plans ask you to change how you eat while you are running on empty. We start somewhere else.': 'Most plans want you to overhaul dinner while you\'re running on fumes. We start smaller: ten seconds, one honest answer, and one friend who asks how it went.',
    'About four minutes. No wrong answers.': 'Four minutes. No wrong answers. Sit down for it.',
    'What is happening right now?': 'Okay. What\'s going on?',
    'No need to explain it. Just the closest one.': 'Don\'t explain it. Tap the closest one.',
    'You paused.': 'You stopped. That\'s the win.',
    'That is the whole practice. Whatever comes next, you chose it.': 'That\'s the whole thing. Whatever you do next, you picked it.',
    'Back to my day': 'Back to it',
    'Today\'s touch': 'Today, quickly',
    'How much do you have today?': 'How much have you got today?',
    'That is your ten seconds.': 'That\'s your ten seconds. Done.',
    'The rest happens out there, not in here.': 'Now go live your day. It\'s out there, not in here.',
    'One tap is enough. Nothing here keeps score.': 'One tap. Nobody\'s keeping score.',
    'Romance the ordinary': 'Add one',
    'One small beautiful thing': 'One tiny good thing',
    'Choose a witness': 'Pick your person',
    'Who you are holding': 'Who you\'re holding',
    'Step in': 'I\'m in'
  }
});
