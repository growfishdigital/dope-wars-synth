// ═══════════════════════════════════════════════════════════
// proto-screens.jsx — all game screens
// ═══════════════════════════════════════════════════════════

// ── Intro ──────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: DW.gradNight, overflow: 'hidden',
    }}>
      <CityScene id="mia" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.3) 0%, rgba(10,1,24,0.5) 40%, rgba(10,1,24,0.95) 100%)',
      }}/>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 120,
        textAlign: 'center', padding: '0 28px', zIndex: 5,
      }}>
        <div style={{
          fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.3em',
          color: DW.cyan, opacity: 0.8, marginBottom: 8,
          textTransform: 'uppercase',
        }}>1986 · A NEW GAME</div>
        <div style={{
          fontFamily: DW.display, fontWeight: 800, fontSize: 56,
          lineHeight: 0.9, color: '#fff',
          textShadow: `0 0 30px ${DW.magenta}, 0 0 60px ${DW.magenta}88, 0 4px 0 ${DW.violet}`,
          letterSpacing: '-0.02em', marginBottom: 14,
          textTransform: 'uppercase',
        }}>Dope<br/>Wars</div>
        <div style={{
          fontFamily: DW.body, fontSize: 14, color: 'rgba(255,255,255,0.7)',
          marginBottom: 28, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
          lineHeight: 1.4,
        }}>
          30 days. 6 cities. A trenchcoat full of contraband and a loanshark who knows your name.
        </div>
        <NeonBtn color={DW.lime} onClick={() => { DWAudio.confirm(); DWAudio.startAmbient(); onStart(); }}>
          ▸ Start Running
        </NeonBtn>
      </div>

      {/* palm silhouette */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(0deg, #0a0118, transparent)',
      }}/>
    </div>
  );
}

// ── Market Screen ──────────────────────────────────────────
function MarketScreen({ state, dispatch, onOpenTrade, layout = 'list' }) {
  const city = DW_CITIES.find(c => c.id === state.city);
  const prices = state.prices[state.city];

  return (
    <div style={{ position: 'absolute', inset: 0, background: DW.night }}>
      {/* Atmospheric city backdrop, dim */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.22 }}>
        <CityScene id={state.city} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.65) 0%, rgba(10,1,24,0.92) 55%, rgba(10,1,24,0.98) 100%)',
      }}/>

      <HUDBar state={state} />

      <div style={{
        position: 'absolute', top: 112, left: 0, right: 0, bottom: 100,
        overflow: 'auto', padding: '0 12px 20px',
      }}>
        {/* City header */}
        <div style={{
          padding: '8px 4px 14px',
          borderBottom: `1px solid ${city.accent}33`,
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.24em',
            color: city.accent, textTransform: 'uppercase',
          }}>{city.code} · {city.tz} · {city.temp}°F</div>
          <div style={{
            fontFamily: DW.display, fontSize: 28, fontWeight: 800,
            color: '#fff', textShadow: `0 0 18px ${city.accent}`,
            letterSpacing: '-0.01em', textTransform: 'uppercase',
            lineHeight: 1,
          }}>{city.name}</div>
          <div style={{
            fontFamily: DW.body, fontSize: 11, color: 'rgba(255,255,255,0.55)',
            marginTop: 4, fontStyle: 'italic',
          }}>"{city.mood}"</div>
        </div>

        {layout === 'list' && (
          <MarketList state={state} prices={prices} onOpenTrade={onOpenTrade} />
        )}
        {layout === 'grid' && (
          <MarketGrid state={state} prices={prices} onOpenTrade={onOpenTrade} />
        )}
        {layout === 'ticker' && (
          <MarketTicker state={state} prices={prices} onOpenTrade={onOpenTrade} />
        )}
      </div>
    </div>
  );
}

