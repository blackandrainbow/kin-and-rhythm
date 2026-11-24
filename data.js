/* Kin & Rhythm content. Everything a mom reads lives here. */

var APP = {
  name: 'Kin & Rhythm',
  line: 'Come back into rhythm.',
  disclaimer: 'Kin & Rhythm is for education and inspiration. It is not medical advice and does not replace care from your doctor.',
  notes: 'https://github.com/blackandrainbow/kin-and-rhythm-notes'
};

/* Review notes go to a private inbox. The app and the project pages both build their links here.
   where: the screen or section. context: extra detail for us. question: set when answering an open question. */
function noteUrl(where, context, question) {
  var e = encodeURIComponent;
  return APP.notes + '/issues/new?template=note.yml&title=' + e(question ? 'Answer: ' + question : 'Note: ' + where) + '&where=' + e(question ? 'Open question: ' + question : where) +
    (question ? '&kind=' + e('An answer to an open question') : '') + (context ? '&context=' + e(context) : '');
}

/* ---------- Patterns: a state she has been living in, never an identity ---------- */
var PATTERNS = [
  {
    id: 'sun', name: 'Sun', state: 'Pushing through', direction: 'Cool and soften',
    art: 'assets/pattern-sun.svg',
    line: 'You run bright and hot, and you carry it all yourself.',
    looks: 'You get through the list with your jaw set. Rest waits until everything is done, and there is always more.',
    gift: 'Drive, protectiveness, and the ability to make things happen.',
    asks: 'Shade. Setting things down before you are empty, and letting someone else hold a corner.',
    shifts: [['Rest came after the list', 'Ten minutes lying down, before the list is done'], ['The day ran until you stopped', 'Three things set down each evening'], ['You carried it yourself', 'One specific thing asked for']],
    nourish: 'Regular meals you sit down for, plenty of water, and cool, fresh things alongside the hearty ones.',
    move: 'Movement that lets heat out without a scoreboard: long walks, swimming, stretching.',
    anchorLine: 'I can set this down. It will keep.',
    tender: { season: 'spring', text: 'Rising energy can tip into overdrive for you. Leave white space in the calendar on purpose.' },
    theme: { canvas: '#FBF4E6', surface: '#FFFDF7', subtle: '#F4E6CC', primary: '#96481C', deep: '#74350F', accent: '#DFA13A', tint: '#F8E7CF' }
  },
  {
    id: 'wind', name: 'Wind', state: 'Staying in motion', direction: 'Land and ground',
    art: 'assets/pattern-wind.svg',
    line: 'You keep moving so nothing can catch you.',
    looks: 'Six tabs open, six tasks started. Your body sits down and your mind keeps running laps.',
    gift: 'Curiosity, quick thinking, and endless ideas.',
    asks: 'Ground. One thing at a time, and a body that gets to arrive where it already is.',
    shifts: [['Several things started at once', 'One thing at a time, for ten minutes'], ['Straight into the day', 'Ten minutes of morning light'], ['Meals on the move', 'A warm breakfast, sitting down']],
    nourish: 'Warm, grounding meals at steady times. Cooked food, root vegetables, something substantial at breakfast.',
    move: 'Rhythmic and repetitive: walking the same loop, slow strength work, anything with a steady beat.',
    anchorLine: 'I am here. This is the only thing right now.',
    tender: { season: 'spring', text: 'When energy lifts, a dozen new plans arrive. Pick one and let the rest wait a moon.' },
    theme: { canvas: '#F4F5F3', surface: '#FCFDFD', subtle: '#E4E8EE', primary: '#44557A', deep: '#33415F', accent: '#C7A24E', tint: '#E3E8F1' }
  },
  {
    id: 'hearth', name: 'Hearth', state: 'Keeping everyone warm', direction: 'Refill and hold some back',
    art: 'assets/pattern-hearth.svg',
    line: 'You warm the whole house and burn your own wood to do it.',
    looks: 'Everyone is fed before you sit. You say "I\'m fine" and eat what is left on their plates.',
    gift: 'Generosity, attunement, and a home people want to come back to.',
    asks: 'A turn. Your own plate, your own wants, and a small no that keeps some fire for you.',
    shifts: [['You ate after everyone else', 'Your own plate, sitting down'], ['Yes was the default', 'One small no a week'], ['Your time went to everyone else', 'One thing a week that is only yours']],
    nourish: 'Your own full plate, eaten sitting down. Enough protein and fat that you are not running on crusts.',
    move: 'Movement that belongs to you alone: a class, a walk with your music, strength that makes you feel solid.',
    anchorLine: 'My needs fit at this table too.',
    tender: { season: 'summer', text: 'Your most social, giving days. Decide your yeses before the invitations arrive.' },
    theme: { canvas: '#FAF3EB', surface: '#FFFDF9', subtle: '#F2E3D6', primary: '#7C3A26', deep: '#5E2B1C', accent: '#D9966B', tint: '#F6E4DA' }
  },
  {
    id: 'tide', name: 'Tide', state: 'Running on empty', direction: 'Warm and rebuild',
    art: 'assets/pattern-tide.svg',
    line: 'The tide has gone all the way out. It always comes back.',
    looks: 'A burst of effort, then nothing left. You lie down and wake up just as tired. Plans wait.',
    gift: 'Depth, sensitivity, and noticing what everyone else misses.',
    asks: 'Warmth and patience. Small steps that count, and rest you do not have to apologize for.',
    shifts: [['Rest when there was nothing left', 'Lying down before you are empty'], ['Coffee until lunch', 'A warm breakfast before ten'], ['Afternoons without food', 'Something to eat at three']],
    nourish: 'Warm, cooked, easy meals. Soups, stews, eggs, oats. Food that asks very little of you to make.',
    move: 'Gentle first: slow walks, stretching on the floor, water. Build only when it leaves you with more, not less.',
    anchorLine: 'I am coming back slowly, and slowly counts.',
    tender: { season: 'autumn', text: 'This is often your lowest stretch. Protect two evenings and keep meals warm and simple.' },
    theme: { canvas: '#F2F6F4', surface: '#FBFEFD', subtle: '#DFEBE8', primary: '#1F5C66', deep: '#16454D', accent: '#D0A04A', tint: '#DCEAED' }
  },
  {
    id: 'frost', name: 'Frost', state: 'Gone quiet', direction: 'Thaw and wake',
    art: 'assets/pattern-frost.svg',
    line: 'You went still to get through. Underneath, everything is alive.',
    looks: 'Autopilot. Nothing sounds good. You could not say whether you are tired, hungry or sad, only flat.',
    gift: 'Calm in a crisis, perspective, and a deep inner world.',
    asks: 'Gentle warmth and small sensations. Nothing sudden. One sign of life at a time.',
    shifts: [['Days that ran themselves', 'Three check-ins: what do I feel, what do I need?'], ['Mornings indoors', 'Ten minutes of morning light'], ['Breakfast when it happened', 'A warm breakfast before ten']],
    nourish: 'Flavor and warmth to wake the senses: spices, citrus, broth, something you choose rather than default to.',
    move: 'Small and sensory: morning light, shaking out your hands, a short walk where you name what you see.',
    anchorLine: 'I can feel a little, and that is enough for today.',
    tender: { season: 'winter', text: 'Quiet days can slide into numb ones. Add one small sensation: hot tea, cold air, a song.' },
    theme: { canvas: '#F5F3F8', surface: '#FDFCFF', subtle: '#E8E3F0', primary: '#45376B', deep: '#332852', accent: '#C9A24E', tint: '#E7E1F2' }
  }
];

