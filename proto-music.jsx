// ═══════════════════════════════════════════════════════════
// proto-music.jsx — persistent music player bar
// ═══════════════════════════════════════════════════════════

const TRACKS = [
  { file: 'Neon Gated Snare.mp3',     title: 'Running from the Feds' },
  { file: 'Neon Gated Snare (1).mp3', title: 'Trenchcoat Full of Feelings' },
  { file: 'Neon Gated Snare (2).mp3', title: 'The Loan Shark Mambo' },
  { file: 'Neon Gated Snare (3).mp3', title: "Granny's Neon Night" },
  { file: 'Neon Gated Snare (4).mp3', title: 'Heat Wave (Miami Vice Squad)' },
  { file: 'Neon Gated Snare (5).mp3', title: 'Last Flight to Nowhere' },
];

function trackUrl(file) {
  return file.replace(/ /g, '%20');
}

function MusicPlayer({ muted, onMuteToggle }) {
  const [trackIdx, setTrackIdx] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [coverArt, setCoverArt] = React.useState(null);
  const audioRef = React.useRef(null);

  const track = TRACKS[trackIdx];

  // Auto-advance on track end
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setTrackIdx(i => (i + 1) % TRACKS.length);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  // Change track
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = trackUrl(track.file);
    audio.muted = muted;
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [trackIdx]);

  // Sync mute
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Load cover art via jsmediatags
  React.useEffect(() => {
    setCoverArt(null);
    if (typeof jsmediatags === 'undefined') return;
    try {
      jsmediatags.read(trackUrl(track.file), {
        onSuccess: (tag) => {
          const pic = tag.tags.picture;
          if (!pic) return;
          let str = '';
          for (let i = 0; i < pic.data.length; i++) str += String.fromCharCode(pic.data[i]);
          setCoverArt(`data:${pic.format};base64,${btoa(str)}`);
        },
        onError: () => {},
      });
    } catch (e) {}
  }, [trackIdx]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      DWAudio.stopAmbient();
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const skip = (dir) => setTrackIdx(i => (i + dir + TRACKS.length) % TRACKS.length);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 52,
      zIndex: 60,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 10px',
      background: 'rgba(10,1,24,0.95)',
      borderBottom: `1px solid ${DW.magenta}44`,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: `0 2px 20px rgba(0,0,0,0.4)`,
    }}>
      <audio ref={audioRef} />

      {/* Album art */}
      <div style={{
        width: 36, height: 36, borderRadius: 4, flexShrink: 0,
        overflow: 'hidden', background: `${DW.magenta}22`,
        border: `1px solid ${DW.magenta}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: playing ? `0 0 10px ${DW.magenta}88` : 'none',
        transition: 'box-shadow 300ms',
      }}>
        {coverArt
          ? <img src={coverArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 18 }}>🎵</span>
        }
      </div>

      {/* Controls */}
      <MusicBtn onClick={() => skip(-1)} title="Previous">⏮</MusicBtn>
      <MusicBtn onClick={togglePlay} highlight={playing} title={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶'}
      </MusicBtn>
      <MusicBtn onClick={() => skip(1)} title="Next">⏭</MusicBtn>

      {/* Track name — scrolling marquee */}
      <div style={{
        flex: 1, overflow: 'hidden', position: 'relative',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}>
        <div style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          fontFamily: DW.display, fontWeight: 700,
          fontSize: 11, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          animation: playing ? 'dw-marquee 14s linear infinite' : 'none',
          paddingLeft: playing ? 0 : 4,
        }}>
          {playing ? `${track.title}  ·  ${track.title}  ·  ` : track.title}
        </div>
        {!playing && (
          <div style={{
            fontFamily: DW.mono, fontSize: 9,
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginTop: 2, paddingLeft: 4,
          }}>{trackIdx + 1} / {TRACKS.length}</div>
        )}
      </div>

      {/* Track counter when playing */}
      {playing && (
        <div style={{
          fontFamily: DW.mono, fontSize: 9,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
          flexShrink: 0,
        }}>{trackIdx + 1}/{TRACKS.length}</div>
      )}

      {/* Mute */}
      <MusicBtn onClick={onMuteToggle} title={muted ? 'Unmute' : 'Mute'}>
        {muted ? '🔇' : '🔊'}
      </MusicBtn>
    </div>
  );
}

function MusicBtn({ children, onClick, highlight, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: highlight ? `${DW.magenta}33` : 'transparent',
        border: `1px solid ${highlight ? DW.magenta : 'rgba(255,255,255,0.18)'}`,
        color: '#fff', width: 28, height: 28, borderRadius: 4,
        fontSize: 13, cursor: 'pointer', padding: 0, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: highlight ? `0 0 10px ${DW.magenta}77` : 'none',
        transition: 'all 150ms',
      }}
    >{children}</button>
  );
}

Object.assign(window, { MusicPlayer, TRACKS });
