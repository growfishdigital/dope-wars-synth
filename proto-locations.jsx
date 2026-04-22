// locations.jsx
// ═══════════════════════════════════════════════════════════
// Painterly SVG illustrations for each city — used as phone wallpaper / backdrop.
// Each one is a fullscreen-portrait composition (viewBox 402x874 to match iPhone).

function MiamiScene() {
  return (
    <svg viewBox="0 0 402 874" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mia-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0b4a"/>
          <stop offset="0.35" stopColor="#ff2ea6"/>
          <stop offset="0.6" stopColor="#ff7e3d"/>
          <stop offset="0.85" stopColor="#ffcf3a"/>
          <stop offset="1" stopColor="#ff47b3"/>
        </linearGradient>
        <radialGradient id="mia-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1cc"/>
          <stop offset="0.5" stopColor="#ffcf3a"/>
          <stop offset="1" stopColor="#ff7e3d" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="mia-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff47b3"/>
          <stop offset="1" stopColor="#1a0540"/>
        </linearGradient>
      </defs>
      {/* sky */}
      <rect width="402" height="600" fill="url(#mia-sky)"/>
      {/* sun */}
      <circle cx="201" cy="360" r="130" fill="url(#mia-sun)"/>
      <g stroke="#2a0b4a" strokeWidth="2" opacity="0.85">
        <line x1="80" y1="400" x2="322" y2="400"/>
        <line x1="70" y1="420" x2="332" y2="420"/>
        <line x1="60" y1="440" x2="342" y2="440"/>
        <line x1="50" y1="460" x2="352" y2="460"/>
      </g>
      {/* distant buildings */}
      <g opacity="0.55">
        <rect x="10" y="470" width="26" height="130" fill="#6b1d7a"/>
        <rect x="42" y="440" width="30" height="160" fill="#7a1f8a"/>
        <rect x="78" y="460" width="22" height="140" fill="#5a1870"/>
        <rect x="320" y="450" width="28" height="150" fill="#7a1f8a"/>
        <rect x="354" y="470" width="36" height="130" fill="#5a1870"/>
      </g>
      {/* main skyline */}
      <g>
        <rect x="0" y="500" width="60" height="100" fill="#1a0540"/>
        <rect x="60" y="470" width="44" height="130" fill="#2a0b4a"/>
        <rect x="104" y="510" width="30" height="90" fill="#1a0540"/>
        <rect x="134" y="450" width="50" height="150" fill="#2a0b4a"/>
        <rect x="184" y="490" width="36" height="110" fill="#14052a"/>
        <rect x="220" y="430" width="56" height="170" fill="#2a0b4a"/>
        <rect x="276" y="480" width="30" height="120" fill="#1a0540"/>
        <rect x="306" y="460" width="40" height="140" fill="#2a0b4a"/>
        <rect x="346" y="500" width="56" height="100" fill="#14052a"/>
        {/* palm left */}
        <rect x="28" y="380" width="6" height="220" fill="#14052a"/>
        <g fill="#14052a">
          <path d="M31 380 Q 10 360 -5 375 Q 15 355 31 380"/>
          <path d="M31 380 Q 52 360 70 375 Q 50 355 31 380"/>
          <path d="M31 380 Q 5 385 -10 405 Q 18 378 31 380"/>
          <path d="M31 380 Q 58 385 75 400 Q 48 378 31 380"/>
          <path d="M31 380 Q 20 350 22 330 Q 32 360 31 380"/>
        </g>
        {/* palm right */}
        <rect x="368" y="360" width="7" height="240" fill="#14052a"/>
        <g fill="#14052a">
          <path d="M371 360 Q 348 340 332 356 Q 356 332 371 360"/>
          <path d="M371 360 Q 396 340 412 358 Q 392 330 371 360"/>
          <path d="M371 360 Q 344 368 328 388 Q 360 360 371 360"/>
          <path d="M371 360 Q 400 368 414 386 Q 390 360 371 360"/>
          <path d="M371 360 Q 362 330 368 312 Q 372 340 371 360"/>
        </g>
        {/* windows lit */}
        <g fill="#ffcf3a" opacity="0.9">
          <rect x="70" y="480" width="3" height="3"/><rect x="76" y="480" width="3" height="3"/>
          <rect x="70" y="492" width="3" height="3"/><rect x="82" y="498" width="3" height="3"/>
          <rect x="142" y="460" width="3" height="3"/><rect x="148" y="470" width="3" height="3"/>
          <rect x="160" y="485" width="3" height="3"/><rect x="170" y="500" width="3" height="3"/>
          <rect x="230" y="442" width="3" height="3"/><rect x="240" y="455" width="3" height="3"/>
          <rect x="252" y="465" width="3" height="3"/><rect x="262" y="478" width="3" height="3"/>
          <rect x="312" y="475" width="3" height="3"/><rect x="322" y="485" width="3" height="3"/>
        </g>
        <g fill="#ff47b3" opacity="0.8">
          <rect x="90" y="490" width="3" height="3"/><rect x="148" y="490" width="3" height="3"/>
          <rect x="240" y="470" width="3" height="3"/><rect x="310" y="490" width="3" height="3"/>
        </g>
      </g>
      {/* water */}
      <rect x="0" y="600" width="402" height="274" fill="url(#mia-water)"/>
      {/* sun reflection */}
      <g opacity="0.45" fill="#ffcf3a">
        <rect x="180" y="608" width="42" height="3"/>
        <rect x="170" y="620" width="62" height="4"/>
        <rect x="160" y="636" width="82" height="4"/>
        <rect x="150" y="656" width="102" height="5"/>
        <rect x="140" y="680" width="122" height="5"/>
        <rect x="130" y="710" width="142" height="6"/>
        <rect x="120" y="744" width="162" height="7"/>
      </g>
      {/* grain */}
      <g opacity="0.08">
        {Array.from({length: 120}).map((_, i) => (
          <circle key={i} cx={(i*37)%402} cy={(i*61)%874} r="0.7" fill="#fff"/>
        ))}
      </g>
    </svg>
  );
}