/* ---------- Quiz: six moments, five honest answers each ---------- */
var QUIZ = [
  { q: 'It is 5:40pm. Dinner is not started, someone is crying, your phone is buzzing. What happens in you?',
    a: { sun: 'I go into command mode. Faster, louder, tighter.', wind: 'I am suddenly doing six things and finishing none.', hearth: 'I make sure everyone else is okay. I will eat later.', tide: 'Something in me just drops. I can\'t.', frost: 'I go quiet and far away, like I am watching it happen.' } },
  { q: 'You finally get twenty minutes to yourself. You usually…',
    a: { sun: 'Use it to get ahead on the list.', wind: 'Scroll, plan, research. My body sits and my mind keeps running.', hearth: 'Feel guilty and go check on someone.', tide: 'Lie down, and still do not feel rested.', frost: 'Stare. I do not know what I want.' } },
  { q: 'Your relationship with rest right now:',
    a: { sun: 'Rest is earned, and I have not earned it yet.', wind: 'Sitting still makes me itchy.', hearth: 'I rest once everyone else is settled.', tide: 'I rest a lot and it does not refill me.', frost: 'I cannot tell if I am tired. Mostly I feel flat.' } },
  { q: 'When food becomes about more than hunger, it is usually…',
    a: { sun: 'I forget to eat, then inhale something standing up.', wind: 'Grazing while I do other things. I barely notice.', hearth: 'The kids\' leftovers, and whatever is left after everyone is served.', tide: 'Something sweet or salty at night, for the lift.', frost: 'Whatever is easiest. Nothing sounds good.' } },
  { q: 'A hard week tends to end with you…',
    a: { sun: 'Snapping at someone I love, then feeling awful.', wind: 'Starting a brand-new plan to fix everything.', hearth: 'Resentful that nobody noticed how much I did.', tide: 'On the couch, having canceled on everyone.', frost: 'On autopilot. I could not tell you how it went.' } },
  { q: 'What do you most wish someone would say to you?',
    a: { sun: '"You can put it down. It will still be there."', wind: '"You don\'t have to outrun it."', hearth: '"What do you want?"', tide: '"You\'re not lazy. You\'re depleted."', frost: '"Take your time. I\'m not going anywhere."' } }
];

/* ---------- Onboarding choices ---------- */
var STAGES = [
  { id: 'cycling', label: 'I have a fairly regular cycle' },
  { id: 'irregular', label: 'My cycle is irregular or changing', sub: 'Perimenopause, coming off birth control, or just unpredictable' },
  { id: 'postpartum', label: 'I am postpartum or nursing' },
  { id: 'pregnant', label: 'I am pregnant' },
  { id: 'none', label: 'I do not have a cycle', sub: 'Menopause, IUD, or another reason' }
];

var CUP = [
  { id: 'move', label: 'Body', options: ['Walking outside', 'Dancing in the kitchen', 'Yoga or stretching', 'Lifting something heavy', 'Gardening', 'Swimming'] },
  { id: 'kin', label: 'Kin', options: ['Voice notes with a friend', 'Coffee with one person', 'The family table', 'Time with my partner', 'A mom group or book club', 'The dog'] },
  { id: 'calm', label: 'Calm', options: ['A hot shower, door locked', 'Fiction', 'Music or a podcast', 'Sitting outside', 'Breath or prayer', 'A cup of tea'] },
  { id: 'play', label: 'Play', options: ['Cooking for fun', 'Making the house pretty', 'Flowers', 'Journaling', 'Craft, paint or knit', 'Playlists'] },
  { id: 'spirit', label: 'Spirit', options: ['Audiobooks', 'Learning something new', 'Tarot or reflection', 'Puzzles', 'Therapy or coaching', 'Time in nature'] }
];
var SPARKS = ['A ten-minute walk at sunset', 'A hot shower with the door locked', 'One voice note to one friend', 'A cup of tea, sitting down', 'Five minutes of stretching before the house wakes'];

var VALUES = [
  'Steady energy for my kids', 'Feeling at home in my body', 'Being present, not just there', 'Calm evenings',
  'An easy relationship with food', 'Feeling like myself again', 'Strength for the long run', 'Joy that is not earned'
];

var TENDER = [
  { id: 'morning', label: 'The morning rush', from: 6, to: 9 },
  { id: 'slump', label: 'The mid-afternoon dip', from: 14, to: 16 },
  { id: 'crunch', label: 'The 5 to 7 crunch', from: 17, to: 19 },
  { id: 'after', label: 'After bedtime, when it is finally quiet', from: 20, to: 23 },
  { id: 'night', label: 'The middle of the night', from: 0, to: 5 }
];

var DECKS = [
  { id: 'hedgerow', name: 'Hedgerow', art: 'assets/deck-hedgerow.svg', note: 'Botanical. Leaves, berries and garden light.' },
  { id: 'nightsky', name: 'Night Sky', art: 'assets/deck-nightsky.svg', note: 'Celestial. Moons, stars and gold on indigo.' },
  { id: 'hearth', name: 'Hearth & Thread', art: 'assets/deck-hearth.svg', note: 'Folk. Knotwork, warm reds and woven borders.' }
];

