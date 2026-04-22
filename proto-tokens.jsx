// tokens.jsx
// ═══════════════════════════════════════════════════════════
// Miami vaporwave design tokens
const DW = {
  // Core palette — hot pink, cyan, deep night, sunset gradients
  ink: '#0a0118',          // darkest night
  night: '#14052a',        // deep purple-black
  violet: '#2a0d4e',       // grape
  magenta: '#ff2ea6',      // hot pink / primary
  magentaHot: '#ff47b3',
  cyan: '#00e5ff',         // electric cyan / secondary
  cyanIce: '#7cf7ff',
  lime: '#c7ff1f',         // acid accent (spike/hot item)
  sunset: '#ff7e3d',       // orange
  gold: '#ffcf3a',         // warning
  sand: '#ffe5d9',         // cream (soft text on dark)
  off: '#f4f0ff',          // near-white
  danger: '#ff3366',
  good: '#39ffb0',

  // Gradients
  gradSunset: 'linear-gradient(180deg, #ff47b3 0%, #ff7e3d 55%, #ffcf3a 100%)',
  gradOcean:  'linear-gradient(180deg, #1b0a3e 0%, #3e1780 40%, #ff2ea6 100%)',
  gradNight:  'linear-gradient(180deg, #0a0118 0%, #1b0a3e 60%, #3e1780 100%)',
  gradScreen: 'linear-gradient(160deg, #14052a 0%, #2a0d4e 100%)',
  gradChrome: 'linear-gradient(180deg, #fff 0%, #e0d8ff 40%, #a89cd4 60%, #fff 100%)',

  // Type
  display: '"Monument Extended", "Syne", system-ui, sans-serif',
  heading: '"Syne", system-ui, sans-serif',
  body: '"Space Grotesk", system-ui, sans-serif',
  mono: '"Space Mono", ui-monospace, monospace',
  pixel: '"VT323", ui-monospace, monospace',

  // Shadows / glows
  glowMagenta: '0 0 24px rgba(255,46,166,0.6), 0 0 48px rgba(255,46,166,0.3)',
  glowCyan: '0 0 24px rgba(0,229,255,0.6), 0 0 48px rgba(0,229,255,0.3)',
  glowLime: '0 0 16px rgba(199,255,31,0.6)',
  innerCard: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)',
};

// Drug roster — original + modern additions
const DW_DRUGS = [
  { id: 'weed',     name: 'Weed',      emoji: '🌿', min: 300,   max: 900,   tier: 'low',    tag: 'green' },
  { id: 'acid',     name: 'Acid',      emoji: '💊', min: 1000,  max: 4500,  tier: 'mid',    tag: 'rainbow' },
  { id: 'shrooms',  name: 'Shrooms',   emoji: '🍄', min: 600,   max: 1800,  tier: 'mid',    tag: 'earth' },
  { id: 'mdma',     name: 'Molly',     emoji: '💎', min: 900,   max: 3200,  tier: 'mid',    tag: 'cyan' },
  { id: 'coke',     name: 'Cocaine',   emoji: '❄️', min: 12000, max: 28000, tier: 'high',   tag: 'white' },
  { id: 'ket',      name: 'Ketamine',  emoji: '🧪', min: 1500,  max: 4200,  tier: 'mid',    tag: 'pink' },
  { id: 'xan',      name: 'Xanax',     emoji: '🪄', min: 80,    max: 400,   tier: 'low',    tag: 'bar' },
  { id: 'heroin',   name: 'Heroin',    emoji: '🥄', min: 5000,  max: 14000, tier: 'high',   tag: 'brown' },
  { id: 'fent',     name: 'Fentanyl',  emoji: '☠️', min: 20000, max: 90000, tier: 'high',   tag: 'skull' },
  { id: 'ludes',    name: 'Ludes',     emoji: '💤', min: 10,    max: 60,    tier: 'low',    tag: 'retro' },
  { id: 'carts',    name: 'THC Carts', emoji: '🪫', min: 40,    max: 180,   tier: 'low',    tag: 'vape' },
  { id: 'ozempic',  name: 'Ozempic',   emoji: '💉', min: 900,   max: 2400,  tier: 'mid',    tag: 'chem' },
];

const DW_CITIES = [
  { id: 'nyc',    name: 'New York',    code: 'NYC', tz: 'EST',  temp: 34,  mood: 'neon rain',       accent: '#ff2ea6' },
  { id: 'la',     name: 'Los Angeles', code: 'LAX', tz: 'PST',  temp: 72,  mood: 'palm shadows',    accent: '#ff7e3d' },
  { id: 'mia',    name: 'Miami',       code: 'MIA', tz: 'EST',  temp: 86,  mood: 'chrome sunset',   accent: '#ff47b3' },
  { id: 'ber',    name: 'Berlin',      code: 'BER', tz: 'CET',  temp: 48,  mood: 'concrete rave',   accent: '#00e5ff' },
  { id: 'tyo',    name: 'Tokyo',       code: 'HND', tz: 'JST',  temp: 58,  mood: 'shibuya drift',   accent: '#c7ff1f' },
  { id: 'mex',    name: 'Mexico City', code: 'MEX', tz: 'CST',  temp: 68,  mood: 'smoke & gold',    accent: '#ffcf3a' },
];

Object.assign(window, { DW, DW_DRUGS, DW_CITIES });


// ═══════════════════════════════════════════════════════════
