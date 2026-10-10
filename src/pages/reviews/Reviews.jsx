import {
    Search,
    Star,
    Eye,
    Check,
    X,
    Trash2,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Image as ImageIcon,
} from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import useDebounce from "../../hooks/useDebounce";
import reviewService from "../../services/review.service";

const Reviews = () => {
    const navigate = useNavigate();
    const queryClient =
        useQueryClient();

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const [rating, setRating] =
        useState("all");

    const [page, setPage] =
        useState(1);

    const [limit] = useState(10);

    const debouncedSearch =
        useDebounce(search, 500);

    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        status,
        rating,
    ]);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            "reviews",
            {
                page,
                limit,
                search: debouncedSearch,
                status,
                rating,
            },
        ],

        queryFn: () =>
            reviewService.getReviews({
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
                          status,
                      }
                    : {}),

                ...(rating !== "all"
                    ? {
                          rating,
                      }
                    : {}),
            }),
    });

    const reviews =
        data?.data?.reviews || [];

    const pagination =
        data?.data?.pagination || {
            page: 1,
            limit,
            total: 0,
            totalPages: 1,
        };

    const updateStatusMutation =
        useMutation({
            mutationFn: ({
                id,
                status,
            }) =>
                reviewService.updateReviewStatus(
                    id,
                    status
                ),

            onSuccess: (_, variables) => {
                toast.success(
                    variables.status ===
                        "APPROVED"
                        ? "Review approved successfully."
                        : variables.status ===
                          "REJECTED"
                        ? "Review rejected successfully."
                        : "Review moved to pending."
                );

                queryClient.invalidateQueries(
                    {
                        queryKey: [
                            "reviews",
                        ],
                    }
                );
            },

            onError: (error) => {
                toast.error(
                    error?.response
                        ?.data?.message ||
                        "Failed to update review."
                );
            },
        });

    const deleteMutation =
        useMutation({
            mutationFn: (id) =>
                reviewService.deleteReview(
                    id
                ),

            onSuccess: () => {
                toast.success(
                    "Review deleted successfully."
                );

                queryClient.invalidateQueries(
                    {
                        queryKey: [
                            "reviews",
                        ],
                    }
                );
            },

            onError: (error) => {
                toast.error(
                    error?.response
                        ?.data?.message ||
                        "Failed to delete review."
                );
            },
        });

    const handleStatusChange = (
        id,
        newStatus
    ) => {
        updateStatusMutation.mutate({
            id,
            status: newStatus,
        });
    };

    const handleDelete = (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this review?"
            );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate(id);
    };

    return (
        <div>
            <PageHeader
                title="Reviews"
                description="Manage customer reviews and moderate product feedback."
            />

            {/* Filters */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target
                                        .value
                                )
                            }
                            placeholder="Search reviews, customers or products..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(
                                e.target
                                    .value
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">
                            All Status
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="APPROVED">
                            Approved
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>
                    </select>

                    {/* Rating */}
                    <select
                        value={rating}
                        onChange={(e) =>
                            setRating(
                                e.target
                                    .value
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">
                            All Ratings
                        </option>

                        {[5, 4, 3, 2, 1].map(
                            (value) => (
                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >
                                    {value}{" "}
                                    Stars
                                </option>
                            )
                        )}
                    </select>

                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={() =>
                            refetch()
                        }
                        disabled={
                            isFetching
                        }
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>
            </div>

            {/* Error */}
            {isError && (
                <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span>
                        {error?.response
                            ?.data?.message ||
                            "Failed to load reviews."}
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

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Customer
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Product
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Rating
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Review
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Date
                                </th>

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <ReviewTableSkeleton />
                            ) : reviews.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-16"
                                    >
                                        <EmptyReviews />
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(
                                    (
                                        review
                                    ) => (
                                        <ReviewRow
                                            key={
                                                review._id
                                            }
                                            review={
                                                review
                                            }
                                            onView={() =>
                                                navigate(
                                                    `/admin/reviews/${review._id}`
                                                )
                                            }
                                            onStatusChange={
                                                handleStatusChange
                                            }
                                            onDelete={
                                                handleDelete
                                            }
                                            isStatusUpdating={
                                                updateStatusMutation.isPending &&
                                                updateStatusMutation
                                                    .variables
                                                    ?.id ===
                                                    review._id
                                            }
                                            isDeleting={
                                                deleteMutation.isPending &&
                                                deleteMutation.variables ===
                                                    review._id
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
                    reviews.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {(pagination.page -
                                        1) *
                                        pagination.limit +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-slate-700">
                                    {Math.min(
                                        pagination.page *
                                            pagination.limit,
                                        pagination.total
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700">
                                    {
                                        pagination.total
                                    }
                                </span>{" "}
                                reviews
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        pagination.page <=
                                            1 ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                previous
                                            ) =>
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
                                    {
                                        pagination.page
                                    }{" "}
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        pagination.page >=
                                            pagination.totalPages ||
                                        isFetching
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                previous
                                            ) =>
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
        </div>
    );
};

function ReviewRow({
    review,
    onView,
    onStatusChange,
    onDelete,
    isStatusUpdating,
    isDeleting,
}) {
    return (
        <tr className="transition hover:bg-slate-50/70">
            {/* Customer */}
            <td className="px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        {review.user?.name ||
                            "Unknown"}
                    </p>

                    <p className="mt-1 max-w-44 truncate text-xs text-slate-400">
                        {review.user?.email ||
                            "-"}
                    </p>
                </div>
            </td>

            {/* Product */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    {review.product
                        ?.img ? (
                        <img
                            src={getImageUrl(review.product.img)}
                            alt={
                                review.product
                                    ?.name ||
                                "Product"
                            }
                            className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <ImageIcon
                                size={17}
                            />
                        </div>
                    )}

                    <p className="max-w-48 line-clamp-2 text-sm font-medium text-slate-900">
                        {review.product
                            ?.name ||
                            "Unknown Product"}
                    </p>
                </div>
            </td>

            {/* Rating */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                    <Star
                        size={15}
                        className="fill-amber-400 text-amber-400"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                        {review.rating}
                    </span>
                </div>
            </td>

            {/* Review */}
            <td className="max-w-[200px] px-5 py-4">
                <p className="truncate text-sm font-medium text-slate-800">
                    {review.title ||
                        "No title"}
                </p>

                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {review.comment}
                </p>

                {review.images
                    ?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <ImageIcon
                            size={13}
                        />

                        {
                            review.images
                                .length
                        }{" "}
                        image
                        {review.images
                            .length > 1
                            ? "s"
                            : ""}
                    </div>
                )}
            </td>

            {/* Status */}
            <td className="px-5 py-4">
                <select
                    value={
                        review.moderationStatus ||
                        (review.isApproved
                            ? "APPROVED"
                            : "PENDING")
                    }
                    disabled={
                        isStatusUpdating
                    }
                    onChange={(e) =>
                        onStatusChange(
                            review._id,
                            e.target.value
                        )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${getReviewStatusClass(
                        review.moderationStatus ||
                            (review.isApproved
                                ? "APPROVED"
                                : "PENDING")
                    )}`}
                >
                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="APPROVED">
                        Approved
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>
                </select>
            </td>

            {/* Date */}
            <td className="px-5 py-4 text-sm text-slate-500">
                {formatDate(
                    review.createdAt
                )}
            </td>

            {/* Actions */}
            <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onView}
                        title="View Review"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye
                            size={17}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onStatusChange(
                                review._id,
                                "APPROVED"
                            )
                        }
                        disabled={
                            isStatusUpdating ||
                            review.moderationStatus ===
                                "APPROVED"
                        }
                        title="Approve"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Check
                            size={17}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onStatusChange(
                                review._id,
                                "REJECTED"
                            )
                        }
                        disabled={
                            isStatusUpdating ||
                            review.moderationStatus ===
                                "REJECTED"
                        }
                        title="Reject"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <X
                            size={17}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onDelete(
                                review._id
                            )
                        }
                        disabled={
                            isDeleting
                        }
                        title="Delete"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2
                            size={17}
                        />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function getReviewStatusClass(status) {
    switch (
        String(status).toUpperCase()
    ) {
        case "APPROVED":
            return "border-green-200 bg-green-50 text-green-700";

        case "REJECTED":
            return "border-red-200 bg-red-50 text-red-700";

        case "PENDING":
        default:
            return "border-amber-200 bg-amber-50 text-amber-700";
    }
}

function EmptyReviews() {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <Star
                    size={28}
                    className="text-slate-300"
                />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No reviews found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
                Try changing your search or
                filters.
            </p>
        </div>
    );
}

function ReviewTableSkeleton() {
    return Array.from({
        length: 6,
    }).map((_, index) => (
        <tr key={index}>
            {Array.from({
                length: 7,
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

function formatDate(date) {
    if (!date) {
        return "-";
    }

    return new Date(
        date
    ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default Reviews;