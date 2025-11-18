'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

interface BlogViewerProps {
  blog: BlogContent;
  videoId: string;
  onTimestampClick?: (timestamp: string) => void;
  onExport?: (format: 'markdown' | 'html') => void;
}

export function BlogViewer({ blog, videoId, onTimestampClick, onExport }: BlogViewerProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleExportMarkdown = () => {
    let markdown = `# ${blog.title}\n\n`;
    markdown += `${blog.subtitle}\n\n`;
    markdown += `**Published:** ${formatDate(blog.publicationDate)} | **Read time:** ${blog.estimatedReadTime} min\n\n`;
    markdown += `---\n\n`;

    blog.sections.forEach(section => {
      const headerLevel = '#'.repeat(section.level);
      markdown += `${headerLevel} ${section.heading}\n\n`;
      markdown += `${section.content}\n\n`;

      if (section.pullQuotes && section.pullQuotes.length > 0) {
        section.pullQuotes.forEach(quote => {
          markdown += `> "${quote.text}"\n`;
          if (quote.attribution) markdown += `> — ${quote.attribution}\n`;
          markdown += `\n`;
        });
      }
    });

    if (blog.citations.length > 0) {
      markdown += `\n## References\n\n`;
      blog.citations.forEach(citation => {
        markdown += `[${citation.id}] [${citation.title}](${citation.url}) - ${citation.source}\n\n`;
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blog.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white">
      {/* Blog Header */}
      <div className="max-w-[900px] mx-auto px-8 py-12 border-b border-gray-200">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
              Long-Form Analysis
            </span>
            <span className="text-sm text-gray-500">
              {blog.estimatedReadTime} min read
            </span>
          </div>

          <h1 className="text-[48px] font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            {blog.title}
          </h1>

          <p className="text-[24px] text-gray-600 leading-[1.4] mb-8">
            {blog.subtitle}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <time dateTime={blog.publicationDate}>
              {formatDate(blog.publicationDate)}
            </time>

            <div className="flex gap-2">
              <button
                onClick={handleExportMarkdown}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                Export Markdown
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Blog Content */}
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <article className="prose prose-lg max-w-none">
          {blog.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mb-16 scroll-mt-24"
            >
              {/* Section Heading */}
              {section.level === 2 && (
                <h2 className="text-[36px] font-bold text-gray-900 mb-6 leading-tight">
                  {section.heading}
                </h2>
              )}
              {section.level === 3 && (
                <h3 className="text-[28px] font-semibold text-gray-900 mb-5 leading-tight">
                  {section.heading}
                </h3>
              )}

              {/* Section Content */}
              <div className="text-[19px] leading-[1.75] text-gray-800 space-y-6">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-6 leading-[1.75]">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-[1.75]">{children}</li>
                    ),
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>

              {/* Screenshots */}
              {section.screenshots && section.screenshots.length > 0 && (
                <div className="my-10 space-y-8">
                  {section.screenshots.map((screenshot, idx) => (
                    <figure key={idx} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={screenshot.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={screenshot.caption}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default thumbnail if screenshot fails to load
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }}
                        />

                        {/* Timestamp badge */}
                        {onTimestampClick && (
                          <button
                            onClick={() => onTimestampClick(screenshot.timestamp)}
                            className="absolute bottom-4 right-4 px-3 py-2 bg-black/80 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            {screenshot.timestamp}
                          </button>
                        )}
                      </div>

                      <figcaption className="px-6 py-4 text-[15px] text-gray-600 leading-relaxed">
                        {screenshot.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              {/* Pull Quotes */}
              {section.pullQuotes && section.pullQuotes.length > 0 && (
                <div className="my-10 space-y-6">
                  {section.pullQuotes.map((quote, idx) => (
                    <blockquote
                      key={idx}
                      className="relative border-l-4 border-indigo-500 pl-8 py-4 my-8"
                    >
                      <p className="text-[24px] font-serif italic text-gray-800 leading-[1.5] mb-3">
                        "{quote.text}"
                      </p>
                      {quote.attribution && (
                        <footer className="flex items-center gap-3 text-sm text-gray-600">
                          <span>— {quote.attribution}</span>
                          {quote.timestamp && onTimestampClick && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => onTimestampClick(quote.timestamp!)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                              >
                                {quote.timestamp}
                              </button>
                            </>
                          )}
                        </footer>
                      )}
                    </blockquote>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Citations */}
        {blog.citations && blog.citations.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-[28px] font-bold text-gray-900 mb-6">References</h2>
            <ol className="space-y-3 text-[15px]">
              {blog.citations.map((citation) => (
                <li key={citation.id} className="flex gap-3">
                  <span className="text-gray-500 font-medium">[{citation.id}]</span>
                  <div>
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {citation.title}
                    </a>
                    <span className="text-gray-600"> — {citation.source}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Related Resources */}
        {blog.relatedResources && blog.relatedResources.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[28px] font-bold text-gray-900 mb-6">Further Reading</h2>
            <div className="grid gap-4">
              {blog.relatedResources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[17px] font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-[15px] text-gray-600 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded uppercase">
                      {resource.type}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
