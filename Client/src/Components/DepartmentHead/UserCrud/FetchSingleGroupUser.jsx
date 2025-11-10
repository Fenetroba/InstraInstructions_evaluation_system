import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../../Store/UsersDataSlice';

const FetchSingleGroupUser = ({ groupId, groupName }) => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.usersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Get all unique roles from users
  const allRoles = useMemo(() => {
    if (!users) return [];
    const roles = new Set(users.map(user => user.role).filter(Boolean));
    return [...roles];
  }, [users]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users && groupId) {
      let result = users.filter(user => user.groupId === groupId);
      
      // Apply role filter
      if (selectedRole !== 'all') {
        result = result.filter(user => user.role === selectedRole);
      }
      
      // Apply search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(user => 
          user.fullName?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
        );
      }
      
      setFilteredUsers(result);
    }
  }, [users, groupId, searchTerm, selectedRole]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  if (isLoading) return <div className="p-4">Loading group users...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">{groupName || 'Group'} Users</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="all">All Roles</option>
            {allRoles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => handleSearch('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {searchTerm || selectedRole !== 'all' 
            ? 'No users match the selected filters.' 
            : 'No users found in this group.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">User ID</th>
                <th className="py-3 px-4 border-b text-left">Role</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 border-b">{user.fullName || 'N/A'}</td>
                  <td className="py-3 px-4 border-b">{user.username || 'N/A'}</td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'instructor' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">{user.email || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FetchSingleGroupUser;