// Market row — list variant (default)
function MarketList({ state, prices, onOpenTrade }) {
  const history = state.priceHistory[state.city] || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {DW_DRUGS.map(drug => {
        const p = prices[drug.id];
        const held = state.inventory[drug.id] || 0;
        const spikeHot = p.spike?.kind === 'spike';
        const spikeCrash = p.spike?.kind === 'crash';
        const color = spikeHot ? DW.lime : spikeCrash ? DW.cyan : '#fff';
        return (
          <button
            key={drug.id}
            onClick={() => { DWAudio.tap(); onOpenTrade(drug.id); }}
            disabled={!p.available}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${spikeHot ? DW.lime+'66' : spikeCrash ? DW.cyan+'66' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 3, cursor: p.available ? 'pointer' : 'not-allowed',
              opacity: p.available ? 1 : 0.35,
              color: '#fff', textAlign: 'left',
              boxShadow: spikeHot ? `0 0 18px ${DW.lime}33, inset 0 0 12px ${DW.lime}11` :
                         spikeCrash ? `0 0 18px ${DW.cyan}33, inset 0 0 12px ${DW.cyan}11` : 'none',
              transition: 'all 150ms',
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1 }}>{drug.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: DW.display, fontWeight: 700, fontSize: 14,
                textTransform: 'uppercase', letterSpacing: '0.02em',
              }}>{drug.name}</div>
              {p.spike ? (
                <div style={{
                  fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.12em',
                  color: spikeHot ? DW.lime : DW.cyan,
                  textTransform: 'uppercase', marginTop: 1,
                  animation: 'dw-pulse 1.6s infinite',
                }}>◉ {p.spike.tag}</div>
              ) : held > 0 ? (
                <div style={{
                  fontFamily: DW.mono, fontSize: 9,
                  color: 'rgba(255,255,255,0.55)', marginTop: 1,
                }}>HOLDING {held}</div>
              ) : (
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: DW.mono, marginTop: 1 }}>—</div>
              )}
            </div>
            <Spark values={history[drug.id]} color={color} />
            <div style={{ textAlign: 'right', minWidth: 60 }}>
              <div style={{
                fontFamily: DW.display, fontWeight: 800, fontSize: 15, color,
                textShadow: (spikeHot || spikeCrash) ? `0 0 10px ${color}` : 'none',
              }}>{fmt(p.price)}</div>
              <div style={{
                fontSize: 8, fontFamily: DW.mono, color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.14em',
              }}>PER UNIT</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Grid variant
function MarketGrid({ state, prices, onOpenTrade }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {DW_DRUGS.map(drug => {
        const p = prices[drug.id];
        const held = state.inventory[drug.id] || 0;
        const spikeHot = p.spike?.kind === 'spike';
        const spikeCrash = p.spike?.kind === 'crash';
        const color = spikeHot ? DW.lime : spikeCrash ? DW.cyan : DW.magenta;
        return (
          <button
            key={drug.id}
            onClick={() => { DWAudio.tap(); onOpenTrade(drug.id); }}
            disabled={!p.available}
            style={{
              padding: 12, background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color}55`, borderRadius: 3,
              cursor: p.available ? 'pointer' : 'not-allowed',
              opacity: p.available ? 1 : 0.35,
              color: '#fff', textAlign: 'left', minHeight: 96,
              boxShadow: (spikeHot || spikeCrash) ? `0 0 16px ${color}44` : 'none',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 22 }}>{drug.emoji}</div>
              {held > 0 && <div style={{
                fontFamily: DW.mono, fontSize: 9, color: DW.magenta,
                background: `${DW.magenta}22`, padding: '2px 6px', borderRadius: 2,
              }}>×{held}</div>}
            </div>
            <div style={{
              fontFamily: DW.display, fontWeight: 700, fontSize: 12,
              textTransform: 'uppercase',
            }}>{drug.name}</div>
            <div style={{
              fontFamily: DW.display, fontWeight: 800, fontSize: 20,
              color, textShadow: `0 0 10px ${color}88`, marginTop: 'auto',
            }}>{fmt(p.price)}</div>
            {p.spike && (
              <div style={{ fontFamily: DW.mono, fontSize: 8, color,
                          textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {spikeHot ? '▲' : '▼'} {p.spike.tag}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Ticker variant — scrolling Bloomberg style
function MarketTicker({ state, prices, onOpenTrade }) {
  const history = state.priceHistory[state.city] || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {DW_DRUGS.map((drug, i) => {
        const p = prices[drug.id];
        const prev = (history[drug.id] || [])[history[drug.id]?.length - 1];
        const change = prev ? ((p.price - prev) / prev * 100) : 0;
        const held = state.inventory[drug.id] || 0;
        const up = change >= 0;
        const color = p.spike?.kind === 'spike' ? DW.lime :
                      p.spike?.kind === 'crash' ? DW.cyan :
                      up ? DW.good : DW.danger;
        return (
          <button
            key={drug.id}
            onClick={() => { DWAudio.tap(); onOpenTrade(drug.id); }}
            disabled={!p.available}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 50px 50px 50px',
              alignItems: 'center', gap: 8,
              padding: '8px 10px',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              color: '#fff', cursor: p.available ? 'pointer' : 'not-allowed',
              opacity: p.available ? 1 : 0.3,
              fontFamily: DW.mono,
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 16 }}>{drug.emoji}</div>
            <div>
              <div style={{
                fontFamily: DW.display, fontSize: 13, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{drug.name}</div>
              {held > 0 && <div style={{ fontSize: 8, color: DW.magenta }}>×{held}</div>}
            </div>
            <div style={{
              fontSize: 13, fontFamily: DW.display, fontWeight: 800,
              color, textAlign: 'right',
            }}>{fmt(p.price)}</div>
            <div style={{
              fontSize: 10, color, textAlign: 'right',
            }}>
              {up ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Spark values={history[drug.id]} color={color} width={42} height={14}/>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Buy/Sell Trade Sheet ───────────────────────────────────
function TradeSheet({ state, dispatch, tradeCtx, onClose }) {
  const [mode, setMode] = React.useState('buy');
  const [qty, setQty] = React.useState(1);

  const id = tradeCtx?.drugId;
  React.useEffect(() => {
    setMode('buy');
    setQty(1);
  }, [id]);

  // Always render (Sheet handles closed state via transform) — but we need drug data
  // Use fallback drug/price when tradeCtx null so hooks stay consistent
  const drug = id ? drugOf(id) : DW_DRUGS[0];
  const p = id ? state.prices[state.city][drug.id] : { price: 0, available: true };
  const held = id ? (state.inventory[drug.id] || 0) : 0;
  const load = getLoad(state.inventory);
  const space = state.trenchCapacity - load;
  const maxBuy = p.price > 0 ? Math.min(space, Math.floor(state.cash / p.price)) : 0;
  const maxSell = held;
  const max = mode === 'buy' ? maxBuy : maxSell;
  const safeQty = Math.min(Math.max(0, qty), max);
  const total = p.price * safeQty;

  // Cost basis & P&L for sell mode
  const basisPerUnit = (state.costBasis && state.costBasis[drug?.id]) || 0;
  const pnlPerUnit = p.price - basisPerUnit;
  const totalPnl = pnlPerUnit * safeQty;
  const isProfitable = pnlPerUnit >= 0;

  const color = p.spike?.kind === 'spike' ? DW.lime :
                p.spike?.kind === 'crash' ? DW.cyan : DW.magenta;

  const exec = () => {
    if (safeQty <= 0 || safeQty > max) return;
    if (mode === 'buy') {
      dispatch({ type: 'BUY', drugId: drug.id, qty: safeQty });
      DWAudio.cashRegister();
    } else {
      dispatch({ type: 'SELL', drugId: drug.id, qty: safeQty });
      DWAudio.cashRegister();
    }
    onClose();
  };

  return (
    <Sheet open={!!tradeCtx} onClose={onClose} color={color}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 14, marginTop: -6,
      }}>
        <div style={{
          fontSize: 42, lineHeight: 1,
          filter: `drop-shadow(0 0 16px ${color})`,
        }}>{drug.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: DW.display, fontWeight: 800, fontSize: 22,
            color: '#fff', textTransform: 'uppercase', lineHeight: 1,
          }}>{drug.name}</div>
          <div style={{
            fontFamily: DW.mono, fontSize: 10,
            color: 'rgba(255,255,255,0.5)', marginTop: 3,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>{cityName(state.city)} · Day {state.day}</div>
          {p.spike && (
            <div style={{
              fontFamily: DW.mono, fontSize: 10,
              color, textTransform: 'uppercase',
              letterSpacing: '0.1em', marginTop: 4,
              animation: 'dw-pulse 1.2s infinite',
            }}>◉ {p.spike.tag} — {p.spike.kind === 'spike' ? 'spiked' : 'crashed'}</div>
          )}
          {mode === 'sell' && basisPerUnit > 0 && (
            <div style={{
              fontFamily: DW.mono, fontSize: 9, marginTop: 4,
              color: isProfitable ? DW.good : DW.danger,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Bought @ {fmt(basisPerUnit)}/unit</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: DW.display, fontSize: 20, fontWeight: 800, color,
            textShadow: `0 0 12px ${color}`,
          }}>{fmt(p.price)}</div>
          <div style={{ fontSize: 8, fontFamily: DW.mono, color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.14em' }}>PER UNIT</div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['buy', 'sell'].map(m => (
          <button
            key={m}
            onClick={() => { DWAudio.tap(); setMode(m); setQty(1); }}
            style={{
              flex: 1, padding: '8px', border: '1px solid',
              borderColor: mode === m ? (m === 'buy' ? DW.lime : DW.magenta) : 'rgba(255,255,255,0.12)',
              background: mode === m ? (m === 'buy' ? DW.lime+'22' : DW.magenta+'22') : 'transparent',
              color: '#fff', fontFamily: DW.display, fontWeight: 700, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 3,
              cursor: 'pointer',
              boxShadow: mode === m ? `0 0 14px ${m === 'buy' ? DW.lime : DW.magenta}55` : 'none',
            }}
          >
            {m === 'buy' ? `Buy (${fmt(state.cash)} cash)` : `Sell (Holding ${held})`}
          </button>
        ))}
      </div>

      {/* Qty */}
      <div style={{ marginBottom: 16 }}>
        <BigSlider
          value={safeQty}
          onChange={setQty}
          min={0}
          max={Math.max(1, max)}
          color={color}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: DW.mono, fontSize: 10, color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <span>0</span>
          <span style={{
            fontFamily: DW.display, fontSize: 28, color: '#fff',
            textShadow: `0 0 14px ${color}`, fontWeight: 800,
          }}>{safeQty}</span>
          <span>MAX {max}</span>
        </div>
      </div>

      {/* Quick qty */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[
          { label: '−10', act: () => setQty(Math.max(0, safeQty - 10)) },
          { label: '−1',  act: () => setQty(Math.max(0, safeQty - 1)) },
          { label: '+1',  act: () => setQty(Math.min(max, safeQty + 1)) },
          { label: '+10', act: () => setQty(Math.min(max, safeQty + 10)) },
          { label: 'MAX', act: () => setQty(max) },
        ].map(b => (
          <button key={b.label} onClick={() => { DWAudio.tap(); b.act(); }}
            style={{
              flex: 1, padding: '6px 0', border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.03)', color: '#fff',
              fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.08em',
              borderRadius: 2, cursor: 'pointer', fontWeight: 700,
            }}
          >{b.label}</button>
        ))}
      </div>

      {/* Preview */}
      <div style={{
        padding: '12px 14px', marginBottom: 16,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}44`, borderRadius: 3,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              fontFamily: DW.mono, fontSize: 9, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>{mode === 'buy' ? 'Total cost' : 'You receive'}</div>
            <div style={{
              fontFamily: DW.display, fontWeight: 800, fontSize: 28, color: '#fff',
              textShadow: `0 0 14px ${mode === 'buy' ? DW.danger : DW.good}`,
            }}>{mode === 'buy' ? '−' : '+'}{fmtFull(total)}</div>
            {mode === 'sell' && basisPerUnit > 0 && safeQty > 0 && (
              <div style={{
                fontFamily: DW.display, fontWeight: 700, fontSize: 14, marginTop: 4,
                color: isProfitable ? DW.good : DW.danger,
                textShadow: `0 0 10px ${isProfitable ? DW.good : DW.danger}`,
              }}>
                {isProfitable ? '▲' : '▼'} {isProfitable ? '+' : ''}{fmtFull(totalPnl)} P&amp;L
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: DW.mono, fontSize: 9, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>After</div>
            <div style={{ fontFamily: DW.display, fontWeight: 700, fontSize: 16, color: DW.lime }}>
              {fmtFull(mode === 'buy' ? state.cash - total : state.cash + total)}
            </div>
            <div style={{ fontFamily: DW.mono, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              load {mode === 'buy' ? load + safeQty : load - safeQty}/{state.trenchCapacity}
            </div>
          </div>
        </div>
      </div>

      <NeonBtn
        color={mode === 'buy' ? DW.lime : DW.magenta}
        disabled={safeQty <= 0 || safeQty > max}
        onClick={exec}
        style={{ width: '100%' }}
      >
        {mode === 'buy' ? `Buy ${safeQty}× ${drug.name}` : `Sell ${safeQty}× ${drug.name}`}
      </NeonBtn>
    </Sheet>
  );
}

// ── Inventory / Trenchcoat ─────────────────────────────────
function InventoryScreen({ state, dispatch, onOpenTrade }) {
  const load = getLoad(state.inventory);
  const entries = Object.entries(state.inventory).filter(([, q]) => q > 0);
  const inventoryValue = entries.reduce((sum, [id, q]) => {
    const p = state.prices[state.city][id];
    return sum + p.price * q;
  }, 0);

  return (
    <div style={{ position: 'absolute', inset: 0, background: DW.ink }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        <CityScene id={state.city} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.75), rgba(10,1,24,0.98))',
      }}/>

      <HUDBar state={state} />

      <div style={{
        position: 'absolute', top: 112, left: 0, right: 0, bottom: 100,
        padding: '0 16px', overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '4px 0 10px' }}>
          <div style={{
            fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.24em',
            color: DW.magenta, textTransform: 'uppercase',
          }}>TRENCHCOAT · POCKETS OF A LIFE</div>
          <div style={{
            fontFamily: DW.display, fontSize: 28, fontWeight: 800, color: '#fff',
            textShadow: `0 0 14px ${DW.magenta}`, lineHeight: 1,
            textTransform: 'uppercase',
          }}>The Stash</div>
        </div>

        {/* Equipment chips — gun & cop protection */}
        {(state.hasGun || state.hasCopProtection) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {state.hasGun && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: `${DW.danger}22`, border: `1px solid ${DW.danger}88`,
                borderRadius: 20, boxShadow: `0 0 12px ${DW.danger}44`,
              }}>
                <span style={{ fontSize: 16 }}>🔫</span>
                <div>
                  <div style={{ fontFamily: DW.display, fontSize: 11, fontWeight: 700,
                                color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Heat</div>
                  <div style={{ fontFamily: DW.mono, fontSize: 8, color: DW.danger, letterSpacing: '0.1em' }}>ONE USE · BURNS</div>
                </div>
              </div>
            )}
            {state.hasCopProtection && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: `${DW.cyan}22`, border: `1px solid ${DW.cyan}88`,
                borderRadius: 20, boxShadow: `0 0 12px ${DW.cyan}44`,
              }}>
                <span style={{ fontSize: 16 }}>🪪</span>
                <div>
                  <div style={{ fontFamily: DW.display, fontSize: 11, fontWeight: 700,
                                color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badge</div>
                  <div style={{ fontFamily: DW.mono, fontSize: 8, color: DW.cyan, letterSpacing: '0.1em' }}>ONE USE · BURNS</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8, marginBottom: 18,
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.03)', borderRadius: 3,
          border: `1px solid ${DW.magenta}33`,
        }}>
          <div>
            <div style={iStatLabel}>Capacity</div>
            <div style={iStatVal(DW.magenta)}>{load}/{state.trenchCapacity}</div>
          </div>
          <div>
            <div style={iStatLabel}>Value here</div>
            <div style={iStatVal(DW.lime)}>{fmt(inventoryValue)}</div>
          </div>
          <div>
            <div style={iStatLabel}>Health</div>
            <div style={iStatVal(state.health > 60 ? DW.good : state.health > 30 ? DW.gold : DW.danger)}>
              {state.health}%
            </div>
          </div>
        </div>

        {/* Capacity bar */}
        <div style={{
          height: 10, background: 'rgba(255,255,255,0.06)',
          borderRadius: 5, overflow: 'hidden', marginBottom: 20,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: `${Math.min(100, load / state.trenchCapacity * 100)}%`,
            height: '100%',
            background: load > 80 ? `linear-gradient(90deg, ${DW.gold}, ${DW.danger})` :
                                    `linear-gradient(90deg, ${DW.cyan}, ${DW.magenta})`,
            boxShadow: `0 0 12px ${load > 80 ? DW.danger : DW.magenta}`,
            transition: 'width 400ms',
          }}/>
        </div>

        {entries.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            fontFamily: DW.body, color: 'rgba(255,255,255,0.4)',
            fontStyle: 'italic',
          }}>
            Your pockets are empty.<br/>
            <span style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
              Hit the market to start stacking.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(([id, qty]) => {
            const drug = drugOf(id);
            if (!drug) return null;
            const p = state.prices[state.city][id];
            const value = p.price * qty;
            return (
              <button
                key={id}
                onClick={() => { DWAudio.tap(); onOpenTrade(id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3, cursor: 'pointer',
                  color: '#fff', textAlign: 'left',
                }}
              >
                <div style={{
                  fontSize: 26,
                  filter: `drop-shadow(0 0 8px ${DW.magenta}88)`,
                }}>{drug.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: DW.display, fontWeight: 700, fontSize: 14,
                    textTransform: 'uppercase',
                  }}>{drug.name}</div>
                  <div style={{
                    fontFamily: DW.mono, fontSize: 10,
                    color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>×{qty} · worth {fmt(value)} here</div>
                </div>
                <div style={{
                  fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.12em',
                  color: DW.cyan, textTransform: 'uppercase',
                  padding: '4px 8px', border: `1px solid ${DW.cyan}55`,
                  borderRadius: 2,
                }}>Trade</div>
              </button>
            );
          })}
        </div>

        {/* Debt/bank */}
        <div style={{
          marginTop: 20, padding: '12px 14px',
          background: 'rgba(255,48,100,0.06)',
          border: `1px solid ${DW.danger}55`, borderRadius: 3,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={iStatLabel}>🦈 The Shark is Watching</div>
              <div style={{
                fontFamily: DW.display, fontSize: 22, fontWeight: 800, color: DW.danger,
                textShadow: `0 0 12px ${DW.danger}`, marginTop: 4,
              }}>{fmtFull(state.debt)}</div>
              <div style={{ fontFamily: DW.mono, fontSize: 9, color: 'rgba(255,255,255,0.5)',
                            marginTop: 2, letterSpacing: '0.1em' }}>
                +{Math.round(DW_CONFIG.debtInterest*100)}% PER DAY
              </div>
            </div>
            <NeonBtn
              color={DW.danger}
              small
              disabled={state.cash <= 0 || state.debt <= 0}
              onClick={() => {
                const amt = Math.min(state.cash, state.debt);
                dispatch({ type: 'PAY_DEBT', amount: amt });
                DWAudio.cashRegister();
              }}
            >Pay All ({fmt(Math.min(state.cash, state.debt))})</NeonBtn>
          </div>
          {/* Borrow from shark */}
          <div style={{
            paddingTop: 10, borderTop: '1px solid rgba(255,48,100,0.2)',
          }}>
            <div style={{
              fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
              marginBottom: 8,
            }}>Need cash? Borrow (10% added to debt)</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[2000, 5000, 10000, 25000, 50000].map(amt => (
                <button
                  key={amt}
                  onClick={() => { DWAudio.cashRegister(); dispatch({ type: 'BORROW_SHARK', amount: amt }); }}
                  style={{
                    flex: 1, minWidth: 50, padding: '7px 4px',
                    background: 'rgba(255,48,100,0.08)',
                    border: `1px solid ${DW.danger}55`,
                    color: DW.danger, fontFamily: DW.display, fontWeight: 700,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderRadius: 2, cursor: 'pointer',
                  }}
                >{fmt(amt)}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const iStatLabel = {
  fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.14em',
  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
};
const iStatVal = (color) => ({
  fontFamily: DW.display, fontSize: 18, fontWeight: 800,
  color: '#fff', textShadow: `0 0 10px ${color}`, marginTop: 2,
});

// ── Travel / Map ───────────────────────────────────────────
function TravelScreen({ state, dispatch, mapVariant = 'stylized' }) {
  const [selected, setSelected] = React.useState(null);

  const go = () => {
    if (!selected || selected === state.city) return;
    DWAudio.whoosh();
    dispatch({ type: 'TRAVEL', cityId: selected });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: DW.night }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
        <CityScene id={state.city} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.8), rgba(10,1,24,0.98))',
      }}/>

      <HUDBar state={state} />

      <div style={{
        position: 'absolute', top: 112, left: 0, right: 0, bottom: 180,
        padding: '0 16px', overflow: 'auto',
      }}>
        <div style={{ padding: '4px 0 12px' }}>
          <div style={{
            fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.24em',
            color: DW.cyan, textTransform: 'uppercase',
          }}>DEPARTURES · NEXT DAY</div>
          <div style={{
            fontFamily: DW.display, fontSize: 28, fontWeight: 800, color: '#fff',
            textShadow: `0 0 14px ${DW.cyan}`, lineHeight: 1,
            textTransform: 'uppercase',
          }}>Where to?</div>
          <div style={{ fontFamily: DW.body, fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
            Every jump rerolls prices and eats a day. The Shark is counting.
          </div>
        </div>

        {mapVariant === 'stylized' && (
          <TravelStylized state={state} selected={selected} onSelect={setSelected}/>
        )}
        {mapVariant === 'grid' && (
          <TravelGrid state={state} selected={selected} onSelect={setSelected}/>
        )}
        {mapVariant === 'routes' && (
          <TravelRoutes state={state} selected={selected} onSelect={setSelected}/>
        )}
      </div>

      {/* Bottom travel cta */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, right: 0,
        padding: '0 16px', zIndex: 25,
      }}>
        <NeonBtn
          color={DW.cyan}
          disabled={!selected || selected === state.city}
          onClick={go}
          style={{ width: '100%' }}
        >
          {selected && selected !== state.city
            ? `✈ Fly to ${cityName(selected)} · Day ${state.day + 1}`
            : selected === state.city ? 'You are already here' : 'Pick a destination'}
        </NeonBtn>
      </div>
    </div>
  );
}

// Stylized cards variant
function TravelStylized({ state, selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {DW_CITIES.map(city => {
        const here = city.id === state.city;
        const sel = selected === city.id;
        return (
          <button
            key={city.id}
            onClick={() => { DWAudio.tap(); onSelect(city.id); }}
            style={{
              position: 'relative', padding: 0, border: 'none',
              background: 'transparent', cursor: 'pointer',
              height: 120, borderRadius: 4, overflow: 'hidden',
              outline: sel ? `2px solid ${city.accent}` : here ? `1.5px solid ${DW.lime}` : '1px solid rgba(255,255,255,0.1)',
              boxShadow: sel ? `0 0 22px ${city.accent}aa` : 'none',
              transition: 'all 180ms',
              transform: sel ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
              <CityScene id={city.id} />
            </div>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(0deg, rgba(10,1,24,0.9) 0%, rgba(10,1,24,0.2) 60%)`,
            }}/>
            <div style={{
              position: 'absolute', left: 8, bottom: 8, right: 8,
              textAlign: 'left',
            }}>
              <div style={{
                fontFamily: DW.mono, fontSize: 9, color: city.accent,
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>{city.code} · {city.temp}°</div>
              <div style={{
                fontFamily: DW.display, fontSize: 16, fontWeight: 800, color: '#fff',
                textShadow: `0 0 10px ${city.accent}`, lineHeight: 1,
                textTransform: 'uppercase',
              }}>{city.name}</div>
            </div>
            {here && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                padding: '3px 7px', background: `${DW.lime}dd`, color: '#0a0118',
                fontFamily: DW.mono, fontSize: 9, fontWeight: 800,
                letterSpacing: '0.12em', borderRadius: 2,
              }}>YOU ARE HERE</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Grid variant — pure data table
function TravelGrid({ state, selected, onSelect }) {
  // For each city, compute avg price vs current city to hint arbitrage
  const currentPrices = state.prices[state.city];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {DW_CITIES.map(city => {
        const here = city.id === state.city;
        const sel = selected === city.id;
        const prices = state.prices[city.id];
        // pick top 3 deltas for items you're holding
        const holds = Object.keys(state.inventory).filter(k => state.inventory[k] > 0);
        let bestDelta = 0, bestDrug = null;
        holds.forEach(id => {
          const delta = prices[id].price - currentPrices[id].price;
          if (delta > bestDelta) { bestDelta = delta; bestDrug = id; }
        });
        return (
          <button
            key={city.id}
            onClick={() => { DWAudio.tap(); onSelect(city.id); }}
            style={{
              display: 'grid', gridTemplateColumns: '22px 1fr auto 44px',
              alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: sel ? `${city.accent}22` : 'rgba(255,255,255,0.03)',
              border: sel ? `1px solid ${city.accent}` : here ? `1px solid ${DW.lime}88` : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 3, color: '#fff', textAlign: 'left',
              cursor: 'pointer',
              boxShadow: sel ? `0 0 16px ${city.accent}66` : 'none',
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: city.accent, boxShadow: `0 0 10px ${city.accent}`,
            }}/>
            <div>
              <div style={{
                fontFamily: DW.display, fontSize: 15, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.02em',
              }}>{city.name}</div>
              <div style={{
                fontFamily: DW.mono, fontSize: 9, color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>{city.code} · {city.temp}° · {city.mood}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {bestDrug ? (
                <>
                  <div style={{
                    fontFamily: DW.display, fontSize: 13, fontWeight: 800, color: DW.good,
                  }}>+{fmt(bestDelta)}</div>
                  <div style={{
                    fontFamily: DW.mono, fontSize: 8, color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>per {drugOf(bestDrug).name}</div>
                </>
              ) : (
                <div style={{ fontFamily: DW.mono, fontSize: 9, color: 'rgba(255,255,255,0.3)',
                              letterSpacing: '0.1em' }}>—</div>
              )}
            </div>
            <div style={{
              fontFamily: DW.mono, fontSize: 9, color: here ? DW.lime : 'rgba(255,255,255,0.5)',
              textAlign: 'right', letterSpacing: '0.1em',
            }}>{here ? 'HERE' : `→`}</div>
          </button>
        );
      })}
    </div>
  );
}

// Routes variant — airline route lines on a stylized map
function TravelRoutes({ state, selected, onSelect }) {
  // Lay cities on a world-ish map grid (relative coords in %)
  const layout = {
    la:  { x: 12, y: 45 },
    mex: { x: 22, y: 62 },
    nyc: { x: 32, y: 38 },
    mia: { x: 28, y: 58 },
    ber: { x: 58, y: 32 },
    tyo: { x: 86, y: 46 },
  };
  const w = 358, h = 280;
  const here = layout[state.city];
  return (
    <div style={{
      position: 'relative', width: '100%', height: h,
      background: 'rgba(0,229,255,0.04)',
      border: '1px solid rgba(0,229,255,0.18)',
      borderRadius: 4, overflow: 'hidden',
    }}>
      {/* grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="world-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={DW.cyan} strokeWidth="0.5" opacity="0.15"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#world-grid)"/>
        {/* dashed "equator" line */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke={DW.cyan} strokeWidth="0.5" strokeDasharray="4 6" opacity="0.3"/>
        {/* routes */}
        {DW_CITIES.filter(c => c.id !== state.city).map(c => {
          const to = layout[c.id];
          const sel = selected === c.id;
          return (
            <line
              key={c.id}
              x1={`${here.x}%`} y1={`${here.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke={sel ? c.accent : DW.cyan}
              strokeWidth={sel ? 2 : 0.8}
              strokeDasharray={sel ? '0' : '3 4'}
              opacity={sel ? 1 : 0.5}
              style={{ filter: sel ? `drop-shadow(0 0 4px ${c.accent})` : 'none' }}
            />
          );
        })}
      </svg>
      {/* city dots */}
      {DW_CITIES.map(c => {
        const pos = layout[c.id];
        const isHere = c.id === state.city;
        const sel = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => { DWAudio.tap(); onSelect(c.id); }}
            style={{
              position: 'absolute',
              left: `calc(${pos.x}% - 14px)`, top: `calc(${pos.y}% - 14px)`,
              width: 28, height: 28, borderRadius: '50%',
              border: `2px solid ${isHere ? DW.lime : sel ? c.accent : c.accent}`,
              background: sel || isHere ? c.accent : `${c.accent}44`,
              cursor: 'pointer',
              boxShadow: (sel || isHere) ? `0 0 14px ${c.accent}, 0 0 30px ${c.accent}77` : 'none',
              padding: 0, transition: 'all 180ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: DW.mono, fontSize: 9, fontWeight: 800, color: '#0a0118',
            }}
          >
            {isHere ? '●' : ''}
          </button>
        );
      })}
      {/* labels */}
      {DW_CITIES.map(c => {
        const pos = layout[c.id];
        return (
          <div
            key={c.id + '-l'}
            style={{
              position: 'absolute',
              left: `calc(${pos.x}% + 16px)`, top: `calc(${pos.y}% + 4px)`,
              fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.14em',
              color: selected === c.id ? c.accent : 'rgba(255,255,255,0.75)',
              textTransform: 'uppercase', pointerEvents: 'none',
              textShadow: '0 0 4px rgba(0,0,0,0.8)',
            }}
          >{c.code}</div>
        );
      })}
    </div>
  );
}

// ── Events ─────────────────────────────────────────────────
function EventScreen({ state, dispatch }) {
  const ev = state.pendingEvent;
  if (!ev) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: DW.ink,
      overflow: 'hidden',
      animation: 'dw-fadeup 400ms ease-out',
    }}>
      {/* background hazard stripes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(135deg, ${DW.danger}08 0 20px, transparent 20px 40px)`,
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(255,48,100,0.25), transparent 60%)',
      }}/>

      <StatusBar/>

      <div style={{
        position: 'absolute', top: 60, left: 0, right: 0, padding: '20px 24px',
      }}>
        <div style={{
          fontFamily: DW.mono, fontSize: 11, letterSpacing: '0.28em',
          color: DW.danger, textTransform: 'uppercase',
          animation: 'dw-pulse 1.2s infinite',
        }}>◉ INCIDENT · DAY {state.day}</div>
      </div>

      <div style={{
        position: 'absolute', top: '32%', left: 0, right: 0,
        textAlign: 'center', padding: '0 24px',
      }}>
        <div style={{
          fontSize: 80, lineHeight: 1, marginBottom: 16,
          filter: `drop-shadow(0 0 24px ${DW.danger})`,
        }}>{ev.icon}</div>
        <div style={{
          fontFamily: DW.display, fontSize: 34, fontWeight: 800, color: '#fff',
          textShadow: `0 0 16px ${DW.danger}`, lineHeight: 0.95,
          textTransform: 'uppercase', marginBottom: 14,
        }}>{ev.title}</div>
        <div style={{
          fontFamily: DW.body, fontSize: 14, color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.5, maxWidth: 320, margin: '0 auto',
        }}>{ev.body}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        padding: '0 24px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {ev.options.map((opt, i) => (
          <NeonBtn
            key={i}
            color={i === 0 ? DW.magenta : DW.cyan}
            onClick={() => {
              DWAudio.confirm();
              dispatch({ type: 'RESOLVE_EVENT', consequence: opt.consequence });
            }}
            style={{ width: '100%', padding: '16px' }}
          >{opt.label}</NeonBtn>
        ))}
      </div>
    </div>
  );
}

// ── Phone / Messages ───────────────────────────────────────
function PhoneScreen({ state, dispatch }) {
  React.useEffect(() => {
    // Mark all read when they open the phone
    const unread = state.messages.some(m => !m.read);
    if (unread) {
      const t = setTimeout(() => dispatch({ type: 'MARK_READ' }), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Group messages by contact
  const byContact = {};
  state.messages.forEach(m => {
    if (!byContact[m.from]) byContact[m.from] = [];
    byContact[m.from].push(m);
  });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DW.ink }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        <CityScene id={state.city} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.75), rgba(10,1,24,0.98))',
      }}/>

      <HUDBar state={state} />

      <div style={{
        position: 'absolute', top: 112, left: 0, right: 0, bottom: 100,
        padding: '0 16px', overflow: 'auto',
      }}>
        <div style={{ padding: '4px 0 14px' }}>
          <div style={{
            fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.24em',
            color: DW.sunset, textTransform: 'uppercase',
          }}>INBOX · {state.messages.length} MSGS</div>
          <div style={{
            fontFamily: DW.display, fontSize: 28, fontWeight: 800, color: '#fff',
            textShadow: `0 0 14px ${DW.sunset}`, lineHeight: 1,
            textTransform: 'uppercase',
          }}>Messages</div>
        </div>

        {state.messages.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            fontFamily: DW.body, color: 'rgba(255,255,255,0.4)',
            fontStyle: 'italic',
          }}>
            Nobody's pinged you yet.<br/>
            <span style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
              Travel to trigger contacts.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.messages.map((m, i) => {
            const c = CONTACTS[m.from] || { name: m.from, emoji: '👤', color: '#fff' };
            return (
              <div key={i} style={{
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${c.color}33`,
                borderRadius: 3,
                display: 'flex', gap: 10, alignItems: 'flex-start',
                animation: !m.read ? 'dw-fadeup 400ms ease-out' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${c.color}22`, border: `1.5px solid ${c.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                  boxShadow: `0 0 10px ${c.color}66`,
                }}>{c.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{
                      fontFamily: DW.display, fontWeight: 700, fontSize: 13, color: '#fff',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>{c.name}</div>
                    <div style={{ fontFamily: DW.mono, fontSize: 9, color: 'rgba(255,255,255,0.4)',
                                  letterSpacing: '0.1em' }}>D{m.day}</div>
                  </div>
                  <div style={{
                    fontFamily: DW.body, fontSize: 13, color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.4, marginTop: 3,
                  }}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── End of Day Summary ─────────────────────────────────────
function EndOfDayScreen({ state, dispatch }) {
  const [stage, setStage] = React.useState(0);
  React.useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => { setStage(1); DWAudio.tap(); }, 400));
    timers.push(setTimeout(() => { setStage(2); DWAudio.tap(); }, 1000));
    timers.push(setTimeout(() => { setStage(3); DWAudio.cashRegister(); }, 1700));
    return () => timers.forEach(clearTimeout);
  }, []);

  const city = DW_CITIES.find(c => c.id === state.city);
  const recent = state.log.slice(0, 4);
  const netWorth = state.cash + state.bank - state.debt;

  return (
    <div style={{ position: 'absolute', inset: 0, background: DW.ink }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <CityScene id={state.city} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.45) 0%, rgba(10,1,24,0.95) 70%)',
      }}/>

      <StatusBar/>

      <div style={{
        position: 'absolute', top: 60, left: 0, right: 0, bottom: 40,
        padding: '20px 24px', display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Day title */}
        <div style={{ marginBottom: 20, animation: 'dw-fadeup 500ms ease-out' }}>
          <div style={{
            fontFamily: DW.mono, fontSize: 10, letterSpacing: '0.28em',
            color: city.accent, textTransform: 'uppercase',
          }}>DAY {state.day} · {city.code}</div>
          <div style={{
            fontFamily: DW.display, fontSize: 52, fontWeight: 800, color: '#fff',
            textShadow: `0 0 22px ${city.accent}`, lineHeight: 0.9,
            textTransform: 'uppercase', marginTop: 4,
          }}>Touchdown.</div>
          <div style={{ fontFamily: DW.body, fontSize: 13, color: 'rgba(255,255,255,0.6)',
                        marginTop: 8, fontStyle: 'italic' }}>
            The plane taxis. You check the bag. You check the burner. Everything's where it should be.
          </div>
        </div>

        {/* Stat reveal */}
        <div style={{
          padding: '16px 18px', marginBottom: 16,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${DW.lime}55`, borderRadius: 4,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        }}>
          <RevealRow label="Cash on hand" value={fmtFull(state.cash)} color={DW.lime} shown={stage >= 1}/>
          <RevealRow label="Debt" value={fmtFull(state.debt)} color={DW.danger} shown={stage >= 1}/>
          <RevealRow label="Load" value={`${getLoad(state.inventory)} / ${state.trenchCapacity}`} color={DW.magenta} shown={stage >= 2}/>
          <RevealRow label="Heat" value={state.heat} color={DW.gold} shown={stage >= 2}/>
          <div style={{ gridColumn: '1 / span 2',
                        paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <RevealRow
              label="Net worth"
              value={fmtFull(netWorth)}
              color={netWorth >= 0 ? DW.good : DW.danger}
              big
              shown={stage >= 3}
            />
          </div>
        </div>

        {/* Recent log */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
            marginBottom: 8,
          }}>Recent chatter</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recent.map((l, i) => (
              <div key={i} style={{
                fontFamily: DW.mono, fontSize: 11, color: 'rgba(255,255,255,0.7)',
                padding: '4px 0', borderLeft: `2px solid ${logColor(l.kind)}`,
                paddingLeft: 10,
                opacity: stage >= 3 ? 1 : 0,
                transition: `opacity 400ms ${i * 120}ms`,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 6 }}>D{l.day}</span>
                {l.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NeonBtn
            color={DW.lime}
            onClick={() => { DWAudio.confirm(); dispatch({ type: 'GOTO', screen: 'market' }); }}
            style={{ width: '100%' }}
          >▸ Hit the Market</NeonBtn>
          <NeonBtn
            color={DW.cyan}
            ghost
            small
            onClick={() => { DWAudio.tap(); dispatch({ type: 'GOTO', screen: 'phone' }); }}
            style={{ width: '100%' }}
          >Check messages ({state.messages.filter(m => !m.read).length})</NeonBtn>
        </div>
      </div>
    </div>
  );
}

function RevealRow({ label, value, color, shown, big }) {
  return (
    <div style={{
      opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(8px)',
      transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{
        fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.14em',
        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: DW.display, fontSize: big ? 32 : 18, fontWeight: 800,
        color: '#fff', textShadow: `0 0 ${big ? 18 : 10}px ${color}`,
        marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

function logColor(kind) {
  return {
    buy: DW.cyan, sell: DW.lime, travel: DW.magenta,
    good: DW.good, bad: DW.danger, ok: DW.gold, debt: DW.danger,
    intro: DW.cyan,
  }[kind] || DW.magenta;
}

// ── Game Over ──────────────────────────────────────────────
function GameOverScreen({ state, dispatch }) {
  const { how, netWorth, verdict } = state.gameOver || {};
  React.useEffect(() => {
    DWAudio.stopAmbient();
    if (how === 'win') DWAudio.bigWin();
    else DWAudio.lose();
  }, []);
  const lines = {
    legend: { head: 'Legend.', sub: 'The Shark sends flowers. Everyone wants to know your name.' },
    baller: { head: 'You Made Bank.', sub: 'Not retirement money, but close enough to disappear.' },
    survivor: { head: 'Just Barely.', sub: 'You walked out. That\'s more than most.' },
    broke: { head: 'Ate It.', sub: 'The Shark is on the phone. You know what he wants.' },
  };
  const jail = { head: 'Caught.', sub: 'Next sunset will be through bars.' };
  const t = how === 'jail' ? jail : lines[verdict];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(180deg, ${DW.violet}, ${DW.ink} 60%)`,
      overflow: 'hidden',
    }}>
      <CityScene id="mia" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,1,24,0.75), rgba(10,1,24,0.98))',
      }}/>

      <div style={{
        position: 'absolute', top: '20%', left: 0, right: 0,
        textAlign: 'center', padding: '0 24px',
        animation: 'dw-fadeup 700ms ease-out',
      }}>
        <div style={{
          fontFamily: DW.mono, fontSize: 11, letterSpacing: '0.3em',
          color: how === 'jail' ? DW.danger : verdict === 'broke' ? DW.danger : DW.lime,
          textTransform: 'uppercase', marginBottom: 12,
        }}>DAY {state.day} · END OF THE ROAD</div>
        <div style={{
          fontFamily: DW.display, fontSize: 56, fontWeight: 800, color: '#fff',
          textShadow: `0 0 28px ${how === 'jail' || verdict === 'broke' ? DW.danger : DW.lime}`,
          lineHeight: 0.9, textTransform: 'uppercase',
          marginBottom: 16,
        }}>{t.head}</div>
        <div style={{
          fontFamily: DW.body, fontSize: 15, color: 'rgba(255,255,255,0.8)',
          maxWidth: 300, margin: '0 auto', lineHeight: 1.45,
        }}>{t.sub}</div>

        <div style={{
          marginTop: 40, padding: '16px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${DW.magenta}66`, borderRadius: 4,
          maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{ fontFamily: DW.mono, fontSize: 9, letterSpacing: '0.16em',
                        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Final net worth
          </div>
          <div style={{
            fontFamily: DW.display, fontSize: 42, fontWeight: 800,
            color: '#fff',
            textShadow: `0 0 16px ${netWorth >= 0 ? DW.good : DW.danger}`,
            marginTop: 2,
          }}>{fmtFull(netWorth || 0)}</div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 50, left: 0, right: 0,
        padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <NeonBtn color={DW.lime} onClick={() => {
          DWAudio.confirm();
          DWAudio.startAmbient();
          dispatch({ type: 'START_GAME' });
        }} style={{ width: '100%' }}>▸ Run it Back</NeonBtn>
      </div>
    </div>
  );
}

// ── Granny Big Bags ────────────────────────────────────────
function GrannyScreen({ state, dispatch }) {
  const price = grannyItemPrice(state.cash);
  const backpackPrices = DW_CONFIG.grannyBackpackPrices;
  const nextBackpack = backpackPrices[state.backpackTier];
  const canAffordBackpack = nextBackpack != null && state.cash >= nextBackpack;
  const canAffordGun = !state.hasGun && state.cash >= price;
  const canAffordCop = !state.hasCopProtection && state.cash >= price;
  const hasAnything = nextBackpack != null || !state.hasGun || !state.hasCopProtection;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: DW.ink, overflow: 'hidden',
      animation: 'dw-fadeup 400ms ease-out',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${DW.gold}22, transparent 60%)`,
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(45deg, ${DW.gold}06 0 24px, transparent 24px 48px)`,
      }}/>

      <StatusBar/>

      <div style={{
        position: 'absolute', top: 60, left: 0, right: 0, bottom: 0,
        padding: '16px 20px', display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8,
                        filter: `drop-shadow(0 0 20px ${DW.gold})` }}>👵</div>
          <div style={{
            fontFamily: DW.display, fontSize: 34, fontWeight: 800,
            color: '#fff', textShadow: `0 0 18px ${DW.gold}`,
            textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 8,
          }}>Granny<br/>Big Bags</div>
          <div style={{
            fontFamily: DW.body, fontSize: 13, color: 'rgba(255,255,255,0.7)',
            fontStyle: 'italic', maxWidth: 260, margin: '0 auto', lineHeight: 1.4,
          }}>
            "Sweetie, Granny's got what you need. Cash only. No receipt."
          </div>
          <div style={{
            fontFamily: DW.mono, fontSize: 10, color: DW.gold,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8,
          }}>Cash on hand: {fmtFull(state.cash)}</div>
        </div>

        {/* Shop items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>

          {/* Backpack upgrade */}
          {nextBackpack != null && (
            <GrannyItem
              emoji="🎒"
              name={`Backpack Upgrade Tier ${state.backpackTier + 1}`}
              desc={`+50 carry slots (${DW_CONFIG.baseCapacity + (state.backpackTier + 1) * 50} total)`}
              price={nextBackpack}
              color={DW.lime}
              canAfford={canAffordBackpack}
              onBuy={() => {
                DWAudio.cashRegister();
                dispatch({ type: 'BUY_GRANNY', item: 'backpack', price: nextBackpack });
              }}
            />
          )}

          {/* Gun */}
          {!state.hasGun && (
            <GrannyItem
              emoji="🔫"
              name="Heat"
              desc="Scare off muggers — one use, then it's gone"
              price={price}
              color={DW.danger}
              canAfford={canAffordGun}
              onBuy={() => {
                DWAudio.confirm();
                dispatch({ type: 'BUY_GRANNY', item: 'gun', price });
              }}
            />
          )}

          {/* Cop protection */}
          {!state.hasCopProtection && (
            <GrannyItem
              emoji="🪪"
              name="Badge"
              desc="Flash it at a cop stop — one use, disappears after"
              price={price}
              color={DW.cyan}
              canAfford={canAffordCop}
              onBuy={() => {
                DWAudio.confirm();
                dispatch({ type: 'BUY_GRANNY', item: 'copProtection', price });
              }}
            />
          )}

          {!hasAnything && (
            <div style={{
              padding: '30px 20px', textAlign: 'center',
              fontFamily: DW.body, color: 'rgba(255,255,255,0.5)',
              fontStyle: 'italic',
            }}>
              "You've bought everything, sweetie. Come back richer next time."
            </div>
          )}
        </div>

        <NeonBtn
          color={DW.gold}
          onClick={() => { DWAudio.tap(); dispatch({ type: 'GOTO', screen: 'endOfDay' }); }}
          style={{ width: '100%', marginTop: 16 }}
        >Leave Granny</NeonBtn>
      </div>
    </div>
  );
}

