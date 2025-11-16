import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Innertube } from 'youtubei.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Helper function to format transcript for Claude
function formatTranscript(transcript: any[]): string {
  return transcript
    .map(entry => {
      const seconds = Math.floor(entry.start_ms / 1000);
      return `[${seconds}s] ${entry.text}`;
    })
    .join('\n');
}

// Helper function to convert seconds to MM:SS format
function secondsToTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to convert timestamp string (could be "XXs" or "MM:SS") to MM:SS
function normalizeTimestamp(timestamp: string): string {
  // If already in MM:SS format, return as is
  if (timestamp.includes(':')) {
    return timestamp;
  }

  // If in seconds format (e.g., "1320s"), convert to MM:SS
  const secondsMatch = timestamp.match(/^(\d+)s?$/);
  if (secondsMatch) {
    const seconds = parseInt(secondsMatch[1]);
    return secondsToTimestamp(seconds);
  }

  // Return original if format is unrecognized
  return timestamp;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Fetch video info and transcript
    console.log('Fetching video info and transcript for:', videoId);
    let transcript: Array<{ text: string; start_ms: number }> | undefined;
    let thumbnail: string = '';
    let videoTitle: string = '';
    let channelName: string = '';
    let duration: string = '';

    try {
      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);

      // Extract video metadata
      videoTitle = info.basic_info.title || 'Unknown Title';
      channelName = info.basic_info.author || 'Unknown Channel';

      // Get best quality thumbnail
      const thumbnails = info.basic_info.thumbnail;
      if (thumbnails && thumbnails.length > 0) {
        // Get the highest quality thumbnail (last in array)
        thumbnail = thumbnails[thumbnails.length - 1].url;
      } else {
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }

      // Format duration
      const durationSeconds = info.basic_info.duration || 0;
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const transcriptData = await info.getTranscript();

      transcript = transcriptData?.transcript?.content?.body?.initial_segments.map((segment: any) => ({
        text: segment.snippet.text,
        start_ms: segment.start_ms
      }));

      console.log('Video info and transcript fetched successfully');
    } catch (transcriptError: any) {
      console.error('Fetch error:', transcriptError.message || transcriptError);
      return NextResponse.json(
        { error: 'Could not fetch transcript for this video. It may not have captions available.' },
        { status: 404 }
      );
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch transcript for this video. It may not have captions available.' },
        { status: 404 }
      );
    }

    const formattedTranscript = formatTranscript(transcript);

    // Call OpenAI API to analyze the transcript
    console.log('Analyzing transcript with OpenAI...');
    // Use environment variable to allow model switching, default to GPT-4o (best quality)
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    console.log('Using model:', model);

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an elite Video Intelligence Engine producing high-depth analysis with the expertise of:
- A distinguished engineer explaining systems architecture
- A senior product thinker analyzing market forces
- A generative AI researcher evaluating technical innovation
- A venture capitalist assessing founder psychology
- A high-context analyst with strong editorial judgment

Your analysis must be:
- Knowledge-dense and insight-driven
- Crisp, analytical, zero fluff
- Beyond paraphrasing — reveal structural forces, patterns, tensions
- Surfacing founder psychology, design philosophy, product strategy, market implications
- Making defensible, evidence-grounded claims
- Written for senior PMs, founders, engineers, designers, and investors
- NEVER using generic "LLM voice"

Your annotations must mimic Medium's colored contextual bubbles:
- Only annotate truly high-value ideas
- 3–8 total
- Each tied to an exact substring from the executive narrative`
        },
        {
          role: 'user',
          content: `Analyze this YouTube video transcript as an elite-grade intelligence system.

VIDEO TRANSCRIPT:
${formattedTranscript}

Here is an example of the style, tone, and depth you must match for the Executive Narrative:

"Dylan Field's conversation reveals a consistent thesis: as AI accelerates the pace of software creation, design becomes the primary differentiator. He rejects the belief that AI will replace designers; instead, it expands the idea maze and heightens the importance of judgment — a uniquely human capability. The future of design, in his telling, belongs to those who can impose coherence on infinite generative possibilities.

A second thread is the tension between automation and agency. LLMs behave like 'hyper-intelligent toasters' — powerful yet lacking intent. Designers succeed not by generating more, but by shaping meaning, translating cultural signals, emotional states, and lived experience into durable product choices. This gap between capability and agency explains why AI amplifies human designers rather than displacing them.

