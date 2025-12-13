import {
  ArrowLeft,
  LayoutGrid,
  Loader2,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTenantsByProperty } from "../../api/tenant.api";
import TenantGridView from "../../components/dashboard/tenants/TenantCard";
import TenantListView from "../../components/dashboard/tenants/TenantList";
import CreateLeaseModal from "../../components/modal/CreateLeaseModal";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/Search";
import {
  StatusControlTab,
  ViewToggles,
} from "../../components/ui/StatusControlTab";

// --- HOOKS ---
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

  // Data State
  const [propertyInfo, setPropertyInfo] = useState({
    name: "",
    address: "",
    city: "",
    total_units: 0, // Optional, if your API provides it
  });

  const [tenants, setTenants] = useState([]);
  const [summary, setSummary] = useState({
    All: 0,
    Active: 0,
    Expired: 0,
    Terminated: 0,
    Archived: 0,
  });

  // UI State
  const [viewMode, setViewMode] = useState("card");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalItems, setTotalItems] = useState(0);

  // --- FETCH DATA ---
  const fetchTenantsData = async () => {
    setLoading(true);
    try {
      const result = await getTenantsByProperty(propertyId, {
        current_page: currentPage,
        limit: limit,
        search: debouncedSearch,
        statusTab: filter,
      });

      if (result.success) {
        setTenants(result.tenants || []);
        if (result.property) {
          setPropertyInfo({
            name: result.property.property_name || "",
            address: result.property.address || "",
            city: result.property.city || "",
            total_units:
              result.property.total_units || result.tenants?.length || 0,
          });
        }

        // 4. Set Summary & Pagination
        if (result.summary) setSummary(result.summary);
        if (result.pagination) setTotalItems(result.pagination.total_items);
      } else {
        setTenants([]);
        setTotalItems(0);
        console.warn("API Error:", result.message);
      }
    } catch (error) {
      console.error("Network/System Error:", error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
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
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-start gap-4 w-full sm:w-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/landlord/properties")}
            className="group mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>

          {/* Title & Metadata Section */}
          <div>
            {/* Row 1: Property Name (Context) */}
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              {propertyInfo.name ? (
                propertyInfo.name
              ) : (
                <span className="h-8 w-48 bg-slate-200 rounded animate-pulse inline-block" />
              )}
              <span className="text-slate-300 font-light mx-1">/</span>
              <span className="text-slate-500 font-medium">Tenants</span>
            </h1>

            {/* Row 2: Metadata (Address & Units) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500 font-medium">
              {/* Address & City */}
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                {propertyInfo.address ? (
                  <span>
                    {propertyInfo.address}
                    {propertyInfo.city && `, ${propertyInfo.city}`}
                  </span>
                ) : (
                  <span className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                )}
              </div>

              {/* Dot Separator (Visible on larger screens) */}
              <span className="hidden sm:inline text-slate-300">•</span>

              {/* Unit Count (Optional) */}
              <div className="flex items-center gap-1.5">
                <LayoutGrid size={14} className="text-slate-400" />
                {propertyInfo.name ? (
                  <span>
                    {propertyInfo.total_units > 0
                      ? `${propertyInfo.total_units} Active Leases`
                      : "No active leases"}
                  </span>
                ) : (
                  <span className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
          {/* <button className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
            <Download size={18} /> Export
          </button> */}
          <button
            onClick={() => setIsCreateLeaseOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md active:transform active:scale-95 flex-1 sm:flex-none"
          >
            <Plus size={18} /> Add Tenant
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tenant or unit..."
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
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-500 text-sm font-medium">
            Loading tenant list...
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
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <Users size={24} className="opacity-50" />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                No tenants found
              </h3>
              <p className="text-sm mt-1">
                There are no tenants matching your current filters.
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

      {/* Create Modal */}
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
