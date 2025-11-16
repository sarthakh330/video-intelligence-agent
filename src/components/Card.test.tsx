import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with white background by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white');
  });

  it('renders with surface background when specified', () => {
    const { container } = render(<Card background="surface">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-[#F8FAFC]');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card');
  });

  it('has correct default styling classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('rounded-[12px]');
    expect(card).toHaveClass('p-8');
    expect(card).toHaveClass('shadow-[0_2px_8px_rgba(0,0,0,0.04)]');
  });

  it('applies maxHeight style when provided', () => {
    const { container } = render(<Card maxHeight="400px">Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveStyle({ maxHeight: '400px' });
    expect(card).toHaveClass('overflow-y-auto');
  });

  it('does not apply overflow-y-auto when maxHeight is not provided', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).not.toHaveClass('overflow-y-auto');
  });

  it('renders complex children (JSX)', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('combines background and custom className correctly', () => {
    const { container } = render(
      <Card background="surface" className="extra-class">
        Content
      </Card>
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('bg-[#F8FAFC]');
    expect(card).toHaveClass('extra-class');
  });

  it('combines maxHeight and custom className correctly', () => {
    const { container } = render(
      <Card maxHeight="500px" className="extra-class">
        Content
      </Card>
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveStyle({ maxHeight: '500px' });
    expect(card).toHaveClass('overflow-y-auto');
    expect(card).toHaveClass('extra-class');
  });
});
