## Goal

1. Game aur /hack ki history aur next-crash prediction sab users/devices par same dikhe (cross-device global sync).
2. Game page ke top history row ka background hatao (transparent) — already mostly done, verify.

## Approach

### 1. Cross-device sync via Lovable Cloud

Currently game state sirf same browser ke tabs me sync hota hai (BroadcastChannel + localStorage). Sab users ke liye same crash dikhane ke liye backend chahiye — Lovable Cloud enable karna hoga.

**Architecture:**
- Ek Supabase Edge Function `game-engine` jo authoritative game loop chalayegi: round generate karo, crash point decide karo, multiplier tick karo, history maintain karo.
- Ek `game_rounds` table:
  - `id` (uuid)
  - `phase` ('waiting' | 'flying' | 'crashed')
  - `crash_point` (numeric)
  - `started_at`, `crashed_at` (timestamptz)
  - `multiplier` (numeric, current — updated by engine)
  - `waiting_until` (timestamptz)
- RLS: read-only for `anon`/`authenticated`, write only via service role (edge function).
- Frontend subscribes via Supabase Realtime to `game_rounds` table.
- `GameContext` ko refactor karo: leader/follower BroadcastChannel logic hatao, sirf realtime se state read karo. Local timer sirf smooth multiplier interpolation ke liye use karo (server timestamps se calculate).
- Engine trigger: edge function ko ek scheduled trigger ya self-loop chahiye. Simplest: cron (`pg_cron`) jo har 1s pe `tick` function call kare, ya client ke pehle request pe lazy-start kare. Recommended: `pg_cron` har second `game_engine_tick()` SQL function chalaye jo phases manage kare deterministically.
- Hack page same `game_rounds` table read karega — automatically same prediction (crash_point) aur same history dikhayega.

**History:**
- Last 20 crashed rounds ek view ya direct query se aayenge (`order by crashed_at desc limit 20`).
- Game aur Hack dono yahi list use karenge → guaranteed same.

### 2. Game page top history background

`MultiplierHistory.tsx` me already `bg-transparent` hai. Parent (`Index.tsx`) me bhi koi extra bg nahi. Verify karke confirm — agar koi remnant hai to remove.

### 3. Bet/Cashout flow

Bets local hi rahenge (per-user). Cashout multiplier server-driven multiplier se hoga. Callback POST ko same rakhenge.

## Steps

1. Lovable Cloud enable karo.
2. Migration: `game_rounds` table + RLS + `pg_cron` extension + `game_engine_tick()` plpgsql function + cron schedule (every 1 second).
3. Refactor `src/contexts/GameContext.tsx`:
   - Remove BroadcastChannel/leader logic.
   - Subscribe to `game_rounds` realtime + initial fetch.
   - Compute `multiplier` client-side via interpolation between `started_at` and `now()` for smooth UI; snap to server `crash_point` on crash.
   - `crashHistory` from `game_rounds` where phase='crashed' order desc limit 20.
4. Verify `MultiplierHistory.tsx` background transparent (already done).
5. Test: open game and /hack in two different browsers — same crash, same history.

## Technical notes

- Edge function not strictly needed if `pg_cron` + plpgsql handles tick. Simpler.
- Tick logic: if current row phase='waiting' and now>=waiting_until → set phase='flying', started_at=now. If phase='flying' and computed_mult >= crash_point → set phase='crashed', crashed_at=now, schedule next round 5s later. If phase='crashed' and now-crashed_at>=5s → insert new row with new crash_point and waiting_until=now+5s.
- Multiplier formula client-side: `mult = 1 + (elapsed_seconds * growth)` matching old speed curve, capped at server crash_point when phase becomes crashed.

## Out of scope

- Auth (game stays anonymous, balance per-browser via URL token).
- Per-user bet history sync.
