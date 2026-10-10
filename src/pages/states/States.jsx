import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    Power,
    Loader2,
    MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import stateService from "../../services/state.service";
import countryService from "../../services/country.service";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function States() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [countryFilter, setCountryFilter] = useState("");
    const [deleteState, setDeleteState] = useState(null);
    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        data: stateResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: [
            "states",
            {
                search,
                status: statusFilter,
                countryId: countryFilter,
            },
        ],
        queryFn: () =>
            stateService.getStates({
                search: search.trim() || undefined,
                status:
                    statusFilter === "all"
                        ? undefined
                        : statusFilter,
                countryId: countryFilter || undefined,
            }),
    });

    const { data: countryResponse } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });

    const states = stateResponse?.states || [];

    const countries = countryResponse?.countries || [];

    /*
     * Current backend returns all states without pagination.
     * So pagination is handled on the frontend.
     */
    const filteredStates = useMemo(() => {
        let result = [...states];

        const searchValue = search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((state) => {
                return (
                    state.name?.toLowerCase().includes(searchValue) ||
                    state.slug?.toLowerCase().includes(searchValue) ||
                    state.countryId?.name
                        ?.toLowerCase()
                        .includes(searchValue)
                );
            });
        }

        if (statusFilter !== "all") {
            result = result.filter((state) =>
                statusFilter === "active"
                    ? state.isActive
                    : !state.isActive
            );
        }

        if (countryFilter) {
            result = result.filter((state) => {
                const stateCountryId =
                    state.countryId?._id || state.countryId;

                return stateCountryId === countryFilter;
            });
        }

        return result;
    }, [states, search, statusFilter, countryFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStates.length / limit)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedStates = filteredStates.slice(
        (currentPage - 1) * limit,
        currentPage * limit
    );

    const deleteMutation = useMutation({
        mutationFn: (id) => stateService.deleteState(id),

        onSuccess: (response) => {
            toast.success(
                response?.message || "State deleted successfully"
            );

            setDeleteState(null);

            queryClient.invalidateQueries({
                queryKey: ["states"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete state"
            );
        },
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => stateService.toggleStateStatus(id),

        onSuccess: (response) => {
            toast.success(
                response?.message || "State status updated successfully"
            );

            queryClient.invalidateQueries({
                queryKey: ["states"],
            });
        },

        onError: (error) => {
            console.error("Toggle state error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update state status"
            );
        },
    });

    const handleToggleStatus = (state) => {
        if (!state?._id) {
            toast.error("Invalid state");
            return;
        }

        toggleMutation.mutate(state._id);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleCountryChange = (value) => {
        setCountryFilter(value);
        setPage(1);
    };

    const getCountryName = (state) => {
        if (state.countryId?.name) {
            return state.countryId.name;
        }

        const country = countries.find(
            (item) =>
                item._id ===
                (state.countryId?._id || state.countryId)
        );

        return country?.name || "-";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <MapPin
                            size={22}
                            className="text-blue-600"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            States
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage states and their countries.
                    </p>
                </div>

                <Link
                    to="/admin/locations/states/add"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <Plus size={17} />
                    Add State
                </Link>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                            placeholder="Search states..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    {/* Country */}
                    <select
                        value={countryFilter}
                        onChange={(e) =>
                            handleCountryChange(e.target.value)
                        }
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="">All Countries</option>

                        {countries.map((country) => (
                            <option
                                key={country._id}
                                value={country._id}
                            >
                                {country.name}
                            </option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            handleStatusChange(e.target.value)
                        }
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    #
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    State
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Country
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Slug
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <Loader2
                                            size={24}
                                            className="mx-auto animate-spin text-blue-600"
                                        />

                                        <p className="mt-2 text-sm text-slate-500">
                                            Loading states...
                                        </p>
                                    </td>
                                </tr>
                            ) : paginatedStates.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <MapPin
                                            size={30}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-2 text-sm font-medium text-slate-600">
                                            No states found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try changing your search or filters.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedStates.map((state, index) => (
                                    <tr
                                        key={state._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {(currentPage - 1) * limit +
                                                index +
                                                1}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {state.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {state._id}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {getCountryName(state)}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {state.slug}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={state.isActive}
                                                onClick={() => handleToggleStatus(state)}
                                                disabled={toggleMutation.isPending}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${state.isActive
                                                    ? "bg-green-500"
                                                    : "bg-slate-300"
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${state.isActive
                                                        ? "translate-x-5"
                                                        : "translate-x-0.5"
                                                        }`}
                                                />
                                            </button>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    to={`/admin/locations/states/${state._id}/edit`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </Link>

                                                {/* <button
                          type="button"
                          onClick={() =>
                            toggleMutation.mutate(state._id)
                          }
                          disabled={toggleMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                          title={
                            state.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <Power size={16} />
                        </button> */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteState(state)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-blue-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!isLoading && filteredStates.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-medium text-slate-700">
                                {(currentPage - 1) * limit + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-slate-700">
                                {Math.min(
                                    currentPage * limit,
                                    filteredStates.length
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-slate-700">
                                {filteredStates.length}
                            </span>{" "}
                            states
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setPage((prev) => prev - 1)
                                }
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white">
                                {currentPage}
                            </span>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setPage((prev) => prev + 1)
                                }
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <ConfirmModal
                open={Boolean(deleteState)}
                title="Delete State"
                description={
                    deleteState
                        ? `Are you sure you want to delete "${deleteState.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete State"
                loading={deleteMutation.isPending}
                onCancel={() => {
                    if (!deleteMutation.isPending) {
                        setDeleteState(null);
                    }
                }}
                onConfirm={() => {
                    if (deleteState?._id) {
                        deleteMutation.mutate(deleteState._id);
                    }
                }}
            />
        </div>
    );
}