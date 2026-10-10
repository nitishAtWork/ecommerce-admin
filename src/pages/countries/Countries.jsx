import { useEffect, useState } from "react";
import {
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    Globe2,
    RefreshCw,
} from "lucide-react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/common/ConfirmModal";

import countryService from "../../services/country.service";

function Countries() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    const [deleteCountry, setDeleteCountry] =
        useState(null);

    /**
     * ----------------------------------------------------------------------
     * Query
     * ----------------------------------------------------------------------
     */

    const {
        data,
        isLoading,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: [
            "countries",
            {
                search,
                status,
                page,
                limit,
            },
        ],

        queryFn: () =>
            countryService.getCountries({
                search: search || undefined,
                isActive:
                    status === "all"
                        ? undefined
                        : status === "active"
                            ? true
                            : false,
                page,
                limit,
            }),

        keepPreviousData: true,
    });

    const countries =
        data?.countries || [];

    /**
     * Backend currently returns all countries,
     * so pagination metadata may not exist.
     *
     * This supports both paginated and non-paginated
     * responses.
     */
    const pagination =
        data?.pagination || null;

    /**
     * ----------------------------------------------------------------------
     * Delete Mutation
     * ----------------------------------------------------------------------
     */

    const deleteMutation = useMutation({
        mutationFn: (id) =>
            countryService.deleteCountry(id),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "Country deleted successfully."
            );

            setDeleteCountry(null);

            queryClient.invalidateQueries({
                queryKey: ["countries"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete country."
            );
        },
    });

    /**
     * ----------------------------------------------------------------------
     * Toggle Status Mutation
     * ----------------------------------------------------------------------
     */

    const toggleMutation = useMutation({
        mutationFn: (id) =>
            countryService.toggleCountryStatus(id),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "Country status updated successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["countries"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update country status."
            );
        },
    });

    /**
     * ----------------------------------------------------------------------
     * Search
     * ----------------------------------------------------------------------
     */

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    /**
     * ----------------------------------------------------------------------
     * Helpers
     * ----------------------------------------------------------------------
     */

    const handleDelete = () => {
        if (!deleteCountry?._id) {
            return;
        }

        deleteMutation.mutate(
            deleteCountry._id
        );
    };

    const handleToggleStatus = (country) => {
        if (!country?._id) {
            return;
        }

        toggleMutation.mutate(
            country._id
        );
    };

    const getTotalPages = () => {
        if (pagination?.totalPages) {
            return pagination.totalPages;
        }

        return 1;
    };

    const totalPages = getTotalPages();

    /**
     * ----------------------------------------------------------------------
     * UI
     * ----------------------------------------------------------------------
     */

    return (
        <div className="space-y-6">
            <PageHeader
                title="Countries"
                description="Manage countries available in your store."
                action={
                    <Button
                        onClick={() =>
                            navigate(
                                "/admin/locations/countries/add"
                            )
                        }
                    >
                        <Plus size={17} />
                        Add Country
                    </Button>
                }
            />

            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search */}
                    <div className="relative w-full md:max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search countries..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status */}
                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(
                                    event.target.value
                                );
                                setPage(1);
                            }}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
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

                        {/* Refresh */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                refetch()
                            }
                            disabled={isFetching}
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    isFetching
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    #
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Country
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Slug
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        Loading countries...
                                    </td>
                                </tr>
                            ) : countries.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Globe2
                                                size={40}
                                                className="text-slate-300"
                                            />

                                            <p className="mt-3 text-sm font-medium text-slate-700">
                                                No countries found
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Try changing your search or filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                countries.map(
                                    (country, index) => (
                                        <tr
                                            key={
                                                country._id
                                            }
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {(page - 1) *
                                                    limit +
                                                    index +
                                                    1}
                                            </td>

                                            {/* Country */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                        <Globe2
                                                            size={18}
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {
                                                                country.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            ID:{" "}
                                                            {
                                                                country._id
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Slug */}
                                            <td className="px-5 py-4">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                                    /
                                                    {
                                                        country.slug
                                                    }
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={country.isActive}
                                                    onClick={() => handleToggleStatus(country)}
                                                    disabled={toggleMutation.isPending}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${country.isActive
                                                        ? "bg-green-500"
                                                        : "bg-slate-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${country.isActive
                                                            ? "translate-x-5"
                                                            : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    {/* <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/locations/countries/${country._id}`
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                                        title="View"
                                                    >
                                                        <Eye
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button> */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/locations/countries/${country._id}/edit`
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-200 p-2.5 text-blue-600 transition hover:bg-blue-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteCountry(
                                                                country
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
                {pagination && (
                    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                        <p className="text-sm text-slate-500">
                            Page{" "}
                            <span className="font-medium text-slate-700">
                                {page}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-slate-700">
                                {totalPages}
                            </span>
                        </p>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={
                                    page <= 1 ||
                                    isFetching
                                }
                                onClick={() =>
                                    setPage(
                                        (previous) =>
                                            previous - 1
                                    )
                                }
                            >
                                Previous
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={
                                    page >=
                                    totalPages ||
                                    isFetching
                                }
                                onClick={() =>
                                    setPage(
                                        (previous) =>
                                            previous + 1
                                    )
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                open={Boolean(deleteCountry)}
                title="Delete Country"
                description={
                    deleteCountry
                        ? `Are you sure you want to delete "${deleteCountry.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
                cancelText="Cancel"
                loading={
                    deleteMutation.isPending
                }
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeleteCountry(null)
                }
            />
        </div>
    );
}

export default Countries;