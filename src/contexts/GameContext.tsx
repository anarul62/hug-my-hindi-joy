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
  const flyingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  phaseRef.current = phase;
  balanceRef.current = balance;
  multiplierRef.current = multiplier;

  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const sndWin = useRef<HTMLAudioElement | null>(null);
  const sndCrash = useRef<HTMLAudioElement | null>(null);

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

  // Game loop
  useEffect(() => {
    generateCrashPoint();
    setMultiplier(1.0);
    setPhase("waiting");
    startWaitingCountdown();

    // Wait 5s then start flying
    setTimeout(() => {
      if (phaseRef.current !== "waiting") return;
      setPhase("flying");
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "flying") return;

    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const speed = prev < 2 ? 0.02 : prev < 5 ? 0.04 : 0.08;
        const next = parseFloat((prev + speed + Math.random() * speed).toFixed(2));
        if (next >= crashPoint.current) {
          // CRASH
          setPhase("crashed");
          sndCrash.current?.play().catch(() => {});

          // Lose un-cashed bets
          setBets(() => [null, null]);

          setCrashHistory((h) => [crashPoint.current, ...h].slice(0, 20));

          // Next round after 5s
          setTimeout(() => {
            generateCrashPoint();
            setMultiplier(1.0);
            setPhase("waiting");
            startWaitingCountdown();
            setTimeout(() => {
              setPhase("flying");
            }, 5000);
          }, 5000);

          return crashPoint.current;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [phase]);

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