function GrannyItem({ emoji, name, desc, price, color, canAfford, onBuy }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: `${color}11`,
      border: `1px solid ${color}66`,
      borderRadius: 4,
      boxShadow: `0 0 18px ${color}22`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          fontSize: 36, lineHeight: 1,
          filter: `drop-shadow(0 0 10px ${color})`,
        }}>{emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: DW.display, fontWeight: 800, fontSize: 16,
            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{name}</div>
          <div style={{
            fontFamily: DW.body, fontSize: 12, color: 'rgba(255,255,255,0.65)',
            marginTop: 2, lineHeight: 1.3,
          }}>{desc}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: DW.display, fontWeight: 800, fontSize: 18,
            color, textShadow: `0 0 10px ${color}`,
          }}>{fmtFull(price)}</div>
        </div>
      </div>
      <NeonBtn
        color={color}
        disabled={!canAfford}
        onClick={onBuy}
        style={{ width: '100%' }}
        small
      >
        {canAfford ? `Buy for ${fmtFull(price)}` : `Need ${fmtFull(price - 0)} (short ${fmtFull(price)})`}
      </NeonBtn>
    </div>
  );
}

// ── Stripped Screen ────────────────────────────────────────
function StrippedScreen({ state, dispatch }) {
  const reason = state.strippedReason || 'Everything gone.';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: DW.ink, overflow: 'hidden',
      animation: 'dw-fadeup 500ms ease-out',
    }}>
      {/* Red hazard stripes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(135deg, ${DW.danger}10 0 20px, transparent 20px 40px)`,
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 20%, ${DW.danger}33, transparent 60%)`,
      }}/>

      <StatusBar/>

      <div style={{
        position: 'absolute', top: 60, left: 0, right: 0, bottom: 0,
        padding: '24px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', overflowY: 'auto',
      }}>
        {/* Icon + headline */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 80, lineHeight: 1, marginBottom: 10,
            filter: `drop-shadow(0 0 24px ${DW.danger})`,
            animation: 'dw-pulse 2s infinite',
          }}>💀</div>
          <div style={{
            fontFamily: DW.mono, fontSize: 11, letterSpacing: '0.32em',
            color: DW.danger, textTransform: 'uppercase', marginBottom: 10,
            animation: 'dw-pulse 1.2s infinite',
          }}>◉ CLEANED OUT · DAY {state.day}</div>
          <div style={{
            fontFamily: DW.display, fontSize: 46, fontWeight: 800, color: '#fff',
            textShadow: `0 0 28px ${DW.danger}`, lineHeight: 0.9,
            textTransform: 'uppercase', marginBottom: 14,
          }}>Cleaned<br/>Out.</div>
          <div style={{
            fontFamily: DW.body, fontSize: 14, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.5, maxWidth: 280,
          }}>{reason}</div>
        </div>

        {/* Stat snapshot */}
        <div style={{
          width: '100%', padding: '14px 16px', marginBottom: 20,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${DW.danger}44`, borderRadius: 4,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          <div>
            <div style={iStatLabel}>Cash left</div>
            <div style={iStatVal(DW.danger)}>{fmtFull(state.cash)}</div>
          </div>
          <div>
            <div style={iStatLabel}>Debt</div>
            <div style={iStatVal(DW.danger)}>{fmtFull(state.debt)}</div>
          </div>
          <div>
            <div style={iStatLabel}>Health</div>
            <div style={iStatVal(state.health > 40 ? DW.gold : DW.danger)}>{state.health}%</div>
          </div>
          <div>
            <div style={iStatLabel}>Days left</div>
            <div style={iStatVal(DW.magenta)}>{DW_CONFIG.totalDays - state.day}</div>
          </div>
        </div>

        {/* Borrow from shark to get back on feet */}
        <div style={{
          width: '100%', padding: '14px 16px', marginBottom: 16,
          background: `${DW.danger}0a`,
          border: `1px solid ${DW.danger}55`, borderRadius: 4,
        }}>
          <div style={{
            fontFamily: DW.display, fontSize: 14, fontWeight: 800,
            color: DW.danger, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 4,
          }}>🦈 Borrow from the Shark</div>
          <div style={{
            fontFamily: DW.body, fontSize: 12, color: 'rgba(255,255,255,0.6)',
            marginBottom: 10, lineHeight: 1.4,
          }}>
            He's already got your number. Might as well put it to use. +10% added to debt.
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[2000, 5000, 10000, 25000, 50000].map(amt => (
              <button
                key={amt}
                onClick={() => { DWAudio.cashRegister(); dispatch({ type: 'BORROW_SHARK', amount: amt }); }}
                style={{
                  flex: 1, minWidth: 50, padding: '8px 4px',
                  background: `${DW.danger}22`,
                  border: `1px solid ${DW.danger}66`,
                  color: DW.danger, fontFamily: DW.display, fontWeight: 700,
                  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em',
                  borderRadius: 2, cursor: 'pointer',
                  boxShadow: `0 0 8px ${DW.danger}33`,
                }}
              >{fmt(amt)}</button>
            ))}
          </div>
        </div>

        <NeonBtn
          color={DW.magenta}
          onClick={() => { DWAudio.confirm(); dispatch({ type: 'GOTO', screen: 'market' }); }}
          style={{ width: '100%' }}
        >▸ Get Back Out There</NeonBtn>
      </div>
    </div>
  );
}

Object.assign(window, {
  IntroScreen, MarketScreen, TradeSheet, InventoryScreen,
  TravelScreen, EventScreen, PhoneScreen, EndOfDayScreen, GameOverScreen,
  GrannyScreen, StrippedScreen,
});
