import { Send, Users, ThumbsUp, X } from 'lucide-react';
import type { FrontendApplication } from '../../../types/components';

interface ApplicationStatsProps {
  applications: Application[];
}

export function ApplicationStats({ applications }: ApplicationStatsProps) {
  const getStats = () => {
    const stats = {
      applied: 0,
      interviewed: 0,
      offers: 0,
      rejected: 0,
    };

    applications.forEach((app) => {
      const status = app.status.toLowerCase();
      switch (status) {
        case 'applied':
          stats.applied++;
          break;
        case 'interviewed':
          stats.interviewed++;
          break;
        case 'offered':
          stats.offers++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
    });

    return stats;
  };

  const stats = getStats();
  const statItems = [
    { label: 'Applied', value: stats.applied, icon: Send, color: 'bg-blue-100 text-blue-600' },
    { label: 'Interviewed', value: stats.interviewed, icon: Users, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Offers', value: stats.offers, icon: ThumbsUp, color: 'bg-green-100 text-green-600' },
    { label: 'Rejected', value: stats.rejected, icon: X, color: 'bg-red-100 text-red-600' },
];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}