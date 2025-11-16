import { render, screen } from '@testing-library/react';
import { CalloutCard } from './CalloutCard';

describe('CalloutCard Component', () => {
  it('renders children content', () => {
    render(<CalloutCard>Test content</CalloutCard>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<CalloutCard>Content without title</CalloutCard>);
    expect(screen.getByText('Content without title')).toBeInTheDocument();
  });

  it('renders with title when provided', () => {
    render(<CalloutCard title="Important Note">Content here</CalloutCard>);
    expect(screen.getByText('Important Note')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<CalloutCard>Content</CalloutCard>);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('bg-[#E0F7F4]');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-[#1CC6B2]');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('p-6');
  });

  it('renders title with correct styling', () => {
    render(<CalloutCard title="Title Text">Content</CalloutCard>);
    const title = screen.getByText('Title Text');

    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-[#111827]');
    expect(title).toHaveClass('mb-3');
    expect(title).toHaveClass('text-lg');
  });

  it('renders children within a div with correct styling', () => {
    const { container } = render(<CalloutCard>Child content</CalloutCard>);
    const contentDiv = container.querySelector('.text-\\[\\#111827\\]');

    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveTextContent('Child content');
  });

  it('renders complex children (JSX)', () => {
    render(
      <CalloutCard title="Complex Content">
        <p>Paragraph 1</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </CalloutCard>
    );

    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    const { container } = render(<CalloutCard>{''}</CalloutCard>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('title is optional and does not render when not provided', () => {
    const { container } = render(<CalloutCard>Just content</CalloutCard>);
    const h3Elements = container.querySelectorAll('h3');
    expect(h3Elements.length).toBe(0);
  });

  it('renders multiple callout cards independently', () => {
    const { rerender } = render(
      <CalloutCard title="First">First content</CalloutCard>
    );
    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(<CalloutCard title="Second">Second content</CalloutCard>);
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