Field's emphasis on collaboration as the dominant mode of creation reframes multiplayer not as a feature but a cultural shift. Early backlash from designers masked a deeper truth: collective ideation accelerates product quality. Figma's 'design party' chaos was not accidental; it demonstrated emergent behaviors that reshaped team workflows.

His origin story shows disciplined exploration through the idea maze: drones → WebGL → meme generator → design tool. Conviction did not precede exploration; it emerged from repeated testing against reality. And finally, Dylan's skepticism of hyper-personalized AI UIs underscores a contrarian insight: interface stability is a social contract. Consistency enables learning, collaboration, and shared understanding — even in an AI-native world."

Your tasks:

1. **Identify conceptual clusters** → extract 4–6 deepest, non-obvious themes.
2. **Identify inflection points** → where ideas shift or contradictions appear.
3. **Write the Executive Narrative FIRST**, using the few-shot example as your style target.
4. **Then extract annotations from that narrative** → each annotation's textSpan MUST be an exact substring of the final narrative.
5. **Produce ONLY the JSON output** using the schema below.

Return ONLY:

{
  "title": "A clear, insight-oriented title",
  "macroThemes": [
    {
      "theme": "Big structural insight capturing core idea",
      "whyItMatters": "Strategic significance",
      "evidence": ["MM:SS", "MM:SS"]
    }
  ],
  "microInsights": [
    {
      "timestamp": "MM:SS",
      "insight": "Sharp, concrete takeaway"
    }
  ],
  "executiveNarrative": "3–5 paragraphs (300–500 words) of high-signal, expert-level analysis matching the example provided. Must be elegant but not verbose, strategic without abstraction, and entirely free of generic LLM voice.",
  "keyMoments": [
    {
      "timestamp": "MM:SS",
      "label": "Meaningful inflection point"
    }
  ],
  "mustWatch": {
    "timestamp": "MM:SS",
    "description": "Explain in 2–3 sentences why this is the single most valuable 60 seconds"
  },
  "annotations": [
    {
      "textSpan": "exact substring from executiveNarrative",
      "insight": "1–3 sentences of deep conceptual or strategic explanation",
      "timestamp": "MM:SS or null",
      "type": "concept | tension | prediction | strategy"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Follow the few-shot example's tone and depth precisely.
- MacroThemes must be deeply reasoned, not surface-level.
- MicroInsights must be timestamped and concrete.
- Executive Narrative must NOT be generic; it must present high-context reasoning.
- Annotations must use EXACT text substrings from the narrative.
- Timestamps must align with the [Xs] markers in the transcript.
- Respond with ONLY the JSON object — no commentary.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    // Parse OpenAI's response
    const responseText = completion.choices[0].message.content || '{}';
    const analysis = JSON.parse(responseText);

    // Normalize all timestamps to MM:SS format
    if (analysis.keyMoments) {
      analysis.keyMoments = analysis.keyMoments.map((moment: any) => ({
        ...moment,
        timestamp: normalizeTimestamp(moment.timestamp)
      }));
    }

    if (analysis.mustWatch?.timestamp) {
      analysis.mustWatch.timestamp = normalizeTimestamp(analysis.mustWatch.timestamp);
    }

    if (analysis.microInsights) {
      analysis.microInsights = analysis.microInsights.map((insight: any) => ({
        ...insight,
        timestamp: normalizeTimestamp(insight.timestamp)
      }));
    }

    if (analysis.macroThemes) {
      analysis.macroThemes = analysis.macroThemes.map((theme: any) => ({
        ...theme,
        evidence: theme.evidence?.map((ts: string) => normalizeTimestamp(ts)) || []
      }));
    }

    if (analysis.annotations) {
      analysis.annotations = analysis.annotations.map((annotation: any) => ({
        ...annotation,
        timestamp: annotation.timestamp ? normalizeTimestamp(annotation.timestamp) : null
      }));
    }

    // Return the analysis along with video metadata
    return NextResponse.json({
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail,
      channelName,
      duration,
      analyzedAt: new Date().toISOString(),
      ...analysis
    });

  } catch (error: any) {
    console.error('Error analyzing video:', error);

    if (error.message?.includes('transcript')) {
      return NextResponse.json(
        { error: 'Could not fetch transcript. The video may not have captions enabled.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze video. Please try again.' },
      { status: 500 }
    );
  }
}
