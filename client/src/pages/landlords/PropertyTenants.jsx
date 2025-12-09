import { ArrowLeft, Plus, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTenantsByProperty } from "../../api/tenant.api";
import TenantGridView from "../../components/dashboard/tenants/TenantCard";
import TenantListView from "../../components/dashboard/tenants/TenantList";
import CreateLeaseModal from "../../components/modal/CreateLeaseModal";
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

const PropertyTenants = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);
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
  const [limit, setLimit] = useState(9);
  const [totalItems, setTotalItems] = useState(0);

  // --- FETCH LOGIC ---
  const fetchTenantsData = async () => {
    setLoading(true);
    const result = await getTenantsByProperty(propertyId, {
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
    if (propertyId) fetchTenantsData();
  }, [propertyId, currentPage, limit, filter, debouncedSearch]);
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
      {/* Header & Controls (Simplified for brevity) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/landlord/properties")}
            className="group p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tenants</h1>
            <p className="text-sm text-slate-500 font-medium">
              Property #{propertyId}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateLeaseOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2"
          >
            <Plus size={18} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
        {/* ROW 1: Search and View Toggles */}
        <div className="flex items-center justify-between gap-3">
          {/* Search Bar (Grows to fill space) */}
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

          {/* View Toggles (Fixed on the right) */}
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        {/* ROW 2: Status Tabs (Full width) */}
        <div className="w-full overflow-x-auto no-scrollbar ">
          <StatusControlTab
            tabs={tenantTabs}
            current={filter}
            onChange={setFilter}
            summary={summary}
            total={summary["All"] || 0}
          />
        </div>
      </div>

      {/* --- CONTENT RENDER LOGIC --- */}
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

      <CreateLeaseModal
        isOpen={isCreateLeaseOpen}
        onClose={() => setIsCreateLeaseOpen(false)}
        onSuccess={fetchTenantsData}
        preSelectedPropertyId={propertyId}
      />
    </div>
  );
};

export default PropertyTenants;
