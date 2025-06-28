'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TickerSearch } from '@/components/ticker-search';
import { MarketOverview } from '@/components/market-overview';
import { StockChart } from '@/components/stock-chart';
import { TradingSignalsCard } from '@/components/trading-signals-card';
import { NewsFeed } from '@/components/news-feed';
import { 
  getStockData, 
  getLatestSignal, 
  getTradingSignals, 
  getNewsData, 
  getCorporateEvents 
} from '@/lib/market-data';
import type { StockData, TradingSignal, NewsData, CorporateEvent } from '@/lib/supabase';
import { TrendingUp, BarChart3, Newspaper, Calendar, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [currentSymbol, setCurrentSymbol] = useState('NVDA');
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [latestSignal, setLatestSignal] = useState<TradingSignal | null>(null);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [newsData, setNewsData] = useState<NewsData[]>([]);
  const [corporateEvents, setCorporateEvents] = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (symbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        stockDataResult,
        latestSignalResult,
        tradingSignalsResult,
        newsDataResult,
        corporateEventsResult
      ] = await Promise.all([
        getStockData(symbol, 100),
        getLatestSignal(symbol),
        getTradingSignals(symbol, 50),
        getNewsData(symbol, 20),
        getCorporateEvents(symbol, 10)
      ]);

      setStockData(stockDataResult);
      setLatestSignal(latestSignalResult);
      setTradingSignals(tradingSignalsResult);
      setNewsData(newsDataResult);
      setCorporateEvents(corporateEventsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentSymbol);
  }, [currentSymbol]);

  const handleSymbolChange = (symbol: string) => {
    setCurrentSymbol(symbol);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading market data for {currentSymbol}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Error Loading Data</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => fetchData(currentSymbol)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Market Intelligence</h1>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <TickerSearch 
                onSymbolChange={handleSymbolChange}
                currentSymbol={currentSymbol}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Market Overview */}
          <MarketOverview stockData={stockData} symbol={currentSymbol} />
          
          {/* Trading Signal */}
          {latestSignal && (
            <TradingSignalsCard signal={latestSignal} />
          )}
          
          {/* News Feed Preview */}
          <div className="lg:col-span-1">
            <NewsFeed newsData={newsData.slice(0, 3)} />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="chart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chart" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Chart</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Signals</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart & Volume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <StockChart 
                  stockData={stockData} 
                  signals={tradingSignals}
                  height={500}
                  showVolume={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {latestSignal && (
                <TradingSignalsCard signal={latestSignal} />
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Signal History</CardTitle>
                </CardHeader>
                <CardContent>
                  {tradingSignals.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tradingSignals.slice(0, 10).map((signal) => (
                        <div key={signal.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{signal.date}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              signal.overall_signal === 'GREEN' ? 'bg-green-100 text-green-800' :
                              signal.overall_signal === 'RED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {signal.overall_signal}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>Score: {signal.signal_score.toFixed(1)}</div>
                            <div>Confidence: {Math.round(signal.confidence * 100)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No trading signals available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <NewsFeed newsData={newsData} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Corporate Events</CardTitle>
              </CardHeader>
              <CardContent>
                {corporateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {corporateEvents.map((event) => (
                      <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(event.event_date).toLocaleDateString()}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Type: {event.event_type}</span>
                          {event.impact_score && (
                            <span>Impact: {event.impact_score.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No corporate events available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}