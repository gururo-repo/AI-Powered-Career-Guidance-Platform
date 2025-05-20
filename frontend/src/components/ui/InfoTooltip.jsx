import React, { useState, useEffect, useRef } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * InfoTooltip component
 * Displays an information icon that shows a tooltip with detailed information on hover
 *
 * @param {Object} props
 * @param {string} props.title - The title of the tooltip
 * @param {string|React.ReactNode} props.content - The content to display in the tooltip
 * @param {string} [props.iconClass] - Optional custom class for the icon
 * @param {string} [props.tooltipClass] - Optional custom class for the tooltip
 * @param {string} [props.position] - Position of the tooltip (top, bottom, left, right)
 * @param {number} [props.delay] - Delay in ms before showing tooltip on hover (default: 300ms)
 * @param {string} [props.iconSize] - Size of the icon (sm, md, lg, xl)
 */
const InfoTooltip = ({
  title,
  content,
  iconClass = "text-cyan-400 hover:text-cyan-300",
  tooltipClass = "",
  position = "top",
  delay = 300,
  iconSize = "lg"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);

  // Calculate position classes based on the specified position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom': return 'top-full mt-3';
      case 'left': return 'right-full mr-3';
      case 'right': return 'left-full ml-3';
      default: return 'bottom-full mb-3';
    }
  };

  // Get icon size class
  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm': return 'text-base';
      case 'md': return 'text-lg';
      case 'lg': return 'text-xl';
      case 'xl': return 'text-2xl';
      default: return 'text-lg';
    }
  };

  // Adjust tooltip width based on position
  const getWidthClass = () => {
    // For left/right positions, make tooltip wider
    if (position === 'left' || position === 'right') {
      return 'md:min-w-[450px] w-auto';
    }
    // For top/bottom positions, make tooltip narrower
    return 'md:min-w-[350px] w-auto';
  };

  // Handle showing tooltip with delay
  const handleShowTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Handle hiding tooltip
  const handleHideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Adjust tooltip position for mobile
  useEffect(() => {
    const handleResize = () => {
      if (tooltipRef.current && isVisible) {
        const rect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768; // Tailwind's md breakpoint

        // Reset any previously set styles
        tooltipRef.current.style.left = '';
        tooltipRef.current.style.right = '';
        tooltipRef.current.style.top = '';
        tooltipRef.current.style.bottom = '';
        tooltipRef.current.style.maxWidth = '';

        // On mobile, make tooltip wider and position it better
        if (isMobile) {
          tooltipRef.current.style.maxWidth = 'calc(100vw - 40px)';

          // For left/right positioned tooltips on mobile, reposition to top/bottom
          if (position === 'left' || position === 'right') {
            tooltipRef.current.style.left = '50%';
            tooltipRef.current.style.transform = 'translateX(-50%)';
            tooltipRef.current.style.right = 'auto';

            // If there's more space above than below, show above
            const spaceAbove = rect.top;
            const spaceBelow = viewportHeight - rect.bottom;

            if (spaceAbove > spaceBelow) {
              tooltipRef.current.style.bottom = '100%';
              tooltipRef.current.style.top = 'auto';
              tooltipRef.current.style.marginBottom = '10px';
            } else {
              tooltipRef.current.style.top = '100%';
              tooltipRef.current.style.bottom = 'auto';
              tooltipRef.current.style.marginTop = '10px';
            }
          }
        }

        // If tooltip is off-screen on the right
        if (rect.right > viewportWidth) {
          tooltipRef.current.style.left = 'auto';
          tooltipRef.current.style.right = '0';
        }

        // If tooltip is off-screen on the left
        if (rect.left < 0) {
          tooltipRef.current.style.left = '0';
          tooltipRef.current.style.right = 'auto';
        }

        // If tooltip is off-screen at the bottom
        if (rect.bottom > viewportHeight) {
          tooltipRef.current.style.top = 'auto';
          tooltipRef.current.style.bottom = '0';
        }
      }
    };

    if (isVisible) {
      // Small delay to ensure the tooltip is rendered before measuring
      setTimeout(handleResize, 10);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, position]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`focus:outline-none transition-all duration-200 rounded-full p-1.5 hover:bg-cyan-500/20 focus:ring-2 focus:ring-cyan-500/40 ${iconClass}`}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Show information"
      >
        <FaInfoCircle className={`${getIconSizeClass()} transform hover:scale-110 transition-transform duration-200`} />
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          aria-live="polite"
          className={`absolute z-50 ${getPositionClasses()} bg-gradient-to-br from-zinc-800 to-zinc-900 p-3 rounded-lg border border-cyan-700/50 shadow-lg ${getWidthClass()} text-left ${tooltipClass} animate-in fade-in duration-200`}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={handleHideTooltip}
        >
          {title && <h4 className="text-cyan-300 font-medium text-sm ">{title}</h4>}
          <div className="text-cyan-100 text-xs ">{content}</div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
