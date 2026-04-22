// ═══════════════════════════════════════════════════════════
// proto-store.jsx — game state, price engine, events, messages
// ═══════════════════════════════════════════════════════════

const DW_CONFIG = {
  startingCash: 2000,
  startingDebt: 5500,
  debtInterest: 0.10,       // +10% per day
  bankInterest: 0.06,       // +6% per day
  totalDays: 30,
  trenchCapacity: 100,      // # of items
  startCity: 'mia',
};

// Seeded RNG so same day produces same prices per city
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(day, cityId) {
  let h = 2166136261;
  const s = `${day}-${cityId}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// City-level price modifiers: some cities cheap/expensive for certain goods
const CITY_BIAS = {
  nyc: { coke: 1.15, mdma: 0.85, xan: 0.9, heroin: 1.1, carts: 0.95 },
  la:  { coke: 0.9, mdma: 1.1, acid: 1.15, shrooms: 1.05, ozempic: 0.85 },
  mia: { coke: 0.8, heroin: 1.1, ket: 0.9, mdma: 1.05, weed: 0.9 },
  ber: { mdma: 0.7, ket: 0.75, acid: 0.85, coke: 1.25, heroin: 1.2 },
  tyo: { ludes: 0.6, shrooms: 0.8, carts: 1.3, fent: 1.5, ozempic: 0.95 },
  mex: { weed: 0.6, coke: 0.95, shrooms: 0.75, fent: 1.4, ludes: 1.1 },
};

// Daily event pool for spikes/crashes — some goods go wild 10% of days
const SPIKE_TYPES = [
  { kind: 'spike', tag: 'Cops raided supply', mul: [2.5, 4.5] },
  { kind: 'spike', tag: 'Festival nearby', mul: [1.8, 3.0] },
  { kind: 'spike', tag: 'Celeb overdose', mul: [2.0, 3.5] },
  { kind: 'crash', tag: 'Market flooded', mul: [0.25, 0.5] },
  { kind: 'crash', tag: 'Cartel dumping', mul: [0.3, 0.55] },
  { kind: 'crash', tag: 'Bad batch warning', mul: [0.35, 0.6] },
];

function generatePrices(day, cityId, drugs) {
  const rng = mulberry32(hashSeed(day, cityId));
  const bias = CITY_BIAS[cityId] || {};
  // 0–2 spike events per city-day
  const spikes = {};
  const spikeCount = rng() < 0.7 ? (rng() < 0.5 ? 1 : 0) : 2;
  const pool = [...drugs];
  for (let i = 0; i < spikeCount; i++) {
    const drug = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const type = SPIKE_TYPES[Math.floor(rng() * SPIKE_TYPES.length)];
    const mul = type.mul[0] + rng() * (type.mul[1] - type.mul[0]);
    spikes[drug.id] = { mul, kind: type.kind, tag: type.tag };
  }
  const prices = {};
  drugs.forEach(d => {
    const base = d.min + rng() * (d.max - d.min);
    const biased = base * (bias[d.id] || 1);
    const spiked = spikes[d.id] ? biased * spikes[d.id].mul : biased;
    // round to nearest 10 for readability
    const rounded = Math.round(spiked / 10) * 10;
    // random availability — some goods not sold today
    const available = rng() > 0.15;
    prices[d.id] = {
      price: rounded,
      available,
      spike: spikes[d.id] || null,
    };
  });
  return prices;
}

// Random events that trigger on travel (the A/B dilemmas)
const EVENT_BANK = [
  {
    id: 'mugging',
    title: 'Street Hustle',
    body: 'Two guys block your path in an alley. One flashes a knife and asks for "the stash."',
    icon: '🔪',
    options: [
      { label: 'Hand it over', consequence: 'loseCashOrStash', weight: 1 },
      { label: 'Fight back',  consequence: 'fightMugger', weight: 1 },
    ],
  },
  {
    id: 'cop',
    title: 'Cop Check',
    body: 'Flashing lights in the rearview. Officer wants to search the trunk.',
    icon: '🚓',
    options: [
      { label: 'Comply nicely',  consequence: 'copCompliance', weight: 1 },
      { label: 'Hit the gas',    consequence: 'copFlee', weight: 1 },
    ],
  },
  {
    id: 'dealer',
    title: 'Old Friend',
    body: 'Someone you used to run with offers a big bag at 40% under market price. Seems legit. Seems.',
    icon: '🫂',
    options: [
      { label: 'Take the deal', consequence: 'friendDeal', weight: 1 },
      { label: 'Walk away',     consequence: 'none', weight: 1 },
    ],
  },
  {
    id: 'lostbag',
    title: 'Dropped Bag',
    body: 'You spot a gym bag half-stashed behind a dumpster. Heavy. Smells chemical.',
    icon: '🎒',
    options: [
      { label: 'Grab it',  consequence: 'foundStash', weight: 1 },
      { label: 'Nah',      consequence: 'none', weight: 1 },
    ],
  },
  {
    id: 'hurricane',
    title: 'Weather Alert',
    body: 'Hurricane warning just hit. Flights are canceling. You can buy a scalped seat on the last plane.',
    icon: '🌀',
    options: [
      { label: 'Pay $800 for the seat', consequence: 'payHurricane', weight: 1 },
      { label: 'Wait it out',           consequence: 'skipDay', weight: 1 },
    ],
  },
  {
    id: 'loanshark',
    title: 'The Shark',
    body: 'A man in a linen suit slides into the seat across from you. "Your debt. It\'s looking lonely. Let me help."',
    icon: '🦈',
    options: [
      { label: 'Borrow $5,000',  consequence: 'borrowShark', weight: 1 },
      { label: 'I\'m good',      consequence: 'none', weight: 1 },
    ],
  },
];

// Rolodex of contacts — messages arrive between days
const CONTACTS = {
  mami: { name: 'Mami', emoji: '💋', color: '#ff47b3' },
  vega: { name: 'Vega', emoji: '🕶️', color: '#00e5ff' },
  shark: { name: 'The Shark', emoji: '🦈', color: '#ffcf3a' },
  cop: { name: 'Unknown', emoji: '📞', color: '#ff3366' },
  sis: { name: 'Lisa', emoji: '🌸', color: '#c7ff1f' },
};

const MESSAGE_BANK = [
  { from: 'mami', tag: 'tip', text: 'Heard coke\'s clean in Miami this week. Don\'t sleep.' },
  { from: 'vega', tag: 'tip', text: 'Berlin molly is half price. You seeing this?' },
  { from: 'shark', tag: 'warn', text: 'Day {day}. Your debt is ${debt}. Tick. Tock.' },
  { from: 'sis',  tag: 'life', text: 'mom asked about you again. call her.' },
  { from: 'mami', tag: 'flirt', text: 'come back to Miami. the pool is warm 🌴' },
  { from: 'vega', tag: 'tip', text: 'Tokyo carts are trending hot. 12 hours till the market cools.' },
  { from: 'cop', tag: 'warn', text: 'We know about the LAX run. Come in voluntarily.' },
  { from: 'sis', tag: 'life', text: 'I\'m fine. you don\'t have to send more money.' },
  { from: 'vega', tag: 'tip', text: 'Mexico City fent market is flooded. Dump if holding.' },
  { from: 'mami', tag: 'flirt', text: 'last night was 🔥. don\'t disappear this time.' },
];

// Initial state
function makeInitialState() {
  const prices = {};
  DW_CITIES.forEach(c => {
    prices[c.id] = generatePrices(1, c.id, DW_DRUGS);
  });
  return {
    day: 1,
    city: DW_CONFIG.startCity,
    cash: DW_CONFIG.startingCash,
    debt: DW_CONFIG.startingDebt,
    bank: 0,
    health: 100,
    heat: 0,  // cop heat 0-100
    inventory: {},  // { drugId: qty }
    prices,             // { cityId: { drugId: {price, available, spike} } }
    priceHistory: {},   // { cityId: { drugId: [price1, price2, ...] } }
    messages: [],       // [{ from, text, day, read }]
    log: [],            // [{ day, text, kind }]
    pendingEvent: null, // event shown after travel
    screen: 'intro',
    gameOver: null,     // null | 'win' | 'lose' | 'jail'
  };
}

// Actions
function storeReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const s = makeInitialState();
      s.screen = 'market';
      s.log = [{ day: 1, text: `Landed in ${cityName(s.city)}. Trenchcoat empty. Shark wants ${fmt(s.debt)}.`, kind: 'intro' }];
      return s;
    }
    case 'BUY': {
      const { drugId, qty } = action;
      const p = state.prices[state.city][drugId];
      const cost = p.price * qty;
      if (cost > state.cash) return state;
      if (getLoad(state.inventory) + qty > DW_CONFIG.trenchCapacity) return state;
      const inv = { ...state.inventory, [drugId]: (state.inventory[drugId] || 0) + qty };
      return {
        ...state,
        cash: state.cash - cost,
        inventory: inv,
        log: [{ day: state.day, text: `Bought ${qty}× ${drugName(drugId)} @ ${fmt(p.price)} in ${cityName(state.city)}.`, kind: 'buy' }, ...state.log].slice(0, 60),
      };
    }
    case 'SELL': {
      const { drugId, qty } = action;
      const have = state.inventory[drugId] || 0;
      if (qty > have) return state;
      const p = state.prices[state.city][drugId];
      const revenue = p.price * qty;
      const inv = { ...state.inventory };
      inv[drugId] = have - qty;
      if (inv[drugId] <= 0) delete inv[drugId];
      return {
        ...state,
        cash: state.cash + revenue,
        inventory: inv,
        log: [{ day: state.day, text: `Sold ${qty}× ${drugName(drugId)} @ ${fmt(p.price)} in ${cityName(state.city)}.`, kind: 'sell' }, ...state.log].slice(0, 60),
      };
    }
    case 'TRAVEL': {
      // Step to next day + reroll prices + maybe event + message + debt/bank interest
      const newDay = state.day + 1;
      if (newDay > DW_CONFIG.totalDays) {
        // End of game
        return endGame(state, 'win');
      }
      const newCity = action.cityId;
      // Regenerate prices for new day (everywhere)
      const prices = {};
      DW_CITIES.forEach(c => {
        prices[c.id] = generatePrices(newDay, c.id, DW_DRUGS);
      });
      // Save price history for current city before move
      const history = { ...state.priceHistory };
      if (!history[state.city]) history[state.city] = {};
      DW_DRUGS.forEach(d => {
        const arr = history[state.city][d.id] || [];
        arr.push(state.prices[state.city][d.id].price);
        history[state.city][d.id] = arr.slice(-14);
      });

      const newDebt = Math.round(state.debt * (1 + DW_CONFIG.debtInterest));
      const newBank = Math.round(state.bank * (1 + DW_CONFIG.bankInterest));

      // Maybe trigger a random event (35%)
      let pendingEvent = null;
      if (Math.random() < 0.35) {
        const ev = EVENT_BANK[Math.floor(Math.random() * EVENT_BANK.length)];
        pendingEvent = { ...ev };
      }

      // Maybe add a message (50%)
      const messages = [...state.messages];
      if (Math.random() < 0.6) {
        const t = MESSAGE_BANK[Math.floor(Math.random() * MESSAGE_BANK.length)];
        let text = t.text.replace('{day}', newDay).replace('{debt}', fmt(newDebt));
        messages.unshift({ from: t.from, tag: t.tag, text, day: newDay, read: false });
      }

      // Heat cools by 5 each day
      const newHeat = Math.max(0, state.heat - 5);

      return {
        ...state,
        day: newDay,
        city: newCity,
        prices,
        priceHistory: history,
        debt: newDebt,
        bank: newBank,
        heat: newHeat,
        messages: messages.slice(0, 30),
        pendingEvent,
        screen: pendingEvent ? 'event' : 'endOfDay',
        log: [{ day: newDay, text: `Flew to ${cityName(newCity)}. Day ${newDay} of ${DW_CONFIG.totalDays}.`, kind: 'travel' }, ...state.log].slice(0, 60),
      };
    }
    case 'RESOLVE_EVENT': {
      const newState = applyConsequence(state, action.consequence);
      return { ...newState, pendingEvent: null, screen: 'endOfDay' };
    }
    case 'GOTO': {
      return { ...state, screen: action.screen };
    }
    case 'MARK_READ': {
      return { ...state, messages: state.messages.map(m => ({ ...m, read: true })) };
    }
    case 'PAY_DEBT': {
      const amt = Math.min(action.amount, state.cash, state.debt);
      return {
        ...state,
        cash: state.cash - amt,
        debt: state.debt - amt,
        log: [{ day: state.day, text: `Paid ${fmt(amt)} to the Shark.`, kind: 'debt' }, ...state.log].slice(0, 60),
      };
    }
    case 'DEPOSIT': {
      const amt = Math.min(action.amount, state.cash);
      return { ...state, cash: state.cash - amt, bank: state.bank + amt };
    }
    case 'WITHDRAW': {
      const amt = Math.min(action.amount, state.bank);
      return { ...state, cash: state.cash + amt, bank: state.bank - amt };
    }
    case 'RESET':
      return makeInitialState();
    case '__LOAD':
      return action.state;
    default:
      return state;
  }
}

function endGame(state, how) {
  const netWorth = state.cash + state.bank - state.debt;
  const verdict = netWorth > 50000 ? 'legend' : netWorth > 10000 ? 'baller' : netWorth > 0 ? 'survivor' : 'broke';
  return { ...state, screen: 'gameover', gameOver: { how, netWorth, verdict } };
}

// Apply event consequence
function applyConsequence(state, key) {
  switch (key) {
    case 'loseCashOrStash': {
      const loss = Math.round(state.cash * 0.25);
      return {
        ...state,
        cash: state.cash - loss,
        health: Math.max(0, state.health - 10),
        log: [{ day: state.day, text: `Mugged. Lost ${fmt(loss)}. Bruised but alive.`, kind: 'bad' }, ...state.log],
      };
    }
    case 'fightMugger': {
      const luck = Math.random();
      if (luck > 0.5) {
        return {
          ...state,
          health: Math.max(0, state.health - 20),
          log: [{ day: state.day, text: `Beat the mugger. Kept your stash. Cracked rib.`, kind: 'ok' }, ...state.log],
        };
      }
      const loss = Math.round(state.cash * 0.5);
      return {
        ...state,
        cash: state.cash - loss,
        health: Math.max(0, state.health - 35),
        log: [{ day: state.day, text: `Fought, lost. Down ${fmt(loss)} and bleeding.`, kind: 'bad' }, ...state.log],
      };
    }
    case 'copCompliance': {
      const heat = state.heat + 10;
      const load = getLoad(state.inventory);
      if (load > 20) {
        // Lose inventory + jail if too heavy
        return endGame({
          ...state,
          log: [{ day: state.day, text: `Cops found the stash. Game over.`, kind: 'bad' }, ...state.log],
        }, 'jail');
      }
      return {
        ...state,
        heat,
        log: [{ day: state.day, text: `Cops let you go. Heat +10.`, kind: 'ok' }, ...state.log],
      };
    }
    case 'copFlee': {
      const luck = Math.random();
      if (luck > 0.4) {
        return {
          ...state,
          heat: state.heat + 25,
          log: [{ day: state.day, text: `Outran the cops. Adrenaline. Heat +25.`, kind: 'ok' }, ...state.log],
        };
      }
      return endGame({
        ...state,
        log: [{ day: state.day, text: `Caught. Cuffed. Game over.`, kind: 'bad' }, ...state.log],
      }, 'jail');
    }
    case 'friendDeal': {
      // 60% legit, 40% scam
      if (Math.random() > 0.4) {
        // Find a good to "get"
        const affordable = DW_DRUGS.filter(d => d.max > 500);
        const drug = affordable[Math.floor(Math.random() * affordable.length)];
        const qty = 5;
        const space = DW_CONFIG.trenchCapacity - getLoad(state.inventory);
        const actual = Math.min(qty, space);
        const cost = Math.round(drug.min * 0.6 * actual);
        if (cost > state.cash) {
          return { ...state, log: [{ day: state.day, text: `Couldn't afford the deal anyway.`, kind: 'ok' }, ...state.log] };
        }
        return {
          ...state,
          cash: state.cash - cost,
          inventory: { ...state.inventory, [drug.id]: (state.inventory[drug.id] || 0) + actual },
          log: [{ day: state.day, text: `Got ${actual}× ${drug.name} at 40% off. Luck.`, kind: 'good' }, ...state.log],
        };
      }
      const loss = Math.min(state.cash, 800);
      return {
        ...state,
        cash: state.cash - loss,
        log: [{ day: state.day, text: `Old friend scammed you. Lost ${fmt(loss)}.`, kind: 'bad' }, ...state.log],
      };
    }
    case 'foundStash': {
      // Find something good
      const affordable = DW_DRUGS.filter(d => d.tier !== 'low');
      const drug = affordable[Math.floor(Math.random() * affordable.length)];
      const qty = 3 + Math.floor(Math.random() * 5);
      const space = DW_CONFIG.trenchCapacity - getLoad(state.inventory);
      const actual = Math.min(qty, space);
      return {
        ...state,
        inventory: { ...state.inventory, [drug.id]: (state.inventory[drug.id] || 0) + actual },
        heat: state.heat + 5,
        log: [{ day: state.day, text: `Found ${actual}× ${drug.name}. Felony.`, kind: 'good' }, ...state.log],
      };
    }
    case 'payHurricane': {
      return {
        ...state,
        cash: state.cash - 800,
        log: [{ day: state.day, text: `Last flight out. -${fmt(800)}.`, kind: 'ok' }, ...state.log],
      };
    }
    case 'skipDay': {
      // Apply debt interest again
      return {
        ...state,
        debt: Math.round(state.debt * (1 + DW_CONFIG.debtInterest)),
        log: [{ day: state.day, text: `Stuck an extra day. Debt grew.`, kind: 'bad' }, ...state.log],
      };
    }
    case 'borrowShark': {
      return {
        ...state,
        cash: state.cash + 5000,
        debt: state.debt + 5500,
        log: [{ day: state.day, text: `Borrowed ${fmt(5000)}. Owe ${fmt(5500)}. Smile.`, kind: 'bad' }, ...state.log],
      };
    }
    default:
      return state;
  }
}

// Helpers
function getLoad(inv) {
  return Object.values(inv).reduce((a, b) => a + b, 0);
}
function cityName(id) { return (DW_CITIES.find(c => c.id === id) || {}).name || id; }
function drugName(id) { return (DW_DRUGS.find(d => d.id === id) || {}).name || id; }
function drugOf(id) { return DW_DRUGS.find(d => d.id === id); }
function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '$0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}$${(abs/1000000).toFixed(1)}M`;
  if (abs >= 10000) return `${sign}$${Math.round(abs/1000)}k`;
  return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
function fmtFull(n) {
  if (n === null || n === undefined || isNaN(n)) return '$0';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

Object.assign(window, {
  DW_CONFIG, makeInitialState, storeReducer, generatePrices,
  getLoad, cityName, drugName, drugOf, fmt, fmtFull,
  EVENT_BANK, CONTACTS, MESSAGE_BANK, CITY_BIAS,
});
