import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    Package,
    ShoppingBag,
    CreditCard,
    Truck,
    CheckCircle2,
    XCircle,
    Clock3,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import useDebounce from "../../hooks/useDebounce";
import orderService from "../../services/order.service";

const Orders = () => {
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) =>
            orderService.updateOrderStatus(id, status),

        onSuccess: () => {
            toast.success("Order status updated successfully");

            queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update order status"
            );
        },
    });

    const handleOrderStatusChange = (orderId, newStatus) => {
        updateStatusMutation.mutate({
            id: orderId,
            status: newStatus,
        });
    };

    const [paymentStatus, setPaymentStatus] =
        useState("all");

    const [page, setPage] =
        useState(1);

    const [limit] =
        useState(10);

    const debouncedSearch =
        useDebounce(search, 500);

    /*
     * Reset page when filters change
     */
    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        status,
        paymentStatus,
    ]);

    /*
     * Orders query
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
            "orders",
            {
                page,
                limit,
                search: debouncedSearch,
                status,
                paymentStatus,
            },
        ],

        queryFn: () =>
            orderService.getOrders({
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

                ...(paymentStatus !==
                    "all"
                    ? {
                        paymentStatus,
                    }
                    : {}),
            }),
    });

    /*
     * Adjust these according to your
     * actual API response.
     */
    const orders =
        data?.data?.orders || [];

    const paginationData = data?.data?.pagination;

    const pagination = {
        page: Number(paginationData?.page ?? page),
        limit: Number(paginationData?.limit ?? limit),
        total: Number(paginationData?.total ?? 0),
        totalPages: Number(paginationData?.totalPages ?? 1),

        hasNextPage:
            paginationData?.hasNextPage ??
            Number(paginationData?.page ?? page) <
            Number(paginationData?.totalPages ?? 1),

        hasPreviousPage:
            paginationData?.hasPreviousPage ??
            Number(paginationData?.page ?? page) > 1,
    };

    return (
        <div>
            <PageHeader
                title="Orders"
                description="Manage and track your ecommerce orders."
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
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search by order ID, customer..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Order Status */}
                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">
                            All Order Status
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="CONFIRMED">
                            Confirmed
                        </option>

                        <option value="PROCESSING">
                            Processing
                        </option>

                        <option value="SHIPPED">
                            Shipped
                        </option>

                        <option value="DELIVERED">
                            Delivered
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>

                    {/* Payment */}
                    <select
                        value={paymentStatus}
                        onChange={(event) =>
                            setPaymentStatus(event.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">
                            All Payment
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="PAID">
                            Paid
                        </option>

                        <option value="FAILED">
                            Failed
                        </option>

                        <option value="EXPIRED">
                            Expired
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
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
                        {error
                            ?.response
                            ?.data
                            ?.message ||
                            "Failed to load orders."}
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

            {/* Orders Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Order
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Customer
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Items
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Total
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Payment
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>
                                {/* 
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Date
                                </th> */}

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <OrderTableSkeleton />
                            ) : orders.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                    >
                                        <EmptyOrders />
                                    </td>
                                </tr>
                            ) : (
                                orders.map(
                                    (
                                        order
                                    ) => (
                                        <OrderRow
                                            key={order._id}
                                            order={order}
                                            onView={() =>
                                                navigate(`/admin/orders/${order._id}`)
                                            }
                                            onStatusChange={handleOrderStatusChange}
                                            isStatusUpdating={
                                                updateStatusMutation.isPending &&
                                                updateStatusMutation.variables?.id === order._id
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
                    orders.length >
                    0 && (
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
                                orders
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
                                        size={
                                            17
                                        }
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
                                        !pagination.hasNextPage ||
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
                                        size={
                                            17
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

function OrderRow({
    order,
    onView,
    onStatusChange,
    isStatusUpdating,
}) {
    const itemsCount =
        order.items?.reduce(
            (
                total,
                item
            ) =>
                total +
                (Number(
                    item.quantity
                ) || 0),
            0
        ) ||
        order.items?.length ||
        0;

    return (
        <tr className="transition hover:bg-slate-50/70">
            {/* Order */}
            <td className="px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        #
                        {order.orderNumber ||
                            order._id
                                ?.slice(
                                    -8
                                )
                                .toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {formatDate(
                            order.createdAt
                        )}
                    </p>
                </div>
            </td>

            {/* Customer */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <ShoppingBag
                            size={17}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="max-w-48 truncate text-sm font-medium text-slate-900">
                            {order
                                .user
                                ?.name ||
                                order
                                    .customer
                                    ?.name ||
                                order
                                    .shippingAddress
                                    ?.fullName ||
                                "Guest Customer"}
                        </p>

                        <p className="max-w-48 truncate text-xs text-slate-400">
                            {order
                                .user
                                ?.email ||
                                order
                                    .customer
                                    ?.email ||
                                order
                                    .shippingAddress
                                    ?.phone ||
                                "-"}
                        </p>
                    </div>
                </div>
            </td>

            {/* Items */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package
                        size={16}
                        className="text-slate-400"
                    />

                    <span>
                        {itemsCount}{" "}
                        {itemsCount ===
                            1
                            ? "item"
                            : "items"}
                    </span>
                </div>
            </td>

            {/* Total */}
            <td className="px-5 py-4">
                <span className="text-sm font-semibold text-slate-900">
                    ₹
                    {Number(
                        order.totalAmount ??
                        order.total ??
                        0
                    ).toLocaleString(
                        "en-IN"
                    )}
                </span>
            </td>

            {/* Payment */}
            <td className="px-5 py-4">
                <PaymentBadge
                    status={
                        order.paymentStatus || "pending"
                    }
                />
            </td>

            {/* Status */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <select
                        value={order.orderStatus || "PENDING"}
                        disabled={
                            isStatusUpdating ||
                            order.orderStatus === "CANCELLED" ||
                            order.orderStatus === "DELIVERED"
                        }
                        onChange={(e) =>
                            onStatusChange(
                                order._id,
                                e.target.value
                            )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${getOrderStatusSelectClass(
                            order.orderStatus
                        )}`}
                    >
                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="CONFIRMED">
                            Confirmed
                        </option>

                        <option value="PROCESSING">
                            Processing
                        </option>

                        <option value="SHIPPED">
                            Shipped
                        </option>

                        <option value="DELIVERED">
                            Delivered
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>

                    {isStatusUpdating && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                    )}
                </div>
            </td>

            {/* Date */}
            {/* <td className="px-5 py-4 text-sm text-slate-500">
                {formatDate(
                    order.createdAt
                )}
            </td> */}

            {/* Action */}
            <td className="px-5 py-4 text-right">
                <button
                    type="button"
                    onClick={onView}
                    title="View Order"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                    <Eye
                        size={17}
                    />
                </button>
            </td>
        </tr>
    );
}

function PaymentBadge({
    status,
}) {
    const normalized =
        String(status)
            .toLowerCase();

    const config = {
        paid: {
            label: "Paid",
            className:
                "bg-green-50 text-green-700 border-green-200",
            icon: CheckCircle2,
        },

        success: {
            label: "Paid",
            className:
                "bg-green-50 text-green-700 border-green-200",
            icon: CheckCircle2,
        },

        failed: {
            label: "Failed",
            className:
                "bg-red-50 text-red-700 border-red-200",
            icon: XCircle,
        },

        refunded: {
            label: "Refunded",
            className:
                "bg-purple-50 text-purple-700 border-purple-200",
            icon: RefreshCw,
        },

        pending: {
            label: "Pending",
            className:
                "bg-amber-50 text-amber-700 border-amber-200",
            icon: Clock3,
        },
    };

    const current =
        config[normalized] ||
        config.pending;

    const Icon =
        current.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${current.className}`}
        >
            <Icon size={13} />
            {current.label}
        </span>
    );
}

function OrderStatusBadge({
    status,
}) {
    const normalized =
        String(status)
            .toLowerCase();

    const config = {
        pending: {
            label: "Pending",
            className:
                "bg-amber-50 text-amber-700 border-amber-200",
            icon: Clock3,
        },

        confirmed: {
            label: "Confirmed",
            className:
                "bg-blue-50 text-blue-700 border-blue-200",
            icon: CheckCircle2,
        },

        processing: {
            label: "Processing",
            className:
                "bg-indigo-50 text-indigo-700 border-indigo-200",
            icon: Package,
        },

        shipped: {
            label: "Shipped",
            className:
                "bg-cyan-50 text-cyan-700 border-cyan-200",
            icon: Truck,
        },

        delivered: {
            label: "Delivered",
            className:
                "bg-green-50 text-green-700 border-green-200",
            icon: CheckCircle2,
        },

        cancelled: {
            label: "Cancelled",
            className:
                "bg-red-50 text-red-700 border-red-200",
            icon: XCircle,
        },
    };

    const current =
        config[normalized] ||
        config.pending;

    const Icon =
        current.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${current.className}`}
        >
            <Icon size={13} />
            {current.label}
        </span>
    );
}

function EmptyOrders() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <ShoppingBag
                    size={28}
                    className="text-slate-300"
                />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No orders found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
                Try changing your
                search or filters.
            </p>
        </div>
    );
}

function OrderTableSkeleton() {
    return Array.from({
        length: 6,
    }).map((_, index) => (
        <tr key={index}>
            {Array.from({
                length: 8,
            }).map(
                (
                    _,
                    cellIndex
                ) => (
                    <td
                        key={
                            cellIndex
                        }
                        className="px-5 py-5"
                    >
                        <div className="h-4 animate-pulse rounded bg-slate-100" />
                    </td>
                )
            )}
        </tr>
    ));
}

function formatDate(date) {
    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default Orders;

function getOrderStatusSelectClass(status) {
    switch (String(status || "").toUpperCase()) {
        case "PENDING":
            return `
                border-amber-200
                bg-amber-50
                text-amber-700
                focus:border-amber-400
                focus:ring-amber-100
            `;

        case "CONFIRMED":
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
                focus:border-blue-400
                focus:ring-blue-100
            `;

        case "PROCESSING":
            return `
                border-indigo-200
                bg-indigo-50
                text-indigo-700
                focus:border-indigo-400
                focus:ring-indigo-100
            `;

        case "SHIPPED":
            return `
                border-cyan-200
                bg-cyan-50
                text-cyan-700
                focus:border-cyan-400
                focus:ring-cyan-100
            `;

        case "DELIVERED":
            return `
                border-green-200
                bg-green-50
                text-green-700
                focus:border-green-400
                focus:ring-green-100
            `;

        case "CANCELLED":
            return `
                border-red-200
                bg-red-50
                text-red-700
                focus:border-red-400
                focus:ring-red-100
            `;

        default:
            return `
                border-slate-200
                bg-white
                text-slate-700
                focus:border-slate-400
                focus:ring-slate-100
            `;
    }
}