"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSave, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";

import keywordInCityService from "../../services/keywordInCity.service";

const defaultValues = {
  name: "",
  shortDescription: "",
  description: "",
  extraDescription: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

export default function KeywordInCity() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues,
  });

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["keyword-in-city"],
    queryFn: keywordInCityService.get,
  });

  useEffect(() => {
    if (data?.keywordInCity) {
      reset({
        name: data.keywordInCity.name || "",
        shortDescription: data.keywordInCity.shortDescription || "",
        description: data.keywordInCity.description || "",
        extraDescription: data.keywordInCity.extraDescription || "",
        metaTitle: data.keywordInCity.metaTitle || "",
        metaDescription: data.keywordInCity.metaDescription || "",
        metaKeywords: data.keywordInCity.metaKeywords || "",
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: keywordInCityService.update,

    onSuccess: (response) => {
      toast.success(
        response?.message || "Keyword in city content updated successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["keyword-in-city"],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update keyword in city content"
      );
    },
  });

  const onSubmit = (values) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FiRefreshCw className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Keyword in City is not configured
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error?.response?.data?.message ||
            "Unable to load keyword in city content."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Keyword in City
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the reusable content template used for keyword location
            pages.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Main Content */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Use <code>keyword</code> and{" "}
                <code>subdomain</code> as dynamic placeholders.
              </p>
            </div>

            <div className="grid gap-6 p-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Name
                </label>

                <input
                  {...register("name")}
                  placeholder="Enter page name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Short Description
                </label>

                <textarea
                  {...register("shortDescription")}
                  rows={3}
                  placeholder="Enter short description"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  {...register("description")}
                  rows={7}
                  placeholder="Enter description"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Extra Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Extra Description
                </label>

                <textarea
                  {...register("extraDescription")}
                  rows={7}
                  placeholder="Enter extra description"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* SEO */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="mb-4 text-base font-semibold text-slate-900">
                  SEO Settings
                </h3>

                <div className="grid gap-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Meta Title
                    </label>

                    <input
                      {...register("metaTitle")}
                      placeholder="Enter meta title"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Meta Description
                    </label>

                    <textarea
                      {...register("metaDescription")}
                      rows={4}
                      placeholder="Enter meta description"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Meta Keywords
                    </label>

                    <textarea
                      {...register("metaKeywords")}
                      rows={3}
                      placeholder="keyword 1, keyword 2, keyword 3"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="sticky bottom-0 z-20 mt-6 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  if (data?.keywordInCity) {
                    reset({
                      name: data.keywordInCity.name || "",
                      shortDescription:
                        data.keywordInCity.shortDescription || "",
                      description:
                        data.keywordInCity.description || "",
                      extraDescription:
                        data.keywordInCity.extraDescription || "",
                      metaTitle:
                        data.keywordInCity.metaTitle || "",
                      metaDescription:
                        data.keywordInCity.metaDescription || "",
                      metaKeywords:
                        data.keywordInCity.metaKeywords || "",
                    });
                  }
                }}
                disabled={updateMutation.isPending}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave />

                {updateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}