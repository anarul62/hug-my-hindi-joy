// AgentX admin operations: manage hack keys and blocked IPs.
// Secured by x-admin-key header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_KEY = "AVIATOR-ADMIN-2024";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: any = {};
  try { body = await req.json(); } catch {}
  const { op, payload } = body;

  try {
    let result: any = null;
    switch (op) {
      case "create_key": {
        const key = payload?.key || crypto.randomUUID().slice(0, 8).toUpperCase();
        const { data, error } = await supabase.from("hack_keys")
          .insert({ key, label: payload?.label ?? null, active: true })
          .select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "delete_key": {
        const { error } = await supabase.from("hack_keys").delete().eq("id", payload.id);
        if (error) throw error;
        result = { ok: true };
        break;
      }
      case "toggle_key": {
        const { data, error } = await supabase.from("hack_keys")
          .update({ active: payload.active }).eq("id", payload.id).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "block_ip": {
        const { data, error } = await supabase.from("blocked_ips")
          .insert({ ip: payload.ip, reason: payload?.reason ?? null }).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "unblock_ip": {
        const { error } = await supabase.from("blocked_ips").delete().eq("id", payload.id);
        if (error) throw error;
        result = { ok: true };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown op" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
