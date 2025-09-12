import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CertificateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [formData, setFormData] = useState({
    documentId: '',
    documentName: '',
    description: '',
    versionNumber: '',
    issueDate: '',
    validThrough: ''
  });

  useEffect(() => {
  if (id) {
    axios
      .get(`http://localhost:5000/api/certificates/${id}`)
      .then((res) => {
        // Format the dates before setting state
        const data = res.data;
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        setFormData((prev) => ({
          ...prev,
          ...data,
          issueDate: formatDate(data.issueDate),
          validThrough: formatDate(data.validThrough)
        }));
      })
      .catch((err) => console.error(err));

    // Fetch attachments code remains same
    axios
      .get(`http://localhost:5000/api/certificates/${id}/attachments`)
      .then((res) => setAttachments(res.data))
      .catch(() => setAttachments([]));
  }
}, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['documentId', 'documentName', 'description', 'versionNumber', 'issueDate', 'validThrough'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill the ${field} field.`);
        return;
      }
    }

    // Date validation
    const issueDateValue = new Date(formData.issueDate);
    const validThroughValue = new Date(formData.validThrough);

    if (validThroughValue <= issueDateValue) {
      alert("Valid Through date must be after the Issue Date.");
      return;
    }

    try {
      let certificateId = id;
      if (id) {
        const updateData = {...formData, attachments}; // include current attachments array here
        await axios.put(`http://localhost:5000/api/certificates/${id}`, updateData);
        alert('Certificate updated successfully!');
      } else {
        const res = await axios.post('http://localhost:5000/api/certificates', formData);
        certificateId = res.data._id;
        alert('Certificate added successfully!');
      }

      if (selectedFiles.length > 0 && certificateId) {
        const uploadData = new FormData();
        selectedFiles.forEach(file => uploadData.append('attachments', file));
        await axios.post(
          `http://localhost:5000/api/certificates/${certificateId}/attachments`,
          uploadData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      navigate('/organisationdocuments/certificates');
    } catch (error) {
      console.error('Failed to save certificate:', error);
      alert('Failed to save certificate. Please try again.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel?')) {
      navigate('/organisationdocuments/certificates');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
  if (!window.confirm('Are you sure you want to delete this attachment?')) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/certificates/${id}/attachments/${attachmentId}`
    );

    // Remove the deleted attachment from attachments state
    setAttachments(prev => prev.filter(att => att._id !== attachmentId));
    alert('Attachment deleted successfully!');
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    alert('Failed to delete attachment. Please try again.');
  }
};

  return (
    <form onSubmit={handleSubmit} className="p-1 max-w-5xl mx-auto pt-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-xs">
        
        {/* Certificate ID */}
        <div className="flex flex-col">
          <label>
            Document ID <span className="text-red-500">*</span>
          </label>
          <input
            name="documentId"
            value={formData.documentId}
            onChange={handleChange}
            required
            className={`mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 ${id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            readOnly={!!id}
            placeholder="Enter Document ID"
            pattern="[a-zA-Z0-9]+"
            title="Only alphanumeric characters allowed"
            autoComplete="off"
          />
        </div>

        {/* Certificate Name */}
        <div className="flex flex-col">
          <label>
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            name="documentName"
            value={formData.documentName}
            onChange={handleChange}
            required
            className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400"
            placeholder="Enter Document Name"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            maxLength={1000}
            className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 resize-none"
            placeholder="Enter Description"
          />
        </div>

        {/* Version Number */}
        <div className="flex flex-col">
          <label>
            Version Number <span className="text-red-500">*</span>
          </label>
          <input
            name="versionNumber"
            value={formData.versionNumber}
            onChange={handleChange}
            required
            className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400"
            placeholder="Enter Version Number"
            pattern="[a-zA-Z0-9]+"
            title="Only alphanumeric characters allowed"
            autoComplete="off"
          />
        </div>

        {/* Issue Date */}
        <div className="flex flex-col">
          <label>
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            required
            className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400"
          />
        </div>

        {/* Valid Through */}
        <div className="flex flex-col">
          <label>
            Valid Through <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="validThrough"
            value={formData.validThrough}
            onChange={handleChange}
            required
            className="mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400"
          />
        </div>

        {/* Attachments */}
        <div className="flex flex-col md:col-span-3 mt-4">
          <label>Attachments</label>
          <input
            type="file"
            multiple
            onChange={e => setSelectedFiles([...e.target.files])}
            className="mt-2 py-2 px-2 rounded-lg bg-white border border-gray-400"
          />
          {selectedFiles.length > 0 && (
            <ul className="text-sm mt-2">
              {Array.from(selectedFiles).map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}

          {attachments.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold mb-1">Existing Attachments:</div>
              <ul>
                {attachments.map((file) => (
                  <li key={file._id} className="flex items-center justify-between">
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline">
                      {file.name}
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
          className="w-32 bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-1 rounded-lg"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="w-32 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;

