# Video Intelligence Reader

An elite-grade Video Intelligence Engine that transforms YouTube videos into deep, strategic analysis with the expertise of distinguished engineers, senior product thinkers, and venture capitalists.

## Features

### Elite Analysis System
- **Macro Themes**: 4-6 deep structural insights capturing big ideas and strategic significance
- **Executive Narrative**: 3-5 flowing paragraphs of high-signal, expert-level analysis
- **Medium-Style Annotations**: Contextual highlights with deep conceptual explanations
- **Micro Insights**: Timestamped sharp takeaways (not generic observations)
- **Key Moments**: Meaningful inflection points in the video
- **Must-Watch Segment**: The single most valuable 60 seconds
- **Long-Form Blog Generation**: Transform analysis into 2500-3500 word Stratechery-quality blog posts

### Writing Style
- Knowledge-dense and insight-driven
- Crisp, analytical, zero fluff
- Reveals structural forces, patterns, and tensions
- Surfaces founder psychology, design philosophy, product strategy
- Written for senior PMs, founders, engineers, designers, and investors

### Annotation Types
- 💡 **Concept**: Deep conceptual explanations
- ⚡ **Tension**: Contradictions and tradeoffs
- 🔮 **Prediction**: Long-term consequences and strategic outlook
- 🎯 **Strategy**: Decision frameworks and tactical insights

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Add your OpenAI API key:
```
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o  # or gpt-4o-mini for faster/cheaper analysis
OPENAI_BLOG_MODEL=gpt-4o  # Model for blog generation (gpt-4o recommended)
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

```bash
npm test
```

## Long-Form Blog Generation

Transform video analysis into publication-quality blog posts matching the depth of Stratechery, MIT Technology Review, and a16z essays.

### Features
- **2500-3500 word articles** with strategic depth
- **Industry context and framing** beyond the video content
- **Structured sections** with insight-oriented headers
- **Pull quotes** from key moments in the video
- **Screenshot integration** at strategic points
- **Citations and references** to external sources
- **Related resources** for deeper exploration
- **Export to Markdown** for publishing anywhere

### How to Generate
1. Analyze a video (existing workflow)
2. Click "Generate Blog Post" button at bottom of analysis
3. Wait 30-60 seconds for generation
4. Blog appears below with full formatting
5. Export to Markdown for your blog/Medium/Substack

### Screenshot Quality
By default, blog posts use YouTube's default thumbnail for all screenshots. For **actual video frame grabs** at specific timestamps:

1. Sign up for [ScreenshotOne](https://screenshotone.com/) (or similar service)
2. Add `SCREENSHOT_API_KEY=your-key` to `.env.local`
3. Blog posts will now include actual frame captures at key moments

**Without API:** Default YouTube thumbnail for all images
**With API:** Precise frame grabs at AI-identified timestamps

### Cost Considerations
- Video analysis: ~$0.05-0.15 per video
- Blog generation: ~$0.30-0.80 per blog
- Screenshots (optional): ~$0.01-0.05 per image
- **Total per video with blog: ~$0.35-0.95** (or ~$0.40-1.25 with screenshots)

### Writing Quality
Blog posts are optimized to match:
- **Stratechery**: Strategic business frameworks and analysis
- **MIT Tech Review**: Technical rigor with accessibility
- **a16z Essays**: First-principles thinking about trends
- **The Economist**: Global context and implications

## macOS Desktop App

A native macOS desktop application that packages the Video Intelligence Reader as a standalone app with automatic backend management.

### Features
- **One-Click Launch**: Opens directly from Applications - no terminal needed
- **Automatic Backend**: Starts Next.js server automatically in the background
- **Port Management**: Automatically handles port conflicts
- **Graceful Shutdown**: Cleans up backend process when app closes
- **Native Experience**: Full macOS integration with dock icon and window management

### Installation

**Option 1: Build from Source**
```bash
cd VideoAgentDesktopApp
npm install
npm run dist
```

The DMG installer will be created in `VideoAgentDesktopApp/dist/Video Agent-1.0.0-arm64.dmg`

**Option 2: Install Pre-built DMG**
1. Download the DMG file
2. Open the DMG
3. Drag "Video Agent" to Applications folder
4. Launch from Applications

### Requirements
- macOS 10.15 (Catalina) or later
- Node.js 18.x or later (must be installed on your system)
- All dependencies from the main project installed

### How It Works
1. App launches and automatically starts the Next.js development server
2. Waits for backend to be ready (with health checks)
3. Opens the web interface in an Electron window
4. Automatically terminates the backend when you quit the app

For more details, see [VideoAgentDesktopApp/README.md](VideoAgentDesktopApp/README.md)

## Architecture

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript, Tailwind CSS
- **Analysis**: OpenAI GPT-4o for elite-grade synthesis
- **Transcript**: youtubei.js for YouTube data extraction
- **UI Components**: Custom components with Google Labs-inspired design
- **Storage**: localStorage for video history, sessionStorage for analysis data
- **Desktop App**: Electron wrapper for native macOS experience

## API Schema

The `/api/analyze` endpoint returns:

```typescript
{
  video: {
    videoId: string;
    title: string;
    thumbnail: string;
    duration: string;
    channelName: string;
  },
  analysis: {
    macroThemes: Array<{
      theme: string;
      whyItMatters: string;
      evidence: string[];  // timestamps
    }>,
    executiveNarrative: string;
    annotations: Array<{
      textSpan: string;  // exact substring from narrative
      insight: string;
      timestamp: string | null;
      type: 'concept' | 'tension' | 'prediction' | 'strategy';
    }>,
    microInsights: Array<{
      timestamp: string;
      insight: string;
    }>,
    keyMoments: Array<{
      timestamp: string;
      label: string;
    }>,
    mustWatch: {
      timestamp: string;
      description: string;
    }
  }
}
```

## Design Philosophy

This tool produces analysis that reads like it came from:
- A senior designer explaining AI-era tooling
- A VC explaining founder psychology
- A distinguished engineer explaining systems architecture
- A product manager explaining market forces

Every insight is concrete, grounded in the transcript, and written with intellectual sharpness. No generic "LLM voice."
