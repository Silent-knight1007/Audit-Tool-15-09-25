import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import App from './App.jsx'
import Home from './components/Home/Home.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import AuditPlan from './components/AuditPlan/AuditPlan.jsx'
import NonConformity from './components/NonConformity/NonConformity.jsx'
import ParentNCButton from './components/NonConformity/ParentNcButton.jsx'
import User from './components/User/User.jsx'
import ParentButton from './components/AuditPlan/ParentButton.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="*" element={<App />}>
      {/* Public */}
      <Route path="" element={<Home />} />
      {/* Protected */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="auditplan" element={<ParentButton />} />
      <Route path="nonconformity" element={<ParentNCButton />} />
      <Route path="user/:userid" element={<User />} />
      <Route path="xyz" element={<AuditPlan />} />
      <Route path="abc" element={<NonConformity />} />
      <Route path="edit-audit/:id" element={<AuditPlan />} />
      <Route path="edit-nc/:id" element={<NonConformity />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
