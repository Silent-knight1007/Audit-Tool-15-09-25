// components/AuditPlan/DeleteAuditButton.jsx
import React from 'react';

export default function DeleteAuditButton({ onDelete, disabled }) {
  return (
    <button
      className="bg-red-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-5 rounded-lg mr-1"
      onClick={onDelete}
      disabled={disabled}
    >
      Delete
    </button>
  );
}
