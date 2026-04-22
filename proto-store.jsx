// ═══════════════════════════════════════════════════════════
// proto-store.jsx — game state, price engine, events, messages
// ═══════════════════════════════════════════════════════════

const DW_CONFIG = {
  startingCash: 2000,
  startingDebt: 5500,
  debtInterest: 0.10,
  bankInterest: 0.06,
  totalDays: 30,
  baseCapacity: 100,
  startCity: 'mia',
  grannyBackpackPrices: [50000, 150000, 500000],
  eventProbability: 0.58,
};

// Seeded RNG
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

const CITY_BIAS = {
  nyc: { coke: 1.15, mdma: 0.85, xan: 0.9, heroin: 1.1, carts: 0.95 },
  la:  { coke: 0.9, mdma: 1.1, acid: 1.15, shrooms: 1.05, ozempic: 0.85 },
  mia: { coke: 0.8, heroin: 1.1, ket: 0.9, mdma: 1.05, weed: 0.9 },
  ber: { mdma: 0.7, ket: 0.75, acid: 0.85, coke: 1.25, heroin: 1.2 },
  tyo: { ludes: 0.6, shrooms: 0.8, carts: 1.3, fent: 1.5, ozempic: 0.95 },
  mex: { weed: 0.6, coke: 0.95, shrooms: 0.75, fent: 1.4, ludes: 1.1 },
};

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
    const rounded = Math.round(spiked / 10) * 10;
    const available = rng() > 0.15;
    prices[d.id] = { price: rounded, available, spike: spikes[d.id] || null };
  });
  return prices;
}

// Events — cops and muggings weighted 3× heavier
const EVENT_BANK = [
  {
    id: 'mugging', weight: 3,
    title: 'Street Hustle',
    body: 'Two guys block your path in an alley. One flashes a knife and asks for "the stash."',
    icon: '🔪',
    options: [
      { label: 'Hand it over', consequence: 'loseCashOrStash' },
      { label: 'Fight back',   consequence: 'fightMugger' },
    ],
  },
  {
    id: 'cop', weight: 3,
    title: 'Cop Check',
    body: 'Flashing lights in the rearview. Officer wants to search the trunk.',
    icon: '🚓',
    options: [
      { label: 'Comply nicely', consequence: 'copCompliance' },
      { label: 'Hit the gas',   consequence: 'copFlee' },
    ],
  },
  {
    id: 'dealer', weight: 1,
    title: 'Old Friend',
    body: 'Someone you used to run with offers a big bag at 40% under market. Seems legit. Seems.',
    icon: '🫂',
    options: [
      { label: 'Take the deal', consequence: 'friendDeal' },
      { label: 'Walk away',     consequence: 'none' },
    ],
  },
  {
    id: 'lostbag', weight: 1,
    title: 'Dropped Bag',
    body: 'You spot a gym bag half-stashed behind a dumpster. Heavy. Smells chemical.',
    icon: '🎒',
    options: [
      { label: 'Grab it', consequence: 'foundStash' },
      { label: 'Nah',     consequence: 'none' },
    ],
  },
  {
    id: 'hurricane', weight: 1,
    title: 'Weather Alert',
    body: 'Hurricane warning just hit. Flights are canceling. You can buy a scalped seat on the last plane.',
    icon: '🌀',
    options: [
      { label: 'Pay $800 for the seat', consequence: 'payHurricane' },
      { label: 'Wait it out',           consequence: 'skipDay' },
    ],
  },
  {
    id: 'loanshark', weight: 1,
    title: 'The Shark',
    body: "A man in a linen suit slides into the seat across from you. \"Your debt. It's looking lonely. Let me help.\"",
    icon: '🦈',
    options: [
      { label: 'Borrow $5,000', consequence: 'borrowShark' },
      { label: "I'm good",      consequence: 'none' },
    ],
  },
];

function pickWeightedEvent() {
  const total = EVENT_BANK.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const ev of EVENT_BANK) {
    r -= ev.weight;
    if (r <= 0) return { ...ev };
  }
  return { ...EVENT_BANK[EVENT_BANK.length - 1] };
}

const CONTACTS = {
  mami:  { name: 'Mami',      emoji: '💋', color: '#ff47b3' },
  vega:  { name: 'Vega',      emoji: '🕶️', color: '#00e5ff' },
  shark: { name: 'The Shark', emoji: '🦈', color: '#ffcf3a' },
  cop:   { name: 'Unknown',   emoji: '📞', color: '#ff3366' },
  sis:   { name: 'Lisa',      emoji: '🌸', color: '#c7ff1f' },
};

