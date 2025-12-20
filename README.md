# CryptoTradeHub

A comprehensive Crypto Trading Simulator and Backtesting Platform built with React, TypeScript, and Vite.

## Features

### 1. 🎓 Learning Module

- Interactive crypto education.
- Progress tracking.
- Topics: Blockchain Basics, Trading Strategies, Risk Management.

### 2. 📈 Simulator Engine

- **Risk-Free Trading**: Practice with virtual CHF 10,000.
- **Real-Time Data**: Live prices fetched from CoinGecko.
- **Portfolio Management**: Track holdings, average entry price, and P&L.
- **Order Types**: Buy/Sell using Fiat amount or Coin quantity.

### 3. 🔙 Backtesting Engine

- **Strategy Testing**: Test DCA, Grid, and Momentum strategies.
- **Synthetic Data**: Simulates Bull, Bear, Range, and Volatile market conditions.
- **Visualization**: Interactive Equity Curve and performance metrics (Return, Drawdown).

### 4. 🚀 Real Trading Integration

- **Dual Mode**: Switch between Simulator and Real Trading.
- **Binance Integration**: Connect via API Key (stored locally) to execute real trades.
- **Safety First**: Visual warnings and "Mock Mode" for safe testing.

### 5. ✨ AI Assistant

- **Gemini Powered**: Context-aware AI chat.
- **Portfolio Insights**: Ask questions about your specific holdings.
- **Smart Assistance**: Get explanations of trading concepts on the fly.

## Getting Started

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Start Development Server**

    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI
- **State Management**: React Context, LocalStorage
- **Charts**: Recharts
- **AI**: Google Generative AI SDK

## Configuration

- **API Keys**: Manage your Binance and Gemini API keys in the **Settings** page. Keys are stored securely in your browser's LocalStorage and are never sent to our servers.
