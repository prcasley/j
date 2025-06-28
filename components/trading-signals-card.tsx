'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TradingSignal } from '@/lib/supabase';

interface TradingSignalsCardProps {
  signal: TradingSignal;
}

export function TradingSignalsCard({ signal }: TradingSignalsCardProps) {
  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'GREEN': return 'bg-green-100 text-green-800 border-green-200';
      case 'RED': return 'bg-red-100 text-red-800 border-red-200';
      case 'YELLOW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'GREEN': return <TrendingUp className="h-4 w-4" />;
      case 'RED': return <TrendingDown className="h-4 w-4" />;
      case 'YELLOW': return <Minus className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const confidencePercentage = Math.round(signal.confidence * 100);
  const scoreColor = signal.signal_score >= 3 ? 'text-green-600' : 
                    signal.signal_score <= -3 ? 'text-red-600' : 'text-yellow-600';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Latest Trading Signal</span>
          <Badge className={getSignalColor(signal.overall_signal)}>
            {getSignalIcon(signal.overall_signal)}
            <span className="ml-1">{signal.overall_signal}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Signal Score</p>
            <p className={`text-xl font-bold ${scoreColor}`}>
              {signal.signal_score.toFixed(1)}/10
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="text-xl font-bold text-blue-600">
              {confidencePercentage}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Position Size</p>
            <p className="text-xl font-bold text-purple-600">
              {signal.position_size}
            </p>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-sm text-gray-600 mb-2">Key Reasons</p>
          <p className="text-sm bg-gray-50 p-3 rounded-lg">
            {signal.key_reasons || 'No specific reasons provided'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">RSI (14)</p>
            <p className="font-semibold">{signal.rsi_14?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">MACD</p>
            <p className="font-semibold">{signal.macd?.toFixed(4) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">SMA 20</p>
            <p className="font-semibold">${signal.sma_20?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">SMA 50</p>
            <p className="font-semibold">${signal.sma_50?.toFixed(2) || 'N/A'}</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 border-t pt-2">
          Last updated: {new Date(signal.date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}