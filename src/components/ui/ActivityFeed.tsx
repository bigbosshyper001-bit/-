import React from 'react';
import type { SemanticAccent } from '../../design-tokens.ts';
import { StatusBadge } from './StatusBadge.tsx';

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  category: 'meeting' | 'curriculum' | 'regulatory' | 'document' | 'general';
  accent?: SemanticAccent;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className = '' }) => {
  return (
    <div className={`divide-y divide-slate-100 ${className}`}>
      {activities.map((act) => {
        return (
          <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center text-xs font-bold shrink-0">
              {act.user.name.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-800 leading-snug">
                <span className="font-semibold text-slate-900">{act.user.name}</span>{' '}
                <span className="text-slate-600">{act.action}</span>{' '}
                <strong className="font-medium text-[#B83B6F]">{act.target}</strong>
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span>{act.user.role}</span>
                <span>•</span>
                <span>{act.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
