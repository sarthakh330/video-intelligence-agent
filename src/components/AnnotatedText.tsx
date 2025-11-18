'use client';

import { useState, useRef, useEffect } from 'react';

interface Annotation {
  textSpan: string;
  insight: string;
  timestamp: string | null;
  type: 'concept' | 'tension' | 'prediction' | 'strategy';
}

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
  onTimestampClick?: (timestamp: string) => void;
}

interface PopoverState {
  annotation: Annotation;
  x: number;
  y: number;
}

export function AnnotatedText({ text, annotations, onTimestampClick }: AnnotatedTextProps) {
  const [activePopover, setActivePopover] = useState<PopoverState | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        console.log('🎈 CLOSE - Click outside detected, closing popover');
        setActivePopover(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        console.log('🎈 CLOSE - Escape key detected, closing popover');
        setActivePopover(null);
      }
    }

    if (activePopover) {
      console.log('🎈 STATE - activePopover updated:', {
        type: activePopover.annotation.type,
        x: activePopover.x,
        y: activePopover.y,
        hasRef: !!popoverRef.current
      });
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      console.log('🎈 STATE - activePopover is null');
    }
  }, [activePopover]);

  const getAnnotationColor = (type: string) => {
    // Subtle Medium-style highlight colors - barely visible, polished
    switch (type) {
      case 'concept':
        return 'bg-blue-50/50 hover:bg-blue-50';
      case 'tension':
        return 'bg-amber-50/50 hover:bg-amber-50';
      case 'prediction':
        return 'bg-purple-50/50 hover:bg-purple-50';
      case 'strategy':
        return 'bg-emerald-50/50 hover:bg-emerald-50';
      default:
        return 'bg-yellow-50/50 hover:bg-yellow-50';
    }
  };

  const getPopoverColor = () => {
    // All popovers use clean white surface with subtle border
    return 'border-gray-200/60 bg-white';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'concept':
        return 'Concept';
      case 'tension':
        return 'Tension';
      case 'prediction':
        return 'Prediction';
      case 'strategy':
        return 'Strategy';
      default:
        return 'Note';
    }
  };

  // Helper function to normalize text for matching (handle quotes, dashes, whitespace)
  const normalizeText = (str: string): string => {
    return str
      .replace(/['']/g, "'")  // Smart single quotes to straight
      .replace(/[""]/g, '"')  // Smart double quotes to straight
      .replace(/[—–]/g, '-')  // Em/en dashes to hyphen
      .replace(/\s+/g, ' ')   // Multiple spaces to single
      .trim();
  };

  // Fuzzy find function to locate text spans even with character variations
  const fuzzyFindText = (haystack: string, needle: string): { start: number; end: number } | null => {
    const normalizedHaystack = normalizeText(haystack);
    const normalizedNeedle = normalizeText(needle);

    const normalizedIndex = normalizedHaystack.indexOf(normalizedNeedle);
    if (normalizedIndex === -1) {
      console.log('🔴 Fuzzy match failed: normalized needle not in normalized haystack');
      return null;
    }

    console.log(`🟢 Found in normalized text at index: ${normalizedIndex}`);

    // Build a mapping from normalized indices to original indices
    const normalizedToOriginal: number[] = [];
    let normalizedPos = 0;

    for (let i = 0; i < haystack.length; i++) {
      // Map each position in normalized string to original string position
      const substr = haystack.substring(0, i + 1);
      const normalizedSubstr = normalizeText(substr);

      // Record mapping for each character in normalized string
      for (let j = normalizedPos; j < normalizedSubstr.length; j++) {
        normalizedToOriginal[j] = i + 1;
      }
      normalizedPos = normalizedSubstr.length;
    }

    // Find start and end positions in original text
    const startIndex = normalizedIndex === 0 ? 0 : (normalizedToOriginal[normalizedIndex - 1] || 0);
    const endNormalizedIndex = normalizedIndex + normalizedNeedle.length - 1;
    const endIndex = normalizedToOriginal[endNormalizedIndex] || haystack.length;

    console.log(`📍 Mapped to original text: start=${startIndex}, end=${endIndex}`);

    return { start: startIndex, end: endIndex };
  };

  // Split text into segments with annotations - proper inline rendering
  const renderAnnotatedText = () => {
    if (!annotations || annotations.length === 0) {
      // Render paragraphs without annotations
      return text.split('\n\n').map((para, index) => (
        <p key={index} className="text-[16px] leading-[1.65] text-gray-800 mb-4">
          {para}
        </p>
      ));
    }

    // Debug logging with clear sections
    console.group('🔍 AnnotatedText Debug Info');
    console.log(`📊 Received ${annotations.length} annotations`);
    console.log(`📝 Text length: ${text.length} characters`);
    console.log('📄 First 200 chars of text:', text.substring(0, 200));

    // Find all annotation positions
    const annotationPositions: Array<{ start: number; end: number; annotation: Annotation }> = [];

    annotations.forEach((annotation, index) => {
      console.group(`🎯 Annotation ${index + 1}/${annotations.length}: ${annotation.type}`);

      // First try exact match
      let startIndex = text.indexOf(annotation.textSpan);
      let endIndex = -1;
      let matchType = 'none';

      if (startIndex !== -1) {
        endIndex = startIndex + annotation.textSpan.length;
        matchType = 'exact';
        console.log('✅ Exact match found');
      } else {
        // If exact match fails, try fuzzy matching
        console.log('❌ Exact match failed, trying fuzzy match...');
        console.log('Looking for:', annotation.textSpan.substring(0, 80) + '...');
        console.log('Normalized needle:', normalizeText(annotation.textSpan).substring(0, 80) + '...');

        const fuzzyResult = fuzzyFindText(text, annotation.textSpan);
        if (fuzzyResult) {
          startIndex = fuzzyResult.start;
          endIndex = fuzzyResult.end;
          matchType = 'fuzzy';
          console.log('✅ Fuzzy match found');
          console.log('Matched text:', text.substring(startIndex, endIndex).substring(0, 80) + '...');
        } else {
          console.warn('❌ No match found');
          console.log('Searching in normalized text:', normalizeText(text).substring(0, 200));
        }
      }

      console.log(`📍 Position: start=${startIndex}, end=${endIndex}, type=${matchType}`);

      if (startIndex !== -1 && endIndex !== -1) {
        annotationPositions.push({
          start: startIndex,
          end: endIndex,
          annotation
        });
        console.log('✅ Added to annotation positions');
      } else {
        console.warn('⚠️ Skipped (not found)');
      }

      console.groupEnd();
    });

    console.log(`📊 Summary: ${annotationPositions.length}/${annotations.length} annotations matched`);
    console.groupEnd();

    // Sort by start position
    annotationPositions.sort((a, b) => a.start - b.start);

    // Build inline segments
    const segments: Array<{ text: string; annotation?: Annotation }> = [];
    let currentPos = 0;

    console.log('🔨 Building segments from', annotationPositions.length, 'annotation positions');

    for (const { start, end, annotation } of annotationPositions) {
      // Add text before annotation
      if (start > currentPos) {
        const beforeText = text.substring(currentPos, start);
        segments.push({ text: beforeText });
        console.log(`📄 Added plain text: "${beforeText.substring(0, 50)}..."`);
      }

      // Add annotated text
      const annotatedText = text.substring(start, end);
      segments.push({
        text: annotatedText,
        annotation
      });
      console.log(`✨ Added annotated text (${annotation.type}): "${annotatedText.substring(0, 50)}..."`);

      currentPos = end;
    }

    // Add remaining text
    if (currentPos < text.length) {
      const remainingText = text.substring(currentPos);
      segments.push({ text: remainingText });
      console.log(`📄 Added remaining text: "${remainingText.substring(0, 50)}..."`);
    }

    console.log(`📊 Total segments created: ${segments.length}`);

    // Render as inline elements with proper paragraph breaks
    const result: JSX.Element[] = [];
    let currentParagraph: JSX.Element[] = [];
    let paragraphIndex = 0;

    segments.forEach((segment, segmentIndex) => {
      const parts = segment.text.split('\n\n');

      parts.forEach((part, partIndex) => {
        if (partIndex > 0 && currentParagraph.length > 0) {
          // New paragraph detected, push current paragraph
          result.push(
            <p key={`para-${paragraphIndex}`} className="text-[16px] leading-[1.65] text-gray-800 mb-4">
              {currentParagraph}
            </p>
          );
          currentParagraph = [];
          paragraphIndex++;
        }

        if (part.trim()) {
          if (segment.annotation && partIndex === 0) {
            // Annotated span - inline with Medium-style highlight
            currentParagraph.push(
              <span
                key={`seg-${segmentIndex}-${partIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const newPopoverState = {
                    annotation: segment.annotation!,
                    x: rect.left,
                    y: rect.bottom + window.scrollY + 8
                  };
                  console.log('🎈 CLICK - Setting popover state:', {
                    x: newPopoverState.x,
                    y: newPopoverState.y,
                    windowScrollY: window.scrollY,
                    rectBottom: rect.bottom,
                    type: newPopoverState.annotation.type,
                    insight: newPopoverState.annotation.insight.substring(0, 50) + '...'
                  });
                  setActivePopover(newPopoverState);
                }}
                className={`${getAnnotationColor(segment.annotation.type)} cursor-pointer transition-all duration-120 rounded`}
                style={{
                  display: 'inline',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'inherit',
                  padding: '0.125rem 0.25rem',
                  margin: '0 -0.125rem',
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone'
                }}
              >
                {part}
              </span>
            );
          } else {
            // Regular text - inline
            currentParagraph.push(
              <span
                key={`seg-${segmentIndex}-${partIndex}`}
                style={{ display: 'inline', whiteSpace: 'pre-wrap', lineHeight: 'inherit' }}
              >
                {part}
              </span>
            );
          }
        }
      });
    });

    // Push final paragraph
    if (currentParagraph.length > 0) {
      result.push(
        <p key={`para-${paragraphIndex}`} className="text-[16px] leading-[1.65] text-gray-800 mb-4">
          {currentParagraph}
        </p>
      );
    }

    return result;
  };

  // Debug popover rendering
  console.log('🎈 RENDER - About to render, activePopover:', activePopover ? {
    type: activePopover.annotation.type,
    x: activePopover.x,
    y: activePopover.y,
    windowWidth: window.innerWidth,
    calculatedLeft: Math.min(activePopover.x, window.innerWidth - 384)
  } : null);

  return (
    <div className="relative">
      <div className="prose prose-neutral max-w-none leading-relaxed">
        {renderAnnotatedText()}
      </div>

      {/* Popover - Google Labs style with pointer arrow */}
      {activePopover && (
        <div
          ref={popoverRef}
          className={`fixed z-50 w-[360px] ${getPopoverColor()} animate-fadeIn`}
          style={{
            left: `${Math.min(Math.max(12, activePopover.x), window.innerWidth - 372)}px`,
            top: `${activePopover.y}px`,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
            borderRadius: '12px',
            border: '1px solid #ececec'
          }}
        >
          {/* Small pointer arrow */}
          <div
            className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-gray-200/60 rotate-45"
            style={{ borderRadius: '2px' }}
          ></div>

          <div className="relative bg-white rounded-xl p-5">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {getTypeLabel(activePopover.annotation.type)}
                </span>
              </div>
              <p className="text-[15px] leading-[1.65] text-gray-800 font-normal">
                {activePopover.annotation.insight}
              </p>
            </div>

            {activePopover.annotation.timestamp && onTimestampClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTimestampClick(activePopover.annotation.timestamp!);
                  setActivePopover(null);
                }}
                className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-lg text-[13px] font-medium text-gray-700 transition-all duration-120 flex items-center justify-center gap-2 hover:shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Jump to {activePopover.annotation.timestamp}
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 120ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
