import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import stateService from "../../services/state.service";
import countryService from "../../services/country.service";

const stateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "State name must be at least 2 characters.")
    .max(150, "State name cannot exceed 150 characters."),

  countryId: z
    .string()
    .min(1, "Please select a country."),

  isActive: z.boolean(),
});

export default function AddState() {
  const navigate = useNavigate();

  const {
    data: countryResponse,
    isLoading: countriesLoading,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countryService.getCountries(),
  });

  const countries = useMemo(
    () => countryResponse?.countries || [],
    [countryResponse]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      name: "",
      countryId: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      stateService.createState(data),

    onSuccess: (response) => {
      toast.success(
        response?.message ||
          "State created successfully"
      );

    //   navigate("/admin/locations/states");
    // reset form
    setValue("name", "");
    // setValue("countryId", "");
    setValue("isActive", true);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create state"
      );
    },
  });

  const onSubmit = (values) => {
    createMutation.mutate({
      name: values.name.trim(),
      countryId: values.countryId,
      isActive: values.isActive,
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Add State
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new state and assign it to a country.
          </p>
        </div>

        <Link
          to="/admin/locations/states"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              State Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the state details below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                State Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                placeholder="Enter state name"
                {...register("name")}
                className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-red-500 focus:ring-red-100"
                }`}
              />

              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                {...register("countryId")}
                disabled={countriesLoading}
                className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-red-100 ${
                  errors.countryId
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
              >
                <option value="">
                  {countriesLoading
                    ? "Loading countries..."
                    : "Select country"}
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
                  {errors.countryId.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-medium text-slate-700">
                    Active
                  </span>

                  <span className="block text-xs text-slate-400">
                    Make this state available for use.
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
              to="/admin/locations/states"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={createMutation.isPending}
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
                  Create State
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}