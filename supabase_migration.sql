-- 1. Settings & Balance
CREATE TABLE IF NOT EXISTS sim_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  balance_usdt NUMERIC(20, 4) DEFAULT 10000.00, -- Start with $10k Paper Money
  is_bot_active BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{"rsi_length": 14, "rsi_buy": 30, "rsi_sell": 70, "ema_period": 200, "adx_threshold": 25}'::jsonb
);

-- 2. Portfolio (Coins Owned)
CREATE TABLE IF NOT EXISTS sim_portfolio (
  symbol TEXT PRIMARY KEY, -- e.g. "BTCUSDT"
  amount NUMERIC(20, 8) NOT NULL,
  avg_buy_price NUMERIC(20, 4) NOT NULL
);

-- 3. Trade Logs
CREATE TABLE IF NOT EXISTS sim_trades (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL, -- 'BUY' or 'SELL'
  amount NUMERIC(20, 8),
  price NUMERIC(20, 4),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  pnl NUMERIC(20, 4) -- Profit/Loss (only for SELL)
);

-- Initialize default user if not exists
INSERT INTO sim_settings (balance_usdt)
SELECT 10000.00
WHERE NOT EXISTS (SELECT 1 FROM sim_settings);
