import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Globe2,
} from "lucide-react";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    useForm,
} from "react-hook-form";

import {
    z,
} from "zod";

import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import countryService from "../../services/country.service";

const countrySchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            2,
            "Country name is required."
        )
        .max(
            100,
            "Country name cannot exceed 100 characters."
        ),
});

function EditCountry() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [
        isActive,
        setIsActive,
    ] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(
            countrySchema
        ),
        defaultValues: {
            name: "",
        },
    });

    /**
     * ----------------------------------------------------------------------
     * Get Country
     * ----------------------------------------------------------------------
     */

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [
            "country",
            id,
        ],

        queryFn: () =>
            countryService.getCountryById(
                id
            ),

        enabled: Boolean(id),
    });

    /**
     * ----------------------------------------------------------------------
     * Populate Form
     * ----------------------------------------------------------------------
     */

    useEffect(() => {
        const country =
            data?.country;

        if (!country) {
            return;
        }

        reset({
            name:
                country.name || "",
        });

        setIsActive(
            country.isActive !== false
        );
    }, [
        data,
        reset,
    ]);

    /**
     * ----------------------------------------------------------------------
     * Submit
     * ----------------------------------------------------------------------
     */

    const onSubmit = async (values) => {
        try {
            await countryService.updateCountry(
                id,
                {
                    name: values.name.trim(),
                    isActive,
                }
            );

            toast.success(
                "Country updated successfully."
            );

            navigate(
                "/admin/locations/countries",
                {
                    replace: true,
                }
            );
        } catch (error) {
            console.error(
                "Update country error:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    "Failed to update country."
            );
        }
    };

    /**
     * ----------------------------------------------------------------------
     * Loading
     * ----------------------------------------------------------------------
     */

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-slate-500">
                    Loading country...
                </p>
            </div>
        );
    }

    /**
     * ----------------------------------------------------------------------
     * Error
     * ----------------------------------------------------------------------
     */

    if (isError || !data?.country) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="font-medium text-red-700">
                    Country not found.
                </p>

                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() =>
                        navigate(
                            "/admin/locations/countries"
                        )
                    }
                >
                    Back to Countries
                </Button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Edit Country"
                description="Update country information."
                action={
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/admin/locations/countries"
                            )
                        }
                    >
                        <ArrowLeft
                            size={17}
                        />
                        Back to Countries
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit(
                    onSubmit
                )}
                className="space-y-6"
            >
                {/* Country Information */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                <Globe2
                                    size={20}
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Country Information
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update the country name.
                                    The slug is managed automatically.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 p-5">
                        <Input
                            label="Country Name"
                            name="name"
                            placeholder="Enter country name"
                            required
                            error={
                                errors.name
                                    ?.message
                            }
                            {...register(
                                "name"
                            )}
                        />
                    </div>
                </section>

                {/* Status */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Country Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Control whether this country
                            is active.
                        </p>
                    </div>

                    <div className="p-5">
                        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Active Country
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Active countries can be
                                    displayed on the frontend.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={
                                    isActive
                                }
                                onChange={(
                                    event
                                ) =>
                                    setIsActive(
                                        event
                                            .target
                                            .checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </section>

                {/* Sticky Actions */}
                <div className="sticky bottom-0 z-30 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={
                                isSubmitting
                            }
                            onClick={() =>
                                navigate(
                                    "/admin/locations/countries"
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={
                                isSubmitting
                            }
                            disabled={
                                isSubmitting
                            }
                        >
                            Update Country
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditCountry;