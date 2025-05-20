import { FaArrowRight } from 'react-icons/fa';

const ActionCard = ({ icon, title, description, actionText, onClick }) => {
  // Handle both new props format and original action object format
  if (title && description) {
    // New props format
    return (
      <div className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-lg">{icon}</div>}
            <p className="text-cyan-50">{title}</p>
          </div>
          <FaArrowRight className="text-cyan-400/70" />
        </div>
        <div className="mt-2 text-xs text-cyan-50/70">
          {description}
        </div>
        {actionText && (
          <div className="mt-3">
            <button 
              onClick={onClick} 
              className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
            >
              {actionText}
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // Original action object format
  const action = arguments[0];
  
  // Early return with fallback UI if action is undefined
  if (!action || typeof action !== 'object') {
    return (
      <div className="p-4 rounded-lg bg-zinc-800/50">
        <p className="text-cyan-50/50">No action data available</p>
      </div>
    );
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
      case 2:
        return 'bg-red-400/20 text-red-300';
      case 3:
        return 'bg-yellow-400/20 text-yellow-300';
      case 4:
      case 5:
        return 'bg-green-400/20 text-green-300';
      default:
        return 'bg-cyan-400/20 text-cyan-300';
    }
  };

  // Use optional chaining to safely access properties
  const priority = action?.priority || 0;
  const actionTitle = action?.title || 'Untitled Action';
  const type = action?.type || '';

  return (
    <div className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(priority)}`}>
            P{priority}
          </div>
          <p className="text-cyan-50">{actionTitle}</p>
        </div>
        <FaArrowRight className="text-cyan-400/70" />
      </div>
      <div className="mt-2 text-xs text-cyan-50/70">
        {type}
      </div>
    </div>
  );
};

export default ActionCard;