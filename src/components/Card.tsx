interface CardProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'surface';
  maxHeight?: string;
}

export function Card({ children, className = '', background = 'white', maxHeight }: CardProps) {
  const bgColor = background === 'white' ? 'bg-white' : 'bg-[#F8FAFC]';
  const heightStyle = maxHeight ? { maxHeight } : {};
  
  return (
    <div 
      className={`${bgColor} rounded-[12px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${maxHeight ? 'overflow-y-auto' : ''} ${className}`}
      style={heightStyle}
    >
      {children}
    </div>
  );
}