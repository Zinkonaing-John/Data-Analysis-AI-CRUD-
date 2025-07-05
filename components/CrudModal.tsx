
"use client";

import { useState, useEffect } from "react";

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  columns: any[];
  initialData?: any;
}

export default function CrudModal({ isOpen, onClose, onSave, columns, initialData }: CrudModalProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{initialData ? "Edit Record" : "Add Record"}</h2>
        <form onSubmit={handleSubmit}>
          {columns.map(col => (
            <div key={col.Field} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">{col.Field}</label>
              <input
                type="text"
                name={col.Field}
                value={formData[col.Field] || ''}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            </div>
          ))}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="text-gray-600 font-semibold">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
