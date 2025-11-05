
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, change, changeType }) => {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-2 ${changeColor}`}>
            {change}
          </p>
        )}
      </div>
      <div className="text-primary-500 bg-primary-100 dark:bg-primary-500/20 p-3 rounded-full">
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
    </div>
  );
};

export default DashboardCard;
