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

## Architecture

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript, Tailwind CSS
- **Analysis**: OpenAI GPT-4o for elite-grade synthesis
- **Transcript**: youtubei.js for YouTube data extraction
- **UI Components**: Custom components with Google Labs-inspired design
- **Storage**: localStorage for video history, sessionStorage for analysis data

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
