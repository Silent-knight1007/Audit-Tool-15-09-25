import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileIcon } from 'react-file-icon';

const AuditTable = ({ selectedIds, setSelectedIds, audits, setAudits }) => {
  const navigate = useNavigate();

  
  const handleClick = (auditId, actualDate) => {
    navigate('/abc', {
      state: {
        auditId: auditId,
        actualdate: actualDate  // ✅ this is the key addition
      }
    });
  };
  const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

  return (
    <div className="p-1">
      {/* Scroll wrapper */}
    <div className="overflow-auto max-h-[500px] max-w-full border border-gray-300">
      <table className="min-w-full table-auto border-separate border-spacing-0 border-red-500 text-xs">
        <thead className="bg-red-500 ">
          <tr>
            <th className="border p-2 sticky top-0 bg-red-500 z-10">
              <input
                type="checkbox"
                checked={audits.length > 0 && selectedIds.length === audits.length}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedIds(audits.map(a => a._id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
              />
            </th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Audit ID</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Type</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Standards</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Location</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Lead Auditor</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Planned Date</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Status</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Actual Date</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Complete Date</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Add Non Conformity</th>
            <th className="border p-2 text-xs text-white sticky top-0 bg-red-500 z-10">Attachments</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr key={audit._id}>
              <td className="border p-2"> 
                <input
                  type="checkbox"
                  checked={selectedIds.includes(audit._id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, audit._id]);
                    } else {
                      setSelectedIds(selectedIds.filter(id => id !== audit._id));
                    }
                  }}
                />
              </td>
              <td className="border p-2 text-xs">
                <button
                  className="text-blue-900 underline"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  onClick={() => navigate(`/edit-audit/${audit._id}`)}>
                  {audit.auditId}
                </button>
              </td>
              <td className="border p-2 text-xs">{audit.auditType}</td>
              <td className="border p-2 text-xs">{audit.standards}</td>
              <td className="border p-2 text-xs">{audit.location}</td>
              <td className="border p-2 text-xs">{audit.leadAuditor}</td>
              <td className="border p-2 text-xs">{new Date(audit.plannedDate).toLocaleDateString()}</td>
              <td className="border p-2 text-xs">{audit.status}</td>
              <td className="border p-2 text-xs">{new Date(audit.actualDate).toLocaleDateString()}</td>
              <td className="border p-2 text-xs">{formatDate(audit.completeDate)}</td>
              <td className="border p-2 text-xs">
                {(audit.status === "Executed" || audit.status === "Completed") && (
                <button
                onClick={() => handleClick(audit.auditId, audit.actualDate)}
                className="w-auto bg-red-500 hover:bg-orange-600 text-white font-bold text-xs
                py-1 px-1 rounded mt-2 mb-2 transition duration-200">
                Add NonConformity
                </button>
                )}

              </td>
              <td className="border p-2">
                {audit.attachments && audit.attachments.length > 0 ? (
                  <ul>
                    {audit.attachments.map(file => {
                      const ext = file.originalname.split('.').pop().toLowerCase();
                      return (
                        <li key={file.filename} className="flex items-center gap-2">
                          <div style={{ width: 24, height: 24 }}>
                            <FileIcon extension={ext} />
                          </div>
                          <a
                            href={`http://localhost:5000/uploads/${file.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="text-blue-900 underline"
                          >
                            {file.originalname}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="text-red-500">No files</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default AuditTable;