function NYCScene() {
  return (
    <svg viewBox="0 0 402 874" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="nyc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0118"/>
          <stop offset="0.5" stopColor="#2a0d4e"/>
          <stop offset="1" stopColor="#ff2ea6"/>
        </linearGradient>
        <linearGradient id="nyc-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0d4e" stopOpacity="0"/>
          <stop offset="1" stopColor="#ff2ea6" stopOpacity="0.35"/>
        </linearGradient>
      </defs>
      <rect width="402" height="874" fill="url(#nyc-sky)"/>
      {/* moon */}
      <circle cx="320" cy="170" r="44" fill="#f4f0ff" opacity="0.95"/>
      <circle cx="332" cy="160" r="40" fill="#2a0d4e"/>
      {/* clouds */}
      <g fill="#ff47b3" opacity="0.25">
        <ellipse cx="80" cy="180" rx="70" ry="10"/>
        <ellipse cx="200" cy="230" rx="110" ry="8"/>
      </g>
      {/* far skyline */}
      <g opacity="0.35" fill="#1b0540">
        <rect x="0" y="480" width="40" height="200"/>
        <rect x="38" y="460" width="26" height="220"/>
        <rect x="62" y="500" width="34" height="180"/>
        <rect x="94" y="450" width="30" height="230"/>
        <rect x="124" y="470" width="40" height="210"/>
        <rect x="162" y="440" width="36" height="240"/>
        <rect x="196" y="480" width="26" height="200"/>
        <rect x="220" y="430" width="34" height="250"/>
        <rect x="252" y="470" width="30" height="210"/>
        <rect x="280" y="450" width="40" height="230"/>
        <rect x="318" y="480" width="34" height="200"/>
        <rect x="350" y="460" width="52" height="220"/>
      </g>
      {/* main skyscrapers */}
      <g fill="#0a0118">
        <rect x="0" y="440" width="50" height="300"/>
        <rect x="50" y="380" width="40" height="360"/>
        <rect x="90" y="420" width="30" height="320"/>
        <rect x="120" y="340" width="54" height="400"/>
        <polygon points="147,340 174,340 174,310 160,290 147,310"/>
        <rect x="174" y="400" width="32" height="340"/>
        <rect x="206" y="360" width="50" height="380"/>
        <rect x="256" y="420" width="34" height="320"/>
        <rect x="290" y="370" width="44" height="370"/>
        <polygon points="312,370 316,280 320,370"/>
        <rect x="334" y="410" width="30" height="330"/>
        <rect x="364" y="440" width="38" height="300"/>
      </g>
      {/* warm windows */}
      <g fill="#ffcf3a">
        {Array.from({length: 70}).map((_, i) => {
          const x = 4 + (i*11) % 394;
          const y = 400 + ((i*31) % 330);
          const w = 2 + (i%2);
          return <rect key={i} x={x} y={y} width={w} height="2.5" opacity={0.5 + (i%3)*0.15}/>;
        })}
      </g>
      <g fill="#00e5ff">
        {Array.from({length: 24}).map((_, i) => {
          const x = 8 + (i*19) % 390;
          const y = 420 + ((i*47) % 280);
          return <rect key={i} x={x} y={y} width="2" height="2" opacity="0.8"/>;
        })}
      </g>
      {/* neon sign */}
      <g>
        <rect x="90" y="540" width="70" height="14" fill="#ff2ea6" opacity="0.9"/>
        <text x="94" y="551" fontFamily="VT323, monospace" fontSize="13" fill="#fff">OPEN 24HRS</text>
      </g>
      {/* rain streaks */}
      <g stroke="#ff47b3" strokeWidth="0.6" opacity="0.25">
        {Array.from({length: 40}).map((_, i) => {
          const x = (i*23) % 402;
          const y = (i*37) % 874;
          return <line key={i} x1={x} y1={y} x2={x-6} y2={y+18}/>;
        })}
      </g>
      {/* foreground street glow */}
      <rect x="0" y="740" width="402" height="134" fill="url(#nyc-fog)"/>
      {/* puddle reflections */}
      <g opacity="0.45" fill="#ffcf3a">
        <rect x="40" y="800" width="80" height="2"/>
        <rect x="160" y="820" width="120" height="2"/>
        <rect x="300" y="810" width="60" height="2"/>
      </g>
    </svg>
  );
}

