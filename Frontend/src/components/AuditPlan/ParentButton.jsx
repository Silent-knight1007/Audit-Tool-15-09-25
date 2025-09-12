// components/AuditPlan/ParentButton.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuditTable from "./AuditPlanTable";
import DeleteAuditButton from "./DeleteAuditPlanButton"; // ✅ make sure this matches actual file name
import axios from "axios";

export default function ParentButton() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [audits, setAudits] = useState([]);

  const handleDeleteSelected = async (ids = selectedIds) => {
    // ✅ Ensure ids is always an array
    if (!Array.isArray(ids)) {
      ids = selectedIds;
    }

    const selectedAudits = audits.filter(audit => ids.includes(audit._id));
    const nonPlanned = selectedAudits.filter(
      audit =>
        typeof audit.status === "string" &&
        audit.status.trim().toLowerCase() !== "planned"
    );

    if (nonPlanned.length > 0) {
      alert("Audits with status 'executed' & 'completed' can't be deleted.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      const response = await axios.delete("http://localhost:5000/audits", {
        data: { ids }
      });

      const deletedIds =
        response.data.deletedIds && response.data.deletedIds.length > 0
          ? response.data.deletedIds
          : ids;

      console.log("Deleted IDs from backend or fallback:", deletedIds);

      setAudits(prevAudits =>
        prevAudits.filter(a => !deletedIds.includes(a._id))
      );
      setSelectedIds(prevIds =>
        prevIds.filter(id => !deletedIds.includes(id))
      );

      alert(response.data.message || "Deleted successfully.");
    } catch (error) {
      console.error("Error deleting audits:", error);
      alert("Error deleting audits");
    }
  };

  const fetchAudits = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/AuditPlan"
      );
      setAudits(response.data);
    } catch (error) {
      console.error("Error fetching audits:", error.message);
      if (error.response) {
        console.error("Response:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Axios config error:", error.config);
      }
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  return (
    <div className="p-4">
        <h1 className="mb-8 font-bold text-xl ml-2">Audit Records</h1>
      {/* Buttons Row */}
      <div className="flex gap-x-2 mb-2">
        <Link to="/xyz">
          <button className="bg-red-500 hover:bg-orange-600 text-white ml-1 font-bold text-xs py-2 px-7 rounded-lg">
            Add
          </button>
        </Link>

        <DeleteAuditButton
          onDelete={() => handleDeleteSelected()}
          disabled={selectedIds.length === 0}
        />
      </div>

      {/* Table */}
      <AuditTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        audits={audits}
        setAudits={setAudits}
      />
    </div>
  );
}
