// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Conexão com o banco do Supabase
const SUPABASE_URL = "https://ikdrgqipinsmpnmctppz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Rxg3XLgPFNnur5TL4xoqmw_GABA9I0T";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);