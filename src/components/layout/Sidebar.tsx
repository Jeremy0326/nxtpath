import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STUDENT_NAVIGATION, UNIVERSITY_NAVIGATION, EMPLOYER_NAVIGATION, ADMIN_NAVIGATION } from '../../lib/constants/navigation';

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const userType = user?.role || 'student';
  
  const navigation = {
    student: STUDENT_NAVIGATION,
    university: UNIVERSITY_NAVIGATION,
    employer: EMPLOYER_NAVIGATION,
    admin: ADMIN_NAVIGATION,
  }[userType] || [];

  const isActiveRoute = (path: string) => {
    // Use exact match for sub-items to avoid multiple highlights
    return location.pathname === path;
  };

  // For students, flatten the sidebar and remove section headers
  if (userType === 'student') {
    return (
      <nav className="h-full py-8 bg-white border-r border-gray-100">
        <div className="px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-base rounded-xl transition-colors font-medium group mb-1
                  ${isActive ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-900'}`}
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  }

  // For other user types, keep section headers
  return (
    <nav className="h-full py-6 bg-white">
      <div className="px-3 space-y-6">
        {navigation.map((item) => {
          if ('items' in item) {
            // Check if any child route is active
            const isGroupActive = item.items.some(subItem => isActiveRoute(subItem.path));
            return (
              <div key={item.name} className="space-y-2">
                <p className={`px-3 text-xs font-semibold tracking-wider uppercase ${
                  isGroupActive ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {item.name}
                </p>
                {item.items.map((subItem) => {
                  const isActive = isActiveRoute(subItem.path);
                  const Icon = subItem.icon;
                  return (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {subItem.name}
                    </NavLink>
                  );
                })}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {item.name}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}