'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AnalysisProgress } from '@/components/AnalysisProgress';

interface AnalyzedVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  analyzedAt: string;
  channelName?: string;
  duration?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [recentVideos, setRecentVideos] = useState<AnalyzedVideo[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Load recent videos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentVideos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentVideos(parsed);
      } catch (e) {
        console.error('Failed to parse stored videos:', e);
      }
    }
  }, []);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze video');
      }

      // Store the analysis data in sessionStorage to pass to the video page
      sessionStorage.setItem('videoAnalysis', JSON.stringify(data));

      // Save to recent videos in localStorage
      const videoData: AnalyzedVideo = {
        videoId: data.videoId,
        title: data.title,
        thumbnail: data.thumbnail,
        analyzedAt: data.analyzedAt,
        channelName: data.channelName,
        duration: data.duration,
      };

      const stored = localStorage.getItem('recentVideos');
      let videos: AnalyzedVideo[] = [];
      if (stored) {
        try {
          videos = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored videos:', e);
        }
      }

      // Add new video to the beginning, remove duplicates
      videos = [videoData, ...videos.filter(v => v.videoId !== data.videoId)];

      // Keep only last 10 videos
      videos = videos.slice(0, 10);

      localStorage.setItem('recentVideos', JSON.stringify(videos));
      setRecentVideos(videos);

      // Set success status and navigate after fade-out
      setAnalysisStatus('success');
      setTimeout(() => {
        router.push(`/video/${data.videoId}`);
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setAnalysisStatus('error');
      setIsAnalyzing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleVideoClick = (videoId: string) => {
    // Load the video from localStorage to sessionStorage
    const stored = localStorage.getItem('recentVideos');
    if (stored) {
      try {
        const videos: AnalyzedVideo[] = JSON.parse(stored);
        const video = videos.find(v => v.videoId === videoId);
        if (video) {
          // We only have basic info in recent videos, so just navigate
          // The video detail page will need to handle missing full analysis
          router.push(`/video/${videoId}`);
        }
      } catch (e) {
        console.error('Failed to load video:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Google Labs-style organic background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-pink-100 to-orange-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-8 py-24">
        {/* Header with Google Labs style */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700">EXPERIMENT</span>
          </div>
          <h1 className="text-[56px] font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Video Intelligence<br/>Reader
          </h1>
          <p className="text-[20px] text-gray-600 max-w-[720px] mx-auto leading-relaxed">
            Transform any YouTube video into a rich, readable summary with key insights, timestamped moments, and deep analysis powered by AI.
          </p>
        </div>

        {/* Input Section with Google Labs playful style */}
        <div className="mb-24 max-w-[780px] mx-auto">
          <div className="mb-5">
            <Input
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={setUrl}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' && !isAnalyzing) {
                  handleAnalyze();
                }
              }}
            />
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !url.trim()}>
            Analyze Video
          </Button>

          <AnalysisProgress
            status={analysisStatus}
            onComplete={() => setAnalysisStatus('idle')}
          />
        </div>

        {/* Recent Videos - Perplexity-inspired clean design */}
        {recentVideos.length > 0 && (
          <div className="max-w-[960px] mx-auto">
            <h2 className="text-[24px] font-semibold text-gray-900 mb-6">Recent Analysis</h2>
            <div className="space-y-3">
              {recentVideos.map((video, index) => (
                <button
                  key={video.videoId}
                  onClick={() => handleVideoClick(video.videoId)}
                  className="group relative w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 text-left overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-[180px] h-[101px] object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to default YouTube thumbnail
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
                        }}
                      />
                      {video.duration && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                      <h3 className="text-[16px] font-medium text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[13px] text-gray-500">
                        {video.channelName && (
                          <>
                            <span className="truncate max-w-[200px]">{video.channelName}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatDate(video.analyzedAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recentVideos.length === 0 && (
          <div className="max-w-[960px] mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos analyzed yet</h3>
            <p className="text-gray-600">Start by analyzing your first YouTube video above</p>
          </div>
        )}
      </div>
    </div>
  );
}
