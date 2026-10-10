import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    Loader2,
    Save,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
    useMutation,
    useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import cityService from "../../services/city.service";
import countryService from "../../services/country.service";
import stateService from "../../services/state.service";

const citySchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            2,
            "City name must be at least 2 characters."
        )
        .max(
            150,
            "City name cannot exceed 150 characters."
        ),

    countryId: z.string().optional(),

    stateId: z
        .string()
        .min(1, "Please select a state."),

    majorcity: z.boolean(),

    isActive: z.boolean(),
});

export default function AddCity() {
    const navigate = useNavigate();

    const {
        data: countryResponse,
        isLoading: countriesLoading,
    } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });

    const {
        data: stateResponse,
        isLoading: statesLoading,
    } = useQuery({
        queryKey: ["states"],
        queryFn: () => stateService.getStates(),
    });

    const countries =
        countryResponse?.countries || [];

    const states =
        stateResponse?.states || [];

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(citySchema),
        defaultValues: {
            name: "",
            countryId: "",
            stateId: "",
            majorcity: false,
            isActive: true,
        },
    });

    const selectedCountryId = useWatch({
        control,
        name: "countryId",
    });

    const filteredStates = useMemo(() => {
        // No country selected → show all states
        if (!selectedCountryId) {
            return states;
        }

        // Country selected → show only its states
        return states.filter((state) => {
            const stateCountryId =
                state.countryId?._id ||
                state.countryId;

            return (
                stateCountryId ===
                selectedCountryId
            );
        });
    }, [states, selectedCountryId]);

    useEffect(() => {
        setValue("stateId", "");
    }, [selectedCountryId, setValue]);

    const createMutation = useMutation({
        mutationFn: (data) =>
            cityService.createCity(data),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "City created successfully"
            );

            // navigate("/admin/locations/cities");

            // reset form
            setValue("name", "");
            // setValue("countryId", "");
            // setValue("stateId", "");
            setValue("majorcity", false);
            setValue("isActive", true);
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to create city"
            );
        },
    });

    const onSubmit = (values) => {
        createMutation.mutate({
            name: values.name.trim(),
            countryId: values.countryId || null,
            stateId: values.stateId,
            majorcity: values.majorcity,
            isActive: values.isActive,
        });
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Add City
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Create a city and assign it to a country and state.
                    </p>
                </div>

                <Link
                    to="/admin/locations/cities"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    <ArrowLeft size={17} />
                    Back
                </Link>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <h2 className="text-base font-semibold text-slate-900">
                            City Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Enter the city details below.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        {/* City Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                City Name
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                placeholder="Enter city name"
                                {...register(
                                    "name"
                                )}
                                className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors.name
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                    }`}
                            />

                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {
                                        errors
                                            .name
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Country */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Country
                                {/* <span className="ml-1 text-red-500">
                                    *
                                </span> */}
                            </label>

                            <select
                                {...register("countryId")}
                                disabled={countriesLoading}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    {countriesLoading
                                        ? "Loading countries..."
                                        : "Select country (Optional)"}
                                </option>

                                {countries.map((country) => (
                                    <option
                                        key={country._id}
                                        value={country._id}
                                    >
                                        {country.name}
                                    </option>
                                ))}
                            </select>

                            {errors.countryId && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {
                                        errors
                                            .countryId
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* State */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                State
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <select
                                {...register(
                                    "stateId"
                                )}
                                disabled={
                                    // !selectedCountryId ||
                                    statesLoading
                                }
                                className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 ${errors.stateId
                                    ? "border-red-400"
                                    : "border-slate-200"
                                    }`}
                            >
                                <option value="">
                                    {statesLoading
                                        ? "Loading states..."
                                        // : !selectedCountryId
                                        //     ? "Select country first"
                                        : "Select state"}
                                </option>

                                {filteredStates.map(
                                    (state) => (
                                        <option
                                            key={
                                                state._id
                                            }
                                            value={
                                                state._id
                                            }
                                        >
                                            {
                                                state.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.stateId && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {
                                        errors
                                            .stateId
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Major City */}
                        <div>
                            <label className="inline-flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    {...register(
                                        "majorcity"
                                    )}
                                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                                />

                                <span>
                                    <span className="block text-sm font-medium text-slate-700">
                                        Major City
                                    </span>

                                    <span className="block text-xs text-slate-400">
                                        Mark this as a major/popular city.
                                    </span>
                                </span>
                            </label>
                        </div>

                        {/* Active */}
                        <div className="md:col-span-2">
                            <label className="inline-flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    {...register(
                                        "isActive"
                                    )}
                                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                                />

                                <span>
                                    <span className="block text-sm font-medium text-slate-700">
                                        Active
                                    </span>

                                    <span className="block text-xs text-slate-400">
                                        Make this city available.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sticky Actions */}
                <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            to="/admin/locations/cities"
                            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                createMutation.isPending
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Create City
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}