/* ---------- Inner seasons: the shared language for cycle and moon ---------- */
var SEASONS = {
  winter: { name: 'Inner Winter', moon: 'Dark moon', cycle: 'Bleed', word: 'Rest', color: '#586A8E', art: 'assets/season-winter.svg',
    asks: 'Slowness, warmth and fewer inputs. This is the exhale.',
    energy: 'Lowest of the month, and turned inward. Clear what you can.',
    nourish: 'Warm and simple: broth, stew, eggs, oats. Eat before you are starving.',
    move: 'Walks, stretching, or nothing at all. Rest is the training today.',
    romance: ['Light a candle at dinner. Call it a ritual, because it is.', 'Wear the softest thing you own on purpose.', 'Go to bed like it is an event.'] },
  spring: { name: 'Inner Spring', moon: 'Waxing moon', cycle: 'Follicular', word: 'Begin', color: '#6C9660', art: 'assets/season-spring.svg',
    asks: 'A gentle start. One new thing, tried lightly.',
    energy: 'Rising. Ideas come easily and so does over-committing.',
    nourish: 'Fresh, bright and crunchy alongside your steady meals.',
    move: 'Try something: a new route, a little strength, a class.',
    romance: ['Open a window first thing and let the morning in.', 'Buy the flowers. Put them where you wash up.', 'Take the long way home once this week.'] },
  summer: { name: 'Inner Summer', moon: 'Full moon', cycle: 'Ovulation', word: 'Shine', color: '#D29A36', art: 'assets/season-summer.svg',
    asks: 'Connection and expression. Say the thing, see the people.',
    energy: 'Your brightest days. Spend it on what matters, not on everything.',
    nourish: 'Lighter plates, plenty of water, food shared with people you like.',
    move: 'Play. Dance, hike, move with someone else.',
    romance: ['Eat one meal outside, even if it is toast on the step.', 'Put on the good playlist while you cook.', 'Dress for the day you want, not the errands you have.'] },
  autumn: { name: 'Inner Autumn', moon: 'Waning moon', cycle: 'Luteal', word: 'Gather in', color: '#B4623C', art: 'assets/season-autumn.svg',
    asks: 'Slowing down, finishing things, and fewer yeses.',
    energy: 'Turning inward. Patience runs thinner, and hunger runs higher. Both are normal.',
    nourish: 'Hearty and steady: roasted vegetables, grains, a real afternoon snack.',
    move: 'Steady, familiar movement. Shorter is fine.',
    romance: ['Make the afternoon snack a small ceremony: plate, seat, two minutes.', 'Catch the golden hour from a window.', 'Tidy one corner and let the rest be.'] }
};
var SEASON_ORDER = ['winter', 'spring', 'summer', 'autumn'];

/* ---------- Rhythms: the small steady things. She reads "rhythms"; the code still calls them anchors. ---------- */
var PILLARS = { nourish: 'Nourish', move: 'Move', rest: 'Rest', mind: 'Mind' };
var ANCHORS = {
  warmBreakfast: { pillar: 'nourish', title: 'A warm breakfast with protein before ten', easier: 'Add one thing to the breakfast you already eat',
    why: 'A steady morning takes the edge off the afternoon. You are adding, not taking away.',
    swaps: ['Eggs any way with whatever bread is in the house', 'Oats with a spoon of yogurt or nut butter stirred in', 'Last night\'s dinner, warmed up. Breakfast does not have to look like breakfast.'] },
  ownPlate: { pillar: 'nourish', title: 'Your own plate, sitting down, once a day', easier: 'Sit for the first three bites',
    why: 'You deserve a fresh plate, not the crusts. Sitting tells your body that this counts as a meal.',
    swaps: ['Serve yourself first for one meal', 'Eat lunch away from the counter and the screen', 'Use the nice bowl'] },
  bridge: { pillar: 'nourish', title: 'A real snack at three, to carry you to dinner', easier: 'Put the snack where you will see it at three',
    why: 'Arriving at dinner starving makes every choice harder. A bridge keeps you steady through the crunch.',
    swaps: ['Apple and cheese', 'Yogurt with seeds', 'Toast with egg or nut butter', 'A handful of nuts and something sweet you like'] },
  addFirst: { pillar: 'nourish', title: 'Protein and plants first at dinner. Keep the pasta.', easier: 'Add one extra thing to the pot',
    why: 'Nothing is off the table. Starting with what satisfies means the rest lands more gently.',
    swaps: ['Stir beans or lentils into the sauce', 'A bag of frozen spinach into anything simmering', 'Meatballs first, then twirl'] },
  light: { pillar: 'rest', title: 'Ten minutes of morning light', easier: 'Drink your first cup by a window',
    why: 'Morning light sets your body clock, which helps tonight\'s sleep before the day has begun.',
    swaps: ['Stand on the step with your coffee', 'Walk the kids the long way to the car', 'Open every blind before you check your phone'] },
  walk: { pillar: 'move', title: 'A twelve-minute walk, stopped on an odd minute', easier: 'Walk to the end of the street and back',
    why: 'Short and unfinished on purpose. You are practicing showing up, not hitting a number.',
    swaps: ['Loop the field during practice', 'Walk while you take a call', 'Rainy day: two laps of a bookshop'] },
  strength: { pillar: 'move', title: 'Two five-minute strength snacks this week', easier: 'Five slow squats while the coffee brews',
    why: 'Strength is what lets you keep carrying the people and things you love for decades.',
    swaps: ['Push-ups against the kitchen counter', 'Carry the groceries in one trip, on purpose', 'A short video you like, on the living room floor'] },
  play: { pillar: 'move', title: 'Move for fun once this week', easier: 'One song, danced to, in the kitchen',
    why: 'Joy is a reason to move that never runs out. No tracking, no target.',
    swaps: ['Dance while dinner cooks', 'Join the kids on the trampoline', 'A swim with no laps counted'] },
  windDown: { pillar: 'rest', title: 'Twenty-five screen-free minutes before bed', easier: 'Charge your phone outside the bedroom tonight',
    why: 'Sleep does more for cravings and patience than willpower ever will.',
    swaps: ['Four pages of fiction', 'Tea by lamp light', 'A hot shower, then straight to bed'] },
  lieDown: { pillar: 'rest', title: 'Ten minutes lying down, not earned', easier: 'Sit down for two minutes before the next thing',
    why: 'Rest taken before you are empty refills more than rest taken after.',
    swaps: ['Legs up the wall while the kids watch a show', 'Lie on the floor with a timer', 'Sit in the parked car for one song'] },
  oneNo: { pillar: 'mind', title: 'One small no this week', easier: 'Say "let me get back to you" once',
    why: 'Every yes spends something. One no keeps a little back for you.',
    swaps: ['Decline one thing without explaining', 'Leave one message unanswered until tomorrow', 'Let someone else volunteer first'] },
  spark: { pillar: 'mind', title: 'Your spark, twice this week', easier: 'Five minutes of it counts',
    why: 'A cup that is being refilled has more to give. This is not a reward. It is maintenance.',
    swaps: [] },
  setDown: { pillar: 'mind', title: 'Close the day: three things you are setting down', easier: 'Name one thing out loud and let it go',
    why: 'Your mind holds on until it is told the day is over. Write it down so it can stop carrying it.',
    swaps: ['A note on your phone', 'Say it to your partner', 'A sticky note you throw away in the morning'] },
  ask: { pillar: 'mind', title: 'Ask for one specific thing', easier: 'Notice one thing you would hand over if you could',
    why: 'People help more easily when they know exactly what is needed. You are allowed to need things.',
    swaps: ['"Can you do bath tonight?"', '"Can you pick up Thursday?"', '"I need twenty minutes after dinner."'] },
  oneThing: { pillar: 'mind', title: 'One thing at a time, for ten minutes', easier: 'Finish the cup of tea before starting the next task',
    why: 'Attention is a muscle. Ten undivided minutes is a full rep.',
    swaps: ['Phone in another room for one task', 'Eat one meal without a screen', 'Fold the laundry and only fold the laundry'] },
  feel: { pillar: 'mind', title: 'Three times a day: what do I feel, what do I need?', easier: 'Ask it once, at lunch',
    why: 'Feeling comes back through small check-ins. No answer is also an answer.',
    swaps: ['Hungry, tired, lonely, or bored?', 'Warm or cold? Tense or loose?', 'Name it, and do nothing about it'] },
  glimmer: { pillar: 'mind', title: 'Notice one small beautiful thing a day', easier: 'Look up once on the way to the car',
    why: 'What you look for, you find more of. This trains your attention toward what is good.',
    swaps: ['The steam off your cup', 'The light at four o\'clock', 'Your child\'s hand in yours'] }
};

