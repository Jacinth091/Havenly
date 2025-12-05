import {
  Archive,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'users' table
// Columns: user_id, username, email, role, is_active, created_at
const MOCK_USERS = [
  {
    id: 1,
    username: "admin_main",
    email: "admin@havenly.com",
    role: "Admin",
    is_active: true,
    created_at: "2025-01-01",
  },
  {
    id: 2,
    username: "landlord_j",
    email: "john@landlord.com",
    role: "Landlord",
    is_active: true,
    created_at: "2025-01-15",
  },
  {
    id: 3,
    username: "tenant_alice",
    email: "alice@gmail.com",
    role: "Tenant",
    is_active: false, // Inactive user
    created_at: "2025-02-10",
  },
  {
    id: 4,
    username: "landlord_m",
    email: "maria@landlord.com",
    role: "Landlord",
    is_active: true,
    created_at: "2025-02-12",
  },
  {
    id: 5,
    username: "tenant_bob",
    email: "bob@gmail.com",
    role: "Tenant",
    is_active: true,
    created_at: "2025-03-01",
  },
  {
    id: 6,
    username: "tenant_charlie",
    email: "charlie@gmail.com",
    role: "Tenant",
    is_active: true,
    created_at: "2025-03-05",
  },
];

const ITEMS_PER_PAGE = 5;

const AdminUsers = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Filter Logic
  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Helper: Role Color
  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "purple";
      case "Landlord":
        return "blue";
      case "Tenant":
        return "slate";
      default:
        return "gray";
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-600">
            Administer accounts, roles, and access.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm transition-all">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full xl:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto justify-end">
          {/* Role Filter */}
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 cursor-pointer min-w-[140px]"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Landlord">Landlord</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <User size={32} className="mx-auto mb-2 opacity-50" />
          No users found matching your criteria.
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User Profile</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {user.username}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.created_at}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={user.is_active ? "green" : "red"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Deactivate (Archive)"
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentData.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="p-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <User size={32} />
                </div>
                <h3 className="font-bold text-slate-800">{user.username}</h3>
                <p className="text-xs text-slate-500 mb-3">{user.email}</p>

                <div className="flex gap-2 mb-4">
                  <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
                  <Badge color={user.is_active ? "green" : "red"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="text-[10px] text-slate-400 mb-4">
                  Joined: {user.created_at}
                </p>

                <div className="w-full flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded flex items-center justify-center gap-1">
                    <Edit size={12} /> Edit
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded flex items-center justify-center gap-1">
                    <Ban size={12} /> Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
        <span className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="font-medium text-slate-900">
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}
          </span>{" "}
          of {filteredUsers.length} users
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
