type Status = 'pending' | 'funded' | 'completed';

const statusStyles: Record<Status, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  funded:  'bg-orange-500/20 text-orange-400 border-orange-500/50',
  completed: 'bg-green-500/20 text-green-400 border-green-500/50',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
        border capitalize
        ${statusStyles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50'}
      `}
    >
      {status}
    </span>
  );
}