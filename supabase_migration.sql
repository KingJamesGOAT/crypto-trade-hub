-- 1. RESET: Delete old tables to start fresh
DROP TABLE IF EXISTS sim_logs;
DROP TABLE IF EXISTS sim_trades;
DROP TABLE IF EXISTS sim_portfolio;
DROP TABLE IF EXISTS sim_settings;

-- 2. CREATE SETTINGS (With Stop Loss & Neural Config included)
CREATE TABLE sim_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  balance_usdt NUMERIC(20, 4) DEFAULT 10000.00,
  is_bot_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ, 
  -- Combined Config: Neural Strategy + News + 3% Stop Loss
  config JSONB DEFAULT '{"stoch_len": 14, "stoch_k": 3, "stoch_d": 3, "macd_fast": 12, "macd_slow": 26, "macd_sig": 9, "news_impact": 1.5, "risk_per_trade": 0.05, "stop_loss_pct": 0.03}'::jsonb
);

-- 3. CREATE PORTFOLIO
CREATE TABLE sim_portfolio (
  symbol TEXT PRIMARY KEY,
  amount NUMERIC(20, 8) NOT NULL,
  avg_buy_price NUMERIC(20, 4) NOT NULL
);

-- 4. CREATE TRADES (With News Score)
CREATE TABLE sim_trades (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  amount NUMERIC(20, 8),
  price NUMERIC(20, 4),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  pnl NUMERIC(20, 4),
  news_score NUMERIC(5, 2)
);

-- 5. CREATE LOGS (The Fix for the Crash)
CREATE TABLE sim_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  message TEXT NOT NULL
);

-- 6. INITIALIZE BALANCE
INSERT INTO sim_settings (balance_usdt) VALUES (10000.00);
