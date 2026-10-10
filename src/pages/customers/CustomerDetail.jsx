import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    CalendarDays,
    ShieldCheck,
    ShoppingBag,
    MapPin,
    Hash,
    Pencil,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useQuery,
} from "@tanstack/react-query";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";

import customerService from "../../services/customer.service";


/*
 * Format date.
 */
const formatDate = (
    date
) => {
    if (!date) {
        return "-";
    }

    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


/*
 * Format date and time.
 */
const formatDateTime = (
    date
) => {
    if (!date) {
        return "-";
    }

    return new Date(
        date
    ).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


/*
 * Get initials.
 */
const getInitials = (
    name
) => {
    if (!name) {
        return "CU";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            (part) =>
                part.charAt(0)
                    .toUpperCase()
        )
        .join("");
};


/*
 * Detail item.
 */
const DetailItem = ({
    icon: Icon,
    label,
    value,
}) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon size={17} />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
};


/*
 * Loading skeleton.
 */
const CustomerDetailSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">

            <div className="h-8 w-48 rounded-lg bg-slate-200" />

            <div className="grid gap-6 lg:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-slate-200" />

                        <div className="space-y-2">
                            <div className="h-5 w-40 rounded bg-slate-200" />
                            <div className="h-4 w-56 rounded bg-slate-200" />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        <div className="h-12 rounded bg-slate-100" />
                        <div className="h-12 rounded bg-slate-100" />
                        <div className="h-12 rounded bg-slate-100" />
                        <div className="h-12 rounded bg-slate-100" />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="h-5 w-32 rounded bg-slate-200" />

                    <div className="mt-6 space-y-5">
                        <div className="h-10 rounded bg-slate-100" />
                        <div className="h-10 rounded bg-slate-100" />
                        <div className="h-10 rounded bg-slate-100" />
                    </div>
                </div>

            </div>
        </div>
    );
};


/*
 * Customer detail page.
 */
const CustomerDetail = () => {
    const navigate = useNavigate();

    const {
        id,
    } = useParams();


    /*
     * Load customer.
     */
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            "customer",
            id,
        ],

        queryFn: () =>
            customerService.getCustomerById(
                id
            ),

        enabled: Boolean(id),
    });


    /*
     * API response:
     *
     * {
     *   success: true,
     *   data: {
     *      customer: {}
     *   }
     * }
     */
    const customer =
        data?.data?.customer ||
        data?.customer;


    /*
     * Loading.
     */
    if (isLoading) {
        return (
            <div>
                <PageHeader
                    title="Customer Details"
                    description="View customer information."
                />

                <CustomerDetailSkeleton />
            </div>
        );
    }


    /*
     * Error.
     */
    if (isError || !customer) {
        return (
            <div>
                <PageHeader
                    title="Customer Details"
                    description="Unable to load customer information."
                    action={
                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate(
                                    "/admin/customers"
                                )
                            }
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Back to Customers
                        </Button>

                        
                    }
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <User size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-red-700">
                                Customer could not be loaded
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {error?.response?.data?.message ||
                                    "The requested customer was not found."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    const name =
        customer.name ||
        customer.fullName ||
        "Customer";

    const email =
        customer.email || "-";

    const phone =
        customer.phone || "-";

    const role =
        customer.role || "USER";

    const createdAt =
        customer.createdAt;

    const updatedAt =
        customer.updatedAt;


    return (
        <div>

            <PageHeader
                title="Customer Details"
                description="View customer information and account details."
                action={
                   <div className="flex items-center gap-2">

                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate(
                                        `/admin/customers/${id}/edit`
                                    )
                                }
                            >
                                <Pencil size={16} />

                                Edit Customer
                            </Button>

                        </div>

                }
            />


            {/* Customer header */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                            {getInitials(
                                name
                            )}
                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <h2 className="text-xl font-semibold text-slate-900">
                                    {name}
                                </h2>

                                {
                                    customer?.isActive 
                                    ?
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    Active
                                </span>
                                :
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                                    Inactive
                                </span>
                                }

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                {email}
                            </p>

                        </div>

                    </div>


                    {/* Customer ID */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">

                        <Hash size={14} />

                        <span className="max-w-48 truncate">
                            {customer._id ||
                                customer.id ||
                                "-"}
                        </span>

                    </div>

                </div>

            </div>


            {/* Main content */}
            <div className="grid gap-6 lg:grid-cols-3">


                {/* Customer information */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

                    <div className="border-b border-slate-200 px-6 py-4">

                        <h3 className="text-sm font-semibold text-slate-900">
                            Customer Information
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Basic information associated with this account.
                        </p>

                    </div>


                    <div className="grid gap-6 p-6 sm:grid-cols-2">

                        <DetailItem
                            icon={User}
                            label="Full Name"
                            value={name}
                        />

                        <DetailItem
                            icon={Mail}
                            label="Email Address"
                            value={email}
                        />

                        <DetailItem
                            icon={Phone}
                            label="Phone Number"
                            value={phone}
                        />

                        <DetailItem
                            icon={ShieldCheck}
                            label="Account Role"
                            value={role}
                        />

                        <DetailItem
                            icon={CalendarDays}
                            label="Joined On"
                            value={formatDate(
                                createdAt
                            )}
                        />

                        <DetailItem
                            icon={CalendarDays}
                            label="Last Updated"
                            value={formatDateTime(
                                updatedAt
                            )}
                        />

                    </div>

                </div>


                {/* Account summary */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-6 py-4">

                        <h3 className="text-sm font-semibold text-slate-900">
                            Account Summary
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Customer account overview.
                        </p>

                    </div>


                    <div className="space-y-5 p-6">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <User size={17} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Account Type
                                    </p>

                                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                        {role}
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <CalendarDays size={17} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Joined
                                    </p>

                                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                        {formatDate(
                                            createdAt
                                        )}
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <ShoppingBag size={17} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Orders
                                    </p>

                                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                        {customer.orderCount ??
                                            0}
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <MapPin size={17} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Address
                                    </p>

                                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                        {customer.address
                                            ? "Available"
                                            : "Not available"}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* Contact section */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-4">

                    <h3 className="text-sm font-semibold text-slate-900">
                        Contact Details
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        Customer contact information.
                    </p>

                </div>


                <div className="grid gap-6 p-6 sm:grid-cols-2">

                    <DetailItem
                        icon={Mail}
                        label="Email"
                        value={email}
                    />

                    <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={phone}
                    />

                </div>

            </div>

        </div>
    );
};

export default CustomerDetail;