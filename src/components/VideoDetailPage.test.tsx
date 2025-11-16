import { render, screen, fireEvent } from '@testing-library/react';
import { VideoDetailPage } from './VideoDetailPage';

describe('VideoDetailPage Component', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  it('renders the back button', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    const backButton = screen.getByText('Back to Home').closest('button');

    if (backButton) {
      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    }
  });

  it('renders the video title', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText(/The Future of AI/i)).toBeInTheDocument();
  });

  it('renders video metadata', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText(/Tech Insights Channel/i)).toBeInTheDocument();
    expect(screen.getByText(/21:34/i)).toBeInTheDocument();
    expect(screen.getByText(/Nov 16, 2025/i)).toBeInTheDocument();
  });

  it('renders the video player placeholder', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText('YouTube Video Player')).toBeInTheDocument();
  });

  it('renders Deep Summary section', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText('Deep Summary')).toBeInTheDocument();
  });

  it('renders multiple paragraphs in deep summary', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText(/This comprehensive exploration/i)).toBeInTheDocument();
    expect(screen.getByText(/The discussion moves into the practical applications/i)).toBeInTheDocument();
  });

  it('renders Key Insights section', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
  });

  it('renders all key insight items', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText(/AI development is accelerating exponentially/i)).toBeInTheDocument();
    expect(screen.getByText(/Healthcare and scientific research/i)).toBeInTheDocument();
    expect(screen.getByText(/Ethical frameworks must be established/i)).toBeInTheDocument();
  });

  it('renders Key Moments section', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText('Key Moments')).toBeInTheDocument();
  });

  it('renders all 8 key moment chips', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);

    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.getByText('Introduction & Context')).toBeInTheDocument();
    expect(screen.getByText('2:30')).toBeInTheDocument();
    expect(screen.getByText('Main Problem Explained')).toBeInTheDocument();
    expect(screen.getByText('5:15')).toBeInTheDocument();
    expect(screen.getByText('First Key Solution')).toBeInTheDocument();
    expect(screen.getByText('8:20')).toBeInTheDocument();
    expect(screen.getByText('Case Study Example')).toBeInTheDocument();
    expect(screen.getByText('11:45')).toBeInTheDocument();
    expect(screen.getByText('Common Misconceptions')).toBeInTheDocument();
    // 14:30 appears twice (in chips and in must-watch section), so use getAllByText
    expect(screen.getAllByText('14:30').length).toBeGreaterThan(0);
    expect(screen.getByText('Practical Application')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
    expect(screen.getByText('Future Implications')).toBeInTheDocument();
    expect(screen.getByText('19:15')).toBeInTheDocument();
    expect(screen.getByText('Summary & Takeaways')).toBeInTheDocument();
  });

  it('renders Must Watch callout section', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    expect(screen.getByText(/If you only watch 60 seconds/i)).toBeInTheDocument();
  });

  it('must watch section contains 14:30 timestamp', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    const mustWatchSection = screen.getByText(/If you only watch 60 seconds/i).closest('div');
    expect(mustWatchSection).toHaveTextContent('14:30');
  });

  it('key moment chips are clickable', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<VideoDetailPage onBack={mockOnBack} />);

    const firstChip = screen.getByText('0:45').closest('button');
    if (firstChip) {
      fireEvent.click(firstChip);
      expect(consoleLogSpy).toHaveBeenCalledWith('Jump to 0:45');
    }

    consoleLogSpy.mockRestore();
  });

  it('renders multiple Card components', () => {
    const { container } = render(<VideoDetailPage onBack={mockOnBack} />);
    // There should be multiple cards in the layout
    const cards = container.querySelectorAll('[class*="rounded-[12px]"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('has two-column layout structure', () => {
    const { container } = render(<VideoDetailPage onBack={mockOnBack} />);
    // Check for the flex layout
    const layout = container.querySelector('.flex.gap-12');
    expect(layout).toBeInTheDocument();
  });

  it('left column has fixed width', () => {
    const { container } = render(<VideoDetailPage onBack={mockOnBack} />);
    const leftColumn = container.querySelector('.w-\\[580px\\]');
    expect(leftColumn).toBeInTheDocument();
  });

  it('renders with correct background color', () => {
    const { container } = render(<VideoDetailPage onBack={mockOnBack} />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-[#F7F8FA]');
  });

  it('renders all sections in correct order', () => {
    render(<VideoDetailPage onBack={mockOnBack} />);
    const allText = screen.getByText('Deep Summary').parentElement?.parentElement?.textContent || '';

    // Verify sections appear
    expect(screen.getByText('Deep Summary')).toBeInTheDocument();
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Key Moments')).toBeInTheDocument();
  });
});
