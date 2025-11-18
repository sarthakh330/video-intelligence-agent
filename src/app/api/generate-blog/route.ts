import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TypeScript interfaces for blog content
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

interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
}

interface Resource {
  title: string;
  url: string;
  description: string;
  type: 'article' | 'video' | 'paper' | 'tool';
}

interface BlogContent {
  title: string;
  subtitle: string;
  publicationDate: string;
  estimatedReadTime: number;
  sections: BlogSection[];
  citations: Citation[];
  relatedResources: Resource[];
  tags: string[];
  summary: string;
}

// Helper function to generate screenshot URLs at specific timestamps
async function generateScreenshotUrl(videoId: string, timestamp: string): Promise<string> {
  // Convert timestamp (MM:SS) to seconds
  const parts = timestamp.split(':');
  const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);

  // Option 1: Use screenshot service (recommended for production)
  // Requires SCREENSHOT_API_KEY in .env.local
  if (process.env.SCREENSHOT_API_KEY) {
    // Example with screenshotone.com
    const apiKey = process.env.SCREENSHOT_API_KEY;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
    return `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(videoUrl)}&viewport_width=1920&viewport_height=1080&device_scale_factor=1&format=jpg&block_ads=true&block_cookie_banners=true&delay=3`;
  }

  // Option 2: Use YouTube's vi_webp format (unofficial, may not work for all videos)
  // This sometimes provides timestamp-specific thumbnails
  const frameNumber = Math.floor(seconds / 10); // Approximate frame
  return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;

  // Option 3: Fallback to default thumbnail with timestamp overlay
  // return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, analysisData, includeResearch = false } = await request.json();

    if (!videoId || !analysisData) {
      return NextResponse.json(
        { error: 'videoId and analysisData are required' },
        { status: 400 }
      );
    }

    console.log('Generating blog post for video:', videoId);

    // Use GPT-4 for highest quality writing (or gpt-4-turbo for speed/cost balance)
    const model = process.env.OPENAI_BLOG_MODEL || 'gpt-4o';
    console.log('Using model:', model);

    // Create comprehensive blog generation prompt
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an elite technology analyst and strategic writer producing long-form analysis for executives, founders, investors, and industry leaders. Your writing mirrors the depth and sophistication of:

- **Stratechery** (Ben Thompson): Strategic business analysis with clear frameworks
- **MIT Technology Review**: Technical rigor with accessible explanations
- **a16z Essays**: First-principles thinking about technology trends
- **The Economist**: Global context and implications

Core Writing Principles:
- Start with strategic context and industry framing (not the video itself)
- Develop a clear, defensible thesis with supporting evidence
- Include contrarian or non-obvious insights that challenge consensus
- Connect specific observations to broader technology/business trends
- Write 2500-3500 words of substantive, information-dense analysis
- Use sophisticated prose that is still accessible to educated readers
- Ground all analysis in concrete examples from the video transcript
- Add external industry context and strategic implications
- Include multiple stakeholder perspectives (founders, investors, users, competitors)
- End with actionable insights and future outlook

Structural Requirements:
- Hook that establishes stakes and strategic importance
- Clear thesis statement in opening section
- 4-6 main sections with descriptive headers
- Logical flow building toward synthesis
- Strategic implications and takeaways
- Citations showing broader research
- Related resources for deeper exploration

Your analysis should be:
- **Information-rich**: Every sentence adds value
- **Strategic**: Focus on "why it matters" not just "what happened"
- **Contrarian**: Surface non-obvious insights
- **Evidence-based**: Cite specific moments and external sources
- **Forward-looking**: Implications and predictions
- **Stakeholder-aware**: Consider multiple perspectives`
        },
        {
          role: 'user',
          content: `Create a publication-quality blog post analyzing this YouTube video.

VIDEO METADATA:
- Title: ${analysisData.title}
- Channel: ${analysisData.channelName || 'Unknown'}
- Duration: ${analysisData.duration || 'Unknown'}
- Video ID: ${videoId}

EXISTING VIDEO ANALYSIS:
${JSON.stringify({
  macroThemes: analysisData.macroThemes,
  executiveNarrative: analysisData.executiveNarrative,
  microInsights: analysisData.microInsights,
  keyMoments: analysisData.keyMoments,
  mustWatch: analysisData.mustWatch
}, null, 2)}

