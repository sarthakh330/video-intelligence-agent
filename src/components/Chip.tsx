interface ChipProps {
  timestamp: string;
  label: string;
  onClick?: () => void;
}

export function Chip({ timestamp, label, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2.5 px-5 py-3 bg-gradient-to-br from-gray-50 to-white hover:from-teal-50 hover:to-cyan-50 border border-gray-200 hover:border-teal-300 rounded-xl transition-all duration-200 text-gray-700 text-[15px] shadow-sm hover:shadow-md group"
    >
      <span className="text-[#1CC6B2] font-semibold">{timestamp}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}