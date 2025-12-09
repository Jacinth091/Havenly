import { Plus, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { getLandlordTenants } from "../../api/tenant.api";
import TenantGridView from "../../components/dashboard/tenants/TenantCard";
import TenantListView from "../../components/dashboard/tenants/TenantList";
import CreateTenantModal from "../../components/modal/CreateTenantModal";
import Pagination from "../../components/ui/Pagination";
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";
// Hooks
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Mock API function - replace with actual API call in production
const getAllTenants = async ({ current_page, limit, search, statusTab }) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock data - replace with actual API response
  const MOCK_TENANTS = [
    {
      id: 1,
      first_name: "Alice",
      last_name: "Smith",
      email: "alice@gmail.com",
      current_lease: "Lease #101",
      room: "101",
      is_active: true,
      created_at: "2024-01-15",
      status: "Active",
    },
    {
      id: 2,
      first_name: "Bob",
      last_name: "Jones",
      email: "bob@gmail.com",
      current_lease: "Lease #102",
      room: "102",
      is_active: true,
      created_at: "2024-06-20",
      status: "Active",
    },
    {
      id: 3,
      first_name: "Charlie",
      last_name: "Day",
      email: "charlie@gmail.com",
      current_lease: null,
      room: null,
      is_active: false,
      created_at: "2023-11-05",
      status: "Inactive",
    },
    {
      id: 4,
      first_name: "Diana",
      last_name: "Prince",
      email: "diana@gmail.com",
      current_lease: "Lease #105",
      room: "205",
      is_active: true,
      created_at: "2024-08-01",
      status: "Active",
    },
    {
      id: 5,
      first_name: "Evan",
      last_name: "Wright",
      email: "evan@gmail.com",
      current_lease: "Lease #106",
      room: "206",
      is_active: true,
      created_at: "2024-09-12",
      status: "Active",
    },
    {
      id: 6,
      first_name: "Fiona",
      last_name: "Gale",
      email: "fiona@gmail.com",
      current_lease: "Lease #107",
      room: "207",
      is_active: true,
      created_at: "2024-09-12",
      status: "Active",
    },
    {
      id: 7,
      first_name: "George",
      last_name: "Henry",
      email: "george@gmail.com",
      current_lease: null,
      room: null,
      is_active: false,
      created_at: "2024-09-12",
      status: "Terminated",
    },
    {
      id: 8,
      first_name: "Ivy",
      last_name: "King",
      email: "ivy@gmail.com",
      current_lease: "Lease #109",
      room: "301",
      is_active: true,
      created_at: "2024-09-12",
      status: "Active",
    },
    {
      id: 9,
      first_name: "John",
      last_name: "Doe",
      email: "john@gmail.com",
      current_lease: "Lease #110",
      room: "302",
      is_active: false,
      created_at: "2023-12-01",
      status: "Expired",
    },
    {
      id: 10,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@gmail.com",
      current_lease: null,
      room: null,
      is_active: false,
      created_at: "2023-10-15",
      status: "Archived",
    },
  ];

  // Filter logic
  let filtered = [...MOCK_TENANTS];

  // Status filter
  if (statusTab && statusTab !== "All") {
    filtered = filtered.filter((tenant) => tenant.status === statusTab);
  }

  // Search filter
  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter(
      (tenant) =>
        `${tenant.first_name} ${tenant.last_name}`
          .toLowerCase()
          .includes(lowerSearch) ||
        tenant.room?.toLowerCase().includes(lowerSearch) ||
        tenant.email?.toLowerCase().includes(lowerSearch)
    );
  }

  // Calculate summary counts
  const summary = {
    All: MOCK_TENANTS.length,
    Active: MOCK_TENANTS.filter((t) => t.status === "Active").length,
    Inactive: MOCK_TENANTS.filter((t) => t.status === "Inactive").length,
    Expired: MOCK_TENANTS.filter((t) => t.status === "Expired").length,
    Terminated: MOCK_TENANTS.filter((t) => t.status === "Terminated").length,
    Archived: MOCK_TENANTS.filter((t) => t.status === "Archived").length,
  };

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (current_page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    tenants: paginatedData,
    pagination: {
      current_page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
    },
    summary,
  };
};

const LandlordTenants = () => {
  // --- STATE ---
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  const [summary, setSummary] = useState({
    All: 0,
    Active: 0,
    Expired: 0,
    Terminated: 0,
    Archived: 0,
  });

  // Filter & Search
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // --- FETCH LOGIC ---
  const fetchTenantsData = async () => {
    setLoading(true);
    const result = await getLandlordTenants({
      current_page: currentPage,
      limit: limit,
      search: debouncedSearch,
      statusTab: filter,
    });

    if (result.success) {
      setTenants(result.tenants);
      setTotalItems(result.pagination.total_items);
      if (result.summary) setSummary(result.summary);
    } else {
      setTenants([]);
      setTotalItems(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTenantsData();
  }, [currentPage, limit, filter, debouncedSearch]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

  const tenantTabs = [
    { id: "All", label: "All Tenants", count: summary.All },
    { id: "Active", label: "Active", count: summary.Active, color: "emerald" },
    { id: "Expired", label: "Expired", count: summary.Expired, color: "amber" },
    {
      id: "Terminated",
      label: "Terminated",
      count: summary.Terminated,
      color: "rose",
    },
    {
      id: "Archived",
      label: "Archived",
      count: summary.Archived,
      color: "slate",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tenant Directory
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage tenant profiles and status across all properties
          </p>
        </div>
        <button
          onClick={() => setIsAddTenantOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-sm transition-all"
        >
          <Plus size={18} /> Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
        {/* ROW 1: Search and View Toggles */}
        <div className="flex items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search unit or tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* View Toggles */}
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        {/* ROW 2: Status Tabs (Full width) */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <StatusControlTab
            tabs={tenantTabs}
            current={filter}
            onChange={setFilter}
            summary={summary}
            total={summary["All"] || 0}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading tenants...</p>
        </div>
      ) : (
        <>
          {tenants.length > 0 ? (
            <div className="min-h-[300px]">
              {viewMode === "card" ? (
                <TenantGridView tenants={tenants} />
              ) : (
                <TenantListView tenants={tenants} />
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="mx-auto h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                <User size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No tenants found
              </h3>
              <p className="text-slate-500 text-sm">
                Adjust your filters or add a new tenant.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-6 pt-2">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                limit={limit}
                onPageChange={setCurrentPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onSuccess={() => {
          fetchTenantsData();
        }}
        preSelectedRoom={null}
      />
    </div>
  );
};

export default LandlordTenants;
