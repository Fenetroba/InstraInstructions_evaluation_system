import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Loader2, LoaderPinwheel } from "lucide-react";
import { fetchAllUsers } from "../../../Store/UsersDataSlice";
import FetchSingleGroupUser from "./FetchSingleGroupUser";
import { useNavigate } from "react-router-dom";
import DeleteUser from "./DeleteUser";

const FetchUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, isLoading, error } = useSelector((state) => state.usersData);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Toggle row expansion
  const toggleRow = (userId) => {
    setExpandedRow(expandedRow === userId ? null : userId);
  };

  // Get unique groups and roles from users
  const groups = useMemo(() => {
    if (!users) return [];
    return [...new Set(users.map((user) => user.groupId).filter(Boolean))];
  }, [users]);

  const allRoles = useMemo(() => {
    if (!users) return [];
    return [...new Set(users.map((user) => user.role).filter(Boolean))];
  }, [users]);

  // Filter users based on search term and role
  useEffect(() => {
    if (users) {
      let result = [...users];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (user) =>
            user.fullName?.toLowerCase().includes(term) ||
            user.username?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
      }

      if (selectedRole !== "all") {
        result = result.filter((user) => user.role === selectedRole);
      }

      setFilteredUsers(result);
    }
  }, [users, searchTerm, selectedRole]);

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroup(groupId);
    setShowAllUsers(groupId === "");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
  };

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
    // Add your edit logic here
  };

  const handleDeleteUser = (userId) => {
    console.log("Delete user:", userId);
    // Add your delete logic here
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
      
        <LoaderPinwheel className="h-18 w-18 animate-spin shadow-lg rounded-full shadow-green-200" />
   
      </div>
    );
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">
          {showAllUsers ? "All Users" : `Group ${selectedGroup} Users`}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={selectedRole}
          onChange={handleRoleChange}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
        >
          <option value="all">All Roles</option>
          {allRoles.map((role) => (
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
            onChange={handleSearch}
          />
          {(searchTerm || selectedRole !== "all") && (
            <button
              onClick={clearFilters}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {showAllUsers ? (
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border-b text-left">Name</th>
                  <th className="py-3 px-4 border-b text-left">Username</th>
                  <th className="py-3 px-4 border-b text-left">Role</th>
                  <th className="py-3 px-4 border-b text-left">Email</th>
                  <th className="py-3 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(
                  (user) =>
                    user.role !== "department_head" && (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 border-b">
                          {user.fullName || "N/A"}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {user.username || "N/A"}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "instructor"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          {user.email || "N/A"}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleRow(user._id)}
                              className="text-gray-500 hover:text-blue-500 transition-colors p-1"
                            >
                              <Plus
                                className={`h-5 w-5 transition-transform duration-200 ${
                                  expandedRow === user._id ? "rotate-45" : ""
                                }`}
                              />
                            </button>
                            {expandedRow === user._id && (
                              <div className="flex gap-2 ml-2">
                                <button
                                  onClick={() =>
                                    navigate(`/users/edit/${user._id}`)
                                  }
                                  className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                  title="Edit user"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <DeleteUser
                                  userId={user._id}
                                  onDelete={async (userId) => {
                                    // Call your delete API here
                                    await deleteUserFromAPI(userId);
                                    // Optionally refresh the user list
                                    dispatch(fetchAllUsers());
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <FetchSingleGroupUser
          groupId={selectedGroup}
          groupName={`Group ${selectedGroup}`}
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
};

export default FetchUser;
