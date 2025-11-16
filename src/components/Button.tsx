interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, type = 'button', disabled = false, className = '' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-6 py-3 bg-[#1CC6B2] hover:bg-[#17A090] text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
