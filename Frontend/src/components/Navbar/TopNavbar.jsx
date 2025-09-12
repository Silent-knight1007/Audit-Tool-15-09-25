import React, { useState, useRef, useEffect, useContext } from 'react';
import CompanyLogo from '../../assets/CompanyLogo.png';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';
import AuthContext from '../../Context/AuthContext';

export default function TopNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    console.log("TopNavbar user:", user);
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out!", {
      position: "top-center",
      autoClose: 2000,
    });
    setMenuOpen(false);
    setTimeout(() => {
      navigate('/home');
    }, 2100);
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  // Generate initials if no avatar (use user from context directly)
  const initials = user?.name
  ? user.name.split(' ').map(namePart => namePart[0]).join('').toUpperCase()
  : 'U';


  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow flex items-center justify-between px-6 z-50">
      <button
        className="mr-4"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <img
        src={CompanyLogo}
        alt="Company Logo"
        className="h-8 cursor-pointer"
        onClick={() => navigate('/home')}
      />

      <div className="relative flex items-center" ref={menuRef}>
        {!isAuthenticated ? (
          <button
            onClick={handleSignIn}
            className="text-orange-700 font-semibold hover:underline"
          >
            Sign In
          </button>
        ) : (
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center focus:outline-none mr-3 rounded-full bg-orange-400 text-white font-bold"
              style={{ width: 40, height: 40 }}
              aria-label="User menu"
              title={user?.name || "User"}
            >
              {initials || <FaUserCircle size={32} />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded shadow-lg z-50 border p-3">
                <div className="p-2 border-b font-semibold select-none">
                  {user ? `${user.name} (${user.role})` : 'Guest'}
                </div>

                <button
                  className="block w-full text-left p-2 hover:bg-orange-100 rounded mt-2"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile/reset-password');
                  }}
                >
                  Reset Password
                </button>

                <button
                  className="block w-full text-left p-2 text-red-700 hover:bg-orange-50 rounded mt-1"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}







// import React, { useState, useRef, useEffect, useContext } from 'react';
// import CompanyLogo from '../../assets/CompanyLogo.png';
// import { useNavigate } from "react-router-dom";
// import { toast } from 'react-toastify';
// import { FaUserCircle } from 'react-icons/fa'; // Profile icon
// import AuthContext from '../../Context/AuthContext';

// export default function TopNavbar({ onMenuClick }) {
//   const navigate = useNavigate();
//   const { isAuthenticated, logout } = useContext(AuthContext);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     toast.info("You have been logged out!", {
//       position: "top-center",
//       autoClose: 2000,
//     });
//     setMenuOpen(false);
//     // Navigate to home after short delay to let toast show
//     setTimeout(() => {
//       navigate('/home');
//     }, 2100);
//   };

//   const handleSignIn = () => {
//     navigate('/login');
//   };

//   return (
//     <header className="fixed top-0 left-0 w-full h-16 bg-white shadow flex items-center justify-between px-6 z-50">
//       {/* Hamburger Icon - ALWAYS visible */}
//       <button
//         className="mr-4"
//         onClick={onMenuClick}
//         aria-label="Open sidebar"
//       >
//         <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//         </svg>
//       </button>

//       {/* Company Logo (clickable to Home) */}
//       <img
//         src={CompanyLogo}
//         alt="Company Logo"
//         className="h-8 cursor-pointer"
//         onClick={() => navigate('/home')}
//       />

//       {/* Profile Section */}
//       <div className="relative" ref={menuRef}>
//         {!isAuthenticated ? (
//           <button
//             onClick={handleSignIn}
//             className="text-orange-700 font-semibold hover:underline"
//           >
//             Sign In
//           </button>
//         ) : (
//           <>
//             <button
//               onClick={() => setMenuOpen(!menuOpen)}
//               className="ml-4 flex items-center focus:outline-none"
//               aria-label="User menu"
//             >
//               <FaUserCircle className="text-3xl text-orange-700" />
//             </button>
//             {menuOpen && (
//               <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-lg z-50 border">
//                 <button
//                   className="block w-full text-left px-4 py-2 text-red-700 hover:bg-orange-50"
//                   onClick={() => {
//                   setMenuOpen(false);
//                   navigate('/profile/reset-password');}}>
//                   Reset Password
//                 </button>
//                 <button
//                   className="block w-full text-left px-4 py-2 text-red-700 hover:bg-orange-50"
//                   onClick={handleLogout}>
//                   Sign Out
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </header>
//   );
// }
