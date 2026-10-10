"use client";

import { useMemo } from "react";
import {
    FiArrowLeft,
    FiBox,
    FiCalendar,
    FiCheck,
    FiClock,
    FiCreditCard,
    FiHash,
    FiMapPin,
    FiPackage,
    FiPhone,
    FiTruck,
    FiUser,
    FiMail,
    FiX,
} from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import orderService from "../../services/order.service";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import { getImageUrl } from "../../utils/getImageUrl";
import { formatCurrency } from "../../utils/formatCurrency";

export default function OrderView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["order", id],
        queryFn: () => orderService.getOrderById(id),
        enabled: Boolean(id),
    });

    const order = data?.data?.order;

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            console.log("Mutation started:", {
                id,
                status,
            });

            return orderService.updateOrderStatus(
                id,
                status
            );
        },

        onSuccess: (response) => {
            console.log(
                "Status update response:",
                response
            );

            toast.success(
                "Order status updated successfully"
            );

            queryClient.invalidateQueries({
                queryKey: ["order", id],
            });

            queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
        },

        onError: (error) => {
            console.error(
                "Order status update error:",
                error
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update order status"
            );
        },
    });

    const status = order?.orderStatus || "PENDING";

    const customer = order?.user || {};

    const items = order?.items || [];

    const subtotal = Number(
        order?.subtotal ??
        order?.subTotal ??
        order?.totalAmount ??
        0
    );

    const shippingAmount = Number(
        order?.shippingAmount ??
        order?.shippingCost ??
        order?.shipping ??
        0
    );

    const discount = Number(
        order?.discountAmount ??
        order?.discount ??
        0
    );

    const total = Number(
        order?.totalAmount ??
        order?.total ??
        subtotal + shippingAmount - discount
    );

    const paymentStatus =
        order?.paymentStatus ||
        "PENDING";

    const paymentMethod =
        order?.paymentMethod ||
        "COD";

    const orderNumber =
        order?.orderNumber ||
        order?.orderId ||
        order?._id;

    const formattedDate = useMemo(() => {
        if (!order?.createdAt) return "-";

        return new Date(
            order.createdAt
        ).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [order?.createdAt]);

    const handleStatusChange = (newStatus) => {
        console.log("Status selected:", newStatus);

        if (newStatus === status) {
            return;
        }

        updateStatusMutation.mutate({
            id,
            status: newStatus,
        });
    };

    if (isLoading) {
        return <OrderViewSkeleton />;
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Order"
                    description="Unable to load order details."
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <div className="text-sm font-medium text-red-700">
                        {error?.response?.data?.message ||
                            "Failed to load order."}
                    </div>

                    <button
                        onClick={() => refetch()}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Order not found"
                    description="The requested order could not be found."
                />

                <Button
                    onClick={() =>
                        navigate("/admin/orders")
                    }
                >
                    <FiArrowLeft />
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <FiArrowLeft size={18} />
                    </button>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-900">
                                Order #{orderNumber}
                            </h1>

                            <StatusBadge
                                status={status}
                            />
                        </div>

                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <FiCalendar size={14} />
                            {formattedDate}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={status}
                        disabled={
                            updateStatusMutation.isPending ||
                            status === "CANCELLED" ||
                            status === "DELIVERED"
                        }
                        onChange={(e) =>
                            handleStatusChange(e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                </div>
            </div>

            {/* Main Grid */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left */}

                <div className="space-y-6 xl:col-span-2">
                    {/* Order Items */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <FiPackage
                                    className="text-red-600"
                                    size={18}
                                />

                                <h2 className="text-sm font-bold text-slate-900">
                                    Order Items
                                </h2>

                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                    {items.length}
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {items.length > 0 ? (
                                items.map(
                                    (item, index) => (
                                        <OrderItem
                                            key={
                                                item?._id ||
                                                item?.product?._id ||
                                                index
                                            }
                                            item={item}
                                        />
                                    )
                                )
                            ) : (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    No items found.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Customer */}

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionTitle
                            icon={FiUser}
                            title="Customer Information"
                        />

                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <InfoItem
                                icon={FiUser}
                                label="Name"
                                value={
                                    customer?.name ||
                                    order?.shippingAddress
                                        ?.fullName ||
                                    "-"
                                }
                            />

                            <InfoItem
                                icon={FiMail}
                                label="Email"
                                value={
                                    customer?.email ||
                                    "-"
                                }
                            />

                            <InfoItem
                                icon={FiPhone}
                                label="Phone"
                                value={
                                    customer?.phone ||
                                    order?.shippingAddress
                                        ?.phone ||
                                    "-"
                                }
                            />
                        </div>
                    </section>

                    {/* Shipping Address */}

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionTitle
                            icon={FiMapPin}
                            title="Shipping Address"
                        />

                        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <ShippingAddress
                                address={
                                    order?.shippingAddress
                                }
                            />
                        </div>
                    </section>
                </div>

                {/* Right */}

                <div className="space-y-6">
                    {/* Status */}

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionTitle
                            icon={FiClock}
                            title="Order Status"
                        />

                        <div className="mt-5 space-y-3">
                            <StatusStep
                                label="Order Placed"
                                active={true}
                                completed={true}
                            />

                            <StatusStep
                                label="Processing"
                                active={[
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED",
                                ].includes(
                                    status
                                )}
                                completed={[
                                    "SHIPPED",
                                    "DELIVERED",
                                ].includes(
                                    status
                                )}
                            />

                            <StatusStep
                                label="Shipped"
                                active={[
                                    "SHIPPED",
                                    "DELIVERED",
                                ].includes(
                                    status
                                )}
                                completed={
                                    status ===
                                    "DELIVERED"
                                }
                            />

                            <StatusStep
                                label="Delivered"
                                active={
                                    status ===
                                    "DELIVERED"
                                }
                                completed={
                                    status ===
                                    "DELIVERED"
                                }
                            />

                            {status ===
                                "CANCELLED" && (
                                    <StatusStep
                                        label="Cancelled"
                                        active={true}
                                        completed={true}
                                        cancelled
                                    />
                                )}
                        </div>
                    </section>

                    {/* Payment */}

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionTitle
                            icon={FiCreditCard}
                            title="Payment"
                        />

                        <div className="mt-5 space-y-4">
                            <InfoItem
                                label="Method"
                                value={paymentMethod}
                            />

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Payment Status
                                </p>

                                <div className="mt-1">
                                    <PaymentBadge
                                        status={
                                            paymentStatus
                                        }
                                    />
                                </div>
                            </div>

                            {order?.paymentId && (
                                <InfoItem
                                    icon={FiHash}
                                    label="Payment ID"
                                    value={
                                        order.paymentId
                                    }
                                />
                            )}
                        </div>
                    </section>

                    {/* Summary */}

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <SectionTitle
                            icon={FiBox}
                            title="Order Summary"
                        />

                        <div className="mt-5 space-y-3">
                            <SummaryRow
                                label="Subtotal"
                                value={formatCurrency(
                                    subtotal
                                )}
                            />

                            <SummaryRow
                                label="Shipping"
                                value={formatCurrency(
                                    shippingAmount
                                )}
                            />

                            <SummaryRow
                                label="Discount"
                                value={`- ${formatCurrency(
                                    discount
                                )}`}
                            />

                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">
                                        Total
                                    </span>

                                    <span className="text-lg font-bold text-red-600">
                                        {formatCurrency(
                                            total
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({
    icon: Icon,
    title,
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon
                size={18}
                className="text-red-600"
            />

            <h2 className="text-sm font-bold text-slate-900">
                {title}
            </h2>
        </div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <div className="mt-1 flex items-center gap-2">
                {Icon && (
                    <Icon
                        size={15}
                        className="text-slate-400"
                    />
                )}

                <p className="break-all text-sm font-medium text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
                {label}
            </span>

            <span className="font-medium text-slate-700">
                {value}
            </span>
        </div>
    );
}

function StatusBadge({
    status,
}) {
    const styles = {
        PENDING:
            "bg-amber-50 text-amber-700 border-amber-200",
        PROCESSING:
            "bg-blue-50 text-blue-700 border-blue-200",
        SHIPPED:
            "bg-indigo-50 text-indigo-700 border-indigo-200",
        DELIVERED:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        CANCELLED:
            "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ||
                "border-slate-200 bg-slate-50 text-slate-600"
                }`}
        >
            {status}
        </span>
    );
}

function PaymentBadge({
    status,
}) {
    const normalized =
        String(status).toUpperCase();

    const styles = {
        PAID:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        PENDING:
            "bg-amber-50 text-amber-700 border-amber-200",
        FAILED:
            "bg-red-50 text-red-700 border-red-200",
        REFUNDED:
            "bg-purple-50 text-purple-700 border-purple-200",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[normalized] ||
                "border-slate-200 bg-slate-50 text-slate-600"
                }`}
        >
            {normalized}
        </span>
    );
}

function OrderItem({
    item,
}) {
    const product =
        item?.product || {};

    const name =
        item?.name ||
        product?.name ||
        "Product";

    const image =
        item?.img ||
        item?.image ||
        product?.img ||
        product?.images?.[0];

    const quantity =
        item?.quantity || 1;

    const price = Number(
        item?.price ||
        item?.unitPrice ||
        0
    );

    const itemTotal =
        Number(
            item?.total ||
            item?.subtotal ||
            price * quantity
        );

    return (
        <div className="flex gap-4 p-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {image ? (
                    <img
                        src={getImageUrl(image)}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <FiPackage
                            size={24}
                        />
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                    {name}
                </h3>

                {product?.sku && (
                    <p className="mt-1 text-xs text-slate-400">
                        SKU: {product.sku}
                    </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>
                        Qty:{" "}
                        <strong className="text-slate-700">
                            {quantity}
                        </strong>
                    </span>

                    <span>
                        Price:{" "}
                        <strong className="text-slate-700">
                            {formatCurrency(
                                price
                            )}
                        </strong>
                    </span>
                </div>
            </div>

            <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(
                        itemTotal
                    )}
                </p>
            </div>
        </div>
    );
}

function ShippingAddress({
    address,
}) {
    if (!address) {
        return (
            <p className="text-sm text-slate-500">
                No shipping address available.
            </p>
        );
    }

    return (
        <div className="space-y-1 text-sm text-slate-600">
            {address.fullName && (
                <p className="font-semibold text-slate-900">
                    {address.fullName}
                </p>
            )}

            {address.phone && (
                <p>{address.phone}</p>
            )}

            {address.addressLine1 && (
                <p>{address.addressLine1}</p>
            )}

            {address.addressLine2 && (
                <p>{address.addressLine2}</p>
            )}

            <p>
                {[
                    address.city,
                    address.state,
                    address.pincode ||
                    address.postalCode,
                ]
                    .filter(Boolean)
                    .join(", ")}
            </p>

            {address.country && (
                <p>{address.country}</p>
            )}
        </div>
    );
}

function StatusStep({
    label,
    active,
    completed,
    cancelled = false,
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${cancelled
                    ? "border-red-200 bg-red-50 text-red-600"
                    : completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : active
                            ? "border-blue-200 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-slate-50 text-slate-300"
                    }`}
            >
                {cancelled ? (
                    <FiX size={15} />
                ) : completed ? (
                    <FiCheck size={15} />
                ) : active ? (
                    <FiClock size={15} />
                ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                )}
            </div>

            <span
                className={`text-sm font-medium ${active || completed
                    ? "text-slate-800"
                    : "text-slate-400"
                    }`}
            >
                {label}
            </span>
        </div>
    );
}

function OrderViewSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 w-64 rounded-lg bg-slate-200" />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <SkeletonCard height="h-72" />
                    <SkeletonCard height="h-40" />
                    <SkeletonCard height="h-48" />
                </div>

                <div className="space-y-6">
                    <SkeletonCard height="h-64" />
                    <SkeletonCard height="h-48" />
                    <SkeletonCard height="h-56" />
                </div>
            </div>
        </div>
    );
}

function SkeletonCard({
    height,
}) {
    return (
        <div
            className={`rounded-xl border border-slate-200 bg-white p-5 ${height}`}
        >
            <div className="h-5 w-32 rounded bg-slate-200" />

            <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
                <div className="h-4 w-3/5 rounded bg-slate-100" />
            </div>
        </div>
    );
}