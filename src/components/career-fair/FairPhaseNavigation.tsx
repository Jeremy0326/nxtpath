import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Video, FileText } from 'lucide-react';

interface FairPhaseNavigationProps {
  fairId: string;
  currentPhase: 'pre-fair' | 'on-fair' | 'post-fair';
}

export function FairPhaseNavigation({ fairId, currentPhase }: FairPhaseNavigationProps) {
  const location = useLocation();
  
  const steps = [
    { id: 'pre-fair',  name: 'Pre-Fair', icon: Calendar, path: `/career-fairs/${fairId}` },
    { id: 'on-fair',   name: 'Live Fair', icon: Video,
      path: fairId === '1' ? '/career-fairs/physical' : '/career-fairs/virtual' },
    { id: 'post-fair', name: 'Post-Fair', icon: FileText, path: `/career-fairs/${fairId}/follow-up` },
  ];

  return (
    <nav className="bg-white rounded-xl shadow-sm p-6">
      <ol className="relative flex justify-between items-start gap-x-8">
        {/* connector */}
        <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10" />
        
        {steps.map(({ id, name, icon: Icon, path }, idx) => {
          const status = id === currentPhase
            ? 'current'
            : steps.findIndex(s => s.id === currentPhase) > idx
              ? 'past'
              : 'future';

          const color =
            status === 'current' ? 'bg-indigo-600 text-white'
            : status === 'past'    ? 'bg-indigo-100 text-indigo-600'
            :                       'bg-gray-100 text-gray-400';

          return (
            <li key={id} className="flex flex-col items-center shrink-0">
              <Link to={path}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${color}
                                ${status === 'future' ? '' : ''}`}>
                <Icon className="w-6 h-6" />
              </Link>
              <span className={`mt-3 w-24 text-center text-sm
                               ${status === 'current' ? 'text-indigo-600 font-medium'
                                : status === 'past'   ? 'text-gray-700'
                                :                        'text-gray-400'}`}>
                {name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}