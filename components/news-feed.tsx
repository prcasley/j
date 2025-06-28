'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { NewsData } from '@/lib/supabase';

interface NewsFeedProps {
  newsData: NewsData[];
}

export function NewsFeed({ newsData }: NewsFeedProps) {
  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'bg-green-100 text-green-800';
    if (score < -0.1) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score < -0.3) return 'Very Negative';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
  };

  if (newsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No news articles available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News & Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsData.map((article) => (
            <div key={article.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-sm leading-relaxed line-clamp-2">
                    {article.headline}
                  </h4>
                  {article.sentiment_score !== null && (
                    <Badge className={getSentimentColor(article.sentiment_score)}>
                      {getSentimentLabel(article.sentiment_score)}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(article.published_date), 'MMM dd, yyyy')}
                    </span>
                    {article.source && (
                      <>
                        <span>•</span>
                        <span>{article.source}</span>
                      </>
                    )}
                  </div>
                  
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Read</span>
                    </a>
                  )}
                </div>

                {article.content && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {article.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}