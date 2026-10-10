import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    BriefcaseBusiness,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import ConfirmModal from "../../components/common/ConfirmModal";
import Button from "../../components/ui/Button";

import natureOfBusinessService from "../../services/natureOfBusiness.service";

const PAGE_SIZE = 10;

export default function NatureOfBusinesses() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        item: null,
    });

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["nature-of-businesses"],
        queryFn: () =>
            natureOfBusinessService.getNatureOfBusinesses(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) =>
            natureOfBusinessService.deleteNatureOfBusiness(id),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                    "Nature of business deleted successfully."
            );

            setDeleteModal({
                open: false,
                item: null,
            });

            queryClient.invalidateQueries({
                queryKey: ["nature-of-businesses"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to delete nature of business."
            );
        },
    });

    const toggleMutation = useMutation({
        mutationFn: (id) =>
            natureOfBusinessService.toggleNatureOfBusinessStatus(id),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                    "Status updated successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["nature-of-businesses"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to update status."
            );
        },
    });

    const businesses = data?.natureOfBusiness || [];

    const filteredBusinesses = businesses.filter((item) =>
        item.name
            ?.toLowerCase()
            .includes(search.toLowerCase().trim())
    );

    const totalPages = Math.max(
        1,
        Math.ceil(filteredBusinesses.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedBusinesses = filteredBusinesses.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleToggleStatus = (item) => {
        if (!item?._id) {
            toast.error("Invalid nature of business.");
            return;
        }

        toggleMutation.mutate(item._id);
    };

    const handleDelete = () => {
        if (!deleteModal.item?._id) {
            return;
        }

        deleteMutation.mutate(deleteModal.item._id);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nature of Business"
                description="Manage nature of business entries for your platform."
                action={
                    <Link to="/admin/nature-of-business/add">
                        <Button>
                            <Plus size={17} />
                            Add Nature of Business
                        </Button>
                    </Link>
                }
            />

            {/* Search */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            handleSearch(event.target.value)
                        }
                        placeholder="Search nature of business..."
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <Loader2
                            size={28}
                            className="animate-spin text-blue-600"
                        />
                    </div>
                ) : isError ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm font-medium text-red-600">
                            Failed to load nature of business.
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {error?.response?.data?.message ||
                                "Something went wrong."}
                        </p>
                    </div>
                ) : paginatedBusinesses.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <BriefcaseBusiness size={26} />
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-slate-900">
                            No nature of business found
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-slate-500">
                            {search
                                ? "Try changing your search."
                                : "Create your first nature of business entry."}
                        </p>

                        {!search && (
                            <Link
                                to="/admin/nature-of-business/add"
                                className="mt-5"
                            >
                                <Button>
                                    <Plus size={17} />
                                    Add Nature of Business
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            #
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Name
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Short Description
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {paginatedBusinesses.map(
                                        (item, index) => (
                                            <tr
                                                key={item._id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                                                    {(safePage - 1) *
                                                        PAGE_SIZE +
                                                        index +
                                                        1}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {item.name}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            /{item.slug}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="max-w-md px-5 py-4">
                                                    <p className="truncate text-sm text-slate-600">
                                                        {item.shortDescription ||
                                                            "—"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={
                                                            item.isActive
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            toggleMutation.isPending
                                                        }
                                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                            item.isActive
                                                                ? "bg-blue-600"
                                                                : "bg-slate-300"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                                item.isActive
                                                                    ? "translate-x-5"
                                                                    : "translate-x-0.5"
                                                            }`}
                                                        />
                                                    </button>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/admin/nature-of-business/${item._id}/edit`}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                            />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteModal(
                                                                    {
                                                                        open: true,
                                                                        item,
                                                                    }
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={16}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {(safePage - 1) *
                                        PAGE_SIZE +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-slate-700">
                                    {Math.min(
                                        safePage * PAGE_SIZE,
                                        filteredBusinesses.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700">
                                    {filteredBusinesses.length}
                                </span>
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={safePage === 1}
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.max(1, prev - 1)
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <span className="min-w-20 text-center text-sm text-slate-600">
                                    Page {safePage} of{" "}
                                    {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        safePage === totalPages
                                    }
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(
                                                totalPages,
                                                prev + 1
                                            )
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal
                open={deleteModal.open}
                title="Delete Nature of Business"
                description={`Are you sure you want to delete "${deleteModal.item?.name || ""}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() =>
                    !deleteMutation.isPending &&
                    setDeleteModal({
                        open: false,
                        item: null,
                    })
                }
            />
        </div>
    );
}