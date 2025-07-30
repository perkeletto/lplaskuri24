import React, { useEffect, useRef, useState } from 'react';

const BuffsContainer = ({ children }) => {
  const containerRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    if (containerRef.current) {
      setStartHeight(containerRef.current.offsetHeight);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const delta = startY - e.touches[0].clientY;
    const newHeight = Math.min(
      Math.max(startHeight + delta, 60),
      window.innerHeight * 0.9
    );
    
    containerRef.current.style.maxHeight = `${newHeight}px`;
    containerRef.current.style.minHeight = `${newHeight}px`;
  };

  const handleTouchEnd = () => {
    if (!isDragging || !containerRef.current) return;
    
    setIsDragging(false);
    const height = containerRef.current.offsetHeight;
    
    if (height > window.innerHeight * 0.3) {
      setIsExpanded(true);
      containerRef.current.style.maxHeight = '90vh';
      containerRef.current.style.minHeight = '90vh';
    } else {
      setIsExpanded(false);
      containerRef.current.style.maxHeight = '60px';
      containerRef.current.style.minHeight = '60px';
    }
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    if (containerRef.current) {
      setStartHeight(containerRef.current.offsetHeight);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const delta = startY - e.clientY;
    const newHeight = Math.min(
      Math.max(startHeight + delta, 60),
      window.innerHeight * 0.9
    );
    
    containerRef.current.style.maxHeight = `${newHeight}px`;
    containerRef.current.style.minHeight = `${newHeight}px`;
  };

  const handleMouseUp = () => {
    if (!isDragging || !containerRef.current) return;
    
    setIsDragging(false);
    const height = containerRef.current.offsetHeight;
    
    if (height > window.innerHeight * 0.3) {
      setIsExpanded(true);
      containerRef.current.style.maxHeight = '90vh';
      containerRef.current.style.minHeight = '90vh';
    } else {
      setIsExpanded(false);
      containerRef.current.style.maxHeight = '60px';
      containerRef.current.style.minHeight = '60px';
    }
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, startHeight]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Reset styles when expanded state changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (isExpanded) {
      containerRef.current.style.maxHeight = '90vh';
      containerRef.current.style.minHeight = '90vh';
    } else {
      containerRef.current.style.maxHeight = '60px';
      containerRef.current.style.minHeight = '60px';
    }
  }, [isExpanded]);

  return (
    <div 
      ref={containerRef}
      className={`buffs-container ${isExpanded ? 'expanded' : ''}`}
    >
      <div 
        className="drag-handle"
        onClick={toggleExpanded}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={0}
        aria-label="Drag to resize buffs panel"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      />
      <div className="buffs-content">
        {children}
      </div>
    </div>
  );
};

export default BuffsContainer; 