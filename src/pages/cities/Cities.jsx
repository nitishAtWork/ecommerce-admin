import { useMemo, useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    Edit,
    Plus,
    Search,
    Trash2,
    MapPin,
    Loader2,
    Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import cityService from "../../services/city.service";
import countryService from "../../services/country.service";
import stateService from "../../services/state.service";

import ConfirmModal from "../../components/common/ConfirmModal";

export default function Cities() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);

    const [deleteCity, setDeleteCity] = useState(null);

    const limit = 10;

    /* =========================
       Cities
    ========================= */

    const {
        data: cityResponse,
        isLoading,
    } = useQuery({
        queryKey: ["cities"],
        queryFn: () => cityService.getCities(),
    });

    const cities = cityResponse?.cities || [];

    /* =========================
       Countries
    ========================= */

    const {
        data: countryResponse,
    } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });

    const countries = countryResponse?.countries || [];

    /* =========================
       States
    ========================= */

    const {
        data: stateResponse,
    } = useQuery({
        queryKey: ["states"],
        queryFn: () => stateService.getStates(),
    });

    const states = stateResponse?.states || [];

    /* =========================
       Filtering
    ========================= */

    const filteredCities = useMemo(() => {
        let result = [...cities];

        const searchValue =
            search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((city) => {
                return (
                    city.name
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    city.slug
                        ?.toLowerCase()
                        .includes(searchValue)
                );
            });
        }

        if (countryFilter) {
            result = result.filter((city) => {
                const cityCountryId =
                    city.countryId?._id ||
                    city.countryId;

                return cityCountryId === countryFilter;
            });
        }

        if (stateFilter) {
            result = result.filter((city) => {
                const cityStateId =
                    city.stateId?._id ||
                    city.stateId;

                return cityStateId === stateFilter;
            });
        }

        if (statusFilter !== "all") {
            result = result.filter((city) =>
                statusFilter === "active"
                    ? city.isActive
                    : !city.isActive
            );
        }

        return result;
    }, [
        cities,
        search,
        countryFilter,
        stateFilter,
        statusFilter,
    ]);

    /* =========================
       Pagination
    ========================= */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCities.length / limit)
    );

    const currentPage = Math.min(
        page,
        totalPages
    );

    const paginatedCities =
        filteredCities.slice(
            (currentPage - 1) * limit,
            currentPage * limit
        );

    /* =========================
       Country Name
    ========================= */

    const getCountryName = (city) => {
        if (city.countryId?.name) {
            return city.countryId.name;
        }

        const country = countries.find(
            (item) =>
                item._id ===
                (city.countryId?._id ||
                    city.countryId)
        );

        return country?.name || "-";
    };

    /* =========================
       State Name
    ========================= */

    const getStateName = (city) => {
        if (city.stateId?.name) {
            return city.stateId.name;
        }

        const state = states.find(
            (item) =>
                item._id ===
                (city.stateId?._id ||
                    city.stateId)
        );

        return state?.name || "-";
    };

    /* =========================
       Delete
    ========================= */

    const deleteMutation = useMutation({
        mutationFn: (id) =>
            cityService.deleteCity(id),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "City deleted successfully"
            );

            setDeleteCity(null);

            queryClient.invalidateQueries({
                queryKey: ["cities"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete city"
            );
        },
    });

    /* =========================
       Toggle Status
    ========================= */

    const toggleMutation = useMutation({
        mutationFn: (id) =>
            cityService.toggleCityStatus(id),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "City status updated successfully"
            );

            queryClient.invalidateQueries({
                queryKey: ["cities"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update city status"
            );
        },
    });

    const handleToggleStatus = (city) => {
        if (!city?._id) {
            toast.error("Invalid city");
            return;
        }

        toggleMutation.mutate(city._id);
    };

    const handleCountryFilter = (value) => {
        setCountryFilter(value);
        setStateFilter("");
        setPage(1);
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
                            Cities
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage cities and their location hierarchy.
                    </p>
                </div>

                <Link
                    to="/admin/locations/cities/add"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <Plus size={17} />
                    Add City
                </Link>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(
                                    e.target.value
                                );
                                setPage(1);
                            }}
                            placeholder="Search cities..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Country */}
                    <select
                        value={countryFilter}
                        onChange={(e) =>
                            handleCountryFilter(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">
                            All Countries
                        </option>

                        {countries.map(
                            (country) => (
                                <option
                                    key={country._id}
                                    value={country._id}
                                >
                                    {country.name}
                                </option>
                            )
                        )}
                    </select>

                    {/* State */}
                    <select
                        value={stateFilter}
                        onChange={(e) => {
                            setStateFilter(
                                e.target.value
                            );
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">
                            All States
                        </option>

                        {states
                            .filter((state) => {
                                if (!countryFilter) {
                                    return true;
                                }

                                const stateCountryId =
                                    state.countryId?._id ||
                                    state.countryId;

                                return (
                                    stateCountryId ===
                                    countryFilter
                                );
                            })
                            .map((state) => (
                                <option
                                    key={state._id}
                                    value={state._id}
                                >
                                    {state.name}
                                </option>
                            ))}
                    </select>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(
                                e.target.value
                            );
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">
                            All Status
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    #
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    City
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Country
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    State
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Major City
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
                                        colSpan={7}
                                        className="px-5 py-12 text-center"
                                    >
                                        <Loader2
                                            size={25}
                                            className="mx-auto animate-spin text-blue-600"
                                        />

                                        <p className="mt-2 text-sm text-slate-500">
                                            Loading cities...
                                        </p>
                                    </td>
                                </tr>
                            ) : paginatedCities.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-12 text-center"
                                    >
                                        <MapPin
                                            size={30}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-2 text-sm font-medium text-slate-600">
                                            No cities found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try changing your filters.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCities.map(
                                    (city, index) => (
                                        <tr
                                            key={city._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {(currentPage -
                                                    1) *
                                                    limit +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            city.name
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {
                                                            city.slug
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {getCountryName(
                                                    city
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {getStateName(
                                                    city
                                                )}
                                            </td>

                                            {/* Major City */}
                                            <td className="px-5 py-4">
                                                {city.majorcity ? (
                                                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        Major
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={
                                                        city.isActive
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            city
                                                        )
                                                    }
                                                    disabled={
                                                        toggleMutation.isPending
                                                    }
                                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${city.isActive
                                                        ? "bg-green-600"
                                                        : "bg-slate-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${city.isActive
                                                            ? "translate-x-5"
                                                            : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        to={`/admin/locations/cities/${city._id}/edit`}
                                                        className="rounded-lg border border-gray-200 p-2.5 text-blue-600 transition hover:bg-blue-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteCity(
                                                                city
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading &&
                    filteredCities.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {(currentPage -
                                        1) *
                                        limit +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-slate-700">
                                    {Math.min(
                                        currentPage *
                                        limit,
                                        filteredCities.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700">
                                    {
                                        filteredCities.length
                                    }
                                </span>{" "}
                                cities
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        currentPage ===
                                        1
                                    }
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                prev -
                                                1
                                        )
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
                                    disabled={
                                        currentPage >=
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                prev +
                                                1
                                        )
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
                open={Boolean(deleteCity)}
                title="Delete City"
                description={
                    deleteCity
                        ? `Are you sure you want to delete "${deleteCity.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete City"
                loading={deleteMutation.isPending}
                onCancel={() => {
                    if (
                        !deleteMutation.isPending
                    ) {
                        setDeleteCity(null);
                    }
                }}
                onConfirm={() => {
                    if (deleteCity?._id) {
                        deleteMutation.mutate(
                            deleteCity._id
                        );
                    }
                }}
            />
        </div>
    );
}