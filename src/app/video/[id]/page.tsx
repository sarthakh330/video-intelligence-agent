'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { Chip } from '@/components/Chip';
import { AnnotatedText } from '@/components/AnnotatedText';
import { BlogViewer } from '@/components/BlogViewer';

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

interface BlogSection {
  id: string;
  heading: string;
  level: 1 | 2 | 3;
  content: string;
  screenshots?: Array<{
    timestamp: string;
    caption: string;
    url?: string;  // Generated screenshot URL
  }>;
  pullQuotes?: Array<{
    text: string;
    attribution?: string;
    timestamp?: string;
  }>;
}

interface BlogContent {
  title: string;
  subtitle: string;
  publicationDate: string;
  estimatedReadTime: number;
  sections: BlogSection[];
  citations: Array<{
    id: string;
    title: string;
    url: string;
    source: string;
  }>;
  relatedResources: Array<{
    title: string;
    url: string;
    description: string;
    type: 'article' | 'video' | 'paper' | 'tool';
  }>;
  tags: string[];
  summary: string;
}

interface VideoAnalysis {
  videoId: string;
  videoUrl: string;
  title: string;
  channelName?: string;
  duration?: string;
  // New fields
  macroThemes?: MacroTheme[];
  microInsights?: MicroInsight[];
  executiveNarrative?: string;
  annotations?: Annotation[];
  // Blog content (generated on demand)
  blog?: BlogContent;
  blogGeneratedAt?: string;
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
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [blogError, setBlogError] = useState<string>('');

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

  const handleGenerateBlog = async () => {
    if (!analysis || generatingBlog) return;

    setGeneratingBlog(true);
    setBlogError('');

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId || analysis.videoId,
          analysisData: analysis
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog post');
      }

      // Update analysis with blog content
      const updatedAnalysis = {
        ...analysis,
        blog: data.blog,
        blogGeneratedAt: data.generatedAt
      };

      setAnalysis(updatedAnalysis);

      // Also update sessionStorage
      sessionStorage.setItem('videoAnalysis', JSON.stringify(updatedAnalysis));

      // Smooth scroll to blog section
      setTimeout(() => {
        document.getElementById('blog-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);

    } catch (err: any) {
      setBlogError(err.message || 'Failed to generate blog post. Please try again.');
      console.error('Blog generation error:', err);
    } finally {
      setGeneratingBlog(false);
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

          {/* Blog Generation Section */}
          {!analysis.blog && (
            <div className="mt-12 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-sm border border-indigo-200">
                <div className="max-w-[600px]">
                  <h2 className="text-[24px] font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    Generate Long-Form Blog Post
                  </h2>
                  <p className="text-[16px] text-gray-700 leading-[1.65] mb-6">
                    Transform this analysis into a Stratechery-quality blog post with in-depth strategic insights, external context, screenshots, and citations. Perfect for sharing or deeper study.
                  </p>

                  {blogError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {blogError}
                    </div>
                  )}

                  <button
                    onClick={handleGenerateBlog}
                    disabled={generatingBlog}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {generatingBlog ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating Blog Post... (30-60s)</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Generate Blog Post</span>
                      </>
                    )}
                  </button>

                  {generatingBlog && (
                    <p className="mt-4 text-sm text-gray-600">
                      Creating publication-quality analysis with external research and strategic insights...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* End Main Content Centered Column */}
      </div>

      {/* Blog Section - Full Width */}
      {analysis.blog && (
        <div id="blog-section" className="bg-gray-50 border-t-4 border-indigo-500 py-16">
          <div className="max-w-[1200px] mx-auto px-8">
            <div className="mb-8 text-center">
              <h2 className="text-[32px] font-bold text-gray-900 mb-3">
                Long-Form Analysis
              </h2>
              <p className="text-gray-600">
                In-depth strategic insights and industry context
              </p>
            </div>

            <BlogViewer
              blog={analysis.blog}
              videoId={videoId || analysis.videoId}
              onTimestampClick={handleTimestampClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}
