import {
    ArrowLeft,
    Check,
    X,
    Trash2,
    Star,
    User,
    Mail,
    Phone,
    Package,
    ShoppingBag,
    CalendarDays,
    BadgeCheck,
    Image as ImageIcon,
    ExternalLink,
} from "lucide-react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import reviewService from "../../services/review.service";
import { getImageUrl } from "../../utils/getImageUrl";

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient =
        useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["review", id],

        queryFn: () =>
            reviewService.getReviewById(id),

        enabled: Boolean(id),
    });

    const review =
        data?.data?.review ||
        data?.review ||
        null;

    /*
     * Update status
     */
    const updateStatusMutation =
        useMutation({
            mutationFn: (status) =>
                reviewService.updateReviewStatus(
                    id,
                    status
                ),

            onSuccess: (_, status) => {
                const messages = {
                    APPROVED:
                        "Review approved successfully.",
                    REJECTED:
                        "Review rejected successfully.",
                    PENDING:
                        "Review moved to pending.",
                };

                toast.success(
                    messages[status] ||
                        "Review status updated."
                );

                queryClient.invalidateQueries({
                    queryKey: [
                        "review",
                        id,
                    ],
                });

                queryClient.invalidateQueries({
                    queryKey: ["reviews"],
                });
            },

            onError: (error) => {
                toast.error(
                    error?.response
                        ?.data?.message ||
                        "Failed to update review."
                );
            },
        });

    /*
     * Delete
     */
    const deleteMutation =
        useMutation({
            mutationFn: () =>
                reviewService.deleteReview(
                    id
                ),

            onSuccess: () => {
                toast.success(
                    "Review deleted successfully."
                );

                queryClient.invalidateQueries({
                    queryKey: ["reviews"],
                });

                navigate(
                    "/admin/reviews"
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

    const handleDelete = () => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this review? This action cannot be undone."
            );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate();
    };

    if (isLoading) {
        return <ReviewDetailSkeleton />;
    }

    if (isError || !review) {
        return (
            <div>
                <PageHeader
                    title="Review"
                    description="View customer review details."
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm font-medium text-red-700">
                        {error?.response
                            ?.data?.message ||
                            "Review not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            refetch()
                        }
                        className="mt-3 text-sm font-medium text-red-700 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const status =
        review.moderationStatus ||
        (review.isApproved
            ? "APPROVED"
            : "PENDING");

    return (
        <div>
            <PageHeader
                title="Review Details"
                description="View and manage customer review."
            />

            {/* Top actions */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/reviews"
                        )
                    }
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft
                        size={17}
                    />
                    Back to Reviews
                </button>

                <div className="flex flex-wrap items-center gap-2">
                    {status !==
                        "APPROVED" && (
                        <Button
                            variant="primary"
                            onClick={() =>
                                updateStatusMutation.mutate(
                                    "APPROVED"
                                )
                            }
                            disabled={
                                updateStatusMutation.isPending
                            }
                        >
                            <Check
                                size={16}
                            />

                            {updateStatusMutation.isPending
                                ? "Updating..."
                                : "Approve Review"}
                        </Button>
                    )}

                    {status !==
                        "REJECTED" && (
                        <button
                            type="button"
                            onClick={() =>
                                updateStatusMutation.mutate(
                                    "REJECTED"
                                )
                            }
                            disabled={
                                updateStatusMutation.isPending
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X
                                size={16}
                            />
                            Reject
                        </button>
                    )}

                    {status !==
                        "PENDING" && (
                        <button
                            type="button"
                            onClick={() =>
                                updateStatusMutation.mutate(
                                    "PENDING"
                                )
                            }
                            disabled={
                                updateStatusMutation.isPending
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Move to Pending
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={
                            handleDelete
                        }
                        disabled={
                            deleteMutation.isPending
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2
                            size={16}
                        />

                        Delete
                    </button>
                </div>
            </div>

            {/* Status banner */}
            <div
                className={`mb-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${getStatusBannerClass(
                    status
                )}`}
            >
                <div>
                    <p className="text-sm font-semibold">
                        Review Status
                    </p>

                    <p className="mt-1 text-xs opacity-80">
                        {getStatusDescription(
                            status
                        )}
                    </p>
                </div>

                <ReviewStatusBadge
                    status={status}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                {/* Main review */}
                <div className="space-y-6 xl:col-span-2">
                    {/* Review content */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Customer Review
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-slate-900">
                                    {review.title ||
                                        "Customer Review"}
                                </h2>
                            </div>

                            <Rating
                                rating={
                                    review.rating
                                }
                            />
                        </div>

                        <div className="mt-6 rounded-lg bg-slate-50 p-5">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                {review.comment ||
                                    "No review content."}
                            </p>
                        </div>

                        {/* Images */}
                        {review.images
                            ?.length > 0 && (
                            <div className="mt-6">
                                <div className="mb-3 flex items-center gap-2">
                                    <ImageIcon
                                        size={
                                            17
                                        }
                                        className="text-slate-500"
                                    />

                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Review
                                        Images
                                    </h3>

                                    <span className="text-xs text-slate-400">
                                        (
                                        {
                                            review
                                                .images
                                                .length
                                        }
                                        )
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {review.images.map(
                                        (
                                            image,
                                            index
                                        ) => (
                                            <a
                                                key={
                                                    `${image}-${index}`
                                                }
                                                href={image}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                            >
                                                <img
                                                    src={
                                                        getImageUrl(image)
                                                    }
                                                    alt={`Review image ${
                                                        index +
                                                        1
                                                    }`}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />

                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                                    <ExternalLink
                                                        size={
                                                            20
                                                        }
                                                        className="text-white opacity-0 transition group-hover:opacity-100"
                                                    />
                                                </div>
                                            </a>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Reviewed Product
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                    Product
                                    Information
                                </h2>
                            </div>

                            {review.product
                                ?.slug && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/products/${review.product._id}/edit`
                                        )
                                    }
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View Product
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            {review.product
                                ?.img ? (
                                <img
                                    src={
                                        getImageUrl(review
                                            .product
                                            .img)
                                    }
                                    alt={
                                        review
                                            .product
                                            ?.name ||
                                        "Product"
                                    }
                                    className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                    <Package
                                        size={
                                            28
                                        }
                                    />
                                </div>
                            )}

                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    {review.product
                                        ?.name ||
                                        "Unknown Product"}
                                </h3>

                                {review.product
                                    ?.slug && (
                                    <p className="mt-1 text-xs text-slate-400">
                                        /
                                        {
                                            review
                                                .product
                                                .slug
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <User
                                    size={
                                        18
                                    }
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Reviewer
                                </p>

                                <h2 className="text-sm font-semibold text-slate-900">
                                    Customer
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Name
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {review
                                        .user
                                        ?.name ||
                                        "Unknown"}
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail
                                    size={
                                        16
                                    }
                                    className="mt-0.5 shrink-0 text-slate-400"
                                />

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400">
                                        Email
                                    </p>

                                    <p className="mt-1 truncate text-sm text-slate-700">
                                        {review
                                            .user
                                            ?.email ||
                                            "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone
                                    size={
                                        16
                                    }
                                    className="mt-0.5 shrink-0 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {review
                                            .user
                                            ?.phone ||
                                            "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review information */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Review Information
                        </h2>

                        <div className="mt-5 space-y-4">
                            <InfoRow
                                icon={
                                    <CalendarDays
                                        size={
                                            16
                                        }
                                    />
                                }
                                label="Submitted"
                                value={formatDate(
                                    review.createdAt
                                )}
                            />

                            <InfoRow
                                icon={
                                    <CalendarDays
                                        size={
                                            16
                                        }
                                    />
                                }
                                label="Updated"
                                value={formatDate(
                                    review.updatedAt
                                )}
                            />

                            <InfoRow
                                icon={
                                    <BadgeCheck
                                        size={
                                            16
                                        }
                                    />
                                }
                                label="Verified Purchase"
                                value={
                                    review.isVerifiedPurchase
                                        ? "Yes"
                                        : "No"
                                }
                                valueClass={
                                    review.isVerifiedPurchase
                                        ? "text-green-600"
                                        : "text-slate-600"
                                }
                            />

                            <InfoRow
                                icon={
                                    <Star
                                        size={
                                            16
                                        }
                                    />
                                }
                                label="Rating"
                                value={`${review.rating || 0} / 5`}
                            />
                        </div>
                    </div>

                    {/* Order */}
                    {review.order && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                                    <ShoppingBag
                                        size={
                                            18
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Purchase
                                    </p>

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Order
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Order Number
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        #
                                        {review
                                            .order
                                            .orderNumber ||
                                            review
                                                .order
                                                ._id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Order Amount
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        ₹
                                        {Number(
                                            review
                                                .order
                                                .totalAmount ||
                                                0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* -------------------------------- */
/* Rating */
/* -------------------------------- */

function Rating({ rating }) {
    const value = Number(
        rating || 0
    );

    return (
        <div className="flex items-center gap-1">
            {Array.from({
                length: 5,
            }).map((_, index) => (
                <Star
                    key={index}
                    size={19}
                    className={
                        index < value
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                    }
                />
            ))}

            <span className="ml-2 text-sm font-semibold text-slate-700">
                {value}/5
            </span>
        </div>
    );
}

/* -------------------------------- */
/* Status */
/* -------------------------------- */

function ReviewStatusBadge({
    status,
}) {
    const normalized =
        String(status).toUpperCase();

    const config = {
        APPROVED: {
            label: "Approved",
            className:
                "border-green-200 bg-green-50 text-green-700",
        },

        REJECTED: {
            label: "Rejected",
            className:
                "border-red-200 bg-red-50 text-red-700",
        },

        PENDING: {
            label: "Pending",
            className:
                "border-amber-200 bg-amber-50 text-amber-700",
        },
    };

    const current =
        config[normalized] ||
        config.PENDING;

    return (
        <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${current.className}`}
        >
            {current.label}
        </span>
    );
}

function getStatusBannerClass(status) {
    switch (
        String(status).toUpperCase()
    ) {
        case "APPROVED":
            return "border-green-200 bg-green-50 text-green-800";

        case "REJECTED":
            return "border-red-200 bg-red-50 text-red-800";

        default:
            return "border-amber-200 bg-amber-50 text-amber-800";
    }
}

function getStatusDescription(status) {
    switch (
        String(status).toUpperCase()
    ) {
        case "APPROVED":
            return "This review is visible to customers and contributes to the product rating.";

        case "REJECTED":
            return "This review has been rejected and is not included in the product rating.";

        default:
            return "This review is waiting for admin moderation.";
    }
}

/* -------------------------------- */
/* Info Row */
/* -------------------------------- */

function InfoRow({
    icon,
    label,
    value,
    valueClass = "text-slate-700",
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-400">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-slate-400">
                    {label}
                </p>

                <p
                    className={`mt-1 text-sm font-medium ${valueClass}`}
                >
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

/* -------------------------------- */
/* Loading */
/* -------------------------------- */

function ReviewDetailSkeleton() {
    return (
        <div>
            <PageHeader
                title="Review Details"
                description="View and manage customer review."
            />

            <div className="mb-5 h-5 w-32 animate-pulse rounded bg-slate-100" />

            <div className="grid gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />

                        <div className="mt-6 h-32 animate-pulse rounded-lg bg-slate-100" />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />

                        <div className="mt-5 flex gap-4">
                            <div className="h-24 w-24 animate-pulse rounded-xl bg-slate-100" />

                            <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="h-56 animate-pulse rounded-xl bg-slate-100" />

                    <div className="h-64 animate-pulse rounded-xl bg-slate-100" />

                    <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
};

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

export default ReviewDetail;