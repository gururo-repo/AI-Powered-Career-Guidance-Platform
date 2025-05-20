import { FaLightbulb, FaExclamationTriangle, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

const InsightCard = ({ insight, icon, title, description }) => {
  // Support both passing an insight object or individual props
  const insightData = insight || { title, type: 'default' };
  
  // Choose icon based on insight type
  const getIcon = (type) => {
    if (icon) return icon; // Use provided icon if available
    
    switch (type) {
      case 'readiness':
        return <FaLightbulb className="text-yellow-400" />;
      case 'alert':
        return <FaExclamationTriangle className="text-red-400" />;
      case 'trend':
        return <FaChartLine className="text-green-400" />;
      case 'event':
        return <FaCalendarAlt className="text-blue-400" />;
      default:
        return <FaLightbulb className="text-cyan-400" />;
    }
  };

  // Choose background color based on insight type
  const getBgColor = (type) => {
    switch (type) {
      case 'readiness':
        return 'bg-yellow-400/10';
      case 'alert':
        return 'bg-red-400/10';
      case 'trend':
        return 'bg-green-400/10';
      case 'event':
        return 'bg-blue-400/10';
      default:
        return 'bg-cyan-400/10';
    }
  };

  return (
    <div className={`p-4 rounded-lg ${getBgColor(insightData.type)}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getIcon(insightData.type)}
        </div>
        <div>
          <p className="text-cyan-50">{insightData.title || title}</p>
          {(insightData.description || description) && (
            <p className="text-cyan-200/70 text-sm mt-1">{insightData.description || description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCard; 