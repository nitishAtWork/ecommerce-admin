import { useEffect, useState } from "react";

import {
    Plus,
    Eye,
    Search,
    Pencil,
    Trash2,
    PackageOpen,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { getImageUrl } from "../../utils/getImageUrl";

import ConfirmModal from "../../components/ui/ConfirmModal";

import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";

import keywordService from "../../services/keyword.service";

import useDebounce from "../../hooks/useDebounce";

function Keywords() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const queryClient =
        useQueryClient();

    const [deleteKeyword, setDeleteKeyword] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Delete Keyword
    |--------------------------------------------------------------------------
    */

    const deleteMutation =
        useMutation({
            mutationFn: (id) =>
                keywordService.deleteKeyword(id),

            onSuccess: () => {
                toast.success(
                    "Keyword deleted successfully."
                );

                setDeleteKeyword(null);

                queryClient.invalidateQueries({
                    queryKey: ["keywords"],
                });
            },

            onError: (error) => {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to delete keyword."
                );
            },
        });

    /*
    |--------------------------------------------------------------------------
    | Debounced Search
    |--------------------------------------------------------------------------
    */

    const debouncedSearch =
        useDebounce(search, 500);

    /*
    |--------------------------------------------------------------------------
    | Reset Pagination
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        status,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Get Keywords
    |--------------------------------------------------------------------------
    */

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            "keywords",
            {
                page,
                limit,
                search: debouncedSearch,
                status,
            },
        ],

        queryFn: () =>
            keywordService.getKeywords({
                page,
                limit,

                ...(debouncedSearch
                    ? {
                          search:
                              debouncedSearch,
                      }
                    : {}),

                ...(status !== "all"
                    ? {
                          isActive:
                              status ===
                              "active",
                      }
                    : {}),
            }),
    });

    /*
    |--------------------------------------------------------------------------
    | Response Data
    |--------------------------------------------------------------------------
    */

    const keywords =
        data?.data?.keywords || [];

    const pagination =
        data?.data?.pagination || {
            page: 1,
            limit,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
        };

    /*
    |--------------------------------------------------------------------------
    | Handlers
    |--------------------------------------------------------------------------
    */

    const handleEdit = (id) => {
        navigate(
            `/admin/keywords/${id}/edit`
        );
    };

    const handleDelete = (keyword) => {
        setDeleteKeyword(keyword);
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div>
            <PageHeader
                title="Keywords"
                description="Manage your keyword pages and SEO content."
                action={
                    <Button
                        onClick={() =>
                            navigate(
                                "/admin/keywords/add"
                            )
                        }
                    >
                        <Plus size={18} />
                        Add Keyword
                    </Button>
                }
            />

            {/* Filters */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row">

                    {/* Search */}
                    <div className="relative flex-1">
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
                            placeholder="Search keywords..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            {/* Error */}
            {isError && (
                <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span>
                        {error?.response?.data
                            ?.message ||
                            "Failed to load keywords."}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            refetch()
                        }
                        className="font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Keyword Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">

                    <table className="w-full min-w-[800px]">

                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Keyword
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Short Description
                                </th>

                                {/* <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Size
                                </th> */}

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {isLoading ? (
                                <KeywordTableSkeleton />
                            ) : keywords.length === 0 ? (
                                <tr>
                                    <td colSpan="5">

                                        <div className="flex flex-col items-center justify-center py-16">

                                            <PackageOpen
                                                size={42}
                                                className="text-slate-300"
                                            />

                                            <h3 className="mt-3 text-sm font-semibold text-slate-700">
                                                No keywords found
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-400">
                                                Try changing your search or filters.
                                            </p>

                                        </div>

                                    </td>
                                </tr>
                            ) : (
                                keywords.map(
                                    (keyword) => (
                                        <KeywordRow
                                            key={
                                                keyword._id
                                            }
                                            keyword={
                                                keyword
                                            }
                                            onEdit={
                                                handleEdit
                                            }
                                            onDelete={
                                                handleDelete
                                            }
                                        />
                                    )
                                )
                            )}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading &&
                    keywords.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm text-slate-500">
                                Showing{" "}

                                <span className="font-medium text-slate-700">
                                    {(pagination.page -
                                        1) *
                                        pagination.limit +
                                        1}
                                </span>

                                {" "}to{" "}

                                <span className="font-medium text-slate-700">
                                    {Math.min(
                                        pagination.page *
                                            pagination.limit,
                                        pagination.total
                                    )}
                                </span>

                                {" "}of{" "}

                                <span className="font-medium text-slate-700">
                                    {pagination.total}
                                </span>

                                {" "}keywords
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasPreviousPage ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            (previous) =>
                                                Math.max(
                                                    previous -
                                                        1,
                                                    1
                                                )
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft
                                        size={17}
                                    />
                                </button>

                                <span className="px-2 text-sm text-slate-600">
                                    Page{" "}
                                    {pagination.page}{" "}
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasNextPage ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            (previous) =>
                                                previous +
                                                1
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight
                                        size={17}
                                    />
                                </button>

                            </div>
                        </div>
                    )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                open={Boolean(deleteKeyword)}
                title="Delete keyword?"
                description={
                    deleteKeyword
                        ? `Are you sure you want to delete "${deleteKeyword.name}"? The keyword and its associated content will be removed.`
                        : ""
                }
                confirmText="Delete Keyword"
                loading={
                    deleteMutation.isPending
                }
                onCancel={() =>
                    setDeleteKeyword(null)
                }
                onConfirm={() => {
                    if (deleteKeyword) {
                        deleteMutation.mutate(
                            deleteKeyword._id
                        );
                    }
                }}
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Keyword Row
|--------------------------------------------------------------------------
*/

function KeywordRow({
    keyword,
    onEdit,
    onDelete,
}) {
    const queryClient =
        useQueryClient();

    const image = getImageUrl(
        keyword.img ||
            keyword.images?.[0]
    );

    /*
    |--------------------------------------------------------------------------
    | Toggle Status
    |--------------------------------------------------------------------------
    */

    const toggleStatusMutation =
        useMutation({
            mutationFn: (id) =>
                keywordService.toggleKeywordStatus(
                    id
                ),

            onSuccess: () => {
                toast.success(
                    "Keyword status updated successfully."
                );

                queryClient.invalidateQueries({
                    queryKey: ["keywords"],
                });
            },

            onError: (error) => {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to update keyword status."
                );
            },
        });

    return (
        <tr className="hover:bg-slate-50/70">

            {/* Keyword */}
            <td className="px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">

                        {image ? (
                            <img
                                src={image}
                                alt={keyword.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <PackageOpen
                                    size={20}
                                />
                            </div>
                        )}

                    </div>

                    <div className="min-w-0">

                        <p className="max-w-70 truncate text-sm font-medium text-slate-900">
                            {keyword.name}
                        </p>

                        {keyword.slug && (
                            <p className="mt-0.5 max-w-70 truncate text-xs text-slate-400">
                                /{keyword.slug}
                            </p>
                        )}

                    </div>
                </div>
            </td>

            {/* Short Description */}
            <td className="max-w-80 px-5 py-4 text-sm text-slate-600">
                <p className="line-clamp-2">
                    {keyword.shortDescription ||
                        keyword.description ||
                        "-"}
                </p>
            </td>

            {/* Size */}
            {/* <td className="px-5 py-4 text-sm text-slate-600">
                {keyword.size || "-"}
            </td> */}

            {/* Status */}
            <td className="px-5 py-4">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        role="switch"
                        aria-checked={
                            keyword.isActive
                        }
                        disabled={
                            toggleStatusMutation.isPending
                        }
                        onClick={() =>
                            toggleStatusMutation.mutate(
                                keyword._id
                            )
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            keyword.isActive
                                ? "bg-green-500"
                                : "bg-slate-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                keyword.isActive
                                    ? "translate-x-6"
                                    : "translate-x-1"
                            }`}
                        />
                    </button>

                    <span
                        className={`text-xs font-medium ${
                            keyword.isActive
                                ? "text-green-600"
                                : "text-slate-500"
                        }`}
                    >
                        {keyword.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>

                </div>
            </td>

            {/* Actions */}
            <td className="max-w-32 px-5 py-4 text-right">

                <div className="flex items-center justify-end gap-3">

                    {/* View */}
                    <button
                        type="button"
                        title="View Keyword"
                        onClick={() => {
                            window.location.href =
                                `/admin/keywords/${keyword._id}`;
                        }}
                        className="flex cursor-pointer items-center py-2 text-sm text-slate-700 hover:text-blue-600"
                    >
                        <Eye size={21} />
                    </button>

                    {/* Edit */}
                    <button
                        type="button"
                        title="Edit Keyword"
                        onClick={() =>
                            onEdit(
                                keyword._id
                            )
                        }
                         className="rounded-lg border border-gray-200 p-2.5 text-blue-600 transition hover:bg-blue-50"
                    >
                        <Pencil size={18} />
                    </button>

                    {/* Delete */}
                    <button
                        type="button"
                        title="Delete Keyword"
                        onClick={() =>
                            onDelete(keyword)
                        }
                         className="rounded-lg border border-gray-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                    </button>

                </div>
            </td>
        </tr>
    );
}

/*
|--------------------------------------------------------------------------
| Keyword Table Skeleton
|--------------------------------------------------------------------------
*/

function KeywordTableSkeleton() {
    return Array.from({
        length: 5,
    }).map((_, index) => (
        <tr key={index}>

            {Array.from({
                length: 5,
            }).map((_, cellIndex) => (
                <td
                    key={cellIndex}
                    className="px-5 py-5"
                >
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                </td>
            ))}

        </tr>
    ));
}

export default Keywords;