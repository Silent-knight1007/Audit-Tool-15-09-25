import { useEffect, useState } from 'react';
import axios from 'axios';  
import AutoResizeTextarea from '../NonConformity/AutoResizeTextarea';
import Select from 'react-select';
import { useNavigate} from 'react-router-dom';
import { FileIcon } from 'react-file-icon';
import { useParams } from 'react-router-dom';


export default function AuditPlan() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // Form field states
  const [auditId, setAuditId] = useState('');
  const [auditType, setAuditType] = useState('');
  const [standards, setStandards] = useState([]);
  const [location, setLocation] = useState([]);
  const [selectedAuditTeam, setSelectedAuditTeam] = useState([]);
  const [leadAuditor, setLeadAuditor] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [status, setStatus] = useState('');
  const [actualDate, setActualDate] = useState('');
  const [completeDate,setCompleteDate] = useState('');
  const [criteria, setCriteria] = useState('');
  const [scope, setScope] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/AuditPlan/${id}`)
        .then(response => {
          const data = response.data;
          setAuditId(data.auditId);
          // set other states accordingly
        })
        .catch(error => {
          alert('Error loading audit for edit');
        });
    }
  }, [id]);

  // Editable state
  const [isEditable, setIsEditable] = useState({
    standards: true,
    location: true,
    leadAuditor: true,
    auditteam: true,
    status: true,
    actualdate: true,
    completedate:true,
    auditscope: true,
    auditcriteria:true,
    planneddate: false, // default true now so fields editable in create mode initially
    audittype: false
  });

  // Fetch data or reset fields depending on mode (edit/create)
  useEffect(() => {
    if (id) {
      // Editing mode - disable fields you want to lock during edit
      setIsEditable({
        standards: true,
        location: true,
        leadAuditor: true,
        auditteam: true,
        status: true,
        actualdate: true,
        completedate: true,
        auditscope: true,
        auditcriteria: true,
        planneddate: false,
        audittype: false
      });

  // Fetch existing audit data
      axios.get(`http://localhost:5000/api/AuditPlan/${id}`)
        .then(response => {
          const data = response.data;
          setAuditId(data.auditId || '');
          setAuditType(data.auditType || '');
          setStandards(data.standards || []);
          setLocation(data.location || []);
          setLeadAuditor(data.leadAuditor || '');
          setSelectedAuditTeam(data.auditTeam || []);
          setPlannedDate(data.plannedDate ? data.plannedDate.slice(0,10) : '');
          setStatus(data.status || '');
          setActualDate(data.actualDate ? data.actualDate.slice(0,10) : '');
          setCompleteDate(data.completeDate ? data.completeDate.slice(0,10) : '');
          setCriteria(data.criteria || '');
          setScope(data.scope || '');
          setExistingAttachments(data.attachments || []);
        })
        .catch(error => {
          alert('Error loading audit for edit');
        });
    } else {
      // Creating new mode - enable all fields editable, reset form
      setIsEditable({
        standards: true,
        location: true,
        leadAuditor: true,
        auditteam: true,
        status: true,
        actualdate: true,
        completedate: true,
        auditscope: true,
        auditcriteria: true,
        planneddate: true,
        audittype: true
      });

      setAuditId('');
      setAuditType('');
      setStandards([]);
      setLocation([]);
      setLeadAuditor('');
      setSelectedAuditTeam([]);
      setPlannedDate('');
      setStatus('');
      setActualDate('');
      setCompleteDate('');
      setCriteria('');
      setScope('');
      setExistingAttachments([]);
      setAttachments([]);
    }
  }, [id]);

  const locationOptions = [
    { value: "Noida", label: "Noida" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Pune", label: "Pune" },
    { value: "Dubai", label: "Dubai" },
    { value: "Singapore", label: "Singapore" },
    { value: "Gurgaon", label: "Gurgaon" },
  ];

  const standardOptions = [
    { value: "ISO 9001 : 2015", label: "ISO 9001 : 2015" },
    { value: "ISO 27001 : 2023", label: "ISO 27001 : 2023" },
    { value: "ISO 27701 : 2019", label: "ISO 27701 : 2019" },
    { value: "ISO 22301 : 2019", label: "ISO 22301 : 2019" },
    { value: "ISO 27017 : 2015", label: "ISO 27017 : 2015" },
    { value: "ISO 27018 : 2015", label: "ISO 27018 : 2015" },
  ];

  const auditTeamOptions = [
    { value: "pooja.punyani", label: "pooja.punyani" },
    { value: "ritika.singh", label: "ritika.singh" },
    { value: "anurag.bose", label: "anurag.bose" },
   
  ];

  const handleAttachmentsChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const submitAuditPlanForm = async (AuditPlanData) => {
  try {
    const formData = new FormData();

    for (const key in AuditPlanData) {
      if (key !== 'attachments') {
        if (key === 'completeDate' || key === 'actualDate' || key === 'plannedDate') {
          formData.append(key, AuditPlanData[key] || null);
        } else {
          formData.append(key, AuditPlanData[key]);
        }

      }
    }
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    let url = 'http://localhost:5000/api/AuditPlan';
    let method = 'POST';

    if (id) {
      url = `http://localhost:5000/api/AuditPlan/${id}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert(id ? 'Audit Plan updated successfully!' : 'Audit Plan form submitted successfully!');
      navigate('/AuditPlan');
    } else {
      alert('Failed to submit Audit Plan form: ' + result.error);
    }
  } catch (error) {
    alert('Error submitting Audit Plan form: ' + error.message);
  }
};

  const handleAuditPlanFormSubmit = (e) => {
    e.preventDefault();

    // Convert to Date objects
      const planned = plannedDate ? new Date(plannedDate) : null;
      const actual = actualDate ? new Date(actualDate) : null;
      const complete = completeDate ? new Date(completeDate) : null;

    // Check if actualDate is before or equal to plannedDate
     if (planned && actual && actual < planned) {
    alert("Actual Date cannot be before Planned Date.");
    return;
  }

  if (planned && complete && complete < planned) {
    alert("Completion Date cannot be before Planned Date.");
    return;
  }

  if (actual && complete && complete < actual) {
    alert("Completion Date cannot be before Actual Date.");
    return;
  }

    const AuditPlanData = {
      auditId,
      auditType,
      standards,
      location,
      leadAuditor,
      auditTeam: selectedAuditTeam,
      plannedDate,
      status,
      actualDate,
      completeDate,
      criteria,
      scope,
    };
    submitAuditPlanForm(AuditPlanData);
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel filling the form?")) {
      setAuditId('');
      setAuditType('');
      setStandards([]);
      setLocation([]);
      setLeadAuditor('');
      setSelectedAuditTeam([]);
      setPlannedDate('');
      setStatus('');
      setActualDate('');
      setCompleteDate('');
      setCriteria('');
      setScope('');
      navigate('/AuditPlan')
    }
  };

  // File icon helper
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  return (
    <div className="relative flex items-top justify-center min-h-[700px] bg-white sm:items-center sm:pt-0">
      <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
        <div className="mt-8 overflow-hidden">
          <div className="flex justify-center items-center min-h-screen bg-gray-0">

            <form className="p-1 flex flex-col justify-center" onSubmit={handleAuditPlanFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-xs">
                {/* audit Id */}
                <div className="flex flex-col  hidden">
                  <label htmlFor="auditId" className="text-medium font-medium text-gray-700">
                    Audit ID  <span className="text-red-500 text-xs mt-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="auditId"
                    id="auditId"
                    onChange={e => setAuditId(e.target.value)}
                    value={auditId}
                    placeholder="Enter Audit ID"
                    required
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none"
                    readOnly
                  />
                </div>
                {/* audit type */}
                <div className="flex flex-col">
                  <label htmlFor="audit-type" className="text-medium font-medium text-gray-700">
                    Audit Type <span className="text-red-500 text-xs mt-1">*</span>
                  </label>
                  <select
                    name="auditType"
                    id="audit-type"
                    value={auditType}
                    onChange={e => setAuditType(e.target.value)}
                     disabled={!isEditable.audittype}
                    required
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none">
                    <option value="" disabled>
                      Audit Type
                    </option>
                    <option>Internal</option>
                    <option>External</option>
                  </select>
                </div>
                {/* audit standards */}
                <div className="flex flex-col ">
                  <label htmlFor="standards" className="text-medium font-medium text-gray-700">
                    Standards <span className="text-red-500 text-xs mt-1">*</span>
                  </label>
                  <Select
                    isMulti
                    name="standards"
                    options={standardOptions}
                     isDisabled={!isEditable.standards}
                    value={standardOptions.filter(opt => standards.includes(opt.value))}
                    onChange={selected => setStandards(selected ? selected.map(opt => opt.value) : [])}
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none"
                    classNamePrefix="select"
                    placeholder="Select Standards"
                  />
                </div>
                {/* audit location */}
                <div className="flex flex-col">
                  <label htmlFor="location-audit" className="text-medium font-medium text-gray-700">
                    Location <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <Select
                    isMulti
                    name="location"
                    id="location-audit"
                    options={locationOptions}
                    isDisabled={!isEditable.location}
                    value={locationOptions.filter(opt => location.includes(opt.value))}
                    onChange={selected => setLocation(selected ? selected.map(opt => opt.value) : [])}
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                    font-semibold focus:border-orange-500 focus:outline-none"
                    classNamePrefix="select"
                    placeholder="Select Locations"
                  />
                </div>
                {/* lead auditor */}
                <div className="flex flex-col">
                  <label htmlFor="lead-auditor" className="text-medium font-medium text-gray-700">
                    Lead Auditor <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="leadAuditor"
                    value={leadAuditor}
                    onChange={e => setLeadAuditor(e.target.value)}
                    disabled={!isEditable.leadAuditor}
                    id="lead-auditor"
                    required
                    placeholder="Lead Auditor"
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                {/* audit team */}
                <div className="flex flex-col">
                  <label htmlFor="audit-team" className="text-medium font-medium text-gray-700">
                    Audit Team <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <Select
                    isMulti
                    name="auditTeam"
                    id="audit-team"
                    options={auditTeamOptions}
                    isDisabled={!isEditable.auditteam}
                    value={auditTeamOptions.filter(opt => selectedAuditTeam.includes(opt.value))}
                    onChange={selected => setSelectedAuditTeam(selected ? selected.map(opt => opt.value) : [])}
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                    font-semibold focus:border-orange-500 focus:outline-none"
                    classNamePrefix="select"
                    placeholder="Select Audit Team"
                  />
                </div>
                {/* planned date  */}
                <div className="flex flex-col">
                  <label htmlFor="planned-date" className="text-medium font-medium text-gray-700">
                    Planned Date <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="plannedDate"
                    id="planned-date"
                    value={plannedDate}
                    onChange={e => setPlannedDate(e.target.value)}
                    disabled={!isEditable.planneddate}
                    required
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                {/* audit status */}
                <div className="flex flex-col">
                  <label htmlFor="status" className="text-medium font-medium text-gray-700">
                    Status <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    disabled={!isEditable.status}
                    required
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                    font-semibold focus:border-orange-500 focus:outline-none">
                    <option value="" disabled>
                      Status
                    </option>
                    <option value="Planned">Planned</option>
                    <option value="Executed">Executed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {/* actual date */}
                <div className="flex flex-col">
                  <label htmlFor="actual-date" className="text-medium font-medium text-gray-700">
                    Actual Date 
                  </label>
                  <input
                    type="date"
                    name="actualDate"
                    id="actual-date"
                    value={actualDate}
                    onChange={e => setActualDate(e.target.value)}
                    disabled={!isEditable.actualdate}
                    min={plannedDate || undefined}
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                {/* complete date */}
                <div className="flex flex-col">
                  <label htmlFor="complete-date" className="text-medium font-medium text-gray-700">
                    Complete Date <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="completeDate"
                    id="complete-date"
                    value={completeDate}
                    required
                    onChange={e => setCompleteDate(e.target.value)}
                    disabled={!isEditable.completedate}
                    min={actualDate ? (new Date(actualDate) > new Date(plannedDate) ? actualDate : plannedDate) : plannedDate || undefined }
                      // If actualDate after plannedDate, use actualDate as min, else plannedDate (
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                {/* audit criteria */}
                <div className="flex flex-col  ">
                  <label htmlFor="criteria" className="text-medium font-medium text-gray-700">
                    Audit Criteria  <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <AutoResizeTextarea
                    name="criteria"
                    id="criteria"
                    value={criteria}
                    onChange={e => setCriteria(e.target.value)}
                    readOnly={!isEditable.auditcriteria} 
                    maxLength={1000}
                    required
                    placeholder="Enter Audit Criteria"
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                {/* audit scope */}
                <div className="flex flex-col  ">
                  <label htmlFor="scope" className="text-medium font-medium text-gray-700">
                    Audit Scope  <span className="text-red-500 text-xl mt-1">*</span>
                  </label>
                  <AutoResizeTextarea
                    name="scope"
                    id="scope"
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    readOnly={!isEditable.auditscope}
                    maxLength={1000}
                    required
                    placeholder="Enter Audit Scope"
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                {/* attachments */}
                <div className="flex flex-col">
                  <label htmlFor="attachments" className="text-medium font-medium text-gray-700">
                    Attachments (png,jpeg,docx,pdf,xlsx,pptx)
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    name="attachments"
                    accept=".png,.jpeg,.jpg,.doc,.docx,.pdf,.xlsx,.pptx"
                    multiple
                    onChange={handleAttachmentsChange}
                    className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                    font-semibold focus:border-orange-500 focus:outline-none"
                  />
                  {/* Show existing attachments if any */}
                  {existingAttachments.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-gray-700 mb-1">Existing Attachments:</div>
                      <ul>
                        {existingAttachments.map(file => (
                          <li key={file.filename} className="flex items-center gap-2">
                            <div style={{ width: 24, height: 24 }}>
                              <FileIcon extension={getFileExtension(file.originalname)} />
                            </div>
                            <a
                              href={`http://localhost:5000/uploads/${file.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="text-blue-600 underline"
                            >
                              {file.originalname}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* save button */}
                <button
                  type="submit"
                  className="w-32 bg-orange-700 hover:bg-blue-dark text-white font-bold py-2 px-6 rounded-lg mt-10 
                  hover:bg-orange-600 transition ease-in-out duration-300">
                  Save
                </button>
                {/* cancel button */}
                <button type="button" onClick={handleCancel}
                  className="md:w-32 bg-orange-700 hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-lg mt-10
                  hover:bg-orange-600 transition ease-in-out duration-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
