import Multiselect from 'multiselect-react-dropdown'
import AutoResizeTextarea from './AutoResizeTextarea'
import React, { useRef, useState, useEffect, useContext } from "react"
import { useNavigate, useLocation} from "react-router-dom"
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import { FileIcon } from 'react-file-icon';
import AuthContext from '../../Context/AuthContext';

export default function NonConformity() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const {user} = useContext(AuthContext);
 
    // form fields...
    const [auditId, setAuditId] = useState(location.state?.auditId || '');
    const [ncId, setNcId] = useState('');
    const [ncDescription, setNcDescription] = useState('');
    const [ncClauseNo, setNcClauseNo] = useState('');
    const [ncType, setNcType] = useState('');
    const [actualdate, setActualdate] = useState(location.state?.actualdate || '');
    const [reportingDate, setReportingDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [department, setDepartment] = useState('');
    const [responsiblePeople, setResponsiblePeople] = useState([]);
    const [responsibleperson, setResponsibleperson] = useState('');
    const [responsiblePersonId, setResponsiblePersonId] = useState('');
    const [responsiblepersonmail, setResponsiblepersonmail] = useState('');
    const [nclocation, setNclocation] = useState([]);
    const [ncCorrectiveAction, setNcCorrectiveAction] = useState('');
    const [ncPreventiveAction, setNcPreventiveAction] = useState('');
    const [ncRootCause, setNcRootCause] = useState('');
    const [ncstatus, setNcstatus] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Initial isEditable state - all fields true by default
     const [isEditable, setIsEditable] = useState({
     description: true,
     location: true,
     clauseno: true,
     auditteam: true,
     status: true,
     reportingdate: true,
     department : true,
     nonConformitytype:true,
     dueDate:true,
     responsibleperson:true,
     responsiblepersonmail:true,
     CorrectiveAction:true,
     preventiveAction:true,
     rootcause:true
  // add others as per need
});

// Add this useEffect to set isEditable and initialize form fields depending on edit/create mode
  useEffect(() => {
    if (id) {
      // Editing mode: disable fields as necessary
      setIsEditable({
        description: true,
        location: true,
        clauseno: true,
        auditteam: true,
        status: true,
        reportingdate: false,
        department: true,
        nonConformitytype: true,
        dueDate: true,
        responsibleperson: true,
        responsiblepersonmail: true,
        CorrectiveAction: true,
        preventiveAction: true,
        rootcause: true,
      });

  // Fetch existing NonConformity data
      fetch(`http://localhost:5000/api/NonConformity/${id}`)
        .then(res => res.json())
        .then(data => {
          setAuditId(data.auditId || '');
          setNcId(data.ncId || '');
          setNcDescription(data.ncDescription || '');
          setNcClauseNo(data.ncClauseNo || '');
          setNcType(data.ncType || '');
          setReportingDate(data.reportingDate ? data.reportingDate.slice(0, 10) : '');
          setDueDate(data.dueDate ? data.dueDate.slice(0, 10) : '');
          setDepartment(data.department || '');
          setResponsibleperson(data.responsibleperson || '');
          setResponsiblepersonmail(data.responsiblepersonmail || '');
          setNclocation(data.nclocation || []);
          setNcCorrectiveAction(data.ncCorrectiveAction || '');
          setNcPreventiveAction(data.ncPreventiveAction || '');
          setNcRootCause(data.ncRootCause || '');
          setNcstatus(data.ncstatus || '');
          setExistingAttachments(data.attachments || []);
        })
        .catch(() => alert('Error loading NonConformity for edit'));
    } else {
      // Creating mode: enable all fields and clear form inputs
      setIsEditable({
        description: true,
        location: true,
        clauseno: true,
        auditteam: true,
        status: true,
        reportingdate: true,
        department: true,
        nonConformitytype: true,
        dueDate: true,
        responsibleperson: true,
        responsiblepersonmail: true,
        CorrectiveAction: true,
        preventiveAction: true,
        rootcause: true,
      });

      setAuditId(location.state?.auditId || '');  // optionally reset or keep from location.state
      setNcId('');
      setNcDescription('');
      setNcClauseNo('');
      setNcType('');
      setReportingDate('');
      setDueDate('');
      setDepartment('');
      setResponsibleperson('');
      setResponsiblepersonmail('');
      setNclocation([]);
      setNcCorrectiveAction('');
      setNcPreventiveAction('');
      setNcRootCause('');
      setNcstatus('');
      setExistingAttachments([]);
      setAttachments([]);
    }
  }, [id, location.state?.auditId]);

const submitNCForm = async (ncData) => {
  try {
    const formData = new FormData();

    for (const key in ncData) {
      if (key !== 'attachments') {
        formData.append(key, ncData[key]);
      }
    }

    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    let url = 'http://localhost:5000/api/NonConformity';
    let method = 'POST';

    if (id) {
      url = `http://localhost:5000/api/NonConformity/${id}`;
      method = 'PUT';
    }

    // Assuming you have a user object (replace this with your actual source of loggedInUser)
    if (user) {
      formData.append('userId', user._id);
      formData.append('userRole', user.role);
    } else {
      alert('User not logged in!');
      return;
    }

    const response = await fetch(url, {
      method,
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert(id ? 'NonConformity updated successfully!' : 'NonConformity created successfully!');
      navigate('/NonConformity');
    } else {
      alert('Failed to submit NonConformity: ' + result.error);
    }
  } catch (error) {
    alert('Error submitting NonConformity: ' + error.message);
  }
};

  useEffect(() => {
  const fetchResponsiblePeople = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/responsibleperson');
      const data = await response.json();
      setResponsiblePeople(data);
      console.log('ResponsiblePeople fetched:', data);
    } catch (err) {
      console.error('Error fetching responsible people:', err);
    }
  };

  fetchResponsiblePeople();
}, []);


    useEffect(() => {
    console.log('✅ actualdate received via navigate:', actualdate);
    }, [actualdate]);

    const ncLocationOptions = [
      { value: "Noida", label: "Noida" },
      { value: "Bangalore", label: "Bangalore" },
      { value: "Pune", label: "Pune" },
      { value: "Dubai", label: "Dubai" },
      { value: "Singapore", label: "Singapore" },
      { value: "Gurgaon", label: "Gurgaon" },
    ];

    const handleAttachmentsChange = (e) => {
      setAttachments(Array.from(e.target.files));
    };

    // Helper for file extension
    const getFileExtension = (filename) => {
      return filename.split('.').pop().toLowerCase();
    };

    const submitNonConformityForm = async (NonConformityData) => {
      try {
        const formData = new FormData();
        for (const key in NonConformityData) {
          if (key !== 'attachments') {
            formData.append(key, NonConformityData[key]);
          }
        }
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });

        const response = await fetch('http://localhost:5000/api/NonConformity', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          alert('Non-Conformity form submitted successfully!');
          navigate('/NonConformity');
        } else {
          alert('Failed to submit Non-Conformity form: ' + result.error);
        }
      } catch (error) {
        alert('Error submitting Non-Conformity form: ' + error.message);
      }
    };

    const handleNonConformityFormSubmit = (e) => {
      e.preventDefault();
      setFormError('');
      if (
        !auditId ||
        !ncDescription ||
        !ncClauseNo ||
        !ncType ||
        !reportingDate||
        !dueDate ||
        !department ||
        !responsibleperson ||
        !responsiblepersonmail ||
        !nclocation ||
        !ncRootCause ||
        !ncstatus
      ) {
        setFormError('Please fill in all required fields.');
        return;
      }
      
      const rep = new Date(reportingDate);
      const due = new Date(dueDate);
      const act = new Date(actualdate);

    // Logs for debugging (optional)
    console.log("Reporting Date Parsed:", rep);
    console.log("Due Date Parsed:", due);
    console.log("Actual Date Parsed:", act);

    // Rule 1: rep > act
    if (rep.getTime() <= act.getTime()) {
    window.alert('❌ Reporting Date must be after the Actual Date of Audit.');
    return;
    }

   // Rule 2: rep ≠ due
   if (rep.getTime() === due.getTime()) {
   window.alert('❌ Reporting Date must not be equal to Due Date.');
   return;
   }

   // Rule 3: rep < due
   if (rep.getTime() >= due.getTime()) {
   window.alert('❌ Reporting Date must be before the Due Date.');
   return;
}

      setIsSubmitting(true);
      const NonConformityData = {
        auditId,
        ncDescription,
        ncClauseNo,
        ncType,
        reportingDate,
        dueDate,
        department,
        responsibleperson: responsiblePersonId,
        responsiblepersonmail,
        nclocation,
        ncCorrectiveAction,
        ncPreventiveAction,
        ncRootCause,
        ncstatus,
      };
      submitNCForm(NonConformityData).finally(() => setIsSubmitting(false));
    };

    const handleCancel = () => {
      if (window.confirm("Are you sure you want to cancel filling the form?")) {
        setAuditId('');
        setNcId('');
        setNcDescription('');
        setNcClauseNo('');
        setNcType('');
        setDueDate('');
        setReportingDate('');
        setDepartment('');
        setResponsibleperson('');
        setResponsiblepersonmail('');
        setNclocation('');
        setNcCorrectiveAction('');
        setNcPreventiveAction('');
        setNcRootCause('');
        setNcstatus('');
        navigate('/NonConformity');
      }
    };

    return (
      <div className="relative flex items-top justify-center min-h-[700px] bg-white sm:items-center sm:pt-0">
        <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
          <div className="mt-8 overflow-hidden">
            <div className="flex justify-center items-center min-h-screen bg-gray-0">
              <form className="p-1 flex flex-col justify-center" onSubmit={handleNonConformityFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-xs">

                  {/* auditId */}
                  <div className="flex flex-col">
                    <label htmlFor="audit-id" className="text-medium font-medium text-gray-700">
                      Audit ID <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      name="auditId"
                      id="audit-id"
                      value={auditId}
                      onChange={e => setAuditId(e.target.value)}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                      font-semibold focus:border-orange-500 focus:outline-none"
                      placeholder="Enter or select Audit ID"
                    />
                  </div>
                  {/* ncId */}
                  <div className="flex flex-col hidden">
                    <label htmlFor="ncId" className="text-medium font-medium text-gray-700">
                      NonConformityId
                    </label>
                    <input
                      type="text"
                      name="ncId"
                      required
                      id="ncId"
                      value={ncId}
                      readOnly
                      placeholder="Will be generated after save"
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-gray-100 border border-gray-400 text-gray-800 font-semibold"
                    />
                  </div>
                  {/* description */}
                  <div className="flex flex-col">
                    <label htmlFor="ncDescription" className="text-medium font-medium text-gray-700">
                      Description <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <AutoResizeTextarea
                      value={ncDescription}
                      onChange={e => setNcDescription(e.target.value)}
                      readOnly={!isEditable.description}
                      maxLength={1000}
                      name="ncDescription"
                      id="ncDescription"
                      placeholder="Enter Description"
                      required
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* clause no  */}
                  <div className="flex flex-col  ">
                    <label htmlFor="ncClauseNo" className="text-medium font-medium text-gray-700">
                      Clause Number  <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <AutoResizeTextarea
                      value={ncClauseNo}
                      onChange={e => setNcClauseNo(e.target.value)}
                      disabled={!isEditable.clauseno}
                      maxLength={1000}
                      name="ncClauseNo"
                      id="ncClauseNo"
                      required
                      placeholder="Enter Clause No"
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* nctype */}
                  <div className="flex flex-col">
                    <label htmlFor="nc-type" className="text-medium font-medium text-gray-700">
                      NonConformity Type <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <select
                      name="ncType"
                      id="nc-type"
                      required
                      value={ncType}
                      onChange={e => setNcType(e.target.value)}
                      disabled={!isEditable.nonConformitytype}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none">
                      <option value="" disabled>
                        NonConformity Type
                      </option>
                      <option>Minor</option>
                      <option>Major</option>
                      <option>Observation</option>
                    </select>
                  </div>
                  {/* reporting date */}
                  <div className="flex flex-col">
                    <label htmlFor="reporting-date" className="text-medium font-medium text-gray-700">
                      Reporting Date <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      name="reportingDate"
                      id="reporting-date"
                      value={reportingDate}
                      onChange={e => setReportingDate(e.target.value)}
                      disabled={!isEditable.reportingdate}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* due date */}
                  <div className="flex flex-col">
                    <label htmlFor="due-date" className="text-medium font-medium text-gray-700">
                      Due Date <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      name="dueDate"
                      id="due-date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      disabled={!isEditable.dueDate}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* department */}
                  <div className="flex flex-col">
                    <label htmlFor="department" className="text-medium font-medium text-gray-700">
                      Department <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <select
                      name="department"
                      id="department"
                      required
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      disabled={!isEditable.department}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none">
                      <option value="" disabled>
                        Department
                      </option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                    </select>
                  </div>
                  {/* responsible person */}
                  <div className="flex flex-col">
                    <label htmlFor="responsible-person" className="text-medium font-medium text-gray-700">
                      Responsible-Person <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <select
                      name="responsibleperson"
                      id="responsible-person"
                      required
                      value={responsiblePersonId}   // track selected by ID, not name
                      onChange={e => {
                      const selectedId = e.target.value;
                      setResponsiblePersonId(selectedId);
                      const person = responsiblePeople.find(p => p._id === selectedId);
                      setResponsibleperson(person ? person.name : '');
                      setResponsiblepersonmail(person ? person.email : '');
                      }}
                      disabled={!isEditable.responsibleperson}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 font-semibold focus:border-orange-500 focus:outline-none">
                      <option value="" disabled>Responsible-Person</option>
                      {responsiblePeople.map(person => (
                      <option key={person._id} value={person._id}>{person.name}</option>  // use _id as value
                      ))}
                    </select>
                  </div>
                  {/* responsible person email */}
                  <div className="flex flex-col">
                    <label htmlFor="responsible-person-mail" className="text-medium font-medium text-gray-700">
                      Responsible Person E-Mail <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="responsiblepersonmail"
                      id="responsible-person-mail"
                      readOnly
                      required
                      value={responsiblepersonmail}
                      disabled={!isEditable.responsiblepersonmail}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* location */}
                  <div className="flex flex-col">
                    <label htmlFor="nclocation" className="text-medium font-medium text-gray-700">
                      Location <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <Select
                      isMulti
                      name="nclocation"
                      id="nclocation"
                      options={ncLocationOptions}
                      value={ncLocationOptions.filter(opt => nclocation.includes(opt.value))}
                      onChange={selected => setNclocation(selected ? selected.map(opt => opt.value) : [])}
                      isDisabled={!isEditable.location}
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                      font-semibold focus:border-orange-500 focus:outline-none"
                      classNamePrefix="select"
                      placeholder="Select Location(s)"
                    />
                  </div>
                  {/* corrective action*/}
                  <div className="flex flex-col">
                    <label htmlFor="ncCorrectiveAction" className="text-medium font-medium text-gray-700">
                      Corrective Action
                    </label>
                    <AutoResizeTextarea
                      value={ncCorrectiveAction}
                      onChange={e => setNcCorrectiveAction(e.target.value)}
                      readOnly={!isEditable.CorrectiveAction}
                      maxLength={1000}
                      name="ncCorrectiveAction"
                      id="ncCorrectiveAction"
                      placeholder="Enter Corrective Action"
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* preventive action*/}
                  <div className="flex flex-col  ">
                    <label htmlFor="ncPreventiveAction" className="text-medium font-medium text-gray-700">
                      Preventive Action 
                    </label>
                    <AutoResizeTextarea
                      value={ncPreventiveAction}
                      onChange={e => setNcPreventiveAction(e.target.value)}
                      readOnly={!isEditable.preventiveAction}
                      maxLength={1000}
                      name="ncPreventiveAction"
                      id="ncPreventiveAction"
                      placeholder="Enter Preventive Action"
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* root cause */}
                  <div className="flex flex-col  ">
                    <label htmlFor="ncRootCause" className="text-medium font-medium text-gray-700">
                      Root Cause  <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <AutoResizeTextarea
                      value={ncRootCause}
                      onChange={e => setNcRootCause(e.target.value)}
                      readOnly={!isEditable.rootcause}
                      maxLength={1000}
                      name="ncRootCause"
                      id="ncRootCause"
                      placeholder="Enter Root Cause"
                      required
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-800 
                      font-semibold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  {/* status */}
                  <div className="flex flex-col">
                    <label htmlFor="ncstatus" className="text-medium font-medium text-gray-700">
                      Status <span className="text-red-500 text-xl mt-1">*</span>
                    </label>
                    <select
                      name="ncstatus"
                      id="ncstatus"
                      value={ncstatus}
                      onChange={e => setNcstatus(e.target.value)}
                      disabled={!isEditable.status}
                      required
                      className="w-100 mt-2 py-3 px-3 rounded-lg bg-white border border-gray-400 text-gray-900 
                      font-semibold focus:border-orange-500 focus:outline-none">
                      <option value="" disabled>
                        Status
                      </option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Closed">Closed</option>
                      <option value="Aborted">Aborted</option>
                      <option value="On-Hold">On-Hold</option>
                    </select>
                  </div>
                  {/* attachments */}
                  <div className="flex flex-col">
                    <label htmlFor="attachments" className="text-medium font-medium text-gray-700">
                      Attachments (png, jpeg, docx, pdf, xlsx, pptx)
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
                  {/* update button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-32 bg-red-500 hover:bg-blue-dark text-white font-bold py-2 px-6 rounded-lg 
                      mt-10 hover:bg-orange-600 transition ease-in-out duration-300">
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                   {/* cancel button */}
                  <button type="button" onClick={handleCancel}
                    className="md:w-32 bg-red-500 hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-lg mt-10
                      hover:bg-orange-600 transition ease-in-out duration-300">
                    Cancel
                  </button>
                </div>
                {formError && (
                  <div className="mb-4 text-red-600 font-semibold">{formError}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
}
