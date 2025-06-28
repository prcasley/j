import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database
export interface Ticker {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  market_cap: number;
  quote_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockData {
  id: string;
  ticker_id: string;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  created_at: string;
}

export interface TradingSignal {
  id: string;
  ticker_id: string;
  symbol: string;
  date: string;
  overall_signal: 'GREEN' | 'YELLOW' | 'RED';
  signal_score: number;
  confidence: number;
  position_size: string;
  key_reasons: string;
  rsi_14: number;
  macd: number;
  macd_signal: number;
  bb_upper: number;
  bb_lower: number;
  sma_20: number;
  sma_50: number;
  ema_20: number;
  ema_50: number;
  volume_ratio: number;
  created_at: string;
}

export interface NewsData {
  id: string;
  ticker_id: string;
  symbol: string;
  headline: string;
  content: string;
  source: string;
  published_date: string;
  sentiment_score: number;
  sentiment_label: string;
  url: string;
  created_at: string;
}

export interface CorporateEvent {
  id: string;
  ticker_id: string;
  symbol: string;
  event_date: string;
  event_type: string;
  title: string;
  description: string;
  impact_score: number;
  created_at: string;
}