const MESSAGE_BANK = [
  { from: 'mami',  tag: 'tip',   text: "Heard coke's clean in Miami this week. Don't sleep." },
  { from: 'vega',  tag: 'tip',   text: 'Berlin molly is half price. You seeing this?' },
  { from: 'shark', tag: 'warn',  text: 'Day {day}. Your debt is {debt}. Tick. Tock.' },
  { from: 'sis',   tag: 'life',  text: 'mom asked about you again. call her.' },
  { from: 'mami',  tag: 'flirt', text: 'come back to Miami. the pool is warm 🌴' },
  { from: 'vega',  tag: 'tip',   text: 'Tokyo carts are trending hot. 12 hours till the market cools.' },
  { from: 'cop',   tag: 'warn',  text: 'We know about the LAX run. Come in voluntarily.' },
  { from: 'sis',   tag: 'life',  text: "I'm fine. you don't have to send more money." },
  { from: 'vega',  tag: 'tip',   text: 'Mexico City fent market is flooded. Dump if holding.' },
  { from: 'mami',  tag: 'flirt', text: 'last night was 🔥. don\'t disappear this time.' },
];

// Pick 3 unique Granny days from days 2–20
function makeGrannyDays() {
  const pool = Array.from({ length: 19 }, (_, i) => i + 2);
  const days = [];
  while (days.length < 3) {
    const idx = Math.floor(Math.random() * pool.length);
    days.push(pool.splice(idx, 1)[0]);
  }
  return days.sort((a, b) => a - b);
}

// Price Granny's one-use items at ~30% of cash, nicely rounded
function grannyItemPrice(cash) {
  const raw = Math.max(5000, cash * 0.30);
  if (raw >= 50000) return Math.round(raw / 10000) * 10000;
  if (raw >= 10000) return Math.round(raw / 5000) * 5000;
  return Math.round(raw / 1000) * 1000;
}

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
    heat: 0,
    inventory: {},
    costBasis: {},
    trenchCapacity: DW_CONFIG.baseCapacity,
    backpackTier: 0,
    hasGun: false,
    hasCopProtection: false,
    grannyDays: makeGrannyDays(),
    prices,
    priceHistory: {},
    messages: [],
    log: [],
    pendingEvent: null,
    screen: 'intro',
    gameOver: null,
    strippedReason: null,
  };
}

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
      if (getLoad(state.inventory) + qty > state.trenchCapacity) return state;
      const existingQty = state.inventory[drugId] || 0;
      const existingBasis = state.costBasis[drugId] || 0;
      const newAvgBasis = existingQty > 0
        ? (existingQty * existingBasis + qty * p.price) / (existingQty + qty)
        : p.price;
      return {
        ...state,
        cash: state.cash - cost,
        inventory: { ...state.inventory, [drugId]: existingQty + qty },
        costBasis: { ...state.costBasis, [drugId]: newAvgBasis },
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
      const newCostBasis = { ...state.costBasis };
      if (inv[drugId] <= 0) {
        delete inv[drugId];
        delete newCostBasis[drugId];
      }
      return {
        ...state,
        cash: state.cash + revenue,
        inventory: inv,
        costBasis: newCostBasis,
        log: [{ day: state.day, text: `Sold ${qty}× ${drugName(drugId)} @ ${fmt(p.price)} in ${cityName(state.city)}.`, kind: 'sell' }, ...state.log].slice(0, 60),
      };
    }

    case 'TRAVEL': {
      const newDay = state.day + 1;
      if (newDay > DW_CONFIG.totalDays) return endGame(state, 'win');
      const newCity = action.cityId;

      const prices = {};
      DW_CITIES.forEach(c => {
        prices[c.id] = generatePrices(newDay, c.id, DW_DRUGS);
      });

      const history = { ...state.priceHistory };
      if (!history[state.city]) history[state.city] = {};
      DW_DRUGS.forEach(d => {
        const arr = history[state.city][d.id] || [];
        arr.push(state.prices[state.city][d.id].price);
        history[state.city][d.id] = arr.slice(-14);
      });

      const newDebt = Math.round(state.debt * (1 + DW_CONFIG.debtInterest));
      const newBank = Math.round(state.bank * (1 + DW_CONFIG.bankInterest));
      const newHeat = Math.max(0, state.heat - 5);

      const messages = [...state.messages];
      if (Math.random() < 0.6) {
        const t = MESSAGE_BANK[Math.floor(Math.random() * MESSAGE_BANK.length)];
        const text = t.text.replace('{day}', newDay).replace('{debt}', fmt(newDebt));
        messages.unshift({ from: t.from, tag: t.tag, text, day: newDay, read: false });
      }

      const base = {
        ...state,
        day: newDay,
        city: newCity,
        prices,
        priceHistory: history,
        debt: newDebt,
        bank: newBank,
        heat: newHeat,
        messages: messages.slice(0, 30),
        pendingEvent: null,
        log: [{ day: newDay, text: `Flew to ${cityName(newCity)}. Day ${newDay} of ${DW_CONFIG.totalDays}.`, kind: 'travel' }, ...state.log].slice(0, 60),
      };

      // Granny visit takes priority over random events
      if (state.grannyDays.includes(newDay)) {
        return { ...base, screen: 'granny' };
      }

      if (Math.random() < DW_CONFIG.eventProbability) {
        const ev = pickWeightedEvent();
        return { ...base, pendingEvent: ev, screen: 'event' };
      }

      return { ...base, screen: 'endOfDay' };
    }

    case 'RESOLVE_EVENT': {
      const newState = applyConsequence(state, action.consequence);
      if (newState.screen === 'stripped') return newState;
      return { ...newState, pendingEvent: null, screen: 'endOfDay' };
    }

    case 'BUY_GRANNY': {
      const { item, price } = action;
      if (state.cash < price) return state;
      switch (item) {
        case 'backpack': {
          const newTier = state.backpackTier + 1;
          const newCap = DW_CONFIG.baseCapacity + newTier * 50;
          return {
            ...state,
            cash: state.cash - price,
            backpackTier: newTier,
            trenchCapacity: newCap,
            log: [{ day: state.day, text: `Granny's bag upgrade: +50 slots. Capacity now ${newCap}.`, kind: 'good' }, ...state.log].slice(0, 60),
          };
        }
        case 'gun':
          return {
            ...state,
            cash: state.cash - price,
            hasGun: true,
            log: [{ day: state.day, text: `Granny slid a piece across the table. 'One use, sweetie.'`, kind: 'good' }, ...state.log].slice(0, 60),
          };
        case 'copProtection':
          return {
            ...state,
            cash: state.cash - price,
            hasCopProtection: true,
            log: [{ day: state.day, text: `Granny handed you the badge. 'Flash it once. Then it's gone.'`, kind: 'good' }, ...state.log].slice(0, 60),
          };
        default:
          return state;
      }
    }

    case 'BORROW_SHARK': {
      const { amount } = action;
      const debtAdded = Math.round(amount * 1.1);
      const fromStripped = state.screen === 'stripped';
      return {
        ...state,
        cash: state.cash + amount,
        debt: state.debt + debtAdded,
        screen: fromStripped ? 'market' : state.screen,
        strippedReason: fromStripped ? null : state.strippedReason,
        log: [{ day: state.day, text: `Borrowed ${fmt(amount)} from the Shark. Debt +${fmt(debtAdded)}.`, kind: 'bad' }, ...state.log].slice(0, 60),
      };
    }

    case 'GOTO':
      return { ...state, screen: action.screen };

    case 'MARK_READ':
      return { ...state, messages: state.messages.map(m => ({ ...m, read: true })) };

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
      return { ...makeInitialState(), ...action.state };

    default:
      return state;
  }
}