/* Recovery is a cycle of four phases. Each pattern walks it with different rhythms. */
var PHASES = [
  { id: 'rest', name: 'Rest', season: 'winter', line: 'Settle first. Nothing changes until your body feels safe.' },
  { id: 'rebuild', name: 'Rebuild', season: 'spring', line: 'Two steady rhythms, repeated until they are boring.' },
  { id: 'rise', name: 'Rise', season: 'summer', line: 'A little more capacity, spent on what matters to you.' },
  { id: 'release', name: 'Release', season: 'autumn', line: 'Let go of what you no longer need, and keep what has become yours.' }
];
var PLAN = {
  sun: { rest: ['lieDown', 'setDown'], rebuild: ['ownPlate', 'windDown'], rise: ['walk', 'ask'], release: ['play', 'oneNo'] },
  wind: { rest: ['light', 'oneThing'], rebuild: ['warmBreakfast', 'windDown'], rise: ['walk', 'feel'], release: ['strength', 'glimmer'] },
  hearth: { rest: ['ownPlate', 'spark'], rebuild: ['oneNo', 'bridge'], rise: ['ask', 'play'], release: ['addFirst', 'setDown'] },
  tide: { rest: ['lieDown', 'warmBreakfast'], rebuild: ['light', 'bridge'], rise: ['walk', 'spark'], release: ['strength', 'glimmer'] },
  frost: { rest: ['light', 'feel'], rebuild: ['warmBreakfast', 'walk'], rise: ['spark', 'play'], release: ['ask', 'addFirst'] }
};

/* ---------- Pause: defusion rituals for the hard moment ---------- */
var MOMENTS = [
  { id: 'reach', label: 'I am reaching for food or a drink, and I am not hungry', ritual: 'wave',
    choices: ['Have it, sitting down, and enjoy it', 'Eat something real first, then decide', 'Ten minutes of something else, then decide'] },
  { id: 'snap', label: 'I am about to snap', ritual: 'cool',
    choices: ['Step out of the room for two minutes', 'Say "I need a second"', 'Carry on, slower and quieter'] },
  { id: 'spin', label: 'My mind will not stop', ritual: 'exhale',
    choices: ['Write it down for tomorrow', 'One thing only, for ten minutes', 'Step outside and look at the sky'] },
  { id: 'flat', label: 'I am stuck on the couch, scrolling', ritual: 'wake',
    choices: ['Stand up and stretch once', 'A glass of water and an open window', 'Stay here ten more minutes, on purpose'] },
  { id: 'heavy', label: 'Everything feels too heavy', ritual: 'hold',
    choices: ['Text one person', 'Lie down for ten minutes, on purpose', 'Do the smallest version of one rhythm'] }
];
var RITUALS = {
  exhale: { name: 'The long exhale', kind: 'breath', inS: 4, holdS: 0, outS: 6, rounds: 6, note: 'Breathing out for longer than you breathe in tells your body it can stand down.' },
  wave: { name: 'Ride the wave', kind: 'breath', inS: 4, holdS: 2, outS: 6, rounds: 5, note: 'An urge rises, peaks and passes, like a wave. You do not have to fight it or obey it. Breathe and watch it move.' },
  wake: { name: 'A gentle wake-up', kind: 'steps', note: 'Small sensations to bring you back into the room.',
    steps: ['Press your feet into the floor and feel the ground push back.', 'Look around slowly. Name five things you can see.', 'Roll your shoulders back three times.', 'Take one breath that is a little bigger than the last.'] },
  cool: { name: 'Cool the heat', kind: 'steps', note: 'Heat needs somewhere to go before words do.',
    steps: ['Unclench your jaw and drop your shoulders.', 'Run cold water over your wrists, or press something cool to your neck.', 'Shake out your hands for ten seconds.', 'Breathe out slowly, like blowing on soup.'] },
  hold: { name: 'A steady hold', kind: 'steps', note: 'Nothing to fix. Just company for a moment.',
    steps: ['Put one hand on your chest and one on your belly.', 'Feel the weight and warmth of your own hands.', 'Tap your shoulders slowly, left then right, ten times.', 'Say, quietly: this is a hard moment, and it will pass.'] }
};
var THOUGHTS = ['I deserve this', 'I have already blown it', 'I can\'t cope', 'Nobody helps me', 'I should be better at this', 'What is the point'];

