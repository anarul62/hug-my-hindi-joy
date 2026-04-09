import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";

type GamePhase = "waiting" | "flying" | "crashed";

type Bet = {
  amount: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
};

type GameContextType = {
  phase: GamePhase;
  multiplier: number;
  balance: number;
  bets: [Bet | null, Bet | null];
  placeBet: (panelIndex: 0 | 1, amount: number) => void;
  cashOut: (panelIndex: 0 | 1) => void;
  crashHistory: number[];
  nextCrashPoint: number;
  waitingCountdown: number;
};

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
};

// Use a single BroadcastChannel + leader election so only one tab drives the game loop
const CHANNEL_NAME = "aviator_game_sync";
const LEADER_KEY = "aviator_leader";
const STATE_KEY = "aviator_state";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [balance, setBalance] = useState(5000);
  const [bets, setBets] = useState<[Bet | null, Bet | null]>([null, null]);
  const [crashHistory, setCrashHistory] = useState<number[]>([2.45, 1.12, 5.67, 1.89, 3.21, 10.5, 1.05, 2.78, 1.44, 7.32]);
  const [waitingCountdown, setWaitingCountdown] = useState(5);
  const [nextCrashPointState, setNextCrashPointState] = useState(0);
  const crashPoint = useRef(0);
  const crashedRef = useRef(false);
  const phaseRef = useRef(phase);
  const balanceRef = useRef(balance);
  const multiplierRef = useRef(multiplier);
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLeader = useRef(false);
  const tabId = useRef(Math.random().toString(36).slice(2));
  const channelRef = useRef<BroadcastChannel | null>(null);

  phaseRef.current = phase;
  balanceRef.current = balance;
  multiplierRef.current = multiplier;

  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const sndWin = useRef<HTMLAudioElement | null>(null);
  const sndCrash = useRef<HTMLAudioElement | null>(null);

  // Broadcast current state to other tabs
  const broadcastState = useCallback((p: GamePhase, m: number, cp: number, hist?: number[]) => {
    const state = { phase: p, multiplier: m, crashPoint: cp, history: hist };
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      channelRef.current?.postMessage({ type: "state", ...state });
    } catch {}
  }, []);

  // Audio setup
  useEffect(() => {
    bgMusic.current = new Audio("https://www.tbgameloader.com/800/v37/home/static/media/bg_music.eed9358.mp3");
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;
    sndWin.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3");
    sndCrash.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3");
    const startMusic = () => {
      bgMusic.current?.play().catch(() => {});
      document.removeEventListener("click", startMusic);
    };
    document.addEventListener("click", startMusic);
    return () => document.removeEventListener("click", startMusic);
  }, []);

  const generateCrashPoint = useCallback(() => {
    const r = Math.random();
    let cp = r < 0.02 ? 1.0 : parseFloat((1 / (1 - r)).toFixed(2));
    if (cp > 30) cp = 30;
    crashPoint.current = cp;
    crashedRef.current = false;
    setNextCrashPointState(cp);
    return cp;
  }, []);

  const startWaitingCountdown = useCallback(() => {
    setWaitingCountdown(5);
    if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
    const start = Date.now();
    waitingTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, 5 - elapsed);
      setWaitingCountdown(parseFloat(remaining.toFixed(1)));
      if (remaining <= 0 && waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
      }
    }, 100);
  }, []);

  // Leader election + listener setup
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    // Try to become leader
    const existingLeader = localStorage.getItem(LEADER_KEY);
    if (!existingLeader) {
      localStorage.setItem(LEADER_KEY, tabId.current);
      isLeader.current = true;
    } else {
      isLeader.current = false;
      // Load existing state from leader
      try {
        const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
        if (saved.crashPoint) {
          crashPoint.current = saved.crashPoint;
          setNextCrashPointState(saved.crashPoint);
        }
        if (saved.phase) setPhase(saved.phase);
        if (saved.multiplier) setMultiplier(saved.multiplier);
      } catch {}
    }

    // Listen for state updates from leader
    channel.onmessage = (e) => {
      if (isLeader.current) return; // Leader doesn't listen
      const { type, phase: p, multiplier: m, crashPoint: cp, history } = e.data;
      if (type === "state") {
        if (p) setPhase(p);
        if (m !== undefined) setMultiplier(m);
        if (cp) {
          crashPoint.current = cp;
          crashedRef.current = false;
          setNextCrashPointState(cp);
        }
        if (history) setCrashHistory(history);
      } else if (type === "leader_lost") {
        // Leader closed, try to become leader
        localStorage.setItem(LEADER_KEY, tabId.current);
        isLeader.current = true;
      }
    };

    // Cleanup: if this tab is leader, release leadership
    const cleanup = () => {
      if (isLeader.current) {
        localStorage.removeItem(LEADER_KEY);
        try { channel.postMessage({ type: "leader_lost" }); } catch {}
      }
      channel.close();
    };
    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  // Game loop — only runs if leader
  useEffect(() => {
    if (!isLeader.current) return;
    const cp = generateCrashPoint();
    setMultiplier(1.0);
    setPhase("waiting");
    startWaitingCountdown();
    broadcastState("waiting", 1.0, cp);

    setTimeout(() => {
      if (phaseRef.current !== "waiting") return;
      setPhase("flying");
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flying phase — only leader runs the multiplier loop
  useEffect(() => {
    if (phase !== "flying") return;
    if (!isLeader.current) return;

    broadcastState("flying", 1.0, crashPoint.current);

    const interval = setInterval(() => {
      if (crashedRef.current) return;

      setMultiplier((prev) => {
        if (crashedRef.current) return prev;
        const speed = prev < 2 ? 0.02 : prev < 5 ? 0.04 : 0.08;
        const next = parseFloat((prev + speed + Math.random() * speed).toFixed(2));
        if (next >= crashPoint.current) {
          if (crashedRef.current) return prev;
          crashedRef.current = true;
          clearInterval(interval);

          const crashAt = crashPoint.current;
          setPhase("crashed");
          sndCrash.current?.play().catch(() => {});
          setBets(() => [null, null]);
          setCrashHistory((h) => {
            const newHist = [crashAt, ...h].slice(0, 20);
            broadcastState("crashed", crashAt, crashAt, newHist);
            return newHist;
          });

          setTimeout(() => {
            const newCp = generateCrashPoint();
            setMultiplier(1.0);
            setPhase("waiting");
            startWaitingCountdown();
            broadcastState("waiting", 1.0, newCp);
            setTimeout(() => {
              if (phaseRef.current === "waiting") {
                setPhase("flying");
              }
            }, 5000);
          }, 5000);

          return crashAt;
        }
        broadcastState("flying", next, crashPoint.current);
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [phase, generateCrashPoint, startWaitingCountdown, broadcastState]);

  const placeBet = useCallback((panelIndex: 0 | 1, amount: number) => {
    if (balanceRef.current < amount) return;
    setBalance((b) => b - amount);
    setBets((prev) => {
      const next = [...prev] as [Bet | null, Bet | null];
      next[panelIndex] = { amount, cashedOut: false, cashoutMultiplier: null };
      return next;
    });
  }, []);

  const cashOut = useCallback((panelIndex: 0 | 1) => {
    setBets((prev) => {
      const bet = prev[panelIndex];
      if (!bet || bet.cashedOut) return prev;
      const winnings = parseFloat((bet.amount * multiplierRef.current).toFixed(2));
      setBalance((b) => b + winnings);
      sndWin.current?.play().catch(() => {});
      const next = [...prev] as [Bet | null, Bet | null];
      next[panelIndex] = { ...bet, cashedOut: true, cashoutMultiplier: multiplierRef.current };
      return next;
    });
  }, []);

  return (
    <GameContext.Provider value={{ phase, multiplier, balance, bets, placeBet, cashOut, crashHistory, nextCrashPoint: nextCrashPointState, waitingCountdown }}>
      {children}
    </GameContext.Provider>
  );
};
