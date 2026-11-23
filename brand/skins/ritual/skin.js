/* Ritual play. Runs after data.js and kit.js, before rhythm.js and app.js. */
Skin.use({
  id: 'ritual',
  name: 'Moonkept',
  line: 'A small rite for ordinary days.',
  fonts: 'https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap',
  desk: '#1C2620',

  themes: {
    sun: { canvas: '#FAF0DC', surface: '#FFFBF1', subtle: '#F2E0BE', primary: '#8F4116', deep: '#6E300D', accent: '#C98A1E', tint: '#F7E3C2' },
    wind: { canvas: '#F1F1EC', surface: '#FBFBF8', subtle: '#DFE3E6', primary: '#37507A', deep: '#283C5E', accent: '#B7862B', tint: '#DDE5F0' },
    hearth: { canvas: '#F8EEE2', surface: '#FFFAF3', subtle: '#F0DDCB', primary: '#8A2F22', deep: '#6A2218', accent: '#C98A4A', tint: '#F5DFD3' },
    tide: { canvas: '#EEF3EE', surface: '#FAFDFA', subtle: '#D9E7E1', primary: '#1D5A5E', deep: '#154447', accent: '#B7862B', tint: '#D6E8E6' },
    frost: { canvas: '#F3F0F4', surface: '#FCFAFD', subtle: '#E5DFEA', primary: '#4B3A6E', deep: '#382A55', accent: '#B7862B', tint: '#E4DDEE' }
  },
  seasons: { winter: '#4F6288', spring: '#5C8A4C', summer: '#B67D15', autumn: '#A8532E' },

  art: ['logo.svg', 'icon-spark.svg', 'sunburst.svg',
    'moon-0.svg', 'moon-1.svg', 'moon-2.svg', 'moon-3.svg', 'moon-4.svg', 'moon-5.svg', 'moon-6.svg', 'moon-7.svg',
    'pattern-sun.svg', 'pattern-wind.svg', 'pattern-hearth.svg', 'pattern-tide.svg', 'pattern-frost.svg',
    'season-winter.svg', 'season-spring.svg', 'season-summer.svg', 'season-autumn.svg'],

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