/* ---------- Cards ---------- */
var MAJORS = [
  ['The Fool', 'Begin', 'You do not need the whole plan. Take the first step only.', 'Try one thing a new way: a different walk, a different breakfast.', 'Let today be an experiment, not a test.'],
  ['The Magician', 'Use what is here', 'You already have enough to start.', 'Make a meal from what is in the house.', 'Name one thing you made happen this week.'],
  ['The High Priestess', 'Listen inward', 'Before you ask anyone else, ask yourself.', 'Pause before you eat and check: hungry, tired, or something else?', 'Five quiet minutes with no input at all.'],
  ['The Empress', 'Nourish', 'You are allowed to be cared for too.', 'Eat something warm, sitting down, on a real plate.', 'Put something beautiful where you will see it.'],
  ['The Emperor', 'Structure', 'One steady thing holds up the rest.', 'Eat at a regular time today.', 'Keep one boundary without explaining it.'],
  ['The Hierophant', 'Tradition', 'What did the women before you know?', 'Cook something from your family\'s table.', 'Keep one small ritual exactly as it is.'],
  ['The Lovers', 'Choose', 'Choose on purpose, not by default.', 'Pick the meal you actually want.', 'Tell someone one true thing.'],
  ['The Chariot', 'Direction', 'Point yourself somewhere and go gently.', 'Walk with a destination.', 'Finish one thing and say it is done.'],
  ['Strength', 'Gentle power', 'Soft is not weak.', 'Move in a way that feels kind.', 'Be patient with one hard moment.'],
  ['The Hermit', 'Solitude', 'You can step back without disappearing.', 'An early night.', 'Ten minutes alone, phone in another room.'],
  ['Wheel of Fortune', 'Seasons turn', 'This phase is a phase.', 'Eat for the day you are having, not the one you planned.', 'Notice what is changing without fixing it.'],
  ['Justice', 'Balance', 'Fair includes you.', 'Add something to your plate rather than taking away.', 'Ask for one thing to be shared.'],
  ['The Hanged Man', 'Pause', 'Not doing is also a choice.', 'Lie down for ten minutes without earning it.', 'Look at one problem from the other side.'],
  ['Death', 'Let go', 'Something can end without being a failure.', 'Throw out the food rule that never worked.', 'Name what you are finished carrying.'],
  ['Temperance', 'Steady', 'A little, often, beats all or nothing.', 'Pair it: protein with the pastry, water with the wine.', 'Leave one thing at eighty percent.'],
  ['The Devil', 'Loosen the grip', 'Notice the habit. You do not have to obey it.', 'When the urge comes, wait ten breaths and then decide.', 'What are you allowed to want?'],
  ['The Tower', 'Shake-up', 'When the plan breaks, the next plate is a fresh start.', 'Do the smallest version today.', 'Let it be messy.'],
  ['The Star', 'Hope', 'Things can get lighter.', 'Drink water. Step outside after dark and look up.', 'Write one thing you are looking forward to.'],
  ['The Moon', 'Feel it', 'Not everything needs solving tonight.', 'Wind down early and dim the lights.', 'Let a feeling pass through without a story.'],
  ['The Sun', 'Joy', 'Joy does not have to be earned.', 'Get morning light on your face.', 'Do one thing purely because it is fun.'],
  ['Judgment', 'Wake up', 'You can answer differently this time.', 'Notice one signal from your body and respond to it.', 'Forgive yesterday\'s version of you.'],
  ['The World', 'Whole', 'Look how far the circle has come.', 'Cook a meal to celebrate nothing in particular.', 'Thank your body for one thing.']
];
var SUITS = [
  { id: 'cups', name: 'Cups', where: 'feeling and connection', body: ['Share a meal or a drink with someone, even over the phone.', 'Eat slowly enough to taste it.'] },
  { id: 'pentacles', name: 'Pentacles', where: 'body, food and home', body: ['Make one meal from real ingredients, simply.', 'Tend your body like a garden: water, light, food.'] },
  { id: 'wands', name: 'Wands', where: 'energy and movement', body: ['Move for ten minutes before the day gets loud.', 'Spend your energy on one thing that lights you up.'] },
  { id: 'swords', name: 'Swords', where: 'thoughts and clarity', body: ['Eat one meal with no screen and no list.', 'Take three slow breaths before you decide anything.'] }
];
var RANKS = [
  ['Ace', 'Begin', 'Start small and start now.', 'Plant one seed today and leave it alone.'],
  ['Two', 'Balance', 'Two things can be true at once.', 'Hold what you want and what is needed side by side.'],
  ['Three', 'Share', 'You do not have to do this alone.', 'Let someone in on what you are working toward.'],
  ['Four', 'Rest', 'Stopping is part of the work.', 'Protect a pocket of stillness.'],
  ['Five', 'Friction', 'A rough patch is information, not a verdict.', 'Be gentle with whatever is not working.'],
  ['Six', 'Ease', 'Let the easy thing be easy.', 'Give something small, or accept something small.'],
  ['Seven', 'Check in', 'Look at what is growing before you plant more.', 'Ask what is worth your patience.'],
  ['Eight', 'Practice', 'Repetition is how it becomes yours.', 'Do the ordinary thing with care.'],
  ['Nine', 'Nearly there', 'You have built more than you think.', 'Notice what you can already rely on.'],
  ['Ten', 'Full load', 'You are carrying a lot. Something can be set down.', 'Mark an ending, however small.'],
  ['Page', 'Be curious', 'Ask a beginner\'s question.', 'Learn one small thing for its own sake.'],
  ['Knight', 'Move toward it', 'Take the next step, not all of them.', 'Follow one thing through today.'],
  ['Queen', 'Tend', 'Care for yourself the way you care for them.', 'Make your space a little kinder.'],
  ['King', 'Steady hand', 'You know more than you give yourself credit for.', 'Hold your ground quietly.']
];

