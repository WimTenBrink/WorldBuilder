
import React, { useState } from 'react';
import LargeTextEditDialog from '../dialogs/LargeTextEditDialog';
import EditIcon from '../icons/EditIcon';

interface EditableTextareaProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  rows?: number;
}

const EditableTextarea: React.FC<EditableTextareaProps> = ({ label, value, onChange, rows = 4 }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newValue: string) => {
    onChange(newValue);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {label}
        </label>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
          title="Edit in a larger window"
        >
          <EditIcon className="w-3 h-3" />
          Expand
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark text-sm resize-y text-text-primary-light dark:text-text-primary-dark"
      />
      {isEditing && (
        <LargeTextEditDialog
          title={label}
          initialValue={value}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default EditableTextarea;
