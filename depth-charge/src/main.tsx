import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Audio } from './audio/sonar';
import { loadMuted } from './state/persist';

// Self-hosted fonts — bundled, no runtime CDN dependency.
import '@fontsource/chakra-petch/400.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-mono/700.css';

// Seed the audio engine's mute state before the first render.
Audio.setInitialMute(loadMuted());

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