/* ---------- The food method: add before you take away ---------- */
var STAPLES = [
  { id: 'oatmeal', title: 'Oatmeal or a warm bowl', blocks: [
    { label: 'Rolled oats' },
    { label: 'Chia or flax seeds', role: 'Fiber', tip: 'Stir in a spoonful of chia or ground flax for staying power.' },
    { label: 'Greek yogurt or cottage cheese', role: 'Protein', tip: 'Swirl in a few spoons while it is hot. It turns creamy and keeps you full.' },
    { label: 'Berries, banana or apple', role: 'Plants', tip: 'Fold in frozen berries or grated apple with cinnamon.' },
    { label: 'Butter or nut butter', role: 'Fat', tip: 'A spoon of butter or almond butter carries you to lunch.' } ] },
  { id: 'smoothie', title: 'A morning smoothie', blocks: [
    { label: 'Frozen fruit' },
    { label: 'Protein powder or yogurt', role: 'Protein', tip: 'A scoop of protein or yogurt makes it a meal, not a drink.' },
    { label: 'Chia, hemp or oats', role: 'Fiber', tip: 'A spoon of seeds or oats thickens it and slows it down.' },
    { label: 'A handful of spinach', role: 'Plants', tip: 'A big handful of spinach disappears completely.' },
    { label: 'Avocado or nut butter', role: 'Fat', tip: 'A quarter avocado or a spoon of nut butter makes it satisfying.' } ] },
  { id: 'pasta', title: 'Pasta night', blocks: [
    { label: 'Pasta' }, { label: 'Jarred red sauce' },
    { label: 'Meatballs or chicken', role: 'Protein', tip: 'Brown some extra meat, or start with a few meatballs before the pasta.' },
    { label: 'Lentils or white beans', role: 'Protein and fiber', tip: 'Half a can of beans simmered into the sauce vanishes into it.' },
    { label: 'Spinach, mushrooms or zucchini', role: 'Plants', tip: 'Tip a bag of frozen spinach straight into the pot.' },
    { label: 'Olive oil and parmesan', role: 'Fat', tip: 'Finish with good olive oil and real parmesan. Flavor is part of feeling fed.' } ] },
  { id: 'coffee', title: 'Coffee or tea', blocks: [
    { label: 'Coffee or matcha' }, { label: 'Oat or almond milk' },
    { label: 'Whole milk or half-and-half', role: 'Fat', tip: 'Real milk is simple and satisfying.' },
    { label: 'Collagen or protein milk', role: 'Protein', tip: 'Froth some protein into your latte for an easy head start.' },
    { label: 'Cinnamon or honey', role: 'Flavor', tip: 'A dusting of cinnamon or a little honey, because you like it.' } ] },
  { id: 'tacos', title: 'Taco night', blocks: [
    { label: 'Tortillas' },
    { label: 'Seasoned beef, chicken or fish', role: 'Protein', tip: 'Build the first taco heavy on the filling.' },
    { label: 'Black or pinto beans', role: 'Protein and fiber', tip: 'Warm a can of beans with cumin and fold half into the meat.' },
    { label: 'Slaw, peppers, salsa', role: 'Plants', tip: 'Bagged slaw and salsa add crunch with no extra cooking.' },
    { label: 'Avocado or sour cream', role: 'Fat', tip: 'Avocado or sour cream is what makes two tacos enough.' } ] }
];

var PRACTICES = [
  { id: 'wasting', title: 'Leaving food behind', summary: 'Years of dieting can teach your body that food is scarce. Small acts of leaving some behind teach it otherwise.',
    steps: ['Put the serving spoon straight in the sink instead of scraping the pot.', 'Throw away the broken crumbs at the bottom of the bag.', 'Take your own fresh plate. The kids\' crusts can go to the birds.'] },
  { id: 'imperfect', title: 'Practicing imperfection', summary: 'A plan only works if it survives real life. Breaking tiny rules on purpose builds that muscle.',
    steps: ['Leave the measuring spoons in the drawer and use your eye.', 'If the walk is meant to be thirty minutes, stop at twenty-six.', 'One unplanned meal is information. The next plate is a fresh start.'] },
  { id: 'slow', title: 'Being inefficient on purpose', summary: 'Rushing keeps your body braced. Slowing one small thing lets it notice when it has had enough.',
    steps: ['Sit down fully before you unwrap or take the first bite.', 'Take four unhurried bites before you look at anything else.'] },
  { id: 'novelty', title: 'A menu of small joys', summary: 'A lift does not have to come from the pantry. Small changes wake up an ordinary day.',
    steps: ['Take your walk somewhere new, even a bookshop on a rainy day.', 'Change one thing about breakfast: a different fruit, a new spice.', 'Write your own five-minute joy menu: a song, the sun, a warm mug.'] }
];

var HERITAGE = ['Mediterranean', 'Latin American', 'Italian-American', 'South Asian', 'East Asian', 'Caribbean', 'Southern', 'Middle Eastern', 'Kosher', 'Halal', 'Plant-forward'];
var ALLERGIES = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Soy', 'Eggs'];

/* ---------- Wiring it in: a cue, a rep, a moment to feel it ---------- */
var CUES = ['After I pour my first cup', 'When the kids are buckled in', 'After I close my laptop', 'When dinner goes in the oven', 'After bedtime stories', 'When I brush my teeth'];
var ANCHOR_CUE = {
  warmBreakfast: 'After I pour my first cup', ownPlate: 'When I serve lunch', bridge: 'After school pickup', addFirst: 'When dinner goes in the oven',
  light: 'After I pour my first cup', walk: 'After I close my laptop', strength: 'While the coffee brews', play: 'When dinner goes in the oven',
  windDown: 'After bedtime stories', lieDown: 'After lunch is cleared', oneNo: 'When someone asks for my time', spark: 'After bedtime stories',
  setDown: 'When I brush my teeth', ask: 'When I feel the list growing', oneThing: 'After I close my laptop', feel: 'When I wash my hands', glimmer: 'When I step outside'
};
var TRAIL = [{ min: 0, name: 'Faint track' }, { min: 5, name: 'Footpath' }, { min: 15, name: 'Clear path' }, { min: 30, name: 'Well-worn path' }];
var EFFORT = [['lot', 'A lot'], ['some', 'Some'], ['little', 'Hardly any']];

