'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { CalloutCard } from '@/components/CalloutCard';
import { AnnotatedText } from '@/components/AnnotatedText';

interface VideoDetailPageProps {
  params: Promise<{ id: string }>;
}

interface MacroTheme {
  theme: string;
  whyItMatters: string;
  evidence: string[];
}

interface MicroInsight {
  timestamp: string;
  insight: string;
}

interface Annotation {
  textSpan: string;
  insight: string;
  timestamp: string | null;
  type: 'concept' | 'tension' | 'prediction' | 'strategy';
}

interface VideoAnalysis {
  videoId: string;
  videoUrl: string;
  title: string;
  // New fields
  macroThemes?: MacroTheme[];
  microInsights?: MicroInsight[];
  executiveNarrative?: string;
  annotations?: Annotation[];
  // Legacy fields (for backward compatibility)
  keyInsights?: string[];
  deepSummary?: string[];
  keyMoments: Array<{ timestamp: string; label: string }>;
  mustWatch: { timestamp: string; description: string };
  blindspots?: string[];
  mentalModels?: string[];
}

export default function VideoDetailPage({ params }: VideoDetailPageProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState<string>('');

  useEffect(() => {
    // Resolve params promise and load analysis from sessionStorage
    params.then(resolvedParams => {
      setVideoId(resolvedParams.id);
      const storedAnalysis = sessionStorage.getItem('videoAnalysis');
      if (storedAnalysis) {
        setAnalysis(JSON.parse(storedAnalysis));
        setLoading(false);
      } else {
        // If no data, redirect to home
        router.push('/');
      }
    });
  }, [params, router]);

  const handleTimestampClick = (timestamp: string) => {
    // Convert timestamp string (e.g., "5:15") to seconds
    const parts = timestamp.split(':');
    const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);

    // Use YouTube iframe API to seek to specific time
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true]
        }),
        '*'
      );

      // Also play the video
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: []
        }),
        '*'
      );
    }
  };

  if (loading || !analysis) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Google Labs-style organic background blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-25 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-25 -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full blur-3xl opacity-15"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-10 py-12">
        {/* Back Button with Google Labs style */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-full mb-12 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[14px] font-semibold">Back to Home</span>
        </button>

        {/* Full Width Video Player */}
        <div className="relative group mb-8">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId || analysis.videoId}?enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          {/* Playful accent blob */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
        </div>

        {/* Video Metadata */}
        <div className="space-y-4 mb-10">
          <h1 className="text-[42px] font-bold text-gray-900 leading-tight tracking-tight">
            {analysis.title}
          </h1>
        </div>

        {/* Macro Themes - Google Labs Polish */}
        {analysis.macroThemes && analysis.macroThemes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white bg-gradient-to-b from-white to-gray-50 rounded-xl p-8 shadow-sm border border-black/5 hover:shadow-md transition-all">
              <h2 className="text-[24px] font-semibold text-gray-900 mb-6">
                Macro Themes
              </h2>
              <div className="space-y-3">
                {analysis.macroThemes.map((theme, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-indigo-600 mt-1.5 flex-shrink-0">•</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-gray-800 leading-[1.6]">
                        <span className="font-medium">{theme.theme}:</span> {theme.whyItMatters}
                        {theme.evidence && theme.evidence.length > 0 && (
                          <span className="inline-flex flex-wrap gap-1.5 ml-2">
                            {theme.evidence.map((timestamp, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleTimestampClick(timestamp)}
                                className="inline-flex items-center text-xs px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300 transition-colors"
                              >
                                {timestamp}
                              </button>
                            ))}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Executive Narrative with Annotations - Google Labs Polish */}
        {analysis.executiveNarrative && (
          <div className="mb-8">
            <div className="bg-white bg-gradient-to-b from-white to-gray-50 rounded-xl p-8 shadow-sm border border-black/5 hover:shadow-md transition-all">
              <h2 className="text-[24px] font-semibold text-gray-900 mb-6">
                Executive Analysis
              </h2>
              <AnnotatedText
                text={analysis.executiveNarrative}
                annotations={analysis.annotations || []}
                onTimestampClick={handleTimestampClick}
              />
            </div>
          </div>
        )}

        {/* Micro Insights - Google Labs Polish */}
        {analysis.microInsights && analysis.microInsights.length > 0 && (
          <div className="mb-8">
            <div className="bg-white bg-gradient-to-b from-white to-gray-50 rounded-xl p-8 shadow-sm border border-black/5 hover:shadow-md transition-all">
              <h2 className="text-[24px] font-semibold text-gray-900 mb-6">
                Micro Insights
              </h2>
              <div className="space-y-3">
                {analysis.microInsights.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <button
                      onClick={() => handleTimestampClick(item.timestamp)}
                      className="flex-shrink-0 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-mono rounded-md transition-colors"
                    >
                      {item.timestamp}
                    </button>
                    <p className="text-[15px] text-gray-700 leading-[1.7] flex-1">{item.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legacy Key Insights Card (for backward compatibility) */}
        {analysis.keyInsights && analysis.keyInsights.length > 0 && (
          <div className="relative group mb-8">
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-10 shadow-xl border-2 border-purple-100 hover:border-purple-200 transition-all">
              <h2 className="text-[26px] font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Key Insights
              </h2>
              <ul className="space-y-4 text-[16px] text-gray-700">
                {analysis.keyInsights.map((insight, index) => (
                  <li key={index} className="flex gap-4 leading-[1.7] break-words">
                    <span className="text-[#1CC6B2] text-2xl mt-0.5 flex-shrink-0">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>
        )}

        {/* Legacy Deep Summary Card (for backward compatibility) */}
        {analysis.deepSummary && analysis.deepSummary.length > 0 && (
          <div className="relative group mb-10">
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-10 shadow-xl border-2 border-blue-100 hover:border-blue-200 transition-all">
              <h2 className="text-[26px] font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Deep Summary
              </h2>
              <div className="space-y-5 text-[17px] text-gray-700 leading-[1.8] max-w-none break-words">
                {analysis.deepSummary.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "first-letter:text-4xl first-letter:font-bold first-letter:text-blue-600 first-letter:mr-1 first-letter:float-left" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>
        )}

        {/* Two Column Layout for Key Moments and 60 Second Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Moments Card */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-3xl p-8 shadow-xl border-2 border-teal-100 hover:border-teal-200 transition-all h-full">
              <h2 className="text-[24px] font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                Key Moments
              </h2>
              <div className="flex flex-wrap gap-3">
                {analysis.keyMoments.map((moment, index) => (
                  <Chip
                    key={index}
                    timestamp={moment.timestamp}
                    label={moment.label}
                    onClick={() => handleTimestampClick(moment.timestamp)}
                  />
                ))}
              </div>
            </div>
            {/* Playful accent blob */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>

          {/* Must Watch Callout */}
          <div className="relative group overflow-hidden">
            <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 border-3 border-orange-200 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all h-full">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <h3 className="text-[24px] font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <span className="text-3xl">⏱️</span>
                  If you only watch 60 seconds, watch this
                </h3>
                <p className="text-[16px] text-gray-700 leading-[1.7] break-words">
                  <strong>Jump to <button onClick={() => handleTimestampClick(analysis.mustWatch.timestamp)} className="text-[#1CC6B2] font-bold text-lg hover:text-[#15a392] underline cursor-pointer transition-colors">{analysis.mustWatch.timestamp}</button></strong> {analysis.mustWatch.description}
                </p>
              </div>
            </div>
            {/* Animated accent blob */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full blur-3xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500"></div>
          </div>
        </div>

        {/* Mental Models Section */}
        {analysis.mentalModels && analysis.mentalModels.length > 0 && (
          <div className="relative group mt-8">
            <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl p-10 shadow-xl border-2 border-indigo-100 hover:border-indigo-200 transition-all">
              <h2 className="text-[26px] font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Mental Models & Frameworks
              </h2>
              <ul className="space-y-4 text-[16px] text-gray-700">
                {analysis.mentalModels.map((model, index) => (
                  <li key={index} className="flex gap-4 leading-[1.7] break-words">
                    <span className="text-indigo-600 text-2xl mt-0.5 flex-shrink-0">▸</span>
                    <span>{model}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>
        )}

        {/* Blindspots Section */}
        {analysis.blindspots && analysis.blindspots.length > 0 && (
          <div className="relative group mt-8">
            <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl p-10 shadow-xl border-2 border-amber-100 hover:border-amber-200 transition-all">
              <h2 className="text-[26px] font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Strategic Blindspots
              </h2>
              <ul className="space-y-4 text-[16px] text-gray-700">
                {analysis.blindspots.map((blindspot, index) => (
                  <li key={index} className="flex gap-4 leading-[1.7] break-words">
                    <span className="text-amber-600 text-2xl mt-0.5 flex-shrink-0">⚠</span>
                    <span>{blindspot}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>
        )}
      </div>
    </div>
  );
}
