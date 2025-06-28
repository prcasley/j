'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Volume } from 'lucide-react';
import type { StockData } from '@/lib/supabase';

interface MarketOverviewProps {
  stockData: StockData[];
  symbol: string;
}

export function MarketOverview({ stockData, symbol }: MarketOverviewProps) {
  if (stockData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  const latestData = stockData[0];
  const previousData = stockData[1];
  
  const currentPrice = latestData.close;
  const previousPrice = previousData?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100);
  
  const isPositive = priceChange >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{symbol} Overview</span>
          <Badge variant="outline" className="text-xs">
            {new Date(latestData.date).toLocaleDateString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Price */}
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
              <Badge className={changeBgColor}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Day Range</span>
              </div>
              <p className="text-sm font-semibold">
                ${latestData.low.toFixed(2)} - ${latestData.high.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Volume className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Volume</span>
              </div>
              <p className="text-sm font-semibold">
                {formatVolume(latestData.volume)}
              </p>
            </div>
          </div>

          {/* OHLC Data */}
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-600">Open</p>
              <p className="font-semibold">${latestData.open.toFixed(2)}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-600">High</p>
              <p className="font-semibold text-green-600">${latestData.high.toFixed(2)}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-600">Low</p>
              <p className="font-semibold text-red-600">${latestData.low.toFixed(2)}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-600">Close</p>
              <p className="font-semibold">${latestData.close.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}