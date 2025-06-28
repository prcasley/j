'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TickerSearchProps {
  onSymbolChange: (symbol: string) => void;
  currentSymbol: string;
}

const popularTickers = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC-USD', 'ETH-USD'];

export function TickerSearch({ onSymbolChange, currentSymbol }: TickerSearchProps) {
  const [inputValue, setInputValue] = useState(currentSymbol);

  useEffect(() => {
    setInputValue(currentSymbol);
  }, [currentSymbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSymbolChange(inputValue.trim().toUpperCase());
    }
  };

  const handleQuickSelect = (symbol: string) => {
    setInputValue(symbol);
    onSymbolChange(symbol);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL, NVDA)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 mr-2">Popular:</span>
        {popularTickers.map((ticker) => (
          <Button
            key={ticker}
            variant={currentSymbol === ticker ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickSelect(ticker)}
            className="text-xs"
          >
            {ticker}
          </Button>
        ))}
      </div>
    </div>
  );
}