function endGame(state, how) {
  const netWorth = state.cash + state.bank - state.debt;
  const verdict = netWorth > 50000 ? 'legend' : netWorth > 10000 ? 'baller' : netWorth > 0 ? 'survivor' : 'broke';
  return { ...state, screen: 'gameover', gameOver: { how, netWorth, verdict } };
}

function stripped(state, reason) {
  return {
    ...state,
    cash: 0,
    inventory: {},
    costBasis: {},
    heat: 0,
    pendingEvent: null,
    screen: 'stripped',
    strippedReason: reason,
    log: [{ day: state.day, text: reason, kind: 'bad' }, ...state.log].slice(0, 60),
  };
}

function applyConsequence(state, key) {
  switch (key) {

    case 'loseCashOrStash': {
      const loss = Math.round(state.cash * 0.5);
      const newInv = { ...state.inventory };
      Object.keys(newInv).forEach(id => {
        const taken = Math.floor(newInv[id] * 0.25);
        newInv[id] = newInv[id] - taken;
        if (newInv[id] <= 0) delete newInv[id];
      });
      return {
        ...state,
        cash: state.cash - loss,
        inventory: newInv,
        health: Math.max(0, state.health - 10),
        log: [{ day: state.day, text: `Handed it over. Lost ${fmt(loss)} and a quarter of the stash.`, kind: 'bad' }, ...state.log],
      };
    }

    case 'fightMugger': {
      if (state.hasGun) {
        return {
          ...state,
          hasGun: false,
          log: [{ day: state.day, text: `You pulled the piece. Mugger bolted. Dropped the gun in the scramble — it's gone.`, kind: 'ok' }, ...state.log],
        };
      }
      if (Math.random() > 0.45) {
        return {
          ...state,
          health: Math.max(0, state.health - 25),
          log: [{ day: state.day, text: `Beat them back. Cracked rib. Nothing taken.`, kind: 'ok' }, ...state.log],
        };
      }
      return stripped(state, `Jumped and beaten. Lost everything.`);
    }

    case 'copCompliance': {
      if (state.hasCopProtection) {
        return {
          ...state,
          hasCopProtection: false,
          heat: Math.max(0, state.heat + 5),
          log: [{ day: state.day, text: `Flashed the badge. Cop nodded and walked. It's gone now.`, kind: 'ok' }, ...state.log],
        };
      }
      if (getLoad(state.inventory) > 0) {
        return stripped(state, `Cops found the stash. Everything confiscated.`);
      }
      return {
        ...state,
        heat: state.heat + 15,
        log: [{ day: state.day, text: `Clean pockets. Cops let you walk. Heat +15.`, kind: 'ok' }, ...state.log],
      };
    }

    case 'copFlee': {
      if (state.hasCopProtection) {
        return {
          ...state,
          hasCopProtection: false,
          heat: Math.max(0, state.heat + 10),
          log: [{ day: state.day, text: `Flashed the badge mid-chase. Cop stood down. Card's burned.`, kind: 'ok' }, ...state.log],
        };
      }
      if (Math.random() > 0.5) {
        return {
          ...state,
          heat: state.heat + 30,
          log: [{ day: state.day, text: `Lost them. For now. Heat +30.`, kind: 'ok' }, ...state.log],
        };
      }
      if (getLoad(state.inventory) > 0) {
        return stripped(state, `Caught. Cuffed. Everything confiscated.`);
      }
      const fine = Math.min(state.cash, 1500);
      return {
        ...state,
        cash: state.cash - fine,
        heat: state.heat + 40,
        log: [{ day: state.day, text: `Caught clean. ${fmt(fine)} fine. Heat +40.`, kind: 'bad' }, ...state.log],
      };
    }

    case 'friendDeal': {
      if (Math.random() > 0.4) {
        const affordable = DW_DRUGS.filter(d => d.max > 500);
        const drug = affordable[Math.floor(Math.random() * affordable.length)];
        const qty = 5;
        const space = state.trenchCapacity - getLoad(state.inventory);
        const actual = Math.min(qty, space);
        const cost = Math.round(drug.min * 0.6 * actual);
        if (cost > state.cash) {
          return { ...state, log: [{ day: state.day, text: `Couldn't afford the deal anyway.`, kind: 'ok' }, ...state.log] };
        }
        const existingQty = state.inventory[drug.id] || 0;
        const existingBasis = state.costBasis[drug.id] || 0;
        const unitCost = actual > 0 ? cost / actual : 0;
        const newBasis = existingQty > 0
          ? (existingQty * existingBasis + actual * unitCost) / (existingQty + actual)
          : unitCost;
        return {
          ...state,
          cash: state.cash - cost,
          inventory: { ...state.inventory, [drug.id]: existingQty + actual },
          costBasis: { ...state.costBasis, [drug.id]: newBasis },
          log: [{ day: state.day, text: `Got ${actual}× ${drug.name} at 40% off.`, kind: 'good' }, ...state.log],
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
      const affordable = DW_DRUGS.filter(d => d.tier !== 'low');
      const drug = affordable[Math.floor(Math.random() * affordable.length)];
      const qty = 3 + Math.floor(Math.random() * 5);
      const space = state.trenchCapacity - getLoad(state.inventory);
      const actual = Math.min(qty, space);
      return {
        ...state,
        inventory: { ...state.inventory, [drug.id]: (state.inventory[drug.id] || 0) + actual },
        heat: state.heat + 5,
        log: [{ day: state.day, text: `Found ${actual}× ${drug.name}. Felony.`, kind: 'good' }, ...state.log],
      };
    }

    case 'payHurricane':
      return {
        ...state,
        cash: state.cash - 800,
        log: [{ day: state.day, text: `Last flight out. -${fmt(800)}.`, kind: 'ok' }, ...state.log],
      };

    case 'skipDay':
      return {
        ...state,
        debt: Math.round(state.debt * (1 + DW_CONFIG.debtInterest)),
        log: [{ day: state.day, text: `Stuck an extra day. Debt grew.`, kind: 'bad' }, ...state.log],
      };

    case 'borrowShark':
      return {
        ...state,
        cash: state.cash + 5000,
        debt: state.debt + 5500,
        log: [{ day: state.day, text: `Borrowed ${fmt(5000)}. Owe ${fmt(5500)}. Smile.`, kind: 'bad' }, ...state.log],
      };

    case 'none':
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
function drugOf(id)   { return DW_DRUGS.find(d => d.id === id); }
function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '$0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 10000)   return `${sign}$${Math.round(abs / 1000)}k`;
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
  grannyItemPrice, makeGrannyDays, pickWeightedEvent,
});
