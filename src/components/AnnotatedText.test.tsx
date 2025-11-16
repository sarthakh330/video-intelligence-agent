import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotatedText } from './AnnotatedText';

describe('AnnotatedText', () => {
  const mockOnTimestampClick = jest.fn();

  beforeEach(() => {
    mockOnTimestampClick.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders plain text without annotations', () => {
    const text = 'This is a simple test paragraph.\n\nThis is a second paragraph.';
    const { container } = render(
      <AnnotatedText text={text} annotations={[]} />
    );

    expect(container.textContent).toContain('This is a simple test paragraph.');
    expect(container.textContent).toContain('This is a second paragraph.');
  });

  it('renders text with exact match annotations', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const annotations = [
      {
        textSpan: 'quick brown fox',
        insight: 'This is an insight about foxes',
        timestamp: '1:23',
        type: 'concept' as const
      }
    ];

    const { container } = render(
      <AnnotatedText
        text={text}
        annotations={annotations}
        onTimestampClick={mockOnTimestampClick}
      />
    );

    // Should find annotated span with highlighting
    const annotatedSpan = container.querySelector('.bg-blue-100');
    expect(annotatedSpan).toBeInTheDocument();
    expect(annotatedSpan?.textContent).toBe('quick brown fox');
  });

  it('handles smart quotes in annotations with fuzzy matching', () => {
    const text = "The AI's ability to understand context is crucial.";
    const annotations = [
      {
        textSpan: "AI's ability",  // Straight quote
        insight: 'Important concept',
        timestamp: null,
        type: 'concept' as const
      }
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    const annotatedSpan = container.querySelector('.bg-blue-100');
    expect(annotatedSpan).toBeInTheDocument();
  });

  it('shows popover on hover', async () => {
    const text = 'This is important text.';
    const annotations = [
      {
        textSpan: 'important',
        insight: 'This explains why it matters',
        timestamp: '2:34',
        type: 'strategy' as const
      }
    ];

    const { container } = render(
      <AnnotatedText
        text={text}
        annotations={annotations}
        onTimestampClick={mockOnTimestampClick}
      />
    );

    const annotatedSpan = container.querySelector('.bg-green-100');
    expect(annotatedSpan).toBeInTheDocument();

    // Hover over the annotated text
    fireEvent.mouseEnter(annotatedSpan!);

    await waitFor(() => {
      expect(screen.getByText('Strategy')).toBeInTheDocument();
      expect(screen.getByText('This explains why it matters')).toBeInTheDocument();
    });
  });

  it('shows popover on click', async () => {
    const text = 'This is important text.';
    const annotations = [
      {
        textSpan: 'important',
        insight: 'This explains why it matters',
        timestamp: null,
        type: 'tension' as const
      }
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    const annotatedSpan = container.querySelector('.bg-amber-100');
    expect(annotatedSpan).toBeInTheDocument();

    // Click the annotated text
    fireEvent.click(annotatedSpan!);

    await waitFor(() => {
      expect(screen.getByText('Tension')).toBeInTheDocument();
      expect(screen.getByText('This explains why it matters')).toBeInTheDocument();
    });
  });

  it('closes popover on Escape key', async () => {
    const text = 'This is important text.';
    const annotations = [
      {
        textSpan: 'important',
        insight: 'This explains why it matters',
        timestamp: null,
        type: 'concept' as const
      }
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    const annotatedSpan = container.querySelector('.bg-blue-100');
    fireEvent.click(annotatedSpan!);

    await waitFor(() => {
      expect(screen.getByText('Concept')).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Concept')).not.toBeInTheDocument();
    });
  });

  it('calls onTimestampClick when timestamp button is clicked', async () => {
    const text = 'This is important text.';
    const annotations = [
      {
        textSpan: 'important',
        insight: 'This explains why it matters',
        timestamp: '3:45',
        type: 'prediction' as const
      }
    ];

    const { container } = render(
      <AnnotatedText
        text={text}
        annotations={annotations}
        onTimestampClick={mockOnTimestampClick}
      />
    );

    const annotatedSpan = container.querySelector('.bg-purple-100');
    fireEvent.click(annotatedSpan!);

    await waitFor(() => {
      expect(screen.getByText('3:45')).toBeInTheDocument();
    });

    const timestampButton = screen.getByText('3:45');
    fireEvent.click(timestampButton);

    expect(mockOnTimestampClick).toHaveBeenCalledWith('3:45');
  });

  it('renders multiple annotations correctly', () => {
    const text = 'First concept and second concept in one paragraph.';
    const annotations = [
      {
        textSpan: 'First concept',
        insight: 'First insight',
        timestamp: null,
        type: 'concept' as const
      },
      {
        textSpan: 'second concept',
        insight: 'Second insight',
        timestamp: null,
        type: 'strategy' as const
      }
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    // Should have both blue (concept) and green (strategy) highlights
    const blueSpans = container.querySelectorAll('.bg-blue-100');
    const greenSpans = container.querySelectorAll('.bg-green-100');

    expect(blueSpans.length).toBe(1);
    expect(greenSpans.length).toBe(1);
  });

  it('preserves paragraph structure', () => {
    const text = 'First paragraph here.\n\nSecond paragraph here.';
    const annotations = [
      {
        textSpan: 'First paragraph',
        insight: 'About first',
        timestamp: null,
        type: 'concept' as const
      }
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
  });

  it('handles annotation types with correct colors', () => {
    const text = 'concept, tension, prediction, strategy';
    const annotations = [
      { textSpan: 'concept', insight: 'test', timestamp: null, type: 'concept' as const },
      { textSpan: 'tension', insight: 'test', timestamp: null, type: 'tension' as const },
      { textSpan: 'prediction', insight: 'test', timestamp: null, type: 'prediction' as const },
      { textSpan: 'strategy', insight: 'test', timestamp: null, type: 'strategy' as const },
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();    // concept
    expect(container.querySelector('.bg-amber-100')).toBeInTheDocument();   // tension
    expect(container.querySelector('.bg-purple-100')).toBeInTheDocument();  // prediction
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();   // strategy
  });

  it('handles overlapping annotations by using first match', () => {
    const text = 'The important very important text.';
    const annotations = [
      {
        textSpan: 'important very important',
        insight: 'Long span',
        timestamp: null,
        type: 'concept' as const
      },
      {
        textSpan: 'very important',
        insight: 'Short span',
        timestamp: null,
        type: 'strategy' as const
      }
    ];

    const { container } = render(
      <AnnotatedText text={text} annotations={annotations} />
    );

    // First annotation should match
    const blueSpans = container.querySelectorAll('.bg-blue-100');
    expect(blueSpans.length).toBeGreaterThan(0);
  });
});
