import React from 'react';
import { Check, Circle } from 'lucide-react';
import { HawkVecMilestone } from '../../types/database.types';
import { formatDate } from '../../lib/utils';

interface HawkVecStepperProps {
  milestones: HawkVecMilestone[];
  onToggleMilestone?: (milestoneId: string) => void;
  interactive?: boolean;
}

export const HawkVecStepper: React.FC<HawkVecStepperProps> = ({
  milestones,
  onToggleMilestone,
  interactive = true,
}) => {
  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div className="w-full bg-[#09090B] border-2 border-[#3F3F46] p-6 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#FAFAFA]">
          HAWKVEC 6-STAGE DELIVERY PIPELINE
        </span>
        <span className="text-xs font-extrabold uppercase text-black bg-[#DFE104] px-3 py-1 border border-black">
          {completedCount} / {milestones.length} STAGES CLEARED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {milestones.map((m, idx) => {
          const isCompleted = m.completed;
          return (
            <div
              key={m.id}
              onClick={() => interactive && onToggleMilestone && onToggleMilestone(m.id)}
              className={`p-4 border-2 transition-all flex flex-col justify-between h-28 ${
                interactive ? 'cursor-pointer hover:border-[#DFE104]' : ''
              } ${
                isCompleted
                  ? 'bg-[#DFE104] border-[#DFE104] text-black'
                  : 'bg-[#18181B] border-[#3F3F46] text-[#FAFAFA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${isCompleted ? 'text-black' : 'text-[#A1A1AA]'}`}>
                  0{idx + 1}
                </span>
                {isCompleted ? (
                  <div className="w-5 h-5 bg-black text-[#DFE104] flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 border-2 border-[#3F3F46]" />
                )}
              </div>

              <div>
                <p className={`text-xs font-black uppercase tracking-tight line-clamp-2 ${isCompleted ? 'text-black' : 'text-[#FAFAFA]'}`}>
                  {m.title}
                </p>
                <p className={`text-[10px] font-bold uppercase mt-1 ${isCompleted ? 'text-black/80' : 'text-[#A1A1AA]'}`}>
                  {m.completed_at ? formatDate(m.completed_at) : 'PENDING'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
