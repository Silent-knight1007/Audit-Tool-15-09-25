import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PolicyForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    documentId: '',
    documentName: '',
    description: '',
    versionNumber: '',
    releaseDate: '',
    applicableStandard: [],
  });
  
  const { id } = useParams();
  useEffect(() => {
  if (id) {
    axios.get(`http://localhost:5000/api/policies/${id}`)
      .then(res => {
        const data = res.data;

        // Format releaseDate to YYYY-MM-DD
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        setFormData(prev => ({
          ...prev,
          ...data,
          releaseDate: formatDate(data.releaseDate)
        }));
      })
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/api/policies/${id}/attachments`)
      .then(res => setAttachments(res.data))
      .catch(() => setAttachments([]));
  }
}, [id]);


const [selectedFiles, setSelectedFiles] = useState([]);
const [attachments, setAttachments] = useState([]);


  const standardOptions = [
    { value: "ISO 9001 : 2015", label: "ISO 9001 : 2015" },
    { value: "ISO 27001 : 2023", label: "ISO 27001 : 2023" },
    { value: "ISO 27701 : 2019", label: "ISO 27701 : 2019" },
    { value: "ISO 22301 : 2019", label: "ISO 22301 : 2019" },
    { value: "ISO 27017 : 2015", label: "ISO 27017 : 2015" },
    { value: "ISO 27018 : 2015", label: "ISO 27018 : 2015" },
  ];

  // Handler to allow only numeric input for serialNumber
  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // only digits allowed
      setFormData(prev => ({ ...prev, serialNumber: value }));
    }
  };

  // Handler to allow only alphanumeric for documentId and versionNumber
  const handleAlphanumericChange = (e) => {
    const { name, value } = e.target;
    if (/^[a-zA-Z0-9]*$/.test(value)) { // only alphanumeric allowed
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  // Normal text change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleStandardChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      applicableStandard: selectedOptions ? selectedOptions.map(opt => opt.value): [],
    }));
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  const requiredFields = ['documentId', 'documentName', 'description', 'versionNumber', 'releaseDate', 'applicableStandard'];

  for (const field of requiredFields) {
    if (!Array.isArray(formData.applicableStandard) || formData.applicableStandard.length === 0) {
      alert('Please select at least one Applicable Standard.');
      return;
    }
  }
// Check attachments manually
if ((!attachments || attachments.length === 0) && (!selectedFiles || selectedFiles.length === 0)) {
  alert('Please attach at least one file.');
  return;
}
  try {
    let policyId = id;
    if (id) {
      const updateData = { ...formData, attachments }; // Attach current attachments
      await axios.put(`http://localhost:5000/api/policies/${id}`, updateData);
      alert('Policy updated successfully!');
    } else {
      const res = await axios.post('http://localhost:5000/api/policies', formData);
      policyId = res.data._id;
      alert('Policy added successfully!');
    }

    // Upload selected files
    if (selectedFiles.length > 0 && policyId) {
      const uploadData = new FormData();
      selectedFiles.forEach(file => uploadData.append('attachments', file));
      await axios.post(
        `http://localhost:5000/api/policies/${policyId}/attachments`,
        uploadData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    }

    navigate('/organisationdocuments/policies');
  }catch (error) {
  console.error('Failed to save policy:', error);
  if (error.response) {
    console.error('Full response:', error.response);
    console.error('Response data:', error.response.data);
    alert(`Failed to save policy: ${JSON.stringify(error.response.data) || 'Unknown error'}`);
  } else if (error.request) {
    console.error('No response received:', error.request);
    alert('No response from server. Please try again.');
  } else {
    alert('Failed to save policy. Please try again.');
  }
}


};
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel filling the form?")) {
      navigate('/organisationdocuments/policies');
    }
  };
const handleDeleteAttachment = async (attachmentId) => {
  if (!window.confirm('Are you sure you want to delete this attachment?')) return;

  try {
    await axios.delete(`http://localhost:5000/api/policies/${id}/attachments/${attachmentId}`);
    setAttachments(prev => prev.filter(att => att._id !== attachmentId));
    alert('Attachment deleted successfully!');
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    alert('Failed to delete attachment. Please try again.');
  }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 flex flex-col justify-center max-w-5xl mx-auto pt-20">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-xs">

    {/* Document ID */}
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">
        Document ID <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="documentId"
        value={formData.documentId}
        onChange={handleAlphanumericChange}
        required
        readOnly={!!id} // disable editing if id exists (edit mode)
        className={`mt-2 py-3 px-3 rounded-lg border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none ${id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        placeholder="Enter Document ID"
        pattern="[a-zA-Z0-9]+"
        title="Only alphanumeric characters allowed"
        autoComplete="off"
      />
    </div>

    {/* Document Name */}
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">
        Document Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="documentName"
        value={formData.documentName}
        onChange={handleChange}
        required
        className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none"
        placeholder="Enter Document Name"
      />
    </div>

    {/* Description */}
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">
        Description <span className="text-red-500">*</span>
      </label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        rows={3}
        maxLength={1000}
        className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none resize-none"
        placeholder="Enter Description"
      />
    </div>

    {/* Version Number */}
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">
        Version Number <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="versionNumber"
        value={formData.versionNumber}
        onChange={handleAlphanumericChange}
        required
        className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none"
        placeholder="Enter Version Number"
        pattern="[a-zA-Z0-9]+"
        title="Only alphanumeric characters allowed"
        autoComplete="off"
      />
    </div>

    {/* Release Date */}
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">
        Release Date <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        name="releaseDate"
        value={formData.releaseDate}
        onChange={handleChange}
        required
        className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none"
      />
    </div>

    {/* Applicable Standard */}
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">
        Applicable Standard <span className="text-red-500">*</span>
      </label>
      <Select
        options={standardOptions}
        value={standardOptions.filter(opt =>formData.applicableStandard.includes(opt.value))}
        onChange={handleStandardChange}
        isMulti
        className="mt-2"
        classNamePrefix="select"
        placeholder="Select Applicable Standard"
        isClearable
      />
    </div>
     {/* Attachments */}
    <div className="flex flex-col md:col-span-3 mt-4">
  <label className="font-medium text-gray-700">
    Attachments
  </label>
  <input
    type="file"
    multiple
    // required
    onChange={e => setSelectedFiles([...e.target.files])}
    className="mt-2 py-2 px-2 rounded-lg bg-white border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none"
  />
  {selectedFiles.length > 0 && (
    <ul className="text-sm mt-2">
      {Array.from(selectedFiles).map((file, index) => (
        <li key={index}>{file.name}</li>
      ))}
    </ul>
  )}
  {/* Show existing attachments when editing */}
  {attachments.length > 0 && (
    <div className="mt-4">
      <div className="text-xs font-semibold mb-1">Existing Attachments:</div>
      <ul>
        {attachments.map(file => (
          <li key={file._id} className="flex items-center justify-between">
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              {file.name || file.originalName}
            </a>
            <button
              type="button"
              onClick={() => handleDeleteAttachment(file._id)}
              className="text-red-600 ml-4 hover:text-red-800"
              title="Delete attachment">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )}
    </div>

  </div>

  <div className="flex gap-4 mt-10">
    <button
      type="submit"
      className="w-32 bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-1 rounded-lg transition ease-in-out duration-300"
    >
      Save Policy
    </button>
    <button
      type="button"
      onClick={handleCancel}
      className="w-32 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition ease-in-out duration-300"
    >
      Cancel
    </button>
  </div>
</form>

  );
}


