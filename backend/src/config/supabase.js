const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

const supabase = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

module.exports = { supabase, hasSupabaseConfig };
