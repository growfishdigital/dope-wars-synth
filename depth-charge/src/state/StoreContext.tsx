import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type { AppState, Action } from './actions';
import { reducer, initialState } from './store';
import { loadMeta, saveMeta, loadMuted, saveMuted } from './persist';

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initialState(loadMeta(), loadMuted()),
  );

  // Persist meta whenever it changes.
  const lastMeta = useRef(state.meta);
  useEffect(() => {
    if (state.meta !== lastMeta.current) {
      lastMeta.current = state.meta;
      saveMeta(state.meta);
    }
  }, [state.meta]);

  // Persist mute preference.
  useEffect(() => {
    saveMuted(state.muted);
  }, [state.muted]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
