import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiExternalLink,
    FiRefreshCw,
} from "react-icons/fi";
import { toast } from "sonner";

import pageService from "../../services/page.service";
import ConfirmModal from "../../components/ui/ConfirmModal";

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || fallback;

export default function Pages() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deletePage, setDeletePage] = useState(null);

    const [search, setSearch] = useState("");

    const {
        data: pages = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["pages"],
        queryFn: pageService.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: pageService.delete,

        onSuccess: () => {
            toast.success("Page deleted successfully.");

            setDeletePage(null);

            queryClient.invalidateQueries({
                queryKey: ["pages"],
            });
        },

        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to delete page.")
            );
        },
    });

    const toggleMutation = useMutation({
        mutationFn: pageService.toggleStatus,
        onSuccess: () => {
            toast.success("Page status updated.");
            queryClient.invalidateQueries({ queryKey: ["pages"] });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to update status.")
            );
        },
    });

    const filteredPages = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return pages;

        return pages.filter((page) =>
            [page.name, page.slug, page.metaTitle]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(term)
                )
        );
    }, [pages, search]);

    const handleDelete = (page) => {
        setDeletePage(page);
    };

    return (
        <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Pages
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your website pages and SEO content.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/pages/add")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <FiPlus size={18} />
                    Add Page
                </button>
            </div>

            {/* Search and count */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search pages by name or slug..."
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                        {filteredPages.length} page
                        {filteredPages.length !== 1 ? "s" : ""}
                    </span>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        title="Refresh pages"
                        className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <FiRefreshCw
                            className={isLoading ? "animate-spin" : ""}
                        />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-gray-500">
                        Loading pages...
                    </div>
                ) : isError ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-red-600">
                            Failed to load pages.
                        </p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredPages.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="font-medium text-gray-800">
                            No pages found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Add a page or try a different search.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">Page</th>
                                    <th className="px-5 py-4">Slug</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Custom slug</th>
                                    <th className="px-5 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredPages.map((page) => (
                                    <tr
                                        key={page._id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {page.img ? (
                                                    <img
                                                        src={page.img}
                                                        alt={page.name}
                                                        className="h-11 w-11 rounded-lg border border-gray-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400">
                                                        PAGE
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {page.name}
                                                    </p>
                                                    <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                        {page.shortDescription ||
                                                            "No short description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            <span className="break-all">
                                                /{page.slug}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={Boolean(page.isActive)}
                                                aria-label={`Toggle ${page.name} status`}
                                                disabled={toggleMutation.isPending}
                                                onClick={() =>
                                                    toggleMutation.mutate(page._id)
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${page.isActive
                                                    ? "bg-emerald-500"
                                                    : "bg-gray-300"
                                                    } disabled:opacity-50`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${page.isActive
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                        }`}
                                                />
                                            </button>

                                            <span
                                                className={`ml-2 text-xs font-medium ${page.isActive
                                                    ? "text-emerald-700"
                                                    : "text-gray-500"
                                                    }`}
                                            >
                                                {page.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {page.isCustomSlug ? "Yes" : "No"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/pages/edit/${page._id}`}
                                                    title="Edit page"
                                                    className="rounded-lg border border-gray-200 p-2.5 text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    <FiEdit2 size={16} />
                                                </Link>

                                                {/* {page.isActive && (
                                                    <a
                                                        href={`/${page.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Preview page"
                                                        className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-50"
                                                    >
                                                        <FiExternalLink size={16} />
                                                    </a>
                                                )} */}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(page)}
                                                    disabled={deleteMutation.isPending}
                                                    title="Delete page"
                                                    className="rounded-lg border border-gray-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Delete Confirmation */}
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={Boolean(deletePage)}
                title="Delete Page?"
                description={
                    deletePage
                        ? `Are you sure you want to delete "${deletePage.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete Page"
                loading={deleteMutation.isPending}
                onCancel={() => {
                    if (!deleteMutation.isPending) {
                        setDeletePage(null);
                    }
                }}
                onConfirm={() => {
                    if (deletePage && !deleteMutation.isPending) {
                        deleteMutation.mutate(deletePage._id);
                    }
                }}
            />
        </div>
    );
}