/* ---------- The two rituals: set at the new moon, gather at the full ---------- */
var MOON_RITUALS = {
  new: { name: 'New moon setting', art: 'assets/moon-0.svg', call: 'The moon is new. Time to set the next two weeks.', sub: 'About five minutes. You leave with a card to keep.',
    open: 'The sky is dark, so the slate is clean. This is where you decide what the next two weeks are for.' },
  full: { name: 'Full moon gathering', art: 'assets/moon-4.svg', call: 'The moon is full. Time to gather what grew.', sub: 'About five minutes. Nothing is graded.',
    open: 'Everything is lit. This is where you look at what is there, without grading any of it.' }
};
var OBSTACLES = ['I run out of energy by evening', 'everyone else needs me first', 'I forget until the day is over', 'a hard day knocks me off course', 'I talk myself out of it'];
var PLANS = ['do the smallest version and call it done', 'pause before I decide anything', 'ask for one specific thing', 'begin again at the very next meal', 'look at my moon card'];
var WORDS = ['Soften', 'Steady', 'Begin', 'Enough', 'Receive', 'Slow', 'Brave', 'Play'];
var SEED_GLIMMERS = ['The steam coming off my first cup', 'Her hand finding mine in the parking lot', 'Four o\'clock light on the kitchen floor', 'A whole song with nobody talking', 'Clean sheets', 'The dog asleep on my feet', 'Basil from the windowsill', 'Rain on the car roof at pickup', 'He made the tea without being asked', 'Bare feet on a warm step', 'The first quiet minute after bedtime', 'A text from my sister', 'Bread, still warm', 'The sky going pink over the school', 'Laughing until I had to sit down', 'My own handwriting on a list I finished'];

var SEED_GLIMMER_ART = { 0: 'assets/glimmer-cup.svg', 2: 'assets/glimmer-light.svg', 4: 'assets/glimmer-sheets.svg', 6: 'assets/glimmer-basil.svg' };

/* ---------- The table: a small rotation of go-to meals ----------
   usual: what she might already eat, each with a tweak [title, description, tag] that keeps it and adds to it.
   ideas: [title, description, minutes, tag, flags, contains, cuisine]. Flags: b pantry budget, k kids will eat it, w warm. */
var MEALS = [
  { id: 'breakfast', name: 'Breakfast', ask: 'for breakfast', hint: 'Before ten', color: '#7A3050', tint: '#F6E6EC',
    usual: [
      { id: 'coffee', label: 'Coffee or tea, and not much else', tweak: ['Coffee plus protein', 'Keep the coffee ritual. Pair it with two eggs, or cottage cheese and berries.', 'Protein'] },
      { id: 'cereal', label: 'A bowl of cereal or oats', tweak: ['Upgraded oat and chia bowl', 'Keep your bowl. Stir in chia seeds, Greek yogurt and a spoon of nut butter.', 'Fiber + fat'] },
      { id: 'toast', label: 'Toast or a pastry', tweak: ['Toast with something on it', 'Keep the toast. Add an egg, avocado or nut butter so it lasts until lunch.', 'Protein + fat'] },
      { id: 'kids', label: 'Whatever the kids leave', tweak: ['Your own plate of theirs', 'Make one more portion of what they are having, and sit down with it.', 'Your own plate'] },
      { id: 'skip', label: 'I usually skip it', tweak: ['Something small before ten', 'A yogurt, a boiled egg, or a banana with nut butter. Small counts.', 'A start'] }
    ],
    ideas: [
      ['Five-minute skillet eggs and greens', 'Two eggs in olive oil or butter with a handful of spinach.', 5, 'Protein', 'kw', ['Eggs']],
      ['Greek yogurt and chia parfait', 'Full-fat Greek yogurt, chia seeds, walnuts and fruit.', 2, 'Protein + fiber', 'k', ['Dairy', 'Nuts']],
      ['Smashed avocado and egg toast', 'Sourdough, half an avocado, a fried egg and flaky salt.', 10, 'Staying power', '', ['Eggs', 'Gluten']],
      ['Warm spiced oatmeal', 'Rolled oats with cinnamon, ground flax, berries and a spoon of butter.', 10, 'Fiber + fat', 'bkw', ['Dairy']],
      ['Overnight oats, two jars', 'Oats, milk, chia and fruit, made the night before for two mornings.', 2, 'Made ahead', 'bk', ['Dairy']],
      ['Blender smoothie for the car', 'Frozen berries, spinach, yogurt or protein, and nut butter.', 5, 'Drinkable', 'k', ['Dairy', 'Nuts']],
      ['Last night\'s dinner, warmed up', 'Breakfast does not have to look like breakfast.', 2, 'No effort', 'bw', []],
      ['Eggs, beans and a warm tortilla', 'Scrambled eggs, black beans, salsa and a corn tortilla.', 10, 'Protein + fiber', 'bw', ['Eggs'], 'Latin American']
    ] },
  { id: 'lunch', name: 'Lunch', ask: 'for lunch', hint: 'Sitting down', color: '#27473A', tint: '#E3EEE8',
    usual: [
      { id: 'sandwich', label: 'A sandwich or wrap', tweak: ['The sandwich, built up', 'Keep the sandwich. Add a second filling with protein and something crunchy beside it.', 'Protein + plants'] },
      { id: 'takeout', label: 'Takeout or the drive-through', tweak: ['Your usual order, plus one', 'Keep the order. Add a side with protein or vegetables, and eat it sitting down.', 'Add one thing'] },
      { id: 'kids', label: 'Whatever the kids leave', tweak: ['Your own plate at their lunch', 'Make their lunch twice and put yours on a real plate.', 'Your own plate'] },
      { id: 'graze', label: 'Grazing from the pantry', tweak: ['A snack-plate lunch', 'Put the grazing on one plate: cheese, crackers, fruit, nuts. Then sit.', 'One plate'] },
      { id: 'skip', label: 'I usually skip it', tweak: ['A bridge at midday', 'Something small before two: soup, yogurt, or leftovers.', 'A start'] }
    ],
    ideas: [
      ['Dinner leftovers, on purpose', 'Cook one more portion at dinner and box it before you serve.', 2, 'No effort', 'bw', []],
      ['Tuna, white bean and lemon bowl', 'A can of tuna, a can of white beans, olive oil, lemon and any greens.', 5, 'Protein + fiber', 'b', [], 'Mediterranean'],
      ['Egg and avocado wrap', 'Two scrambled eggs, avocado and salsa in a warm wrap.', 10, 'Staying power', 'kw', ['Eggs', 'Gluten']],
      ['Big soup, small bread', 'A pot of lentil or chicken soup made once and eaten three times.', 20, 'Made ahead', 'bw', []],
      ['Snack-plate lunch', 'Cheese, crackers, fruit, nuts, something pickled. Sit down with it.', 2, 'One plate', 'k', ['Dairy', 'Gluten', 'Nuts']],
      ['Rice bowl with a fried egg', 'Leftover rice, a fried egg, frozen edamame, soy sauce and sesame.', 10, 'Protein', 'bw', ['Eggs', 'Soy'], 'East Asian'],
      ['Chicken salad with crunch', 'Store-bought roast chicken, bagged slaw, olive oil and vinegar.', 5, 'Protein + plants', '', []]
    ] },
  { id: 'dinner', name: 'Dinner', ask: 'for dinner', hint: 'The family table', color: '#8E4420', tint: '#F5E6DA',
    usual: [
      { id: 'pasta', label: 'Pasta or rice with the family', tweak: ['Pasta night, with extras', 'Keep pasta night. Stir beans or meatballs into the sauce and a bag of spinach through it.', 'Protein + plants'] },
      { id: 'takeout', label: 'Takeout or pizza', tweak: ['Pizza night, plus a plate', 'Keep pizza night. Put salad or cut vegetables on the table first.', 'Add one thing'] },
      { id: 'fast', label: 'Whatever is fastest', tweak: ['Two fast dinners you trust', 'Pick two ten-minute dinners and keep what they need in the house.', 'Less deciding'] },
      { id: 'cooked', label: 'A proper cooked meal', tweak: ['Cook once, eat twice', 'Keep cooking. Make one more portion for tomorrow\'s lunch.', 'Made ahead'] },
      { id: 'pick', label: 'Picking while I cook, then not much', tweak: ['A plate of your own', 'Serve yourself first, and sit for the first three bites.', 'Your own plate'] }
    ],
    ideas: [
      ['Sheet-pan chicken and vegetables', 'Chicken thighs and whatever vegetables you have, one tray, one oven.', 20, 'Protein + plants', 'kw', []],
      ['Pasta night, with extras', 'Your usual pasta with beans or meatballs in the sauce and spinach stirred through.', 20, 'Protein + plants', 'bkw', ['Gluten'], 'Italian-American'],
      ['Taco night, built your way', 'Seasoned meat or beans, slaw, salsa and avocado. Everyone builds their own.', 20, 'Everyone eats', 'kw', [], 'Latin American'],
      ['Lemon garlic salmon and couscous', 'Salmon, lemon, garlic and oregano with couscous, cucumber and tomato.', 15, 'Protein', 'w', ['Gluten'], 'Mediterranean'],
      ['Breakfast for dinner', 'Eggs, toast and fruit. Ten minutes and everyone eats.', 10, 'No deciding', 'bkw', ['Eggs', 'Gluten']],
      ['Slow-cooker stew', 'Ten minutes in the morning, and dinner makes itself by six.', 10, 'Made ahead', 'bw', []],
      ['Dal and rice', 'Red lentils simmered with onion, garlic and turmeric, over rice.', 20, 'Protein + fiber', 'bw', [], 'South Asian'],
      ['Roast chicken plate, no cooking', 'A store-bought chicken, bagged salad and good bread.', 2, 'No effort', 'k', ['Gluten']]
    ] },
  { id: 'snack', name: 'The three o\'clock bridge', ask: 'around three', hint: 'To carry you to dinner', color: '#8A6412', tint: '#F6EBCF',
    usual: [
      { id: 'crunch', label: 'Chips or crackers', tweak: ['Crunch with company', 'Keep the crunch. Put cheese, hummus or nuts next to it.', 'Add one thing'] },
      { id: 'sweet', label: 'Something sweet', tweak: ['Sweet, with a partner', 'Keep the sweet thing. Have it with yogurt, nuts or a glass of milk.', 'Add one thing'] },
      { id: 'coffee', label: 'A second coffee', tweak: ['Coffee and a bite', 'Keep the coffee. Have something with protein alongside.', 'Protein'] },
      { id: 'nothing', label: 'Nothing until dinner', tweak: ['A real snack at three', 'Choose one thing and put it where you will see it at three.', 'A start'] }
    ],
    ideas: [
      ['Apple and cheese', 'One apple, a few slices of cheese, a plate.', 2, 'Protein + fiber', 'k', ['Dairy']],
      ['Yogurt with seeds', 'Greek yogurt with pumpkin or sunflower seeds and honey.', 2, 'Protein', '', ['Dairy']],
      ['Toast with nut butter', 'One slice, thick with peanut or almond butter.', 5, 'Staying power', 'bkw', ['Gluten', 'Nuts']],
      ['Boiled eggs, made on Sunday', 'A bowl of them in the fridge, with salt.', 2, 'Protein', 'b', ['Eggs']],
      ['Hummus and whatever crunches', 'Carrots, cucumber, crackers or pita.', 2, 'Fiber', 'bk', [], 'Middle Eastern'],
      ['Nuts and something sweet you like', 'A handful of each, on a plate, sitting down.', 2, 'Staying power', '', ['Nuts']],
      ['Warm milk or cocoa and a banana', 'Five quiet minutes with a mug.', 5, 'Warmth', 'kw', ['Dairy']]
    ] }
];

