import React from 'react';
import { useNavigate } from 'react-router-dom';

const NonConformityTable = ({ nc, selectedIds, setSelectedIds }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  return (
    <div className="p-1">
      {/* Scroll wrapper */}
      <div className="overflow-auto max-h-[500px] max-w-full border border-gray-300">
        <table className="min-w-full table-auto border-collapse border border-red-500 text-xs">
          <thead className="bg-red-500">
            <tr>
              <th className="border p-2 sticky top-0 bg-red-500 z-10">
                <input
                  type="checkbox"
                  checked={nc.length > 0 && selectedIds.length === nc.length}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedIds(nc.map(a => a._id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">NC ID</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Description</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Clause No</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Type</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Reporting Date</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Due Date</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Department</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Responsible Person</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Location</th>
              <th className="border p-2 text-white sticky top-0 bg-red-500 z-10">Status</th>
            </tr>
          </thead>
          <tbody>
            {nc.map(ncItem => (
              <tr key={ncItem._id}>
                <td className="border p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ncItem._id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, ncItem._id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== ncItem._id));
                      }
                    }}
                  />
                </td>
                <td className="border p-2">
                  <button
                    className="text-blue-900 underline"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                    onClick={() => navigate(`/edit-nc/${ncItem._id}`)}
                  >
                    {ncItem.ncId}
                  </button>
                </td>
                <td className="border p-2">{ncItem.ncDescription}</td>
                <td className="border p-2">{ncItem.ncClauseNo}</td>
                <td className="border p-2">{ncItem.ncType}</td>
                <td className="border p-2">{formatDate(ncItem.reportingDate)}</td>
                <td className="border p-2">{formatDate(ncItem.dueDate)}</td>
                <td className="border p-2">{ncItem.department}</td>
                <td className="border p-2">
                  {ncItem.responsibleperson?.name ?? ncItem.responsibleperson ?? '—'}
                </td>
                <td className="border p-2">
                  {Array.isArray(ncItem.nclocation)
                    ? ncItem.nclocation.join(', ')
                    : ncItem.nclocation ?? '—'}
                </td>
                <td className="border p-2">{ncItem.ncstatus ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NonConformityTable;
