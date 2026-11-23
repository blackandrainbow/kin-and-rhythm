/* Small Almanac: the almanac play. Runs after data.js and kit.js, before rhythm.js and app.js. */
Skin.use({
  id: 'almanac',
  name: 'Small Almanac',
  line: 'Know your own weather.',
  fonts: 'https://fonts.googleapis.com/css2?family=Besley:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  desk: '#111214',

  /* Pattern policy: one spot ink. Paper and black stay; her pattern swaps the single spot colour and its wash. */
  patterns: {
    sun: { accent: '#AE400D', tint: '#F6E4D6' },
    wind: { accent: '#2B4C9A', tint: '#DFE6F4' },
    hearth: { accent: '#A3271C', tint: '#F5DFDB' },
    tide: { accent: '#0F6B62', tint: '#D9EBE7' },
    frost: { accent: '#5B3FA8', tint: '#E6E0F3' }
  },
  seasons: { winter: '#2F5C9E', spring: '#3F8A3A', summer: '#D9A019', autumn: '#BE5A1E' },

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

  /* Today is a page of the almanac: the date, today's line and her data. The almanac tab opens on the record. */
  layout: {
    today: ['page', 'moon', 'kin', 'nudge', 'touch', 'glimmer', 'cards', 'why'],
    rhythm: ['head', 'notes', 'week', 'sky', 'seg', 'wheel', 'moons', 'season', 'glimmers']
  },
  blocks: {
    today: {
      page: function (c) {
        var d = c.date, n = c.ritual.until, r = c.rhythm;
        var next = (c.ritual.kind === 'new' ? 'New' : 'Full') + ' moon ' + (c.ritual.due || n === 0 ? 'tonight' : 'in ' + n + ' d');
        var you = r.mode === 'cycle' ? 'Day ' + r.day + ' of ' + r.len : 'By the moon';
        return '<section class="alm"><div class="alm-head"><div class="alm-date"><b>' + d.getDate() + '</b><span>' + d.toLocaleDateString([], { weekday: 'long' }) + '<br>' + d.toLocaleDateString([], { month: 'long', year: 'numeric' }) + '</span></div>' +
          '<img src="' + c.pattern.art + '" alt=""></div>' +
          '<h1 class="alm-line"><b>' + c.season.name + '.</b> Today asks for ' + c.lower(c.season.asks) + '</h1>' +
          '<table class="alm-table" aria-label="Today in numbers"><tbody>' +
          (c.sun ? '<tr><th scope="row">Sun</th><td>Rises ' + c.sun.rise + '</td><td>Gold ' + c.sun.golden + '</td><td>Sets ' + c.sun.set + '</td></tr>' : '') +
          '<tr><th scope="row">Moon</th><td>' + c.moon.name + '</td><td>' + c.moon.lit + '% lit</td><td>' + next + '</td></tr>' +
          '<tr><th scope="row">You</th><td>' + you + '</td><td>' + c.kept.days + ' days kept</td><td>' + c.kept.reps + ' reps</td></tr></tbody></table>' +
          (c.insight ? '<p class="alm-note"><b>The record shows.</b> ' + c.insight[1] + '</p>' : '') + '</section>';
      }
    }
  },
  top: function (c) {
    return '<div class="mast"><div class="mast-row"><img src="assets/logo.svg" alt=""><span class="mast-name">' + c.app.name + '</span></div>' +
      '<p class="mast-line"><span>' + c.date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + '</span><span>No. ' + c.kept.days + '</span><span>' + c.moon.name + '</span></p></div>';
  },

  /* Lines held in data.js */
  copy: {
    MOON_RITUALS: {
      new: { name: 'New moon: set the fortnight', call: 'New moon tonight. Set the next two weeks.', sub: 'About five minutes. You leave with a card to print.',
        open: 'A dark sky makes a clean page. Decide what the next two weeks are for, and write it down.' },
      full: { name: 'Full moon: read it back', call: 'Full moon tonight. Read the last two weeks back.', sub: 'About five minutes. Nothing is graded.',
        open: 'Bright enough to see by. Look at what the last two weeks actually held. Nothing here is graded.' }
    },
    DECKS: {
      hedgerow: { note: 'Field notes. Branches, frost and garden light.' },
      nightsky: { note: 'Sky tables. The moon and her ring of stars.' },
      hearth: { note: 'Household. The hearth, the kettle, the fire.' }
    }
  },

  /* Lines written inside app.js, matched whole */
  text: {
    'Before we talk about food, let\'s find your rhythm.': 'First, a reading of where you actually are.',
    'You are not behind, and you are not broken. Most plans ask you to change how you eat while you are running on empty. We start somewhere else.': 'You are not behind and you are not broken. You are running low, and a plan that ignores that does not hold. So we take a reading first.',
    'What is happening right now?': 'What is the weather right now?',
    'No need to explain it. Just the closest one.': 'No need to explain it. The nearest one will do.',
    'You paused.': 'Noted: you paused.',
    'That is the whole practice. Whatever comes next, you chose it.': 'That is the practice, on the record. What comes next is your call.',
    'Today\'s touch': 'Today\'s entry',
    'How much do you have today?': 'How much do you have?',
    'That is your ten seconds.': 'Entry made. Ten seconds.',
    'One tap is enough. Nothing here keeps score.': 'One tap makes the entry. Nothing here is graded.',
    'Romance the ordinary': 'Worth noting',
    'One small beautiful thing': 'One good thing, noted',
    'What it is noticing': 'What the record shows',
    'Moon rituals': 'Moon dates',
    'Twice a moon': 'Twice a month',
    'Ritual': 'Daily card',
    'Card ritual': 'Daily card',
    'Step in': 'Open the book'
  }
});
