import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileIcon } from 'react-file-icon';
import AuthContext from '../../../Context/AuthContext';

const PolicyTable = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalUrl, setModalUrl] = useState(null);
  const { user } = useContext(AuthContext);
  const userRole = user?.role || 'user';

  const openViewer = (policy) => {
    if (policy.attachments && policy.attachments.length > 0) {
      const file = policy.attachments[0];
      const ext = file.name.split('.').pop().toLowerCase();

      const inlineViewable = ['pdf', 'png', 'jpg', 'jpeg'];

      const url = `http://localhost:5000/api/policies/${policy._id}/attachments/${file._id}`;

      if (inlineViewable.includes(ext)) {
        setModalUrl(url);
      } else {
        window.location.href = url;
      }
    }
  };

  const closeViewer = () => setModalUrl(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/policies'); 
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchPolicies(val);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return isNaN(d) ? '—' : d.toLocaleDateString();
  };

  const handleCreateNew = () => {
    if (userRole === 'admin') {
      navigate('/organisationdocuments/policies/new');
    }
  };

  const handleEditSelected = () => {
    if (selectedIds.length === 1 && userRole === 'admin') {
      navigate(`/organisationdocuments/policies/${selectedIds[0]}`);
    } else if (selectedIds.length !== 1) {
      alert('Please select exactly one advisory to edit.');
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === policies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(policies.map(p => p._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || userRole !== 'admin') return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected policy(s)?`)) return;

    try {
      const response = await axios.delete('http://localhost:5000/api/policies', { 
        data: { ids: selectedIds, role: userRole }
      });
      const deletedIds = response.data.deletedIds || selectedIds;
      setPolicies(prev => prev.filter(p => !deletedIds.includes(p._id)));
      setSelectedIds([]);
      alert(response.data.message || 'Deleted successfully.');
    } catch (error) {
      console.error('Error deleting policies:', error);
      alert('Failed to delete selected policies');
    }
  };

  return (
    <div className="p-2 max-w-full">
      <h2 className="text-xl font-bold mr-10 mb-5 mt-5">Policies</h2>
      <div className="flex gap-x-2 justify-left items-center mb-2">
        {userRole === 'admin' && (
          <button
            onClick={handleCreateNew}
            className="bg-red-600 hover:bg-blue-dark text-white font-bold text-xs py-2 px-4 rounded-lg mt-5 mb-5 hover:bg-orange-600 transition ease-in-out duration-300"
          >
            Add 
          </button>
        )}

        {userRole === 'admin' && (
          <button
            onClick={handleEditSelected}
            disabled={selectedIds.length !== 1}
            className={`px-4 py-2 rounded-lg font-bold text-white text-xs ${
              selectedIds.length !== 1 ? 'bg-red-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'
            } transition`}
          >
             Edit 
          </button>
        )}
        
        {userRole === 'admin' && (
          <button
            onClick={handleDeleteSelected}
            title={userRole !== 'admin' ? 'You do not have permission to delete Policy' : ''}
            disabled={selectedIds.length === 0}
            className={`px-4 py-2 rounded-lg font-bold text-white text-xs ${
              selectedIds.length === 0 ? 'bg-red-600 cursor-not-allowed' : 'hover:bg-orange-600'
            } transition`}
          >
            Delete
          </button>
        )}

        <input
          type="text"
          placeholder="Search Policies..."
          className="border p-2 rounded text-xs mb-5"
          style={{ width: '220px', height: '30px' }}
          value={searchQuery}
          onChange={handleSearchChange}
        />

         <button
          onClick={() => fetchPolicies(searchQuery)}
          className="bg-red-600 hover:bg-orange-600 text-white font-bold text-xs mb-5 py-2 px-3 rounded-lg"
        >
          Search
        </button>
      </div>

      <table className="min-w-full border border-red-600 rounded text-sm">
        <thead className="bg-red-600">
          <tr>
            {userRole === 'admin' && (
              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={policies.length > 0 && selectedIds.length === policies.length}
                  onChange={toggleSelectAll}
                />
              </th>
            )}
            <th className="border p-2 text-xs text-white">Document ID</th>
            <th className="border p-2 text-xs text-white">Document Name</th>
            <th className="border p-2 text-xs text-white">Description</th>
            <th className="border p-2 text-xs text-white">Version Number</th>
            <th className="border p-2 text-xs text-white">Release Date</th>
            <th className="border p-2 text-xs text-white">Applicable Standard</th>
          </tr>
        </thead>
        <tbody>
          {policies.length === 0 ? (
            <tr>
              <td colSpan={userRole === 'admin' ? 8 : 7} className="p-4 text-center font-bold text-red-700">
                No Policies Found.
              </td>
            </tr>
          ) : (
            policies.map(policy => (
              <tr key={policy._id} className="hover:bg-red-50">
                {userRole === 'admin' && (
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(policy._id)}
                      onChange={() => toggleSelect(policy._id)}
                    />
                  </td>
                )}
                <td className="border p-2">{policy.documentId || '—'}</td>
                <td className="border p-2">
                  {policy.attachments && policy.attachments.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => openViewer(policy)}
                      className="text-blue-700 underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      {policy.documentName}
                    </button>
                  ) : (
                    policy.documentName || '—'
                  )}
                </td>
                <td className="border p-2 max-w-xs truncate" title={policy.description}>{policy.description || '—'}</td>
                <td className="border p-2">{policy.versionNumber || '—'}</td>
                <td className="border p-2">{formatDate(policy.releaseDate)}</td>
                <td className="border p-2 text-xs">
                  {Array.isArray(policy.applicableStandard) && policy.applicableStandard.length > 0
                    ? policy.applicableStandard.join(', ')
                    : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] relative p-4">
            <button
              className="absolute top-2 right-3 text-2xl font-bold text-gray-700 hover:text-gray-900"
              onClick={closeViewer}
              aria-label="Close modal"
            >
              &times;
            </button>
            <iframe
              src={modalUrl}
              title="Document Viewer"
              className="w-full h-[80vh] border-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyTable;



