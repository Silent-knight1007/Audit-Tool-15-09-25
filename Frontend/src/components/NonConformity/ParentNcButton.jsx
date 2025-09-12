import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../../Context/AuthContext';
import { Link } from "react-router-dom";
import axios from "axios";
import NonConformityTable from "./NonConformityTable";
import DeleteNonConformityButton from "./DeleteNonConformityButton";

export default function ParentNCButton() {
  const [nc, setNc] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  // Fetch nonconformity data from API
  const fetchNonConformities = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/NonConformity", {
      headers: {
        user: JSON.stringify(user)  // user must have _id and role
      }
    });
    setNc(response.data);
    setSelectedIds([]);
  } catch (error) {
    console.error("Error fetching NonConformity data:", error);
  }
};

  useEffect(() => {
    fetchNonConformities();
  }, []);

  // Delete selected nonconformities
  const handleDeleteSelected = async (ids = selectedIds) => {
    if (!Array.isArray(ids)) {
      ids = selectedIds;
    }
    if (ids.length === 0) return;

    if (!window.confirm("Are you sure you want to delete selected items?")) return;

    try {
      await axios.delete("http://localhost:5000/api/NonConformity", { 
        data: {
        ids,
        userId: user._id,
        role: userRole,
        }
      });
      
      // Update local state after deletion
      setNc(prev => prev.filter(item => !ids.includes(item._id)));
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
      alert("Deleted successfully.");
    } catch (error) {
      console.error("Error deleting NonConformity:", error);
      alert("Error deleting NonConformity");
    }
  };

  return (
    <div className="p-4">
        <h1 className="mb-8 font-bold text-xl ml-2">Non-Conformity Records</h1>
      {/* Buttons Row */}
      <div className="flex gap-x-2 mb-4">

        <DeleteNonConformityButton
          onDelete={() => handleDeleteSelected()}
          selectedIds={selectedIds}
          userRole={userRole}
        />
      </div>

      {/* Table with props */}
      <NonConformityTable
        nc={nc}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
    </div>
  );
}
