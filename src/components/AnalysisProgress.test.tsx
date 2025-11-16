import { render, screen, waitFor, act } from '@testing-library/react';
import { AnalysisProgress } from './AnalysisProgress';

describe('AnalysisProgress', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders nothing when status is idle', () => {
    const { container } = render(<AnalysisProgress status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders progress UI when status is loading', () => {
    render(<AnalysisProgress status="loading" />);
    expect(screen.getByText('Analyzing content')).toBeInTheDocument();
    expect(screen.getByText('Processing video transcript')).toBeInTheDocument();
  });

  it('shows all four steps when loading', () => {
    render(<AnalysisProgress status="loading" />);
    expect(screen.getByText('Extracting transcript')).toBeInTheDocument();
    expect(screen.getByText('Parsing video structure')).toBeInTheDocument();
    expect(screen.getByText('Analyzing content')).toBeInTheDocument();
    expect(screen.getByText('Preparing insights')).toBeInTheDocument();
  });

  it('shows progress bar initially', () => {
    const { container } = render(<AnalysisProgress status="loading" />);
    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('updates progress over time', async () => {
    jest.useFakeTimers();
    const { container } = render(<AnalysisProgress status="loading" />);

    const progressBar = container.querySelector('.bg-blue-600') as HTMLElement;
    expect(progressBar).toBeInTheDocument();

    const initialWidth = progressBar.style.width;

    // Advance by 2 seconds - progress increases by 0.4 every 60ms
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Progress should have increased
    const newWidth = progressBar.style.width;
    expect(newWidth).not.toBe(initialWidth);

    jest.useRealTimers();
  });

  it('shows all steps as completed when status is success', () => {
    const { container } = render(<AnalysisProgress status="success" />);
    // Check that all 4 steps show checkmarks
    const checkmarks = container.querySelectorAll('svg path[d*="M5 13l4 4L19 7"]');
    expect(checkmarks.length).toBe(4);
  });

  it('calls onComplete callback when transitioning to success', async () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    const { rerender } = render(<AnalysisProgress status="loading" onComplete={onComplete} />);

    rerender(<AnalysisProgress status="success" onComplete={onComplete} />);

    // Fast-forward past the 300ms timeout
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('applies fade-out animation on success', () => {
    const { container } = render(<AnalysisProgress status="success" />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('opacity-0');
  });

  it('resets state when going from loading to idle', async () => {
    jest.useFakeTimers();
    const { rerender } = render(<AnalysisProgress status="loading" />);

    // Advance time to get some progress
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Reset to idle
    rerender(<AnalysisProgress status="idle" />);

    // Should render nothing
    expect(screen.queryByText('Analyzing content')).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it('shows error state correctly', () => {
    render(<AnalysisProgress status="error" />);
    // Error state should not show the progress component
    expect(screen.queryByText('Analyzing content')).not.toBeInTheDocument();
  });
});
