import React, { useRef, useEffect } from 'react';
import { ButtonCustom } from './button-custom';
import ExploreFileButton from './ExploreFileButton';

interface ExploreFileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  anchorRef: React.RefObject<HTMLDivElement>;
}

const ExploreFileMenu: React.FC<ExploreFileMenuProps> = ({ 
  isOpen, 
  onClose, 
  onExportPDF, 
  anchorRef 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target as Node) &&
          anchorRef.current &&
          !anchorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onExportPDF();
            onClose();
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
        >
          Save as PDF
        </button>
      </div>
    </div>
  );
};

export default ExploreFileMenu;