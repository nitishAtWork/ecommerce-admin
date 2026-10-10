import { useEffect, useState } from "react";

import {
    Search,
    Eye,
    Users,
    Mail,
    Phone,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Pencil
} from "lucide-react";
import { toast } from "sonner";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import useDebounce from "../../hooks/useDebounce";
import customerService from "../../services/customer.service";

const Customers = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [status, setStatus] =
        useState("all");

    const queryClient =
        useQueryClient();

    const toggleStatusMutation =
        useMutation({
            mutationFn: (customerId) =>
                customerService.toggleCustomerStatus(
                    customerId
                ),

            onSuccess: (
                response
            ) => {
                toast.success(
                    response?.message ||
                    "Customer status updated successfully."
                );

                queryClient.invalidateQueries({
                    queryKey: [
                        "customers",
                    ],
                });
            },

            onError: (
                error
            ) => {
                toast.error(
                    error?.response?.data
                        ?.message ||
                    "Failed to update customer status."
                );
            },
        });

    const [page, setPage] = useState(1);

    const [limit] = useState(10);

    const debouncedSearch = useDebounce(
        search,
        500
    );

    /*
     * Reset page when search changes
     */
    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        status,
    ]);

    /*
     * Customers query
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
            "customers",
            {
                page,
                limit,
                search: debouncedSearch,
                status,
            },
        ],

        queryFn: () =>
            customerService.getCustomers({
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
                            status === "active",
                    }
                    : {}),
            }),
    });

    /*
     * API response
     *
     * Expected:
     *
     * {
     *   success: true,
     *   data: {
     *      users: [],
     *      pagination: {}
     *   }
     * }
     */
    const customers =
        data?.data?.users ||
        data?.data?.customers ||
        data?.users ||
        data?.customers ||
        [];

    const pagination =
        data?.data?.pagination ||
        data?.pagination || {
            page: 1,
            limit,
            total: 0,
            totalPages: 1,
        };

    const hasPreviousPage =
        pagination.page > 1;

    const hasNextPage =
        pagination.page <
        pagination.totalPages;


    return (
        <div>
            <PageHeader
                title="Customers"
                description="Manage and view your ecommerce customers."
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
                                    event.target.value
                                )
                            }
                            placeholder="Search by name, email or phone..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>


                    {/* Status */}

                    <div className="relative">

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            className="h-full min-w-[150px] appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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


                    {/* Refresh */}

                    <button
                        type="button"
                        onClick={() =>
                            refetch()
                        }
                        disabled={isFetching}
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
                        {error?.response?.data
                            ?.message ||
                            "Failed to load customers."}
                    </span>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Customers Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Customer
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Email
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Phone
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Joined
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <CustomerTableSkeleton />
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-12"
                                    >
                                        <EmptyCustomers />
                                    </td>
                                </tr>
                            ) : (
                                customers.map(
                                    (customer) => (
                                        <CustomerRow
                                            key={customer._id}
                                            customer={customer}
                                            onView={() =>
                                                navigate(
                                                    `/admin/customers/${customer._id}`
                                                )
                                            }
                                            onToggleStatus={() =>
                                                toggleStatusMutation.mutate(
                                                    customer._id
                                                )
                                            }
                                            isTogglePending={
                                                toggleStatusMutation.isPending &&
                                                toggleStatusMutation.variables ===
                                                customer._id
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
                    customers.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {(
                                        pagination.page -
                                        1
                                    ) *
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
                                    {pagination.total}
                                </span>{" "}
                                customers
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        !hasPreviousPage ||
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
                                    <span className="font-medium text-slate-900">
                                        {
                                            pagination.page
                                        }
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium text-slate-900">
                                        {
                                            pagination.totalPages
                                        }
                                    </span>
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        !hasNextPage ||
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
        </div>
    );
};

export default Customers;

function CustomerRow({
    customer,
    onView,
    onToggleStatus,
    isTogglePending,
}) {

    const navigate = useNavigate();

    const name =
        customer.name ||
        customer.fullName ||
        "Unknown Customer";

    const email =
        customer.email || "-";

    const phone =
        customer.phone || "-";

    return (
        <tr className="transition hover:bg-slate-50/70">
            {/* Customer */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {getInitials(name)}
                    </div>

                    <div className="min-w-0">
                        <p className="max-w-56 truncate text-sm font-semibold text-slate-900">
                            {name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            #{customer._id?.slice(-8)}
                        </p>
                    </div>
                </div>
            </td>

            {/* Email */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail
                        size={15}
                        className="text-slate-400"
                    />

                    <span className="max-w-64 truncate">
                        {email}
                    </span>
                </div>
            </td>

            {/* Phone */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone
                        size={15}
                        className="text-slate-400"
                    />

                    {phone}
                </div>
            </td>

            {/* Joined */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays
                        size={15}
                        className="text-slate-400"
                    />

                    {formatDate(
                        customer.createdAt
                    )}
                </div>
            </td>

            {/* Status */}

            <td className="px-5 py-4">

                <StatusToggle
                    customer={customer}
                    onToggle={onToggleStatus}
                    isPending={isTogglePending}
                />

            </td>

            {/* Action */}
            <td className="px-5 py-4 text-right">
                <button
                    type="button"
                    onClick={onView}
                    title="View Customer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                    <Eye size={17} />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/admin/customers/${customer._id}/edit`
                        )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <Pencil size={14} />

                    Edit
                </button>
            </td>
        </tr>
    );
}

function EmptyCustomers() {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <Users
                    size={28}
                    className="text-slate-300"
                />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No customers found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
                Try changing your search.
            </p>
        </div>
    );
}

function CustomerTableSkeleton() {
    return Array.from({
        length: 6,
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

function getInitials(name) {
    if (!name) return "C";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}

function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}
function StatusToggle({
    customer,
    onToggle,
    isPending,
}) {
    const isActive = customer.isActive === true;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={
                isActive
                    ? "Deactivate customer"
                    : "Activate customer"
            }
            disabled={isPending}
            onClick={onToggle}
            className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {/* Toggle */}
            <span
                className={`
                    relative
                    h-6 w-11
                    shrink-0
                    rounded-full
                    transition-colors
                    duration-200
                    ease-in-out
                    ${
                        isActive
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                    }
                `}
            >
                {/* Knob */}
                <span
                    className={`
                        absolute
                        left-1
                        top-1
                        h-4 w-4
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                        duration-200
                        ease-in-out
                        ${
                            isActive
                                ? "translate-x-5"
                                : "translate-x-0"
                        }
                    `}
                />
            </span>

            {/* Status */}
            <span
                className={`
                    text-xs font-semibold
                    ${
                        isActive
                            ? "text-emerald-600"
                            : "text-slate-500"
                    }
                `}
            >
                {isActive ? "Active" : "Inactive"}
            </span>
        </button>
    );
}