function LAScene() {
  return (
    <svg viewBox="0 0 402 874" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="la-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e1780"/>
          <stop offset="0.4" stopColor="#ff47b3"/>
          <stop offset="0.75" stopColor="#ff7e3d"/>
          <stop offset="1" stopColor="#ffcf3a"/>
        </linearGradient>
      </defs>
      <rect width="402" height="700" fill="url(#la-sky)"/>
      {/* sun */}
      <circle cx="280" cy="400" r="90" fill="#fff1cc" opacity="0.9"/>
      {/* mountain ridge */}
      <path d="M0 520 L40 500 L80 520 L120 480 L170 510 L210 470 L260 500 L310 460 L360 490 L402 480 L402 700 L0 700 Z" fill="#5a1870" opacity="0.85"/>
      <path d="M0 560 L60 540 L110 560 L160 520 L220 550 L280 520 L340 550 L402 540 L402 700 L0 700 Z" fill="#3e1780"/>
      {/* palm trees silhouette cluster */}
      {[50, 110, 180, 260, 330].map((x, i) => (
        <g key={i} fill="#1a0540">
          <rect x={x-2} y="380" width="4" height="240"/>
          <path d={`M${x} 380 Q ${x-22} 362 ${x-38} 376 Q ${x-16} 356 ${x} 380`}/>
          <path d={`M${x} 380 Q ${x+22} 362 ${x+38} 376 Q ${x+16} 356 ${x} 380`}/>
          <path d={`M${x} 380 Q ${x-20} 386 ${x-36} 402 Q ${x-14} 380 ${x} 380`}/>
          <path d={`M${x} 380 Q ${x+20} 386 ${x+36} 402 Q ${x+14} 380 ${x} 380`}/>
          <path d={`M${x} 380 Q ${x-2} 356 ${x-4} 340 Q ${x+1} 360 ${x} 380`}/>
        </g>
      ))}
      {/* low buildings */}
      <g fill="#1a0540">
        <rect x="0" y="580" width="80" height="120"/>
        <rect x="78" y="560" width="50" height="140"/>
        <rect x="128" y="590" width="60" height="110"/>
        <rect x="188" y="570" width="90" height="130"/>
        <rect x="278" y="600" width="40" height="100"/>
        <rect x="318" y="570" width="84" height="130"/>
      </g>
      {/* HOLLYWOOD-style letters */}
      <g fill="#f4f0ff" fontFamily="Monument Extended, Syne, sans-serif" fontSize="22" fontWeight="800" letterSpacing="4">
        <text x="66" y="504">VENICE</text>
      </g>
      {/* road */}
      <rect x="0" y="700" width="402" height="174" fill="#14052a"/>
      <g stroke="#ff47b3" strokeWidth="3" strokeDasharray="22 18" opacity="0.9">
        <line x1="200" y1="710" x2="200" y2="874"/>
      </g>
      {/* road edge glow */}
      <rect x="0" y="700" width="402" height="4" fill="#ff7e3d" opacity="0.8"/>
      {/* palm shadow on ground */}
      <g opacity="0.3" fill="#ff47b3">
        <ellipse cx="50" cy="700" rx="20" ry="3"/>
        <ellipse cx="180" cy="700" rx="22" ry="3"/>
        <ellipse cx="330" cy="700" rx="20" ry="3"/>
      </g>
      {/* windows */}
      <g fill="#ffcf3a">
        <rect x="10" y="610" width="3" height="3"/>
        <rect x="30" y="620" width="3" height="3"/>
        <rect x="90" y="590" width="3" height="3"/>
        <rect x="200" y="600" width="3" height="3"/>
        <rect x="230" y="620" width="3" height="3"/>
        <rect x="340" y="590" width="3" height="3"/>
      </g>
    </svg>
  );
}

