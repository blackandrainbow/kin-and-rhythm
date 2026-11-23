/* Kin play. Runs after data.js and kit.js, before rhythm.js and app.js. */
Skin.use({
  id: 'kin',
  name: 'Kinhold',
  line: 'Ten seconds for you. One friend who asks.',
  fonts: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700;800&display=swap',
  desk: '#1D1A22',

  themes: {
    sun: { canvas: '#FFF4E8', surface: '#FFFFFF', subtle: '#FCE4CC', primary: '#B8301A', deep: '#94240F', accent: '#F5B21A', tint: '#FFE3B3' },
    wind: { canvas: '#F1F6FF', surface: '#FFFFFF', subtle: '#DCE8FB', primary: '#2540C4', deep: '#1A2F99', accent: '#F2542D', tint: '#D7E4FF' },
    hearth: { canvas: '#FFF3F3', surface: '#FFFFFF', subtle: '#FBDFE2', primary: '#B4245C', deep: '#8C1A46', accent: '#F28A2E', tint: '#FFDDE6' },
    tide: { canvas: '#EFFAF5', surface: '#FFFFFF', subtle: '#D5EFE4', primary: '#0E6B63', deep: '#0A524C', accent: '#F2542D', tint: '#C9F0E2' },
    frost: { canvas: '#F7F3FF', surface: '#FFFFFF', subtle: '#E6DDF7', primary: '#5B34B0', deep: '#45278A', accent: '#F5B21A', tint: '#E6DCFB' }
  },
  seasons: { winter: '#4B6FD6', spring: '#2FA36B', summer: '#F2B01E', autumn: '#E8642C' },

  art: ['logo.svg', 'sunburst.svg',
    'icon-today.svg', 'icon-rhythm.svg', 'icon-pause.svg', 'icon-plan.svg', 'icon-you.svg', 'icon-back.svg', 'icon-next.svg', 'icon-close.svg',
    'icon-check.svg', 'icon-check-ink.svg', 'icon-spark.svg', 'icon-camera.svg', 'icon-sunrise.svg', 'icon-golden.svg', 'icon-sunset.svg',
    'moon-0.svg', 'moon-1.svg', 'moon-2.svg', 'moon-3.svg', 'moon-4.svg', 'moon-5.svg', 'moon-6.svg', 'moon-7.svg',
    'pattern-sun.svg', 'pattern-wind.svg', 'pattern-hearth.svg', 'pattern-tide.svg', 'pattern-frost.svg',
    'season-winter.svg', 'season-spring.svg', 'season-summer.svg', 'season-autumn.svg',
    'deck-hedgerow.svg', 'deck-nightsky.svg', 'deck-hearth.svg'],

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
      nightsky: { note: 'Night. Moons, stars and a deep blue.' },
      hearth: { note: 'Kitchen. Flames, warmth and red enamel.' }
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
    'Romance the ordinary': 'Tiny good things',
    'One small beautiful thing': 'One tiny good thing',
    'Choose a witness': 'Pick your person',
    'Who you are holding': 'Who you\'re holding',
    'Step in': 'I\'m in'
  }
});
