type ProgressBarProps = {
  percentage: number;
};

export default function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="w-64 h-3 bg-gray-300 rounded-full overflow-hidden">
      <div
        className="h-full bg-black transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}