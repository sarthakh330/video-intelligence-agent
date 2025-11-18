'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { Chip } from '@/components/Chip';
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
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-10">
        {/* Back Button - Clean & Simple */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg mb-8 transition-all duration-150 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[14px] font-medium">Back to Home</span>
        </button>

        {/* Video Player - Wider for impact */}
        <div className="max-w-[900px] mx-auto mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
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
        </div>

        {/* Video Title - Centered, narrower */}
        <div className="max-w-[720px] mx-auto mb-10">
          <h1 className="text-[32px] font-bold text-gray-900 leading-tight tracking-tight text-center">
            {analysis.title}
          </h1>
        </div>

        {/* Main Content - Centered Column */}
        <div className="max-w-[720px] mx-auto">
          {/* Macro Themes */}
          {analysis.macroThemes && analysis.macroThemes.length > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Macro Themes
                </h2>
                <div className="space-y-2.5">
                  {analysis.macroThemes.map((theme, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <span className="text-indigo-600 mt-1 flex-shrink-0 text-sm">•</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] text-gray-800 leading-[1.65]">
                          <span className="font-medium">{theme.theme}:</span> {theme.whyItMatters}
                          {theme.evidence && theme.evidence.length > 0 && (
                            <span className="inline-flex flex-wrap gap-1 ml-1.5 align-middle">
                              {theme.evidence.map((timestamp, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleTimestampClick(timestamp)}
                                  className="inline-flex items-center text-[11px] px-1.5 py-0.5 h-[19px] rounded-full bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300 transition-colors font-mono"
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

          {/* Executive Narrative with Annotations */}
          {analysis.executiveNarrative && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Video Analysis
                </h2>
                <AnnotatedText
                  text={analysis.executiveNarrative}
                  annotations={analysis.annotations || []}
                  onTimestampClick={handleTimestampClick}
                />
              </div>
            </div>
          )}

          {/* Micro Insights */}
          {analysis.microInsights && analysis.microInsights.length > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Micro Insights
                </h2>
                <div className="space-y-2.5">
                  {analysis.microInsights.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-start">
                      <button
                        onClick={() => handleTimestampClick(item.timestamp)}
                        className="flex-shrink-0 px-2 py-0.5 h-[20px] bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 text-gray-700 text-[11px] font-mono rounded-full transition-colors"
                      >
                        {item.timestamp}
                      </button>
                      <p className="text-[16px] text-gray-700 leading-[1.65] flex-1">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legacy Key Insights (for backward compatibility) */}
          {analysis.keyInsights && analysis.keyInsights.length > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Key Insights
                </h2>
                <ul className="space-y-3 text-[16px] text-gray-700">
                  {analysis.keyInsights.map((insight, index) => (
                    <li key={index} className="flex gap-3 leading-[1.65] break-words">
                      <span className="text-indigo-600 mt-0.5 flex-shrink-0">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Legacy Deep Summary (for backward compatibility) */}
          {analysis.deepSummary && analysis.deepSummary.length > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Deep Summary
                </h2>
                <div className="space-y-4 text-[16px] text-gray-700 leading-[1.65] max-w-none break-words">
                  {analysis.deepSummary.map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Key Moments */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                Key Moments
              </h2>
              <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Must Watch Callout */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-orange-200">
              <h3 className="text-[22px] font-semibold text-gray-900 mb-4">
                ⏱️ Must Watch
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.65] break-words">
                <strong>Jump to <button onClick={() => handleTimestampClick(analysis.mustWatch.timestamp)} className="text-indigo-600 font-semibold hover:text-indigo-800 underline cursor-pointer transition-colors">{analysis.mustWatch.timestamp}</button></strong> — {analysis.mustWatch.description}
              </p>
            </div>
          </div>

          {/* Mental Models Section */}
          {analysis.mentalModels && analysis.mentalModels.length > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Mental Models & Frameworks
                </h2>
                <ul className="space-y-3 text-[16px] text-gray-700">
                  {analysis.mentalModels.map((model, index) => (
                    <li key={index} className="flex gap-3 leading-[1.65] break-words">
                      <span className="text-indigo-600 mt-0.5 flex-shrink-0">▸</span>
                      <span>{model}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Blindspots Section */}
          {analysis.blindspots && analysis.blindspots.length > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-5">
                  Strategic Blindspots
                </h2>
                <ul className="space-y-3 text-[16px] text-gray-700">
                  {analysis.blindspots.map((blindspot, index) => (
                    <li key={index} className="flex gap-3 leading-[1.65] break-words">
                      <span className="text-amber-600 mt-0.5 flex-shrink-0">⚠</span>
                      <span>{blindspot}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        {/* End Main Content Centered Column */}
      </div>
    </div>
  );
}
