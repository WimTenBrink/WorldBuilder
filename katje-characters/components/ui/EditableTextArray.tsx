import React, { useState } from 'react';
import LargeTextEditDialog from '../dialogs/LargeTextEditDialog';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';

interface EditableTextArrayProps {
  title: string;
  value: string[];
  onChange: (newValue: string[]) => void;
}

const EditableTextArray: React.FC<EditableTextArrayProps> = ({ title, value, onChange }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = (newValue: string) => {
    if (editingIndex !== null) {
      const newArray = [...value];
      newArray[editingIndex] = newValue;
      onChange(newArray);
    }
    setEditingIndex(null);
  };
  
  const handleAdd = () => {
    onChange([...value, 'New entry.']);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 first:mt-0">
      <h4 className="text-md font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">{title}</h4>
      <div className="space-y-2">
        {(value || []).map((item, index) => (
          <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
            <p className="flex-grow text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">{item}</p>
            <div className="flex-shrink-0 flex items-center">
                <button onClick={() => setEditingIndex(index)} className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-300 dark:hover:bg-slate-700">
                    <EditIcon className="w-4 h-4" />
                </button>
                 <button onClick={() => handleRemove(index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}
        <button onClick={handleAdd} className="text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Entry</button>
      </div>
      
      {editingIndex !== null && (
        <LargeTextEditDialog
          title={`Edit ${title} Entry`}
          initialValue={value[editingIndex]}
          onSave={handleSave}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
};

export default EditableTextArray;
