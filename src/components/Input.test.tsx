import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with placeholder text', () => {
    const mockOnChange = jest.fn();
    render(<Input placeholder="Enter text" value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    const mockOnChange = jest.fn();
    render(<Input placeholder="Enter text" value="Test value" onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('Test value');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const mockOnChange = jest.fn();
    render(<Input placeholder="Enter text" value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(mockOnChange).toHaveBeenCalledWith('new value');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onKeyDown when a key is pressed', () => {
    const mockOnChange = jest.fn();
    const mockOnKeyDown = jest.fn();
    render(
      <Input
        placeholder="Enter text"
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
      />
    );

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnKeyDown).toHaveBeenCalledTimes(1);
  });

  it('handles Enter key press correctly', () => {
    const mockOnChange = jest.fn();
    const mockOnKeyDown = jest.fn();
    render(
      <Input
        placeholder="Enter text"
        value="test"
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
      />
    );

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const mockOnChange = jest.fn();
    render(
      <Input
        placeholder="Enter text"
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('custom-class');
  });

  it('has correct default styling classes', () => {
    const mockOnChange = jest.fn();
    render(<Input placeholder="Enter text" value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('px-4');
    expect(input).toHaveClass('py-3');
    expect(input).toHaveClass('border');
    expect(input).toHaveClass('rounded-lg');
  });

  it('renders as text input type', () => {
    const mockOnChange = jest.fn();
    render(<Input placeholder="Enter text" value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('type', 'text');
  });
});
