import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders as button type by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders as submit type when specified', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('is not disabled by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).not.toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled and clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick} disabled>Click me</Button>);

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-button">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('custom-button');
  });

  it('has correct default styling classes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('w-full');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
    expect(button).toHaveClass('bg-[#1CC6B2]');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-lg');
  });

  it('renders complex children (JSX)', () => {
    render(
      <Button>
        <span data-testid="icon">🔥</span>
        <span>Text</span>
      </Button>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('maintains button accessibility attributes', () => {
    render(<Button>Accessible Button</Button>);
    const button = screen.getByRole('button', { name: 'Accessible Button' });
    expect(button).toBeInTheDocument();
  });
});
