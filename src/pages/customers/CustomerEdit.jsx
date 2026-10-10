import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Lock,
    ShieldCheck,
    Eye,
    EyeOff,
    UserRoundPen,
} from "lucide-react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";

import customerService from "../../services/customer.service";


/*
|--------------------------------------------------------------------------
| Input Component
|--------------------------------------------------------------------------
*/

function InputField({
    label,
    icon: Icon,
    error,
    ...props
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}

                <input
                    {...props}
                    className={`
                        w-full rounded-xl border
                        bg-white py-3
                        ${Icon ? "pl-10" : "px-4"}
                        pr-4 text-sm text-slate-800
                        outline-none transition
                        placeholder:text-slate-400
                        focus:border-slate-400
                        focus:ring-4
                        focus:ring-slate-100
                        ${
                            error
                                ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                                : "border-slate-200"
                        }
                    `}
                />
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Page Skeleton
|--------------------------------------------------------------------------
*/

function CustomerEditSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="space-y-2"
                            >
                                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

export default function CustomerEdit() {

    const {
        id,
    } = useParams();

    const navigate = useNavigate();

    const queryClient =
        useQueryClient();


    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    const [
        errors,
        setErrors,
    ] = useState({});


    const [
        form,
        setForm,
    ] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        isActive: true,
    });


    /*
    |--------------------------------------------------------------------------
    | Get Customer
    |--------------------------------------------------------------------------
    */

    const {
        data,
        isLoading,
        isError,
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


    const customer =
        data?.data?.customer ||
        data?.customer;


    /*
    |--------------------------------------------------------------------------
    | Set Form
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!customer) {
            return;
        }

        setForm({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            password: "",
            isActive:
                customer.isActive !== false,
        });

    }, [customer]);


    /*
    |--------------------------------------------------------------------------
    | Handle Input
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;

        setForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

        setErrors(
            (previous) => ({
                ...previous,
                [name]: "",
            })
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {

        const nextErrors = {};


        if (!form.name.trim()) {
            nextErrors.name =
                "Name is required.";
        } else if (
            form.name.trim().length < 2
        ) {
            nextErrors.name =
                "Name must be at least 2 characters.";
        }


        if (!form.email.trim()) {
            nextErrors.email =
                "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email
            )
        ) {
            nextErrors.email =
                "Enter a valid email address.";
        }


        if (
            form.password &&
            form.password.length < 6
        ) {
            nextErrors.password =
                "Password must be at least 6 characters.";
        }


        setErrors(
            nextErrors
        );

        return (
            Object.keys(
                nextErrors
            ).length === 0
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Update Mutation
    |--------------------------------------------------------------------------
    */

    const updateMutation =
        useMutation({

            mutationFn: () =>
                customerService.updateCustomer(
                    id,
                    {
                        name:
                            form.name.trim(),

                        email:
                            form.email
                                .trim()
                                .toLowerCase(),

                        phone:
                            form.phone.trim(),

                        password:
                            form.password.trim(),

                        isActive:
                            form.isActive,
                    }
                ),

            onSuccess: (
                response
            ) => {

                toast.success(
                    response?.message ||
                    "Customer updated successfully."
                );


                queryClient.invalidateQueries({
                    queryKey: [
                        "customer",
                        id,
                    ],
                });


                queryClient.invalidateQueries({
                    queryKey: [
                        "customers",
                    ],
                });


                navigate(
                    `/admin/customers/${id}`
                );
            },

            onError: (
                error
            ) => {

                const response =
                    error?.response?.data;

                const message =
                    response?.message ||
                    "Failed to update customer.";

                toast.error(
                    message
                );
            },

        });


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event
    ) => {

        event.preventDefault();


        if (
            updateMutation.isPending
        ) {
            return;
        }


        if (!validateForm()) {
            return;
        }


        updateMutation.mutate();
    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (isLoading) {

        return (
            <div className="space-y-6">

                <PageHeader
                    title="Edit Customer"
                    description="Update customer information"
                />

                <CustomerEditSkeleton />

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (
        isError ||
        !customer
    ) {

        return (
            <div className="space-y-6">

                <PageHeader
                    title="Edit Customer"
                    description="Update customer information"
                />

                <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">

                        <User
                            size={22}
                            className="text-red-500"
                        />

                    </div>

                    <h2 className="text-lg font-semibold text-slate-800">
                        Customer not found
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        The customer you are trying
                        to edit could not be found.
                    </p>

                    <div className="mt-5 flex justify-center">

                        <Button
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

                    </div>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-6">

            <PageHeader
                title="Edit Customer"
                description="Update customer account information"
            />


            {/* Back */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/admin/customers/${id}`
                    )
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft
                    size={17}
                />

                Back to Customer
            </button>


            {/* Customer Header */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">

                            {(
                                customer.name ||
                                "U"
                            )
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                {customer.name ||
                                    "Customer"}
                            </h2>

                            <p className="mt-0.5 text-sm text-slate-500">
                                {customer.email}
                            </p>

                        </div>

                    </div>


                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">

                        <ShieldCheck
                            size={14}
                        />

                        Customer Account

                    </div>

                </div>

            </div>


            {/* Form */}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* Personal Information */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-6 py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                                <UserRoundPen
                                    size={19}
                                    className="text-slate-700"
                                />

                            </div>

                            <div>

                                <h2 className="font-semibold text-slate-900">
                                    Personal Information
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Update basic customer details.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-6">

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <InputField
                                label="Full Name"
                                name="name"
                                type="text"
                                placeholder="Enter customer name"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                icon={User}
                                error={
                                    errors.name
                                }
                            />


                            <InputField
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="Enter email address"
                                value={form.email}
                                onChange={
                                    handleChange
                                }
                                icon={Mail}
                                error={
                                    errors.email
                                }
                            />


                            <InputField
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                value={form.phone}
                                onChange={
                                    handleChange
                                }
                                icon={Phone}
                                error={
                                    errors.phone
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* Password */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-6 py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                                <Lock
                                    size={19}
                                    className="text-slate-700"
                                />

                            </div>

                            <div>

                                <h2 className="font-semibold text-slate-900">
                                    Change Password
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Leave blank to keep the current password.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-6">

                        <div className="max-w-xl">

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                New Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter new password"
                                    value={
                                        form.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={`
                                        w-full rounded-xl border
                                        bg-white py-3
                                        pl-10 pr-11
                                        text-sm text-slate-800
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-slate-400
                                        focus:ring-4
                                        focus:ring-slate-100
                                        ${
                                            errors.password
                                                ? "border-red-300"
                                                : "border-slate-200"
                                        }
                                    `}
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (
                                                value
                                            ) =>
                                                !value
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                >

                                    {showPassword ? (
                                        <EyeOff
                                            size={18}
                                        />
                                    ) : (
                                        <Eye
                                            size={18}
                                        />
                                    )}

                                </button>

                            </div>


                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500">
                                    {
                                        errors.password
                                    }
                                </p>
                            )}

                        </div>

                    </div>

                </div>


                {/* Account Status */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-6 py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                                <ShieldCheck
                                    size={19}
                                    className="text-slate-700"
                                />

                            </div>

                            <div>

                                <h2 className="font-semibold text-slate-900">
                                    Account Status
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Control whether this customer can use their account.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-6">

                        <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">

                            <div>

                                <p className="text-sm font-semibold text-slate-800">
                                    Active Account
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Inactive customers cannot use their account.
                                </p>

                            </div>


                            <button
                                type="button"
                                role="switch"
                                aria-checked={
                                    form.isActive
                                }
                                onClick={() =>
                                    setForm(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            isActive:
                                                !previous.isActive,
                                        })
                                    )
                                }
                                className={`
                                    relative h-6 w-11
                                    rounded-full
                                    transition
                                    ${
                                        form.isActive
                                            ? "bg-green-600"
                                            : "bg-slate-300"
                                    }
                                `}
                            >

                                <span
                                    className={`
                                        absolute top-1
                                        h-4 w-4
                                        rounded-full
                                        bg-white
                                        shadow
                                        transition
                                        ${
                                            form.isActive
                                                ? "left-6"
                                                : "left-1"
                                        }
                                    `}
                                />

                            </button>

                        </label>

                    </div>

                </div>


                {/* Actions */}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                `/admin/customers/${id}`
                            )
                        }
                        disabled={
                            updateMutation.isPending
                        }
                    >
                        Cancel
                    </Button>


                    <Button
                        type="submit"
                        disabled={
                            updateMutation.isPending
                        }
                    >

                        {updateMutation.isPending ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                Saving...
                            </>
                        ) : (
                            <>
                                <Save
                                    size={17}
                                />

                                Save Changes
                            </>
                        )}

                    </Button>

                </div>

            </form>

        </div>
    );
}