import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface MarketChartProps {
  symbol: string;
  className?: string; // Allow external styling overrides (e.g., h-full)
}

export function MarketChart({ symbol, className }: MarketChartProps) {
  return (
    <div className={`w-full rounded-xl overflow-hidden border border-border ${className || "h-[500px]"}`}>
      <AdvancedRealTimeChart 
        theme="dark" 
        symbol={symbol}
        autosize
        interval="D"
        timezone="Etc/UTC"
        style="1"
        locale="en"
        toolbar_bg="#f1f3f6"
        enable_publishing={false}
        hide_side_toolbar={false}
        allow_symbol_change={true}
        container_id="tradingview_widget"
      />
    </div>
  );
}
