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

type SyncedGameState = {
  phase: GamePhase;
  multiplier: number;
  crashPoint: number;
  history: number[];
  waitingCountdown: number;
  updatedAt: number;
};

type LeaderState = {
  id: string;
  updatedAt: number;
};

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
};

const CHANNEL_NAME = "aviator_game_sync";
const LEADER_KEY = "aviator_leader";
const STATE_KEY = "aviator_state";
const LEADER_TIMEOUT_MS = 4000;

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Read session from URL params (token, member_account, callback_url, return_url, balance)
  const sessionRef = useRef<{
    token: string;
    memberAccount: string;
    callbackUrl: string;
    returnUrl: string;
  }>({ token: "", memberAccount: "", callbackUrl: "", returnUrl: "" });

  const initialBalance = (() => {
    if (typeof window === "undefined") return 5000;
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token") || "";
      const memberAccount = params.get("member_account") || "";
      const callbackUrl = params.get("callback_url") || "";
      const returnUrl = params.get("return_url") || "";
      const balanceParam = params.get("balance");

      if (token || memberAccount || callbackUrl || returnUrl) {
        sessionRef.current = { token, memberAccount, callbackUrl, returnUrl };
        try {
          localStorage.setItem(
            "aviator_session",
            JSON.stringify(sessionRef.current)
          );
        } catch {}
      } else {
        try {
          const raw = localStorage.getItem("aviator_session");
          if (raw) sessionRef.current = JSON.parse(raw);
        } catch {}
      }

      if (balanceParam !== null && !isNaN(Number(balanceParam))) {
        const b = Number(balanceParam);
        try {
          localStorage.setItem("aviator_balance", String(b));
        } catch {}
        return b;
      }

      try {
        const stored = localStorage.getItem("aviator_balance");
        if (stored !== null && !isNaN(Number(stored))) return Number(stored);
      } catch {}
    } catch {}
    return 5000;
  })();

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [balance, setBalance] = useState(initialBalance);
  const [bets, setBets] = useState<[Bet | null, Bet | null]>([null, null]);
  const [crashHistory, setCrashHistory] = useState<number[]>([2.45, 1.12, 5.67, 1.89, 3.21, 10.5, 1.05, 2.78, 1.44, 7.32]);
  const [waitingCountdown, setWaitingCountdown] = useState(5);
  const [nextCrashPointState, setNextCrashPointState] = useState(0);
  const [leaderState, setLeaderState] = useState(false);

  const crashPoint = useRef(0);
  const crashedRef = useRef(false);
  const phaseRef = useRef(phase);
  const balanceRef = useRef(balance);
  const multiplierRef = useRef(multiplier);
  const crashHistoryRef = useRef(crashHistory);
  const waitingCountdownRef = useRef(waitingCountdown);

  const waitingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const takeoffTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const leaderHeartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLeader = useRef(false);
  const tabId = useRef(Math.random().toString(36).slice(2));
  const channelRef = useRef<BroadcastChannel | null>(null);

  phaseRef.current = phase;
  balanceRef.current = balance;
  multiplierRef.current = multiplier;
  crashHistoryRef.current = crashHistory;
  waitingCountdownRef.current = waitingCountdown;

  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const sndWin = useRef<HTMLAudioElement | null>(null);
  const sndCrash = useRef<HTMLAudioElement | null>(null);

  const clearGameTimers = useCallback(() => {
    if (waitingTimerRef.current) {
      clearInterval(waitingTimerRef.current);
      waitingTimerRef.current = null;
    }
    if (takeoffTimeoutRef.current) {
      clearTimeout(takeoffTimeoutRef.current);
      takeoffTimeoutRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (flyingIntervalRef.current) {
      clearInterval(flyingIntervalRef.current);
      flyingIntervalRef.current = null;
    }
  }, []);

  const readLeaderState = useCallback((): LeaderState | null => {
    try {
      const raw = localStorage.getItem(LEADER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as LeaderState;
      return parsed?.id ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const readSyncedState = useCallback((): SyncedGameState | null => {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SyncedGameState;
    } catch {
      return null;
    }
  }, []);

  const applySyncedState = useCallback((state: Partial<SyncedGameState> | null | undefined) => {
    if (!state) return;

    if (state.phase) {
      setPhase(state.phase);
      crashedRef.current = state.phase === "crashed";
    }

    if (typeof state.multiplier === "number") {
      setMultiplier(state.multiplier);
    }

    if (typeof state.crashPoint === "number") {
      crashPoint.current = state.crashPoint;
      setNextCrashPointState(state.crashPoint);
    }

    if (Array.isArray(state.history)) {
      setCrashHistory(state.history);
    }

    if (typeof state.waitingCountdown === "number") {
      setWaitingCountdown(state.waitingCountdown);
    }
  }, []);

  const createSyncedState = useCallback((overrides: Partial<SyncedGameState> = {}): SyncedGameState => {
    return {
      phase: overrides.phase ?? phaseRef.current,
      multiplier: overrides.multiplier ?? multiplierRef.current,
      crashPoint: overrides.crashPoint ?? crashPoint.current,
      history: overrides.history ?? crashHistoryRef.current,
      waitingCountdown: overrides.waitingCountdown ?? waitingCountdownRef.current,
      updatedAt: Date.now(),
    };
  }, []);

  const broadcastState = useCallback((overrides: Partial<SyncedGameState> = {}) => {
    const state = createSyncedState(overrides);

    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      channelRef.current?.postMessage({ type: "state", ...state });
    } catch {}
  }, [createSyncedState]);

  const writeLeaderHeartbeat = useCallback(() => {
    try {
      localStorage.setItem(
        LEADER_KEY,
        JSON.stringify({ id: tabId.current, updatedAt: Date.now() })
      );
    } catch {}
  }, []);

  const claimLeadership = useCallback(() => {
    if (isLeader.current) return;
    isLeader.current = true;
    setLeaderState(true);
    writeLeaderHeartbeat();
  }, [writeLeaderHeartbeat]);

  const becomeFollower = useCallback(() => {
    if (!isLeader.current && !leaderState) return;
    isLeader.current = false;
    setLeaderState(false);
    clearGameTimers();
  }, [clearGameTimers, leaderState]);

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
    const initialCountdown = 5;
    waitingCountdownRef.current = initialCountdown;
    setWaitingCountdown(initialCountdown);

    if (waitingTimerRef.current) {
      clearInterval(waitingTimerRef.current);
    }

    const start = Date.now();
    waitingTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, initialCountdown - elapsed);
      const nextCountdown = parseFloat(remaining.toFixed(1));

      waitingCountdownRef.current = nextCountdown;
      setWaitingCountdown(nextCountdown);

      if (isLeader.current) {
        broadcastState({
          phase: "waiting",
          multiplier: 1.0,
          crashPoint: crashPoint.current,
          history: crashHistoryRef.current,
          waitingCountdown: nextCountdown,
        });
      }

      if (remaining <= 0 && waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
    }, 100);
  }, [broadcastState]);

  // Persist balance locally
  useEffect(() => {
    try {
      localStorage.setItem("aviator_balance", String(balance));
    } catch {}
  }, [balance]);

  const roundIdRef = useRef<string>("");

  // Generate a new round id at the start of each round (when phase becomes waiting)
  useEffect(() => {
    if (phase === "waiting") {
      roundIdRef.current = `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
  }, [phase]);

  // POST to the platform callback URL with the standard JSON contract
  const callCallback = useCallback(
    async (params: { betAmount: number; winAmount: number }) => {
      const { callbackUrl, memberAccount } = sessionRef.current;
      if (!callbackUrl || !memberAccount) return null;

      const payload = {
        member_account: memberAccount,
        game_uid: "aviator",
        bet_amount: params.betAmount,
        win_amount: params.winAmount,
        serial_number: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        game_round: roundIdRef.current || `r_${Date.now()}`,
        currency_code: "BDT",
      };

      try {
        const res = await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (data && typeof data.balance === "number") {
          setBalance(data.balance);
          return data;
        }
      } catch (err) {
        console.warn("Callback failed:", err);
      }
      return null;
    },
    []
  );

  // On mount: if we have a session, fetch live balance from the server (bet=0, win=0)
  useEffect(() => {
    const { callbackUrl, memberAccount } = sessionRef.current;
    if (callbackUrl && memberAccount) {
      callCallback({ betAmount: 0, winAmount: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const startNewRound = useCallback(() => {
    clearGameTimers();

    const cp = generateCrashPoint();
    setMultiplier(1.0);
    setPhase("waiting");
    waitingCountdownRef.current = 5;
    startWaitingCountdown();
    broadcastState({
      phase: "waiting",
      multiplier: 1.0,
      crashPoint: cp,
      history: crashHistoryRef.current,
      waitingCountdown: 5,
    });

    takeoffTimeoutRef.current = setTimeout(() => {
      if (!isLeader.current || phaseRef.current !== "waiting") return;
      setPhase("flying");
    }, 5000);
  }, [broadcastState, clearGameTimers, generateCrashPoint, startWaitingCountdown]);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const existingLeader = readLeaderState();
    const leaderExpired = !existingLeader || Date.now() - existingLeader.updatedAt > LEADER_TIMEOUT_MS;

    if (leaderExpired || existingLeader.id === tabId.current) {
      claimLeadership();
    } else {
      becomeFollower();
      applySyncedState(readSyncedState());
      channel.postMessage({ type: "request_state" });
    }

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data?.type) return;

      if (data.type === "request_state") {
        if (isLeader.current) {
          channel.postMessage({ type: "state", ...createSyncedState() });
        }
        return;
      }

      if (data.type === "state") {
        if (!isLeader.current) {
          applySyncedState(data as Partial<SyncedGameState>);
        }
        return;
      }

      if (data.type === "leader_lost") {
        const latestLeader = readLeaderState();
        if (!latestLeader) {
          claimLeadership();
        }
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STATE_KEY && event.newValue && !isLeader.current) {
        try {
          applySyncedState(JSON.parse(event.newValue) as SyncedGameState);
        } catch {}
      }

      if (event.key === LEADER_KEY) {
        if (!event.newValue) {
          if (!isLeader.current) {
            claimLeadership();
          }
          return;
        }

        try {
          const nextLeader = JSON.parse(event.newValue) as LeaderState;
          if (nextLeader.id !== tabId.current && isLeader.current) {
            becomeFollower();
          }
        } catch {}
      }
    };

    const cleanup = () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("beforeunload", cleanup);

      if (leaderHeartbeatRef.current) {
        clearInterval(leaderHeartbeatRef.current);
        leaderHeartbeatRef.current = null;
      }

      if (isLeader.current) {
        clearGameTimers();
        localStorage.removeItem(LEADER_KEY);
        try {
          channel.postMessage({ type: "leader_lost" });
        } catch {}
      }

      channel.close();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("beforeunload", cleanup);

    return cleanup;
  }, [applySyncedState, becomeFollower, claimLeadership, clearGameTimers, createSyncedState, readLeaderState, readSyncedState]);

  useEffect(() => {
    if (!leaderState) {
      if (leaderHeartbeatRef.current) {
        clearInterval(leaderHeartbeatRef.current);
        leaderHeartbeatRef.current = null;
      }
      return;
    }

    writeLeaderHeartbeat();
    leaderHeartbeatRef.current = setInterval(writeLeaderHeartbeat, 1000);

    return () => {
      if (leaderHeartbeatRef.current) {
        clearInterval(leaderHeartbeatRef.current);
        leaderHeartbeatRef.current = null;
      }
    };
  }, [leaderState, writeLeaderHeartbeat]);

  useEffect(() => {
    if (!leaderState) return;
    startNewRound();
    return clearGameTimers;
  }, [leaderState, startNewRound, clearGameTimers]);

  useEffect(() => {
    if (phase !== "flying" || !leaderState) return;

    broadcastState({
      phase: "flying",
      multiplier: 1.0,
      crashPoint: crashPoint.current,
      history: crashHistoryRef.current,
      waitingCountdown: 0,
    });

    flyingIntervalRef.current = setInterval(() => {
      if (crashedRef.current || !isLeader.current) return;

      setMultiplier((prev) => {
        if (crashedRef.current || !isLeader.current) return prev;

        const speed = prev < 2 ? 0.02 : prev < 5 ? 0.04 : 0.08;
        const next = parseFloat((prev + speed + Math.random() * speed).toFixed(2));

        if (next >= crashPoint.current) {
          crashedRef.current = true;

          if (flyingIntervalRef.current) {
            clearInterval(flyingIntervalRef.current);
            flyingIntervalRef.current = null;
          }

          const crashAt = crashPoint.current;
          const newHistory = [crashAt, ...crashHistoryRef.current].slice(0, 20);

          setPhase("crashed");
          setBets([null, null]);
          setCrashHistory(newHistory);
          sndCrash.current?.play().catch(() => {});

          broadcastState({
            phase: "crashed",
            multiplier: crashAt,
            crashPoint: crashAt,
            history: newHistory,
            waitingCountdown: 0,
          });

          restartTimeoutRef.current = setTimeout(() => {
            if (isLeader.current) {
              startNewRound();
            }
          }, 5000);

          return crashAt;
        }

        broadcastState({
          phase: "flying",
          multiplier: next,
          crashPoint: crashPoint.current,
          history: crashHistoryRef.current,
          waitingCountdown: 0,
        });

        return next;
      });
    }, 80);

    return () => {
      if (flyingIntervalRef.current) {
        clearInterval(flyingIntervalRef.current);
        flyingIntervalRef.current = null;
      }
    };
  }, [phase, leaderState, broadcastState, startNewRound]);

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
