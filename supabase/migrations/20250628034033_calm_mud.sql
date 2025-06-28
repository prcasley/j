/*
  # Stock Analysis Platform Database Schema

  1. New Tables
    - `tickers` - Master list of tracked stock symbols
    - `stock_data` - OHLCV price data with technical indicators
    - `trading_signals` - Generated trading signals and scores
    - `financial_statements` - Income, balance sheet, cash flow data
    - `corporate_events` - Earnings, dividends, splits, etc.
    - `news_data` - News articles with sentiment analysis
    - `pipeline_runs` - Data pipeline execution logs
    - `user_watchlists` - User-specific stock tracking
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    
  3. Features
    - Comprehensive stock data storage
    - Real-time signal tracking
    - News sentiment analysis
    - Pipeline monitoring
*/

-- Tickers master table
CREATE TABLE IF NOT EXISTS tickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text,
  sector text,
  market_cap bigint,
  quote_type text DEFAULT 'EQUITY',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock price and volume data
CREATE TABLE IF NOT EXISTS stock_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_id uuid REFERENCES tickers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  date date NOT NULL,
  open decimal(12,4),
  high decimal(12,4),
  low decimal(12,4),
  close decimal(12,4),
  volume bigint,
  created_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)
);

-- Technical indicators and trading signals
CREATE TABLE IF NOT EXISTS trading_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_id uuid REFERENCES tickers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  date date NOT NULL,
  overall_signal text CHECK (overall_signal IN ('GREEN', 'YELLOW', 'RED')),
  signal_score decimal(4,2),
  confidence decimal(3,2),
  position_size text,
  key_reasons text,
  rsi_14 decimal(6,2),
  macd decimal(8,4),
  macd_signal decimal(8,4),
  bb_upper decimal(12,4),
  bb_lower decimal(12,4),
  sma_20 decimal(12,4),
  sma_50 decimal(12,4),
  ema_20 decimal(12,4),
  ema_50 decimal(12,4),
  volume_ratio decimal(6,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)
);

-- Financial statements data
CREATE TABLE IF NOT EXISTS financial_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_id uuid REFERENCES tickers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  statement_type text CHECK (statement_type IN ('income', 'balance_sheet', 'cash_flow')),
  period_end date,
  revenue bigint,
  net_income bigint,
  total_assets bigint,
  total_debt bigint,
  free_cash_flow bigint,
  shares_outstanding bigint,
  data jsonb, -- Store full financial data as JSON
  created_at timestamptz DEFAULT now()
);

-- Corporate events
CREATE TABLE IF NOT EXISTS corporate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_id uuid REFERENCES tickers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  impact_score decimal(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- News and sentiment data
CREATE TABLE IF NOT EXISTS news_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_id uuid REFERENCES tickers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  headline text NOT NULL,
  content text,
  source text,
  published_date timestamptz,
  sentiment_score decimal(4,3), -- -1 to 1
  sentiment_label text,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Pipeline execution logs
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  status text CHECK (status IN ('started', 'success', 'success_with_warnings', 'failure')),
  steps jsonb,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer
);

-- User watchlists
CREATE TABLE IF NOT EXISTS user_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker_id uuid REFERENCES tickers(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  notes text,
  alert_enabled boolean DEFAULT false,
  price_target decimal(12,4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ticker_id)
);

-- Enable Row Level Security
ALTER TABLE tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

-- Public read access for market data
CREATE POLICY "Public read access for tickers"
  ON tickers FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read access for stock_data"
  ON stock_data FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read access for trading_signals"
  ON trading_signals FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read access for financial_statements"
  ON financial_statements FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read access for corporate_events"
  ON corporate_events FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read access for news_data"
  ON news_data FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read access for pipeline_runs"
  ON pipeline_runs FOR SELECT
  TO authenticated, anon
  USING (true);

-- User-specific policies for watchlists
CREATE POLICY "Users can manage their own watchlists"
  ON user_watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert some sample data
INSERT INTO tickers (symbol, name, sector, quote_type) VALUES
('NVDA', 'NVIDIA Corporation', 'Technology', 'EQUITY'),
('AAPL', 'Apple Inc.', 'Technology', 'EQUITY'),
('TSLA', 'Tesla Inc.', 'Automotive', 'EQUITY'),
('MSFT', 'Microsoft Corporation', 'Technology', 'EQUITY'),
('GOOGL', 'Alphabet Inc.', 'Technology', 'EQUITY')
ON CONFLICT (symbol) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_data_symbol_date ON stock_data(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol_date ON trading_signals(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_news_data_symbol_date ON news_data(symbol, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_corporate_events_symbol_date ON corporate_events(symbol, event_date DESC);