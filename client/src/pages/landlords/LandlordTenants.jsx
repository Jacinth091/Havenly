import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  User,
  UserX,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../components/dashboard/Badge";

// SCHEMA MAPPING: 'tenants' table
// Columns: tenant_id, first_name, last_name, contact_num, is_active, created_at
const MOCK_TENANTS = [
  {
    id: 1,
    first_name: "Alice",
    last_name: "Smith",
    contact_num: "0917-111-2222",
    email: "alice@gmail.com", // Linked via user_id -> users table
    current_lease: "Lease #101",
    room: "101",
    is_active: true,
    created_at: "2024-01-15",
  },
  {
    id: 2,
    first_name: "Bob",
    last_name: "Jones",
    contact_num: "0918-333-4444",
    email: "bob@gmail.com",
    current_lease: "Lease #102",
    room: "102",
    is_active: true,
    created_at: "2024-06-20",
  },
  {
    id: 3,
    first_name: "Charlie",
    last_name: "Day",
    contact_num: "0919-555-6666",
    email: "charlie@gmail.com",
    current_lease: null,
    room: null,
    is_active: false, // Inactive/Previous Tenant
    created_at: "2023-11-05",
  },
  {
    id: 4,
    first_name: "Diana",
    last_name: "Prince",
    contact_num: "0920-777-8888",
    email: "diana@gmail.com",
    current_lease: "Lease #105",
    room: "205",
    is_active: true,
    created_at: "2024-08-01",
  },
  {
    id: 5,
    first_name: "Evan",
    last_name: "Wright",
    contact_num: "0921-999-0000",
    email: "evan@gmail.com",
    current_lease: "Lease #106",
    room: "206",
    is_active: true,
    created_at: "2024-09-12",
  },
];

const ITEMS_PER_PAGE = 4;

const LandlordTenants = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Search Filter
  const filteredTenants = MOCK_TENANTS.filter(
    (tenant) =>
      `${tenant.first_name} ${tenant.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || tenant.room?.includes(searchTerm)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredTenants.slice(
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

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Tenant Directory
          </h2>
          <p className="text-sm text-slate-600">
            Manage tenant profiles and status.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm transition-all">
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      {/* Controls: Search & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search name or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors">
            <Filter size={14} /> Active Only
          </button>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
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
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <UserX size={32} className="mx-auto mb-2 opacity-50" />
          No tenants found.
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tenant Profile</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Current Lease</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                          {tenant.first_name.charAt(0)}
                          {tenant.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {tenant.first_name} {tenant.last_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Since{" "}
                            {new Date(tenant.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Phone size={12} className="text-slate-400" />{" "}
                          {tenant.contact_num}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Mail size={12} className="text-slate-400" />{" "}
                          {tenant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={tenant.is_active ? "green" : "slate"}>
                        {tenant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.is_active && tenant.room ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-700 font-medium text-xs">
                            Unit {tenant.room}
                          </span>
                          <span className="text-slate-400 text-[10px] uppercase">
                            {tenant.current_lease}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          No active lease
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </button>
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
          {currentData.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all group relative"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                    {tenant.first_name.charAt(0)}
                    {tenant.last_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {tenant.first_name} {tenant.last_name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        tenant.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tenant.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                  <Phone size={14} className="text-slate-400" />{" "}
                  {tenant.contact_num}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                  <Mail size={14} className="text-slate-400" /> {tenant.email}
                </div>
              </div>

              {/* Footer: Lease Info */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                {tenant.is_active ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <User size={12} /> Unit {tenant.room}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    No Unit Assigned
                  </span>
                )}
                <span className="text-[10px] text-slate-400">
                  ID: #{tenant.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
        <span className="text-sm text-slate-500 text-center sm:text-left">
          Showing{" "}
          <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="font-medium text-slate-900">
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredTenants.length)}
          </span>{" "}
          of {filteredTenants.length} tenants
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

export default LandlordTenants;
