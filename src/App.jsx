// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { Toaster } from 'react-hot-toast'
// import { AuthProvider } from './contexts/AuthContext'
// import ProtectedRoute from './components/ProtectedRoute'
// import ErrorBoundary from './components/ErrorBoundary'
// import SignUp from './pages/auth/SignUp'
// import Login from './pages/auth/Login'
// import Onboarding from './pages/onboarding/Onboarding'
// import Dashboard from './pages/Dashboard'
// import CreateCampaign from './pages/CreateCampaign'
// import CreateBlast from './pages/CreateBlast'
// import History from './pages/History'
// import Settings from './pages/Settings'
// import Profile from './pages/Profile'
// import SidebarTest from './components/layout/SidebarTest'
// import './App.css'

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// })

// function App() {
//   return (
//     <>
//     {/* // <ErrorBoundary>         */}
         
//           <Routes>
//             <Route path="/signup" element={<SignUp />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/sidebar-test" element={<SidebarTest />} />
//             <Route
//               path="/onboarding/*"
//               element={
//                 <ProtectedRoute>
//                   <Onboarding />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute requireOnboarding>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/create-campaign"
//               element={
//                 <ProtectedRoute requireOnboarding>
//                   <CreateCampaign />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/create-blast"
//               element={
//                 <ProtectedRoute requireOnboarding>
//                   <CreateBlast />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/history"
//               element={
//                 <ProtectedRoute requireOnboarding>
//                   <History />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/settings"
//               element={
//                 <ProtectedRoute requireOnboarding>
//                   <Settings />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/profile"
//               element={
//                 <ProtectedRoute requireOnboarding>
//                   <Profile />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/" element={<Navigate to="/login" replace />} />
//           </Routes>
        
//           <Toaster position="top-right" />
//     {/* // </ErrorBoundary> */}
//     </>
//   )
// }

// export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/Dashboard'
import CreateCampaign from './pages/CreateCampaign'
import CampaignStep1 from './pages/campaign/CampaignStep1'
import CampaignStep2 from './pages/campaign/CampaignStep2'
import CampaignStep3 from './pages/campaign/CampaignStep3'
import CampaignStep4 from './pages/campaign/CampaignStep4'
import CampaignStep5 from './pages/campaign/CampaignStep5'
import CampaignEdit from './pages/CampaignEdit'
import CampaignDetails from './pages/CampaignDetails'
import BlastStep1 from './pages/blast/BlastStep1'
import BlastStep2 from './pages/blast/BlastStep2'
import BlastStep3 from './pages/blast/BlastStep3'
import BlastStep4 from './pages/blast/BlastStep4'
import BlastStep5 from './pages/blast/BlastStep5'
import CreateBlast from './pages/CreateBlast'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import SidebarTest from './components/layout/SidebarTest'
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sidebar-test" element={<SidebarTest />} />
        <Route
          path="/onboarding/*"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-campaign"
          element={
            <ProtectedRoute>
              <CampaignStep1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/step1"
          element={
            <ProtectedRoute>
              <CampaignStep1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/step2"
          element={
            <ProtectedRoute>
              <CampaignStep2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/step3"
          element={
            <ProtectedRoute>
              <CampaignStep3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/step4"
          element={
            <ProtectedRoute>
              <CampaignStep4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/step5"
          element={
            <ProtectedRoute>
              <CampaignStep5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/edit"
          element={
            <ProtectedRoute>
              <CampaignEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/details"
          element={
            <ProtectedRoute>
              <CampaignDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blast/step1"
          element={
            <ProtectedRoute>
              <BlastStep1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blast/step2"
          element={
            <ProtectedRoute>
              <BlastStep2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blast/step3"
          element={
            <ProtectedRoute>
              <BlastStep3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blast/step4"
          element={
            <ProtectedRoute>
              <BlastStep4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blast/step5"
          element={
            <ProtectedRoute>
              <BlastStep5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-blast"
          element={
            <ProtectedRoute>
              <CreateBlast />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App
