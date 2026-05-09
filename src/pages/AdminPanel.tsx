import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Lock, Settings, Globe, FolderOpen, ArrowLeft, Copy, Download, Key, Ban, Trash2, Plus, Power } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const API_KEY = "AVIATOR-ADMIN-2024";

type HackKey = { id: string; key: string; label: string | null; active: boolean; created_at: string };
type BlockedIp = { id: string; ip: string; reason: string | null; created_at: string };

const AdminPanel = () => {
  const [apiKey, setApiKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"game" | "api" | "keys" | "ips" | "setup">("game");

  // Keys + IPs state
  const [keys, setKeys] = useState<HackKey[]>([]);
  const [ips, setIps] = useState<BlockedIp[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newIp, setNewIp] = useState("");
  const [newIpReason, setNewIpReason] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshKeys = useCallback(async () => {
    const { data } = await supabase.from("hack_keys").select("*").order("created_at", { ascending: false });
    setKeys((data ?? []) as HackKey[]);
  }, []);
  const refreshIps = useCallback(async () => {
    const { data } = await supabase.from("blocked_ips").select("*").order("created_at", { ascending: false });
    setIps((data ?? []) as BlockedIp[]);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    refreshKeys();
    refreshIps();
  }, [unlocked, refreshKeys, refreshIps]);

  const callAdmin = async (op: string, payload: any = {}) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("agentx-admin", {
        body: { op, payload },
        headers: { "x-admin-key": API_KEY },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      return (data as any)?.data;
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
      throw e;
    } finally {
      setBusy(false);
    }
  };

  // Game Control state
  const { phase, multiplier, nextCrashPoint, waitingCountdown, crashHistory } = useGame();
  const [controlMode, setControlMode] = useState<"random" | "fixed">("random");
  const [houseEdge, setHouseEdge] = useState(46);
  const [minCrash, setMinCrash] = useState("1");
  const [maxCrash, setMaxCrash] = useState("100");

  // API state
  const [callbackEnabled, setCallbackEnabled] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("");
  const [memberAccount, setMemberAccount] = useState("");
  const [token, setToken] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [gameUid, setGameUid] = useState("aviator");

  const [copied, setCopied] = useState(false);

  const handleUnlock = () => {
    if (apiKey === API_KEY) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const launchUrl = `https://hug-my-hindi-joy.lovable.app/?token=JWT_TOKEN&member_account=USER_ID&callback_url=https://sikkim99.us.cc/my_callback.php`;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-xl p-8 w-full max-w-md shadow-2xl border border-border">
          <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" style={{ color: "rgb(50, 180, 80)" }} />
            🔐 AgentX Access
          </h1>
          <label className="block text-sm text-muted-foreground mb-2">API Key</label>
          <input
            type="text"
            placeholder="Enter API key"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setError(false); }}
            className={`w-full bg-muted border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring mb-1 ${error ? "border-destructive" : "border-border"}`}
          />
          {error && <p className="text-destructive text-xs mb-3">Invalid API key</p>}
          <button onClick={handleUnlock} className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-lg transition-opacity mt-3">
            Unlock AgentX
          </button>
          <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mt-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "rgb(10, 12, 16)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: "rgb(50, 180, 80)" }} />
          <h1 className="text-xl font-bold text-white">AgentX</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/hack" className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: "rgba(220, 40, 40, 0.8)", color: "white" }}>
            🎯 Hack Tool
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            ← Game
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap mx-4 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        {[
          { id: "game" as const, label: "Game", icon: <Settings className="w-4 h-4" /> },
          { id: "api" as const, label: "API", icon: <Globe className="w-4 h-4" /> },
          { id: "keys" as const, label: "Keys", icon: <Key className="w-4 h-4" /> },
          { id: "ips" as const, label: "IPs", icon: <Ban className="w-4 h-4" /> },
          { id: "setup" as const, label: "Setup", icon: <FolderOpen className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors"
            style={{
              background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* ═══════════════ GAME TAB ═══════════════ */}
        {activeTab === "game" && (
          <>
            {/* Live Status */}
            <div className="rounded-lg p-3 flex items-center justify-between" style={{ border: "1px solid rgba(200, 160, 0, 0.4)", background: "rgba(200, 160, 0, 0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: phase === "flying" ? "rgb(50, 200, 50)" : phase === "waiting" ? "rgb(220, 180, 0)" : "rgb(220, 50, 50)" }} />
                <span className="text-sm font-bold" style={{ color: "rgb(220, 180, 0)" }}>
                  {phase === "waiting" ? `⏳ Waiting — ${waitingCountdown.toFixed(0)}s` : phase === "flying" ? `✈️ Flying — ${multiplier.toFixed(2)}x` : "💥 Crashed!"}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>((●)) LIVE</span>
            </div>

            {/* Next Crash */}
            <div className="rounded-lg p-3 flex items-center justify-between" style={{ background: "rgba(150, 30, 30, 0.2)", border: "1px solid rgba(150, 30, 30, 0.4)" }}>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Next Crash:</span>
              <span className="text-xl font-black" style={{ color: "rgb(220, 60, 60)" }}>{nextCrashPoint.toFixed(2)}x</span>
              <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                {controlMode === "random" ? "Random" : "Fixed"}
              </span>
            </div>

            {/* Game Control */}
            <div className="rounded-xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" style={{ color: "rgb(220, 180, 0)" }} />
                <span className="text-[14px]">⚙️</span>
                <h2 className="text-base font-bold text-white">Game Control</h2>
              </div>

              {/* Random / Fixed toggle */}
              <div className="flex rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <button
                  onClick={() => setControlMode("random")}
                  className="flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                  style={{ background: controlMode === "random" ? "rgba(255,255,255,0.12)" : "transparent", color: controlMode === "random" ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  📱 Random
                </button>
                <button
                  onClick={() => setControlMode("fixed")}
                  className="flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                  style={{ background: controlMode === "fixed" ? "rgba(255,255,255,0.12)" : "transparent", color: controlMode === "fixed" ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  🎯 Fixed
                </button>
              </div>

              {/* House Edge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>📉 House Edge</span>
                  <span className="text-sm font-bold" style={{ color: "rgb(255, 140, 0)" }}>{houseEdge}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={houseEdge}
                  onChange={(e) => setHouseEdge(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, rgb(255, 140, 0) ${houseEdge}%, rgba(255,255,255,0.1) ${houseEdge}%)` }}
                />
              </div>

              {/* Min / Max Crash */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Min Crash</label>
                  <input
                    type="text"
                    value={minCrash}
                    onChange={(e) => setMinCrash(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-center text-white font-bold text-lg outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Max Crash</label>
                  <input
                    type="text"
                    value={maxCrash}
                    onChange={(e) => setMaxCrash(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-center text-white font-bold text-lg outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Set */}
            <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">⚡ QUICK SET</h3>
              <div className="grid grid-cols-3 gap-2">
                {["1.00", "1.50", "2.00", "5.00", "10.0", "100"].map((v) => (
                  <button
                    key={v}
                    className="py-2.5 rounded-lg text-sm font-bold transition-colors"
                    style={{ border: "1px solid rgba(255, 140, 0, 0.4)", color: "rgb(255, 140, 0)", background: "rgba(255, 140, 0, 0.06)" }}
                  >
                    {v}x
                  </button>
                ))}
              </div>
              <button
                className="w-full py-3 rounded-lg text-sm font-bold"
                style={{ background: "linear-gradient(135deg, rgb(255, 100, 0), rgb(255, 60, 60))", color: "white" }}
              >
                🎲 Reset to Random
              </button>
            </div>
          </>
        )}

        {/* ═══════════════ API TAB ═══════════════ */}
        {activeTab === "api" && (
          <div className="rounded-xl p-5 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: "rgb(60, 160, 220)" }} />
              <span className="text-[14px]">🔗</span>
              <h2 className="text-base font-bold text-white">Platform API Integration</h2>
            </div>

            {/* Enable Callback API */}
            <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Enable Callback API</span>
              <button
                onClick={() => setCallbackEnabled(!callbackEnabled)}
                className="w-[50px] h-[26px] rounded-full relative transition-colors"
                style={{ background: callbackEnabled ? "rgb(50, 180, 80)" : "rgba(255,255,255,0.15)" }}
              >
                <div
                  className="w-[22px] h-[22px] rounded-full bg-white absolute top-[2px] transition-all"
                  style={{ left: callbackEnabled ? "26px" : "2px" }}
                />
              </button>
            </div>

            {callbackEnabled && (
              <>
                {/* Callback URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    🔗 <span className="font-semibold">Callback URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://yoursite.com/my_callback.php"
                    value={callbackUrl}
                    onChange={(e) => setCallbackUrl(e.target.value)}
                    className="w-full rounded-lg px-3 py-3 text-sm text-white placeholder:text-muted-foreground outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Member Account */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    👤 <span className="font-semibold">Member Account (User ID)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="User ID from platform"
                    value={memberAccount}
                    onChange={(e) => setMemberAccount(e.target.value)}
                    className="w-full rounded-lg px-3 py-3 text-sm text-white placeholder:text-muted-foreground outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Token */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    🔑 <span className="font-semibold">Token</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-filled from URL ?token=XXX"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full rounded-lg px-3 py-3 text-sm text-white placeholder:text-muted-foreground outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Currency & Game UID */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                      💰 <span className="font-semibold">Currency</span>
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg px-3 py-3 text-sm text-white font-bold outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>Game UID</label>
                    <input
                      type="text"
                      value={gameUid}
                      onChange={(e) => setGameUid(e.target.value)}
                      className="w-full rounded-lg px-3 py-3 text-sm text-white font-bold outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                {/* Test Connection */}
                <button className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2" style={{ background: "rgb(40, 120, 200)", color: "white" }}>
                  ✅ Test Connection
                </button>

                {/* How it works */}
                <div className="rounded-lg p-4 space-y-1" style={{ background: "rgba(40, 120, 200, 0.08)", border: "1px solid rgba(40, 120, 200, 0.2)" }}>
                  <p className="text-xs font-semibold flex items-center gap-1" style={{ color: "rgb(80, 160, 240)" }}>ℹ️ How it works:</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>• Bet lagane pe: bet_amount deduct hota hai</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>• Cashout pe: win_amount add hota hai</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>• Token auto URL se aata hai (?token=XXX)</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>• Har transaction ka unique serial_number banta hai</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════ SETUP FILES TAB ═══════════════ */}
        {activeTab === "setup" && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                <span className="text-[14px]">📁</span>
                <h2 className="text-base font-bold text-white">Setup Files & Steps</h2>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Neeche diya gaya fixed launcher file replace karo — Aviator launch redirect issue isi se solve hoga.
              </p>
            </div>

            {/* Step 1 */}
            <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "rgb(220, 50, 50)" }}>1</div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">GetGameUrl_1-2.php Replace karo</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Download karke apne server pe replace karo — ab ye JSON + normal POST dono support karega aur vendor mismatch hone par bhi Aviator ko galat home redirect nahi karega.
                  </p>
                </div>
              </div>
              <button className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2" style={{ background: "rgb(130, 80, 220)", color: "white" }}>
                <Download className="w-4 h-4" /> Download GetGameUrl_1-2.php
              </button>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "rgb(220, 50, 50)" }}>2</div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">my_callback.php same rakho</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Balance callback ke liye existing my_callback.php use hoga. Is file me change tabhi chahiye jab wallet API khud error de rahi ho.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "rgb(220, 50, 50)" }}>3</div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Aviator launch URL</h3>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Aviator request detect hote hi ye URL generate hoga:
                  </p>
                </div>
              </div>
              <div className="relative rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <code className="text-xs break-all" style={{ color: "rgb(100, 220, 100)" }}>{launchUrl}</code>
                <button
                  onClick={() => handleCopy(launchUrl)}
                  className="absolute top-2 right-2 p-1.5 rounded"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Copy className="w-3.5 h-3.5" style={{ color: copied ? "rgb(100, 220, 100)" : "rgba(255,255,255,0.5)" }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
