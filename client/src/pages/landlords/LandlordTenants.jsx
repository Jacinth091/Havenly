import { Loader2, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getLandlordTenants } from "../../api/tenant.api";
import TenantGridView from "../../components/dashboard/tenants/TenantCard";
import TenantListView from "../../components/dashboard/tenants/TenantList";
import CreateTenantModal from "../../components/modal/CreateTenantModal";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/Search";
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

const LandlordTenants = () => {
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

  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // --- FETCH LOGIC ---
  const fetchTenantsData = async () => {
    setLoading(true);
    try {
      // Ensure getLandlordTenants matches your API signature
      const result = await getLandlordTenants({
        current_page: currentPage,
        limit: limit,
        search: debouncedSearch,
        statusTab: filter,
      });

      if (result.success) {
        setTenants(result.tenants || []);
        setTotalItems(result.pagination.total_items);
        if (result.summary) setSummary(result.summary);
      } else {
        setTenants([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch tenants", error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsData();
  }, [currentPage, limit, filter, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

  const tenantTabs = [
    { id: "All", label: "All Tenants", count: summary.All },
    {
      id: "Active",
      label: "Active",
      count: summary.Active,
      color: "emerald",
    },
    {
      id: "Expired",
      label: "Expired",
      count: summary.Expired,
      color: "amber",
    },
    {
      id: "Terminated",
      label: "Terminated",
      count: summary.Terminated,
      color: "red",
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
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Tenant Directory
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage tenant profiles, lease status, and contact info.
          </p>
        </div>
        <button
          onClick={() => setIsAddTenantOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
        >
          <Plus size={18} /> Add Tenant
        </button>
      </div>

      {/* --- CONTROLS TOOLBAR --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
        {/* ROW 1: Search and View Toggles */}
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tenant, unit, or email..."
          />
          <ViewToggles mode={viewMode} setMode={setViewMode} />
        </div>

        {/* ROW 2: Status Tabs */}
        <div className="w-full overflow-x-auto no-scrollbar pt-1">
          <StatusControlTab
            tabs={tenantTabs}
            current={filter}
            onChange={setFilter}
            summary={summary}
            total={summary["All"] || 0}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-500 text-sm font-medium">
            Loading tenants...
          </p>
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
            /* Standardized Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <Users size={24} className="opacity-50" />
              </div>
              <p className="text-base font-medium text-slate-600">
                No tenants found
              </p>
              <p className="text-sm">
                Adjust your filters or add a new tenant.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="pt-2">
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
