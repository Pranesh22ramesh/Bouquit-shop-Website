import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseRealtime = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase =
  hasSupabaseRealtime
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const subscribeToTable = ({ table, filter, onChange, event = "*", schema = "public", channelName }) => {
  if (!supabase) return () => {};

  const channel = supabase.channel(channelName || `realtime:${schema}:${table}:${filter || "all"}`);
  channel.on(
    "postgres_changes",
    {
      event,
      schema,
      table,
      ...(filter ? { filter } : {}),
    },
    (payload) => onChange?.(payload)
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
