-- Add Risk Management columns to Active Portfolio
ALTER TABLE sim_portfolio
ADD COLUMN IF NOT EXISTS stop_loss numeric,
ADD COLUMN IF NOT EXISTS take_profit numeric;

-- Add Trade History/Exit columns to Trade Log
ALTER TABLE sim_trades
ADD COLUMN IF NOT EXISTS closed_at timestamptz,
ADD COLUMN IF NOT EXISTS exit_price numeric,
ADD COLUMN IF NOT EXISTS pnl_percent numeric,
ADD COLUMN IF NOT EXISTS exit_reason text;

-- (Optional) Create a view for easier PnL calculation if needed in future
-- CREATE OR REPLACE VIEW trade_performance AS ...