import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  cancelBet: (panelIndex: 0 | 1) => void;
  crashHistory: number[];
  nextCrashPoint: number;
  waitingCountdown: number;
  lastCashout: { multiplier: number; winAmount: number } | null;
  dismissCashout: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setAnimationEnabled: (v: boolean) => void;
};

type RoundRow = {
  id: number;
  phase: GamePhase;
  crash_point: number;
  waiting_until: string;
  started_at: string | null;
  crashed_at: string | null;
};

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
};

// Must match SQL: exp(0.06 * elapsed_seconds)
const computeMultiplier = (elapsedSec: number) => {
  if (elapsedSec <= 0) return 1.0;
  return Math.exp(0.06 * elapsedSec);
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
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
        try { localStorage.setItem("aviator_session", JSON.stringify(sessionRef.current)); } catch {}
      } else {
        try {
          const raw = localStorage.getItem("aviator_session");
          if (raw) sessionRef.current = JSON.parse(raw);
        } catch {}
      }

      if (balanceParam !== null && !isNaN(Number(balanceParam))) {
        const b = Number(balanceParam);
        try { localStorage.setItem("aviator_balance", String(b)); } catch {}
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
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  const [waitingCountdown, setWaitingCountdown] = useState(5);
  const [nextCrashPoint, setNextCrashPoint] = useState(0);
  const [lastCashout, setLastCashout] = useState<{ multiplier: number; winAmount: number } | null>(null);
  const dismissCashout = useCallback(() => setLastCashout(null), []);

  const currentRoundRef = useRef<RoundRow | null>(null);
  const roundIdRef = useRef<string>("");
  const balanceRef = useRef(balance);
  const multiplierRef = useRef(multiplier);
  balanceRef.current = balance;
  multiplierRef.current = multiplier;

  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const sndWin = useRef<HTMLAudioElement | null>(null);
  const sndCrash = useRef<HTMLAudioElement | null>(null);
  const sndBet = useRef<HTMLAudioElement | null>(null);
  const sndCashOut = useRef<HTMLAudioElement | null>(null);

  const readBool = (key: string, def: boolean) => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? def : v === "1";
    } catch { return def; }
  };
  const [soundEnabled, setSoundEnabledState] = useState(() => readBool("aviator_sound", true));
  const [musicEnabled, setMusicEnabledState] = useState(() => readBool("aviator_music", false));
  const [animationEnabled, setAnimationEnabledState] = useState(() => readBool("aviator_anim", true));
  const soundRef = useRef(soundEnabled);
  const musicRef = useRef(musicEnabled);
  soundRef.current = soundEnabled;
  musicRef.current = musicEnabled;
  const setSoundEnabled = (v: boolean) => { setSoundEnabledState(v); try { localStorage.setItem("aviator_sound", v ? "1" : "0"); } catch {} };
  const setMusicEnabled = (v: boolean) => { setMusicEnabledState(v); try { localStorage.setItem("aviator_music", v ? "1" : "0"); } catch {} };
  const setAnimationEnabled = (v: boolean) => { setAnimationEnabledState(v); try { localStorage.setItem("aviator_anim", v ? "1" : "0"); } catch {} };

  const playSfx = useCallback((ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!soundRef.current || !ref.current) return;
    try { ref.current.currentTime = 0; } catch {}
    ref.current.play().catch(() => {});
  }, []);

  // Audio init
  useEffect(() => {
    bgMusic.current = new Audio("https://www.tbgameloader.com/800/v37/home/static/media/bg_music.eed9358.mp3");
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;
    sndWin.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3");
    sndCrash.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-explosion-hit-1704.mp3");
    sndBet.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3");
    sndCashOut.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-coin-win-notification-1992.mp3");
    if (sndCrash.current) sndCrash.current.volume = 1.0;
    const startMusic = () => {
      if (musicRef.current) bgMusic.current?.play().catch(() => {});
      document.removeEventListener("click", startMusic);
    };
    document.addEventListener("click", startMusic);
    return () => document.removeEventListener("click", startMusic);
  }, []);

  // Background music: play during flying, pause on waiting/crashed (only if music enabled)
  useEffect(() => {
    if (!bgMusic.current) return;
    if (musicEnabled && phase === "flying") {
      bgMusic.current.play().catch(() => {});
    } else {
      try { bgMusic.current.pause(); } catch {}
      if (phase !== "flying") {
        try { bgMusic.current.currentTime = 0; } catch {}
      }
    }
  }, [musicEnabled, phase]);

  // Persist balance
  useEffect(() => {
    try { localStorage.setItem("aviator_balance", String(balance)); } catch {}
  }, [balance]);

  const applyRound = useCallback((row: RoundRow, prevPhase: GamePhase | null) => {
    currentRoundRef.current = row;
    roundIdRef.current = `r_${row.id}`;
    setNextCrashPoint(Number(row.crash_point));
    setPhase(row.phase);

    if (row.phase === "crashed") {
      setMultiplier(Number(row.crash_point));
      if (prevPhase !== "crashed") {
        playSfx(sndCrash);
        // clear bets on crash
        setBets([null, null]);
      }
    } else if (row.phase === "waiting") {
      setMultiplier(1.0);
    }
  }, []);

  // Fetch initial round + history, subscribe to realtime
  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      // Trigger a tick so engine starts if no rows exist
      try { await supabase.rpc("tick_game" as never); } catch {}

      const { data: latest } = await supabase
        .from("game_rounds")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled && latest) {
        applyRound(latest as RoundRow, null);
      }

      const { data: hist } = await supabase
        .from("game_rounds")
        .select("crash_point")
        .eq("phase", "crashed")
        .order("id", { ascending: false })
        .limit(20);

      if (!cancelled && hist) {
        setCrashHistory(hist.map((r: any) => Number(r.crash_point)));
      }
    };

    loadInitial();

    const channel = supabase
      .channel("game_rounds_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_rounds" },
        (payload) => {
          const row = payload.new as RoundRow;
          applyRound(row, currentRoundRef.current?.phase ?? null);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_rounds" },
        (payload) => {
          const row = payload.new as RoundRow;
          const prev = currentRoundRef.current?.phase ?? null;
          applyRound(row, prev);
          if (row.phase === "crashed" && prev !== "crashed") {
            setCrashHistory((h) => [Number(row.crash_point), ...h].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [applyRound]);

  // Local ticker for smooth multiplier + countdown + lazy engine kick
  useEffect(() => {
    const interval = setInterval(() => {
      const r = currentRoundRef.current;
      if (!r) {
        // kick engine
        supabase.rpc("tick_game" as never).then(() => {}, () => {});
        return;
      }
      const now = Date.now();

      if (r.phase === "waiting") {
        const wu = new Date(r.waiting_until).getTime();
        const remaining = Math.max(0, (wu - now) / 1000);
        setWaitingCountdown(parseFloat(remaining.toFixed(1)));
        if (remaining <= 0) {
          supabase.rpc("tick_game" as never).then(() => {}, () => {});
        }
      } else if (r.phase === "flying" && r.started_at) {
        const startMs = new Date(r.started_at).getTime();
        const elapsed = (now - startMs) / 1000;
        let m = computeMultiplier(elapsed);
        if (m >= r.crash_point) {
          m = r.crash_point;
          supabase.rpc("tick_game" as never).then(() => {}, () => {});
        }
        setMultiplier(parseFloat(m.toFixed(2)));
        setWaitingCountdown(0);
      } else if (r.phase === "crashed" && r.crashed_at) {
        const since = (now - new Date(r.crashed_at).getTime()) / 1000;
        if (since >= 5) {
          supabase.rpc("tick_game" as never).then(() => {}, () => {});
        }
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Callback POST
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

  useEffect(() => {
    const { callbackUrl, memberAccount } = sessionRef.current;
    if (callbackUrl && memberAccount) {
      callCallback({ betAmount: 0, winAmount: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeBet = useCallback((panelIndex: 0 | 1, amount: number) => {
    if (balanceRef.current < amount) return;
    setBalance((b) => b - amount);
    setBets((prev) => {
      const next = [...prev] as [Bet | null, Bet | null];
      next[panelIndex] = { amount, cashedOut: false, cashoutMultiplier: null };
      return next;
    });
    playSfx(sndBet);
    callCallback({ betAmount: amount, winAmount: 0 });
  }, [callCallback, playSfx]);

  const cashOut = useCallback((panelIndex: 0 | 1) => {
    setBets((prev) => {
      const bet = prev[panelIndex];
      if (!bet || bet.cashedOut) return prev;
      const winnings = parseFloat((bet.amount * multiplierRef.current).toFixed(2));
      setBalance((b) => b + winnings);
      playSfx(sndCashOut);
      playSfx(sndWin);
      callCallback({ betAmount: 0, winAmount: winnings });
      setLastCashout({ multiplier: multiplierRef.current, winAmount: winnings });
      const next = [...prev] as [Bet | null, Bet | null];
      next[panelIndex] = { ...bet, cashedOut: true, cashoutMultiplier: multiplierRef.current };
      return next;
    });
  }, [callCallback, playSfx]);

  const cancelBet = useCallback((panelIndex: 0 | 1) => {
    setBets((prev) => {
      const bet = prev[panelIndex];
      if (!bet || bet.cashedOut) return prev;
      if (currentRoundRef.current?.phase !== "waiting") return prev;
      setBalance((b) => b + bet.amount);
      const next = [...prev] as [Bet | null, Bet | null];
      next[panelIndex] = null;
      return next;
    });
  }, []);

  return (
    <GameContext.Provider value={{ phase, multiplier, balance, bets, placeBet, cashOut, cancelBet, crashHistory, nextCrashPoint, waitingCountdown, lastCashout, dismissCashout, soundEnabled, musicEnabled, animationEnabled, setSoundEnabled, setMusicEnabled, setAnimationEnabled }}>
      {children}
    </GameContext.Provider>
  );
};
