import { NavLink } from 'react-router';
import { LayoutDashboard, Leaf, Activity, History } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/disease', label: 'Disease Prediction', icon: Activity },
  { to: '/crop', label: 'Crop Recommendation', icon: Leaf },
  { to: '/history', label: 'History', icon: History },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">AgriSmart</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">IoT + AI System</p>
          </div>
        </div>
      </div>
      <nav className="px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
