import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from './page';

// Mock the fetch function
global.fetch = jest.fn();

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('HomePage (page.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    (global.fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders the page title', () => {
    render(<HomePage />);
    expect(screen.getByText(/Video Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Reader/i)).toBeInTheDocument();
  });

  it('renders the EXPERIMENT badge', () => {
    render(<HomePage />);
    expect(screen.getByText('EXPERIMENT')).toBeInTheDocument();
  });

  it('renders the input field with placeholder', () => {
    render(<HomePage />);
    expect(screen.getByPlaceholderText(/Paste YouTube URL here/i)).toBeInTheDocument();
  });

  it('renders the analyze button', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /Analyze Video/i })).toBeInTheDocument();
  });

  it('analyze button is disabled when input is empty', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: /Analyze Video/i });
    expect(button).toBeDisabled();
  });

  it('analyze button is enabled when input has value', () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });

    expect(button).not.toBeDisabled();
  });

  it('renders empty state when no recent videos', () => {
    localStorage.clear();
    render(<HomePage />);
    expect(screen.getByText('No videos analyzed yet')).toBeInTheDocument();
    expect(screen.getByText('Start by analyzing your first YouTube video above')).toBeInTheDocument();
  });

  it('allows typing in the input field', () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=abc123' } });

    expect(input.value).toBe('https://youtube.com/watch?v=abc123');
  });

  it('calls API when analyze button is clicked', async () => {
    const mockResponse = {
      videoId: 'abc123',
      title: 'Test Video',
      keyInsights: ['Insight 1'],
      deepSummary: ['Summary 1'],
      keyMoments: [],
      mustWatch: { timestamp: '1:00', description: 'Must watch' }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=abc123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://youtube.com/watch?v=abc123' }),
      });
    });
  });

  it('shows progress component when analyzing', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          videoId: 'test',
          title: 'Test Video',
          thumbnail: 'https://example.com/thumb.jpg',
          analyzedAt: new Date().toISOString()
        })
      }), 100))
    );

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Analyzing video/i)).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to analyze video' }),
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze video/i)).toBeInTheDocument();
    });
  });

  it('navigates to video page on successful analysis', async () => {
    const mockResponse = {
      videoId: 'abc123',
      title: 'Test Video',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=abc123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/video/abc123');
    });
  });

  it.skip('stores analysis data in sessionStorage', async () => {
    // Clear sessionStorage before this specific test
    sessionStorage.clear();

    const mockResponse = {
      videoId: 'storage123',
      title: 'Storage Test Video',
      keyInsights: ['test'],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=storage123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/video/storage123');
    });

    // Check sessionStorage was set with the analysis data
    const storedData = sessionStorage.getItem('videoAnalysis');
    expect(storedData).toBeTruthy();
    expect(JSON.parse(storedData!)).toMatchObject(mockResponse);
  });

  it('handles Enter key press in input field', async () => {
    const mockResponse = {
      videoId: 'abc123',
      title: 'Test Video',
      thumbnail: 'https://example.com/thumb.jpg',
      analyzedAt: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=abc123' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('saves analyzed video to localStorage', async () => {
    localStorage.clear();

    const mockResponse = {
      videoId: 'test123',
      title: 'Test Video',
      thumbnail: 'https://example.com/thumb.jpg',
      channelName: 'Test Channel',
      duration: '10:30',
      analyzedAt: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Paste YouTube URL here/i);
    const button = screen.getByRole('button', { name: /Analyze Video/i });

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/video/test123');
    });

    const stored = localStorage.getItem('recentVideos');
    expect(stored).toBeTruthy();
    const videos = JSON.parse(stored!);
    expect(videos).toHaveLength(1);
    expect(videos[0].videoId).toBe('test123');
    expect(videos[0].title).toBe('Test Video');
  });
});
