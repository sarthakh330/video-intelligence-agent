import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface HomePageProps {
  onAnalyze: (url: string) => void;
}

export function HomePage({ onAnalyze }: HomePageProps) {
  const [url, setUrl] = useState('');

  const handleAnalyze = () => {
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  const recentVideos = [
    {
      id: 1,
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
      title: 'The Future of AI: What Experts Predict',
      date: 'Nov 14, 2025'
    },
    {
      id: 2,
      thumbnail: 'https://images.unsplash.com/photo-1551817958-20e7b562e1bc?w=400&h=225&fit=crop',
      title: 'Understanding Quantum Computing in 10 Minutes',
      date: 'Nov 12, 2025'
    },
    {
      id: 3,
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop',
      title: 'Climate Change: The Path Forward',
      date: 'Nov 10, 2025'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] text-[#111827] mb-3">Video Intelligence Reader</h1>
          <p className="text-[16px] text-[#4B5563] max-w-[600px] mx-auto">
            Transform any YouTube video into a rich, readable summary with key insights, timestamped moments, and deep analysis.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-16">
          <div className="mb-3">
            <Input
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={setUrl}
            />
          </div>
          <Button onClick={handleAnalyze}>Analyze Video</Button>
        </div>

        {/* Recent Videos */}
        <div>
          <h2 className="text-[20px] text-[#111827] mb-6">Recent Videos</h2>
          <div className="space-y-4">
            {recentVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => onAnalyze('sample')}
                className="w-full flex gap-4 p-4 bg-[#F8FAFC] hover:bg-[#E0F7F4] border border-[#E5E7EB] rounded-lg transition-colors text-left"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-[160px] h-[90px] object-cover rounded"
                />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-[16px] text-[#111827] mb-1">{video.title}</h3>
                  <p className="text-[13px] text-[#4B5563]">{video.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