/* Demo mothers for the presenter bar */
var PERSONAS = {
  maya: { name: 'Maya', stage: 'cycling', pattern: 'hearth', options: ['hearth', 'sun', 'tide'], cup: ['The family table', 'Voice notes with a friend', 'Cooking for fun'],
    values: ['Calm evenings', 'An easy relationship with food'], tender: 'crunch', rhythm: { mode: 'cycle', len: 28, dayAgo: 21 },
    cards: { on: true, deck: 'hearth', arrived: true }, weight: false, phase: 1, heritage: ['Italian-American', 'Mediterranean'], history: 44, kin: 'Jess', holding: [{ name: 'Priya', word: 'Brave' }],
    tableStart: 'empty', eats: { breakfast: ['cereal'], lunch: ['kids'], dinner: ['pasta'] }, table: { breakfast: ['u:cereal'], lunch: ['u:kids'], dinner: ['u:pasta', 'i:0'] } },
  elena: { name: 'Elena', stage: 'irregular', pattern: 'tide', options: ['tide', 'frost'], cup: ['Sitting outside', 'Fiction'],
    values: ['Feeling like myself again', 'Steady energy for my kids'], tender: 'slump', rhythm: { mode: 'moon' },
    cards: { on: true, deck: 'nightsky', arrived: false }, weight: false, phase: 0, heritage: ['Latin American'], history: 11, eats: { breakfast: ['coffee', 'cereal'] } },
  casey: { name: 'Casey', stage: 'postpartum', pattern: 'wind', options: ['wind', 'sun', 'hearth'], cup: [],
    values: ['Being present, not just there'], tender: 'after', rhythm: { mode: 'moon' },
    cards: { on: false, deck: '', arrived: false }, weight: true, phase: 0, heritage: ['Southern'], history: 2 }
};
