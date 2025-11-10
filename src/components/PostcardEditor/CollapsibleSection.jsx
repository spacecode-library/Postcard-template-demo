import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './CollapsibleSection.css';

/**
 * Collapsible section component for organizing sidebar content
 * @param {string} title - Section title
 * @param {ReactNode} children - Section content
 * @param {boolean} defaultOpen - Whether section is open by default
 */
function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        className="section-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title} section`}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <h3>{title}</h3>
      </button>
      {isOpen && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
