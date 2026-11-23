/* Moonkept: the ritual play. Runs after data.js and kit.js, before rhythm.js and app.js. */
Skin.use({
  id: 'ritual',
  name: 'Moonkept',
  line: 'A small rite for ordinary days.',
  fonts: 'https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap',
  desk: '#081410',

  /* Pattern policy: glow only. The night stays; her pattern colours the moon's halo and the fine lines. */
  patterns: {
    sun: { accent: '#EDB04A', tint: '#3D3A1B' },
    wind: { accent: '#93B7EA', tint: '#1F3B49' },
    hearth: { accent: '#EB8E6E', tint: '#472B20' },
    tide: { accent: '#72D1C2', tint: '#174440' },
    frost: { accent: '#BCA9EE', tint: '#30304D' }
  },
  seasons: { winter: '#7F9AD0', spring: '#86B86A', summer: '#E8B64C', autumn: '#D9825A' },

  art: {
    'logo.svg': 'logo.png', 'sunburst.svg': 'sunburst.png',
    'pattern-sun.svg': 'pattern-sun.png', 'pattern-wind.svg': 'pattern-wind.png', 'pattern-hearth.svg': 'pattern-hearth.png', 'pattern-tide.svg': 'pattern-tide.png', 'pattern-frost.svg': 'pattern-frost.png',
    'moon-0.svg': 'moon-0.png', 'moon-1.svg': 'moon-1.png', 'moon-2.svg': 'moon-2.png', 'moon-3.svg': 'moon-3.png', 'moon-4.svg': 'moon-4.png', 'moon-5.svg': 'moon-5.png', 'moon-6.svg': 'moon-6.png', 'moon-7.svg': 'moon-7.png',
    'deck-hedgerow.svg': 'deck-hedgerow.png', 'deck-nightsky.svg': 'deck-nightsky.png', 'deck-hearth.svg': 'deck-hearth.png',
    'season-winter.svg': 'season-winter.svg', 'season-spring.svg': 'season-spring.svg', 'season-summer.svg': 'season-summer.svg', 'season-autumn.svg': 'season-autumn.svg',
    'icon-today.svg': 'icon-today.svg', 'icon-rhythm.svg': 'icon-rhythm.svg', 'icon-pause.svg': 'icon-pause.svg', 'icon-plan.svg': 'icon-plan.svg', 'icon-you.svg': 'icon-you.svg',
    'icon-back.svg': 'icon-back.svg', 'icon-next.svg': 'icon-next.svg', 'icon-close.svg': 'icon-close.svg', 'icon-check.svg': 'icon-check.svg', 'icon-check-ink.svg': 'icon-check-ink.svg',
    'icon-spark.svg': 'icon-spark.svg', 'icon-camera.svg': 'icon-camera.svg', 'icon-sunrise.svg': 'icon-sunrise.svg', 'icon-golden.svg': 'icon-golden.svg', 'icon-sunset.svg': 'icon-sunset.svg'
  },

  /* Today leads with the moon and the next rite. The almanac opens on the wheel. */
  layout: {
    today: ['moonHero', 'moon', 'kin', 'nudge', 'touch', 'cards', 'glimmer', 'why'],
    rhythm: ['head', 'wheel', 'seg', 'moons', 'season', 'notes', 'glimmers', 'week', 'sky']
  },
  blocks: {
    today: {
      moonHero: function (c) {
        var n = c.ritual.until, when = c.ritual.due ? 'tonight' : n === 0 ? 'tonight' : n === 1 ? 'tomorrow night' : 'in ' + n + ' nights';
        return '<section class="moon-hero"><p class="label">' + Skin.hello(c.date) + (c.name ? ', ' + c.esc(c.name) : '') + '</p>' +
          '<div class="moon-halo"><img src="' + c.moon.art + '" alt="' + c.moon.name + '"></div>' +
          '<h1 class="display xl">' + c.season.name + '</h1>' +
          '<p class="lead">' + c.moon.name + ', ' + c.moon.lit + '% lit. Today asks for ' + c.lower(c.season.asks) + '</p>' +
          '<button class="moon-next" data-act="tab" data-arg="rhythm"><b>' + c.ritual.next.name + '</b> ' + when + '</button></section>';
      }
    }
  },
  top: function (c) { return '<div class="top-brand"><img src="assets/logo.svg" alt=""><span>' + c.app.name + '</span></div>'; },

  /* Lines held in data.js */
  copy: {
    MOON_RITUALS: {
      new: { call: 'The moon is new. Come and set the next two weeks.', sub: 'About five minutes. You leave with a card to keep.' },
      full: { call: 'The moon is full. Come and gather what grew.' }
    }
  },

  /* Lines written inside app.js, matched whole */
  text: {
    'Before we talk about food, let\'s find your rhythm.': 'First we find your rhythm. Everything else can wait.',
    'You are not behind, and you are not broken. Most plans ask you to change how you eat while you are running on empty. We start somewhere else.': 'You are not behind, and you are not broken. You are in a season. We begin by learning which one, and what it is asking of you.',
    'What is happening right now?': 'Stop here a moment. What has risen?',
    'You paused.': 'You kept the pause.',
    'Today\'s touch': 'Today\'s small rite',
    'That is your ten seconds.': 'That is today\'s rite, kept.',
    'Step in': 'Cross the threshold'
  }
});