function BerlinScene() {
  return (
    <svg viewBox="0 0 402 874" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="ber-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0118"/>
          <stop offset="0.7" stopColor="#14052a"/>
          <stop offset="1" stopColor="#2a0d4e"/>
        </linearGradient>
        <radialGradient id="ber-spot" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#00e5ff" stopOpacity="0.35"/>
          <stop offset="1" stopColor="#00e5ff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="402" height="874" fill="url(#ber-sky)"/>
      <rect width="402" height="500" fill="url(#ber-spot)"/>
      {/* TV Tower */}
      <g fill="#14052a">
        <rect x="196" y="100" width="10" height="520"/>
        <circle cx="201" cy="240" r="38" fill="#1b0540" stroke="#00e5ff" strokeWidth="1.2"/>
        <polygon points="199,100 203,100 204,60 200,40 198,60"/>
        <rect x="200" y="38" width="2" height="10" fill="#ff2ea6"/>
      </g>
      {/* ball highlights */}
      <g fill="#00e5ff" opacity="0.6">
        <rect x="185" y="228" width="30" height="1.5"/>
        <rect x="185" y="240" width="30" height="1.5"/>
        <rect x="185" y="252" width="30" height="1.5"/>
      </g>
      {/* concrete blocks */}
      <g fill="#1b0540">
        <rect x="0" y="520" width="140" height="240"/>
        <rect x="260" y="520" width="142" height="240"/>
        <rect x="0" y="440" width="70" height="320"/>
        <rect x="332" y="440" width="70" height="320"/>
      </g>
      {/* graffiti / color block walls */}
      <g>
        <rect x="20" y="620" width="60" height="30" fill="#ff2ea6"/>
        <rect x="20" y="650" width="60" height="30" fill="#00e5ff"/>
        <rect x="20" y="680" width="60" height="30" fill="#c7ff1f"/>
        <text x="28" y="705" fontFamily="VT323, monospace" fontSize="18" fill="#0a0118">BERGHAIN</text>
      </g>
      {/* spray tag */}
      <g stroke="#ff2ea6" strokeWidth="3" fill="none" opacity="0.95">
        <path d="M290 610 Q 310 590 330 610 L 340 620 M 350 600 L 370 620"/>
      </g>
      {/* windows grid */}
      <g fill="#00e5ff" opacity="0.55">
        {Array.from({length: 24}).map((_, i) => {
          const row = Math.floor(i / 6);
          const col = i % 6;
          return <rect key={i} x={275 + col*18} y={540 + row*32} width="8" height="14"/>;
        })}
      </g>
      <g fill="#ffcf3a" opacity="0.7">
        {Array.from({length: 18}).map((_, i) => {
          const row = Math.floor(i / 6);
          const col = i % 6;
          return <rect key={i} x={8 + col*18} y={460 + row*28} width="6" height="10"/>;
        })}
      </g>
      {/* street */}
      <rect x="0" y="760" width="402" height="114" fill="#0a0118"/>
      <g stroke="#c7ff1f" strokeWidth="1" opacity="0.5" strokeDasharray="12 8">
        <line x1="0" y1="790" x2="402" y2="790"/>
      </g>
      {/* tram wire */}
      <line x1="0" y1="520" x2="402" y2="520" stroke="#2a0d4e" strokeWidth="0.5"/>
      <line x1="0" y1="480" x2="402" y2="480" stroke="#2a0d4e" strokeWidth="0.5"/>
      {/* laser */}
      <line x1="60" y1="874" x2="340" y2="140" stroke="#ff2ea6" strokeWidth="1" opacity="0.5"/>
      <line x1="340" y1="874" x2="60" y2="140" stroke="#00e5ff" strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}

function TokyoScene() {
  return (
    <svg viewBox="0 0 402 874" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="tyo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0118"/>
          <stop offset="0.5" stopColor="#2a0d4e"/>
          <stop offset="1" stopColor="#5a0a40"/>
        </linearGradient>
      </defs>
      <rect width="402" height="874" fill="url(#tyo-sky)"/>
      {/* moon */}
      <circle cx="70" cy="130" r="36" fill="#ffe5d9" opacity="0.9"/>
      {/* buildings packed tight */}
      <g fill="#0a0118">
        <rect x="0" y="280" width="46" height="500"/>
        <rect x="46" y="240" width="34" height="540"/>
        <rect x="80" y="310" width="40" height="470"/>
        <rect x="120" y="200" width="52" height="580"/>
        <rect x="172" y="260" width="36" height="520"/>
        <rect x="208" y="220" width="44" height="560"/>
        <rect x="252" y="290" width="32" height="490"/>
        <rect x="284" y="240" width="48" height="540"/>
        <rect x="332" y="300" width="36" height="480"/>
        <rect x="368" y="260" width="34" height="520"/>
      </g>
      {/* vertical neon kanji signs — placeholder glyphs */}
      {[
        { x: 14, y: 300, color: '#ff2ea6', chars: ['東','京','酒'] },
        { x: 130, y: 230, color: '#00e5ff', chars: ['夜','食','堂'] },
        { x: 220, y: 250, color: '#c7ff1f', chars: ['薬','局'] },
        { x: 296, y: 270, color: '#ffcf3a', chars: ['渋','谷'] },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width="18" height={s.chars.length*26 + 10} fill="#14052a" stroke={s.color} strokeWidth="1"/>
          {s.chars.map((c, j) => (
            <text key={j} x={s.x+9} y={s.y + 22 + j*26} textAnchor="middle"
              fontFamily="Noto Sans JP, system-ui" fontSize="18" fontWeight="700" fill={s.color}>{c}</text>
          ))}
        </g>
      ))}
      {/* horizontal signs */}
      <rect x="54" y="420" width="24" height="80" fill="#14052a" stroke="#ff47b3" strokeWidth="1"/>
      <rect x="62" y="430" width="8" height="8" fill="#ff47b3"/>
      <rect x="62" y="444" width="8" height="8" fill="#ff47b3"/>
      <rect x="62" y="458" width="8" height="8" fill="#ff47b3"/>
      {/* windows warm */}
      <g fill="#ffcf3a">
        {Array.from({length: 80}).map((_, i) => {
          const x = 4 + (i*13) % 396;
          const y = 320 + ((i*41) % 380);
          const size = 1 + (i%2);
          return <rect key={i} x={x} y={y} width={size} height={size+0.5} opacity={0.6 + (i%3)*0.12}/>;
        })}
      </g>
      <g fill="#00e5ff">
        {Array.from({length: 40}).map((_, i) => (
          <rect key={i} x={(i*19)%398} y={280 + (i*47)%420} width="1.2" height="1.2" opacity="0.85"/>
        ))}
      </g>
      {/* telephone poles */}
      <g stroke="#14052a" strokeWidth="2" fill="none">
        <line x1="100" y1="500" x2="100" y2="820"/>
        <line x1="300" y1="500" x2="300" y2="820"/>
        <line x1="0" y1="560" x2="402" y2="540"/>
        <line x1="0" y1="580" x2="402" y2="560"/>
        <line x1="0" y1="600" x2="402" y2="580"/>
      </g>
      {/* street wet */}
      <rect x="0" y="780" width="402" height="94" fill="#1a0540"/>
      <g fill="#ff2ea6" opacity="0.4">
        <rect x="30" y="820" width="40" height="1.5"/>
        <rect x="100" y="810" width="60" height="1.5"/>
        <rect x="200" y="830" width="80" height="1.5"/>
        <rect x="310" y="820" width="50" height="1.5"/>
      </g>
    </svg>
  );
}

function MexicoCityScene() {
  return (
    <svg viewBox="0 0 402 874" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mex-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0b4a"/>
          <stop offset="0.4" stopColor="#ff47b3"/>
          <stop offset="0.75" stopColor="#ff7e3d"/>
          <stop offset="1" stopColor="#ffcf3a"/>
        </linearGradient>
      </defs>
      <rect width="402" height="700" fill="url(#mex-sky)"/>
      {/* sun */}
      <circle cx="140" cy="320" r="70" fill="#fff1cc" opacity="0.95"/>
      {/* distant volcano */}
      <path d="M0 450 L 80 380 L 120 410 L 160 360 L 200 340 L 240 370 L 280 350 L 340 400 L 402 380 L 402 700 L 0 700 Z" fill="#5a1870"/>
      <path d="M180 340 L200 328 L215 338" fill="#f4f0ff" opacity="0.8"/>
      {/* pyramid silhouette */}
      <g fill="#1a0540">
        <polygon points="60,520 140,520 130,480 70,480"/>
        <polygon points="70,480 130,480 120,440 80,440"/>
        <polygon points="80,440 120,440 112,410 88,410"/>
        <polygon points="88,410 112,410 100,390"/>
      </g>
      {/* colorful buildings (Coyoacán palette) */}
      <g>
        <rect x="0" y="520" width="70" height="180" fill="#ff2ea6"/>
        <rect x="70" y="540" width="60" height="160" fill="#c7ff1f"/>
        <rect x="130" y="510" width="80" height="190" fill="#ff7e3d"/>
        <rect x="210" y="530" width="56" height="170" fill="#00e5ff"/>
        <rect x="266" y="510" width="70" height="190" fill="#ffcf3a"/>
        <rect x="336" y="540" width="66" height="160" fill="#ff47b3"/>
      </g>
      {/* window cutouts */}
      <g fill="#1a0540">
        <rect x="14" y="560" width="14" height="18"/>
        <rect x="34" y="560" width="14" height="18"/>
        <rect x="14" y="600" width="14" height="18"/>
        <rect x="34" y="600" width="14" height="18"/>
        <rect x="82" y="580" width="14" height="18"/>
        <rect x="102" y="580" width="14" height="18"/>
        <rect x="145" y="550" width="16" height="22"/>
        <rect x="170" y="550" width="16" height="22"/>
        <rect x="145" y="600" width="16" height="22"/>
        <rect x="170" y="600" width="16" height="22"/>
        <rect x="222" y="570" width="14" height="18"/>
        <rect x="242" y="570" width="14" height="18"/>
        <rect x="280" y="550" width="14" height="22"/>
        <rect x="304" y="550" width="14" height="22"/>
        <rect x="280" y="600" width="14" height="22"/>
        <rect x="304" y="600" width="14" height="22"/>
        <rect x="350" y="580" width="14" height="18"/>
        <rect x="374" y="580" width="14" height="18"/>
      </g>
      {/* bunting / papel picado */}
      <g>
        <path d="M0 460 Q 100 490 200 460 T 402 460" stroke="#f4f0ff" strokeWidth="1" fill="none"/>
        {Array.from({length: 14}).map((_, i) => {
          const colors = ['#ff2ea6','#c7ff1f','#00e5ff','#ffcf3a','#ff7e3d'];
          return <rect key={i} x={i*30} y={464 + Math.sin(i)*4} width="20" height="16" fill={colors[i%5]}/>;
        })}
      </g>
      {/* cathedral */}
      <g fill="#1a0540">
        <rect x="172" y="480" width="58" height="60"/>
        <polygon points="172,480 230,480 220,460 182,460"/>
        <rect x="178" y="440" width="10" height="40"/>
        <rect x="214" y="440" width="10" height="40"/>
        <circle cx="201" cy="478" r="5" fill="#ffcf3a"/>
      </g>
      <g fill="#ffcf3a">
        <rect x="180" y="444" width="6" height="6"/>
        <rect x="216" y="444" width="6" height="6"/>
      </g>
      {/* street */}
      <rect x="0" y="700" width="402" height="174" fill="#14052a"/>
      <g fill="#ff2ea6" opacity="0.4">
        <rect x="20" y="740" width="80" height="2"/>
        <rect x="180" y="760" width="120" height="2"/>
      </g>
    </svg>
  );
}

const DW_SCENES = {
  mia: MiamiScene,
  nyc: NYCScene,
  la: LAScene,
  ber: BerlinScene,
  tyo: TokyoScene,
  mex: MexicoCityScene,
};

function CityScene({ id, style = {} }) {
  const Cmp = DW_SCENES[id] || MiamiScene;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <Cmp />
    </div>
  );
}

Object.assign(window, { CityScene, DW_SCENES, MiamiScene, NYCScene, LAScene, BerlinScene, TokyoScene, MexicoCityScene });


// ═══════════════════════════════════════════════════════════
