import { supabase } from './supabase';
import type { StockData, TradingSignal, NewsData, CorporateEvent } from './supabase';

export async function getStockData(symbol: string, limit: number = 100): Promise<StockData[]> {
  const { data, error } = await supabase
    .from('stock_data')
    .select('*')
    .eq('symbol', symbol)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getLatestSignal(symbol: string): Promise<TradingSignal | null> {
  const { data, error } = await supabase
    .from('trading_signals')
    .select('*')
    .eq('symbol', symbol)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getTradingSignals(symbol: string, limit: number = 30): Promise<TradingSignal[]> {
  const { data, error } = await supabase
    .from('trading_signals')
    .select('*')
    .eq('symbol', symbol)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getNewsData(symbol: string, limit: number = 20): Promise<NewsData[]> {
  const { data, error } = await supabase
    .from('news_data')
    .select('*')
    .eq('symbol', symbol)
    .order('published_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getCorporateEvents(symbol: string, limit: number = 10): Promise<CorporateEvent[]> {
  const { data, error } = await supabase
    .from('corporate_events')
    .select('*')
    .eq('symbol', symbol)
    .order('event_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getWatchlistedTickers(userId: string) {
  const { data, error } = await supabase
    .from('user_watchlists')
    .select(`
      *,
      tickers:ticker_id (
        symbol,
        name,
        sector
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function addToWatchlist(userId: string, tickerId: string, symbol: string) {
  const { data, error } = await supabase
    .from('user_watchlists')
    .insert({
      user_id: userId,
      ticker_id: tickerId,
      symbol
    });

  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(userId: string, tickerId: string) {
  const { error } = await supabase
    .from('user_watchlists')
    .delete()
    .eq('user_id', userId)
    .eq('ticker_id', tickerId);

  if (error) throw error;
}