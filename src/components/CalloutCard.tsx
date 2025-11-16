interface CalloutCardProps {
  children: React.ReactNode;
  title?: string;
}

export function CalloutCard({ children, title }: CalloutCardProps) {
  return (
    <div className="bg-[#E0F7F4] border border-[#1CC6B2] rounded-lg p-6">
      {title && <h3 className="text-[#111827] mb-3 text-lg">{title}</h3>}
      <div className="text-[#111827]">{children}</div>
    </div>
  );
}
