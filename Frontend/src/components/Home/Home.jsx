import { FaCogs, FaClipboardCheck, FaChartBar, FaShieldAlt, FaUsers } from "react-icons/fa"
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";


// Audit Management Info Blocks
const auditInfo = [
  {
    title: "Audit Management",
    content:
      "Process of planning, executing, and reviewing audits to ensure compliance and improve organizational processes. It involves scheduling audits, assigning tasks, tracking findings, and ensuring corrective actions are implemented.",
  },
  {
    title: "Audit Management Software",
    content:
       "Audit management software is a digital tool that automates and streamlines the entire audit lifecycle. It helps organizations plan, execute, document, and report audits efficiently, reducing manual work and minimizing errors.",
  },
  {
    title: "Core Features",
    content:
      "Audit Planning, workflow automation, customizable checklists, real-time collaboration, document management, reporting, and analytics.",
  },
  {
    title: "Advantages",
    content:
      "Benefits include increased efficiency, improved compliance, reduced risk, better visibility into audit processes, and easier tracking of corrective actions.",
  },
];

const features = [
  {
    icon: <FaCogs className="text-orange-700 text-4xl" />,
    title: "Automated Audit Management",
    desc: "Streamline audits with automated workflows, evidence collection, and real-time status tracking."
  },
  {
    icon: <FaClipboardCheck className="text-orange-700 text-4xl" />,
    title: "Compliance Monitoring",
    desc: "Monitor compliance with industry standards and get instant alerts on violations or gaps."
  },
  {
    icon: <FaChartBar className="text-orange-700 text-4xl" />,
    title: "Analytics & Reporting",
    desc: "Access dashboards and generate comprehensive reports for audits and compliance activities."
  },
  {
    icon: <FaShieldAlt className="text-orange-700 text-4xl" />,
    title: "Data Security",
    desc: "Ensure secure management of sensitive information with robust access controls and encryption."
  },
  {
    icon: <FaUsers className="text-orange-700 text-4xl" />,
    title: "Collaboration Hub",
    desc: "Centralize communication and document sharing between teams and auditors."
  },
];

export default function Home() {

const navigate = useNavigate();
const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

// useEffect(() => {
//   if (isAuthenticated) {
//     navigate("/dashboard", { replace: true });
//   }
// }, [isAuthenticated, navigate]);

  return (
    <div className="w-full min-h-screen ">
      {/* Hero Section */}
      <section className=" bg-red-100 w-full py-16">
        <div className="max-w-4xl mx-auto text-center px-4 ">
          <h1 className="text-5xl font-bold text-red-600 italic mb-4">OneXtel Audit Management </h1>
          <p className="text-m text-gray-900 italic mb-8">
            The complete solution for automated audit management and compliance.
          </p>
          {/* <button className="bg-black italic text-red-600 px-2 py-1 rounded-lg text-lg font-bold hover:bg-red-200 transition" onClick={() => navigate("/login")}>
            Get Started
          </button> */}
        </div>
      </section>

       {/* Audit Management Info Section */}
      <section className="max-w-3xl mx-auto py-12 px-4 space-y-8">
        {auditInfo.map((item, idx) => (
          <div
            key={idx}
            className="bg-red-100  rounded-xl shadow p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <h3 className="text-xl italic font-bold text-red-600 mb-2">{item.title}</h3>
            <p className="text-gray-900 italic text-sm">{item.content}</p>
          </div>
        ))}
      </section>

      {/* How it Works Section with Video */}
<section className="w-full bg-red-100 px-5 py-5">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
    {/* Left: Text Content */}
    <div className="flex-1">
      <h2 className="text-xl font-bold text-red-600 italic mb-4">See How It Works</h2>
      <p className="text-sm font-bold italic text-gray-600 mb-8">
        Watch as we showcase our platform’s intuitive interface, automated control testing, and real-time risk assessments in action.
      </p>
      <button className="bg-red-600 text-white px-2 italic text-sm py-2 rounded-full font-bold hover:bg-red-800 transition">
        SCHEDULE A DEMO
      </button>
    </div>
    {/* Right: Video */}
    <div className="flex-1 flex justify-center">
      <div className="w-full max-w-md aspect-video rounded-xl shadow-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/your-video-id" // <-- Replace with your video link!
          title="How it works | Audit Tool Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  </div>
</section>


      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-center text-red-600 italic mb-12">Platform Services</h2>
        <div className="grid md:grid-cols-3 gap-10 ">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-red-100 rounded-xl shadow-md p-5 flex flex-col items-center transition-transform transition-shadow duration-300 hover:scale-105 hover:shadow-5xl">
              {feature.icon}
              <h3 className="mt-6 text-sm italic font-semibold text-red-600 mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-900 italic text-sm text-center">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* (Optional) Testimonials or Logos Section */}
    </div>
  );
}
