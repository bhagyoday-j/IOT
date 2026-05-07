interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: number;
}

export default function MetricCard({ title, value, unit, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
          </div>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-green-50 dark:bg-green-900 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
