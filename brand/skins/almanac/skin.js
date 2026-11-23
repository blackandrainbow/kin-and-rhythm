/* Almanac play. Runs after data.js and kit.js, before rhythm.js and app.js. */
Skin.use({
  id: 'almanac',
  name: 'Small Almanac',
  line: 'Know your own weather.',
  fonts: 'https://fonts.googleapis.com/css2?family=Besley:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  desk: '#1B1D1F',

  themes: {
    sun: { canvas: '#F3EEE2', surface: '#FCF8EF', subtle: '#E8DFCB', primary: '#A83A12', deep: '#842B0B', accent: '#E0A21E', tint: '#F8E3BF' },
    wind: { canvas: '#F0EEE6', surface: '#FAF9F3', subtle: '#E0DFD6', primary: '#2B4C7E', deep: '#1F3960', accent: '#C8321F', tint: '#DCE6F2' },
    hearth: { canvas: '#F3EEE4', surface: '#FCF8F1', subtle: '#E8DDCF', primary: '#96301F', deep: '#74231A', accent: '#D98B2B', tint: '#F6DFD2' },
    tide: { canvas: '#EFEFE6', surface: '#FAFAF3', subtle: '#DEE2D6', primary: '#12595A', deep: '#0C4344', accent: '#C8321F', tint: '#D5E9E3' },
    frost: { canvas: '#F0EEE8', surface: '#FAF9F5', subtle: '#E1DFDA', primary: '#46407A', deep: '#332E5E', accent: '#C8321F', tint: '#E2E0F0' }
  },
  seasons: { winter: '#3E5C82', spring: '#55883A', summer: '#D69A1B', autumn: '#B24E26' },

  art: ['logo.svg', 'icon-today.svg', 'icon-rhythm.svg', 'icon-pause.svg', 'icon-plan.svg', 'icon-you.svg', 'icon-spark.svg', 'sunburst.svg',
    'moon-0.svg', 'moon-1.svg', 'moon-2.svg', 'moon-3.svg', 'moon-4.svg', 'moon-5.svg', 'moon-6.svg', 'moon-7.svg',
    'pattern-sun.svg', 'pattern-wind.svg', 'pattern-hearth.svg', 'pattern-tide.svg', 'pattern-frost.svg',
    'season-winter.svg', 'season-spring.svg', 'season-summer.svg', 'season-autumn.svg',
    'deck-hedgerow.svg', 'deck-nightsky.svg', 'deck-hearth.svg'],

  /* Lines held in data.js */
  copy: {
    MOON_RITUALS: {
      new: { name: 'New moon: set the fortnight', call: 'New moon tonight. Set the next two weeks.', sub: 'About five minutes. You leave with a card to print.',
        open: 'A dark sky makes a clean page. Decide what the next two weeks are for, and write it down.' },
      full: { name: 'Full moon: read it back', call: 'Full moon tonight. Read the last two weeks back.', sub: 'About five minutes. Nothing is graded.',
        open: 'Bright enough to see by. Look at what the last two weeks actually held. Nothing here is graded.' }
    },
    DECKS: {
      hedgerow: { note: 'Field notes. Leaves, berries and garden light.' },
      nightsky: { note: 'Sky tables. Moons and stars on blue-black.' },
      hearth: { note: 'Household. Hearths, bread and warm reds.' }
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
    'How much do you have today?': 'Today\'s reading: how much do you have?',
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
