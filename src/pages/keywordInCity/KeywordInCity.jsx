
"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FiSave, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import JoditEditor from "jodit-react";

import keywordInCityService from "../../services/keywordInCity.service";
import editorConfig from "../../components/ui/EditorConfig";

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

  // Jodit editor references
  const descriptionEditor = useRef(null);
  const extraDescriptionEditor = useRef(null);

  // Rich-text editor state
  const [description, setDescription] = useState("");
  const [extraDescription, setExtraDescription] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    defaultValues,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["keyword-in-city"],
    queryFn: keywordInCityService.get,
  });

  // Populate form fields when data is loaded
  useEffect(() => {
    if (!data?.keywordInCity) return;

    const item = data.keywordInCity;

    reset({
      name: item.name || "",
      shortDescription: item.shortDescription || "",
      description: item.description || "",
      extraDescription: item.extraDescription || "",
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      metaKeywords: item.metaKeywords || "",
    });

    setDescription(item.description || "");
    setExtraDescription(item.extraDescription || "");
  }, [data, reset]);

  // Update API mutation
  const updateMutation = useMutation({
    mutationFn: keywordInCityService.update,

    onSuccess: (response) => {
      toast.success(
        response?.message ||
          "Keyword in city content updated successfully"
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
    updateMutation.mutate({
      ...values,
      description,
      extraDescription,
    });
  };

  const handleReset = () => {
    const item = data?.keywordInCity;

    reset({
      name: item?.name || "",
      shortDescription: item?.shortDescription || "",
      description: item?.description || "",
      extraDescription: item?.extraDescription || "",
      metaTitle: item?.metaTitle || "",
      metaDescription: item?.metaDescription || "",
      metaKeywords: item?.metaKeywords || "",
    });

    setDescription(item?.description || "");
    setExtraDescription(item?.extraDescription || "");
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

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <FiRefreshCw
            className={isFetching ? "animate-spin" : ""}
          />
          Retry
        </button>
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
            Manage the reusable content template used for keyword
            location pages.
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

              {/* Short Description - Normal Textarea */}
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

              {/* Description - Jodit Editor */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
                  <JoditEditor
                    ref={descriptionEditor}
                    value={description}
                    config={editorConfig}
                    onBlur={(value) => {
                      setDescription(value);

                      setValue("description", value, {
                        shouldDirty: true,
                      });
                    }}
                  />
                </div>
              </div>

              {/* Extra Description - Jodit Editor */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Extra Description
                </label>

                <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
                  <JoditEditor
                    ref={extraDescriptionEditor}
                    value={extraDescription}
                    config={editorConfig}
                    onBlur={(value) => {
                      setExtraDescription(value);

                      setValue("extraDescription", value, {
                        shouldDirty: true,
                      });
                    }}
                  />
                </div>
              </div>

              {/* SEO Settings */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="mb-4 text-base font-semibold text-slate-900">
                  SEO Settings
                </h3>

                <div className="grid gap-5">
                  {/* Meta Title */}
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

                  {/* Meta Description */}
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

                  {/* Meta Keywords */}
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
                onClick={handleReset}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FiRefreshCw />
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
