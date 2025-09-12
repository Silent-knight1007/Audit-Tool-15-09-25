import React, { useState, useEffect, useRef } from 'react';

const ProfileDropdown = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    console.log("ProfileDropdown user:", user);
  }, [user]);

  const initials = user.name
    ? user.name.split(' ').map(namePart => namePart[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-400 text-white font-bold"
        title={user.name}
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        {initials}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded shadow-lg z-50 border p-3">
          <div className="p-2 border-b font-semibold">
            {user.name} ({user.role})
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
              onLogout();
            }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
