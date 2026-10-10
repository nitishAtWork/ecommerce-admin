
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import JoditEditor from "jodit-react";
import {
    ArrowLeft,
    Save,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import editorConfig from "../../components/ui/EditorConfig";

import natureOfBusinessService from "../../services/natureOfBusiness.service";

/* =========================================================
   VALIDATION
========================================================= */

const natureOfBusinessSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nature of business name is required.")
        .max(200, "Name cannot exceed 200 characters."),

    shortDescription: z
        .string()
        .trim()
        .max(500, "Short description cannot exceed 500 characters.")
        .optional()
        .or(z.literal("")),

    description: z.string().optional().or(z.literal("")),

    extraDescription: z.string().optional().or(z.literal("")),

    metaTitle: z.string().trim().optional().or(z.literal("")),

    metaDescription: z.string().trim().optional().or(z.literal("")),

    metaKeywords: z.string().trim().optional().or(z.literal("")),

    isActive: z.boolean(),
});

const defaultValues = {
    name: "",
    shortDescription: "",
    description: "",
    extraDescription: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isActive: true,
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NatureOfBusinessForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();

    const isEdit = Boolean(id);

    // Jodit editor refs
    const descriptionEditor = useRef(null);
    const extraDescriptionEditor = useRef(null);

    // Editor values
    const [description, setDescription] = useState("");
    const [extraDescription, setExtraDescription] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(natureOfBusinessSchema),
        defaultValues,
    });

    /* =====================================================
       GET SINGLE
    ===================================================== */

    const {
        data,
        isLoading: isLoadingDetails,
        isError: isDetailsError,
    } = useQuery({
        queryKey: ["nature-of-business", id],
        queryFn: () =>
            natureOfBusinessService.getNatureOfBusinessById(id),
        enabled: isEdit,
    });

    /* =====================================================
       LOAD EDIT DATA
    ===================================================== */

    useEffect(() => {
        if (!isEdit || !data?.natureOfBusiness) {
            return;
        }

        const nature = data.natureOfBusiness;

        const savedDescription = nature.description || "";
        const savedExtraDescription = nature.extraDescription || "";

        reset({
            name: nature.name || "",
            shortDescription: nature.shortDescription || "",
            description: savedDescription,
            extraDescription: savedExtraDescription,
            metaTitle: nature.metaTitle || "",
            metaDescription: nature.metaDescription || "",
            metaKeywords: nature.metaKeywords || "",
            isActive: nature.isActive ?? true,
        });

        setDescription(savedDescription);
        setExtraDescription(savedExtraDescription);
    }, [isEdit, data, reset]);

    /* =====================================================
       CREATE
    ===================================================== */


    const createMutation = useMutation({
        mutationFn: (formData) =>
            natureOfBusinessService.createNatureOfBusiness(formData),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "Nature of business created successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["nature-of-businesses"],
            });

            // Reset all form fields
            reset(defaultValues);

            // Clear both Jodit editors
            setDescription("");
            setExtraDescription("");
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to create nature of business."
            );
        },
    });

    /* =====================================================
       UPDATE
    ===================================================== */

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) =>
            natureOfBusinessService.updateNatureOfBusiness(id, data),

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "Nature of business updated successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["nature-of-businesses"],
            });

            queryClient.invalidateQueries({
                queryKey: ["nature-of-business", id],
            });

            // Navigate only after a successful update
            navigate("/admin/nature-of-business", {
                replace: true,
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update nature of business."
            );
        },
    });

    /* =====================================================
       EDITOR HANDLERS
    ===================================================== */

    const handleDescriptionChange = (value) => {
        setDescription(value);

        setValue("description", value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleExtraDescriptionChange = (value) => {
        setExtraDescription(value);

        setValue("extraDescription", value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const onSubmit = (values) => {
        const payload = {
            name: values.name.trim(),

            shortDescription:
                values.shortDescription?.trim() || "",

            description: description || values.description || "",

            extraDescription:
                extraDescription || values.extraDescription || "",

            metaTitle: values.metaTitle?.trim() || "",

            metaDescription: values.metaDescription?.trim() || "",

            metaKeywords: values.metaKeywords?.trim() || "",

            isActive: values.isActive,
        };

        if (isEdit) {
            updateMutation.mutate({
                id,
                data: payload,
            });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isSaving =
        createMutation.isPending ||
        updateMutation.isPending ||
        isSubmitting;

    /* =====================================================
       LOADING EDIT
    ===================================================== */

    if (isEdit && isLoadingDetails) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2
                    size={30}
                    className="animate-spin text-blue-600"
                />
            </div>
        );
    }

    /* =====================================================
       ERROR EDIT
    ===================================================== */

    if (isEdit && isDetailsError) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-red-600">
                    Failed to load nature of business.
                </p>

                <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() =>
                        navigate("/admin/nature-of-business")
                    }
                >
                    <ArrowLeft size={17} />
                    Back
                </Button>
            </div>
        );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div>
            <PageHeader
                title={
                    isEdit
                        ? "Edit Nature of Business"
                        : "Add Nature of Business"
                }
                description={
                    isEdit
                        ? "Update the nature of business information."
                        : "Create a new nature of business."
                }
                action={
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            navigate("/admin/nature-of-business")
                        }
                    >
                        <ArrowLeft size={17} />
                        Back to Nature of Business
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                {/* BUSINESS INFORMATION */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Business Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Enter the basic information for this nature
                            of business.
                        </p>
                    </div>

                    <div className="space-y-5 p-5">
                        <Input
                            label="Nature of Business Name"
                            name="name"
                            placeholder="Enter nature of business name"
                            required
                            error={errors.name?.message}
                            {...register("name")}
                        />

                        <Textarea
                            label="Short Description"
                            name="shortDescription"
                            placeholder="Enter a short description"
                            rows={3}
                            error={errors.shortDescription?.message}
                            {...register("shortDescription")}
                        />

                        {/* DESCRIPTION EDITOR */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <JoditEditor
                                    ref={descriptionEditor}
                                    value={description}
                                    config={editorConfig}
                                    onBlur={handleDescriptionChange}
                                />
                            </div>

                            {errors.description?.message && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description.message}
                                </p>
                            )}

                            <p className="mt-1 text-xs text-slate-500">
                                Use the editor toolbar to format your
                                description.
                            </p>
                        </div>

                        {/* EXTRA DESCRIPTION EDITOR */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Extra Description
                            </label>

                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <JoditEditor
                                    ref={extraDescriptionEditor}
                                    value={extraDescription}
                                    config={editorConfig}
                                    onBlur={handleExtraDescriptionChange}
                                />
                            </div>

                            {errors.extraDescription?.message && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.extraDescription.message}
                                </p>
                            )}

                            <p className="mt-1 text-xs text-slate-500">
                                Add any additional formatted content here.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SEO SETTINGS */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            SEO Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure search engine metadata.
                        </p>
                    </div>

                    <div className="space-y-5 p-5">
                        <Input
                            label="Meta Title"
                            name="metaTitle"
                            placeholder="Enter SEO title"
                            error={errors.metaTitle?.message}
                            {...register("metaTitle")}
                        />

                        <Textarea
                            label="Meta Description"
                            name="metaDescription"
                            placeholder="Enter SEO description"
                            rows={4}
                            error={errors.metaDescription?.message}
                            {...register("metaDescription")}
                        />

                        <Textarea
                            label="Meta Keywords"
                            name="metaKeywords"
                            placeholder="keyword 1, keyword 2, keyword 3"
                            rows={3}
                            error={errors.metaKeywords?.message}
                            {...register("metaKeywords")}
                        />
                    </div>
                </section>

                {/* STATUS */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure the visibility of this nature of
                            business.
                        </p>
                    </div>

                    <div className="p-5">
                        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Active Nature of Business
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Customers can see this entry when it
                                    is active.
                                </p>
                            </div>

                            <span className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    {...register("isActive")}
                                />

                                <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
                            </span>
                        </label>
                    </div>
                </section>

                {/* ACTIONS */}

                <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isSaving}
                            onClick={() =>
                                navigate("/admin/nature-of-business")
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={isSaving}
                            disabled={isSaving}
                        >
                            <Save size={17} />

                            {isEdit
                                ? "Update Nature of Business"
                                : "Create Nature of Business"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
