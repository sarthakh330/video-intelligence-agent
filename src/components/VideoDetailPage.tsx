import { ArrowLeft } from 'lucide-react';
import { Card } from './Card';
import { Chip } from './Chip';
import { CalloutCard } from './CalloutCard';

interface VideoDetailPageProps {
  onBack: () => void;
}

export function VideoDetailPage({ onBack }: VideoDetailPageProps) {
  const keyMoments = [
    { timestamp: '0:45', label: 'Introduction & Context' },
    { timestamp: '2:30', label: 'Main Problem Explained' },
    { timestamp: '5:15', label: 'First Key Solution' },
    { timestamp: '8:20', label: 'Case Study Example' },
    { timestamp: '11:45', label: 'Common Misconceptions' },
    { timestamp: '14:30', label: 'Practical Application' },
    { timestamp: '17:00', label: 'Future Implications' },
    { timestamp: '19:15', label: 'Summary & Takeaways' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6A6A6A] hover:text-[#1CC6B2] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[14px]">Back to Home</span>
        </button>

        {/* Two Column Layout */}
        <div className="flex gap-12 items-start">
          {/* LEFT COLUMN - Fixed Width */}
          <div className="w-[580px] flex-shrink-0 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-[#111827] rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-[#1CC6B2] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-sm text-[#F8FAFC]">YouTube Video Player</p>
              </div>
            </div>

            {/* Video Metadata */}
            <div>
              <h1 className="text-[34px] text-[#111827] mb-3 leading-tight">
                The Future of AI: What Experts Predict for 2025 and Beyond
              </h1>
              <div className="flex items-center gap-3 text-[14px] text-[#6A6A6A]">
                <span>Tech Insights Channel</span>
                <span>•</span>
                <span>21:34</span>
                <span>•</span>
                <span>Nov 16, 2025</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Stacked Cards */}
          <div className="flex-1 space-y-8">
            {/* Deep Summary Card - Part 1 */}
            <Card maxHeight="480px">
              <h2 className="text-[18px] text-[#111827] mb-5">Deep Summary</h2>
              <div className="space-y-5 text-[15px] text-[#111827] leading-[1.7]">
                <p>
                  This comprehensive exploration of artificial intelligence begins by examining the current state of AI development and its rapid acceleration over the past few years. The speaker emphasizes how machine learning models have evolved from simple pattern recognition to complex systems capable of nuanced understanding and generation.
                </p>
                <p>
                  The discussion moves into the practical applications already transforming industries. From healthcare diagnostics that can identify diseases earlier than human doctors, to financial systems that predict market trends with unprecedented accuracy, AI is reshaping the fundamental operations of modern business and society.
                </p>
              </div>
            </Card>

            {/* Deep Summary Card - Part 2 */}
            <Card maxHeight="480px">
              <div className="space-y-5 text-[15px] text-[#111827] leading-[1.7]">
                <p>
                  A significant portion addresses the ethical considerations surrounding AI deployment. Questions of bias in training data, transparency in decision-making algorithms, and the potential for misuse are explored in depth. The speaker argues for proactive regulation and industry self-governance to ensure AI benefits humanity broadly.
                </p>
                <p>
                  Looking ahead, the presentation outlines three major trends expected to dominate the next decade: increased personalization of AI assistants, breakthrough applications in scientific research and discovery, and the democratization of AI tools making them accessible to non-technical users across all sectors.
                </p>
              </div>
            </Card>

            {/* Key Insights Card */}
            <Card maxHeight="520px">
              <h2 className="text-[18px] text-[#111827] mb-5">Key Insights</h2>
              <ul className="space-y-4 text-[15px] text-[#111827]">
                <li className="flex gap-3 leading-[1.7]">
                  <span className="text-[#1CC6B2] mt-1">•</span>
                  <span>AI development is accelerating exponentially, with capabilities doubling every 12-18 months</span>
                </li>
                <li className="flex gap-3 leading-[1.7]">
                  <span className="text-[#1CC6B2] mt-1">•</span>
                  <span>Healthcare and scientific research are seeing the most immediate transformative impacts</span>
                </li>
                <li className="flex gap-3 leading-[1.7]">
                  <span className="text-[#1CC6B2] mt-1">•</span>
                  <span>Ethical frameworks must be established now to prevent future misuse and bias</span>
                </li>
                <li className="flex gap-3 leading-[1.7]">
                  <span className="text-[#1CC6B2] mt-1">•</span>
                  <span>Democratization of AI tools will enable non-technical users to leverage advanced capabilities</span>
                </li>
                <li className="flex gap-3 leading-[1.7]">
                  <span className="text-[#1CC6B2] mt-1">•</span>
                  <span>The relationship between human creativity and AI assistance will redefine knowledge work</span>
                </li>
                <li className="flex gap-3 leading-[1.7]">
                  <span className="text-[#1CC6B2] mt-1">•</span>
                  <span>Investment in AI education and literacy is critical for workforce adaptation</span>
                </li>
              </ul>
            </Card>

            {/* Key Moments Card */}
            <Card>
              <h2 className="text-[18px] text-[#111827] mb-5">Key Moments</h2>
              <div className="flex flex-wrap gap-2">
                {keyMoments.map((moment, index) => (
                  <Chip
                    key={index}
                    timestamp={moment.timestamp}
                    label={moment.label}
                    onClick={() => console.log(`Jump to ${moment.timestamp}`)}
                  />
                ))}
              </div>
            </Card>

            {/* Must Watch Callout */}
            <div className="bg-[#E5F7F8] border border-[#1CC6B2]/20 rounded-[12px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-[18px] text-[#111827] mb-4">If you only watch 60 seconds, watch this</h3>
              <p className="text-[15px] text-[#111827] leading-[1.7]">
                <strong>Jump to <span className="text-[#1CC6B2]">14:30</span></strong> where the speaker delivers a powerful 
                60-second summary of how AI will practically impact your daily life within the next 2 years. 
                This segment distills the entire presentation into actionable insights you can apply immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}