Your blog post should include:

1. **OPENING: Hook & Strategic Context** (400-500 words)
   - Industry context and why this topic matters NOW
   - Strategic framing (not "in this video..." but broader implications)
   - Clear thesis statement
   - Stakes: Who should care and why?

2. **MAIN ANALYSIS: 4-6 Sections** (2000-2500 words total)
   Each section should:
   - Have a descriptive, insight-oriented header
   - Develop one key idea with supporting evidence from video
   - Connect to broader industry trends or strategic frameworks
   - Include concrete examples and specific timestamps
   - Surface non-obvious implications

   Suggest 4-6 key moments for screenshots with compelling captions

3. **SYNTHESIS & IMPLICATIONS** (400-500 words)
   - Key strategic takeaways
   - Implications for different stakeholders (founders, investors, users)
   - Contrarian perspectives or tensions
   - Future outlook and predictions

4. **SUPPORTING MATERIALS**
   - 2-3 pull quotes from the video that capture key insights
   - 5-10 citations to external sources (industry reports, competitor analysis, market data)
   - 3-5 related resources for deeper reading
   - 5-7 relevant tags

CRITICAL REQUIREMENTS:
- Write in active voice with strong verbs
- Avoid generic LLM phrases ("it's worth noting", "in today's world", "at the end of the day")
- Every paragraph should advance the argument
- Include specific evidence from the video (reference timestamps and quotes)
- Maintain intellectual rigor while being readable
- Show your reasoning, don't just assert conclusions
- Format citations as: [1] Author, "Title", Publication, Year

Return ONLY a JSON object matching this exact schema:

{
  "title": "Strategic, insight-oriented title (not clickbait)",
  "subtitle": "One-sentence value proposition",
  "publicationDate": "${new Date().toISOString()}",
  "estimatedReadTime": <number of minutes>,
  "sections": [
    {
      "id": "section-1",
      "heading": "Section title",
      "level": 2,
      "content": "Full section content (markdown formatted)",
      "screenshots": [
        {
          "timestamp": "MM:SS",
          "caption": "Screenshot caption that advances the narrative"
        }
      ],
      "pullQuotes": [
        {
          "text": "Exact quote from video",
          "attribution": "Speaker name",
          "timestamp": "MM:SS"
        }
      ]
    }
  ],
  "citations": [
    {
      "id": "1",
      "title": "Source title",
      "url": "https://...",
      "source": "Publication name"
    }
  ],
  "relatedResources": [
    {
      "title": "Resource title",
      "url": "https://...",
      "description": "Why this resource is valuable",
      "type": "article"
    }
  ],
  "tags": ["tag1", "tag2", ...],
  "summary": "2-3 sentence summary for social sharing"
}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,  // Slightly higher for creative writing
      max_tokens: 8000    // Allow for long-form content
    });

    const responseText = completion.choices[0].message.content || '{}';
    const blogContent: BlogContent = JSON.parse(responseText);

    console.log('Blog post generated successfully');
    console.log('- Title:', blogContent.title);
    console.log('- Sections:', blogContent.sections.length);
    console.log('- Estimated read time:', blogContent.estimatedReadTime, 'minutes');

    // Generate actual screenshot URLs for each screenshot in the blog
    console.log('Generating screenshot URLs...');
    for (const section of blogContent.sections) {
      if (section.screenshots && section.screenshots.length > 0) {
        for (const screenshot of section.screenshots) {
          try {
            screenshot.url = await generateScreenshotUrl(videoId, screenshot.timestamp);
            console.log(`- Screenshot for ${screenshot.timestamp}: ${screenshot.url.substring(0, 60)}...`);
          } catch (error) {
            console.error(`Failed to generate screenshot for ${screenshot.timestamp}:`, error);
            // Fallback to default thumbnail
            screenshot.url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }
      }
    }

    return NextResponse.json({
      videoId,
      blog: blogContent,
      generatedAt: new Date().toISOString(),
      model: model,
      success: true
    });

  } catch (error: any) {
    console.error('Error generating blog post:', error);

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate blog post. Please try again.' },
      { status: 500 }
    );
  }
}
