"use client";

import { useState } from "react";
import CrudModal from "./CrudModal";

interface DataTableProps {
  data: any[];
  columns: any[];
  primaryKey: string[];
  tableName: string;
  onRefresh: () => void;
}

export default function DataTable({
  data,
  columns,
  primaryKey,
  tableName,
  onRefresh,
}: DataTableProps) {
  console.log("DataTable received data:", data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);

  const handleSave = async (rowData: any) => {
    const isEditing = !!selectedRow;
    const url = isEditing
      ? `/api/crud/${tableName}/${selectedRow[primaryKey[0]]}`
      : `/api/crud/${tableName}`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rowData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
      }

      onRefresh();
      setIsModalOpen(false);
      setSelectedRow(null);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  const handleDelete = async (row: any) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(
          `/api/crud/${tableName}/${row[primaryKey[0]]}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "An error occurred");
        }

        onRefresh();
      } catch (error) {
        console.error("Failed to delete data:", error);
      }
    }
  };

  return (
    <div className="w-full mt-8 overflow-x-auto">
      <div className="flex justify-start mb-4 sticky left-0">
        <button
          onClick={() => {
            setSelectedRow(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
        >
          Add Record
        </button>
      </div>
      <table className="min-w-full bg-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            {headers.map((header) => (
              <th key={header} className="py-3 px-6 text-left">
                {header}
              </th>
            ))}
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              {headers.map((header) => (
                <td key={header} className="py-3 px-6 text-left">
                  {row[header]}
                </td>
              ))}
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedRow(row);
                      setIsModalOpen(true);
                    }}
                    className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                  >
                    {/* Edit icon */}
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                  >
                    {/* Delete icon */}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        columns={columns}
        initialData={selectedRow}
      />
    </div>
  );
}
