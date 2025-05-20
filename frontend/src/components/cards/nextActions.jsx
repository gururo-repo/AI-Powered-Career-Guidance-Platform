import React from 'react';
import { FaCheck, FaBell } from 'react-icons/fa';

const NextActionsSection = ({ nextActions = [] }) => {
  if (!nextActions || nextActions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-cyan-50 mb-4">Recommended Actions</h3>
      <div className="space-y-4">
        {nextActions.map((action, index) => (
          <div key={index} className="flex items-start bg-zinc-700/30 p-4 rounded-lg">
            <div className="mr-3 mt-1">
              {action.completed ? (
                <span className="bg-green-500/20 text-green-400 p-2 rounded-full inline-flex">
                  <FaCheck size={14} />
                </span>
              ) : (
                <span className="bg-cyan-500/20 text-cyan-400 p-2 rounded-full inline-flex">
                  <FaBell size={14} />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-medium text-cyan-50">{action.title}</h4>
              <p className="text-cyan-100/80 text-sm mt-1">{action.description}</p>
              {!action.completed && action.actionUrl && (
                <a 
                  href={action.actionUrl}
                  className="text-cyan-400 text-sm mt-2 inline-block hover:text-cyan-300"
                >
                  {action.actionText || "Take Action"}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextActionsSection;