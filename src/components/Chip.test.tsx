import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip Component', () => {
  it('renders timestamp and label', () => {
    render(<Chip timestamp="2:30" label="Introduction" />);

    expect(screen.getByText('2:30')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<Chip timestamp="5:15" label="Main Topic" onClick={mockOnClick} />);

    const chip = screen.getByRole('button');
    fireEvent.click(chip);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('works without onClick handler', () => {
    render(<Chip timestamp="0:45" label="Intro" />);

    const chip = screen.getByRole('button');
    expect(chip).toBeInTheDocument();

    // Should not throw error when clicked
    fireEvent.click(chip);
  });

  it('renders as a button element', () => {
    render(<Chip timestamp="1:00" label="Test" />);

    const chip = screen.getByRole('button');
    expect(chip.tagName).toBe('BUTTON');
  });

  it('has correct styling classes', () => {
    render(<Chip timestamp="3:20" label="Section" />);

    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('inline-flex');
    expect(chip).toHaveClass('items-center');
    expect(chip).toHaveClass('gap-2.5');
    expect(chip).toHaveClass('rounded-xl');
  });

  it('displays timestamp with correct styling', () => {
    render(<Chip timestamp="10:00" label="Summary" />);

    const timestamp = screen.getByText('10:00');
    expect(timestamp).toHaveClass('text-[#1CC6B2]');
    expect(timestamp).toHaveClass('font-semibold');
  });

  it('displays label with correct styling', () => {
    render(<Chip timestamp="7:45" label="Key Point" />);

    const label = screen.getByText('Key Point');
    expect(label).toHaveClass('font-medium');
  });

  it('renders multiple chips independently', () => {
    const { rerender } = render(<Chip timestamp="1:00" label="First" />);
    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(<Chip timestamp="2:00" label="Second" />);
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('handles long labels correctly', () => {
    const longLabel = 'This is a very long label that might wrap';
    render(<Chip timestamp="15:30" label={longLabel} />);

    expect(screen.getByText(longLabel)).toBeInTheDocument();
  });

  it('handles special characters in timestamp and label', () => {
    render(<Chip timestamp="0:05" label="Q&A Session" />);

    expect(screen.getByText('0:05')).toBeInTheDocument();
    expect(screen.getByText('Q&A Session')).toBeInTheDocument();
  });
});
