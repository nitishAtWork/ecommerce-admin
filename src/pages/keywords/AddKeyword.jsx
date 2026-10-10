import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ImagePlus,
    X,
    Plus,
    Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";

import keywordService from "../../services/keyword.service";

/* =========================================================
   VALIDATION
========================================================= */

const keywordSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Keyword name is required."),

    shortDescription: z
        .string()
        .trim()
        .max(
            500,
            "Short description cannot exceed 500 characters."
        )
        .optional()
        .or(z.literal("")),

    description: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    extraDescription: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    size: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    icon: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    metaTitle: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    metaDescription: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    metaKeywords: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),
});

/* =========================================================
   COMPONENT
========================================================= */

function AddKeyword() {
    const navigate = useNavigate();

    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] =
        useState("");

    const [additionalImages, setAdditionalImages] =
        useState([]);

    const [additionalPreviews, setAdditionalPreviews] =
        useState([]);

    const [isActive, setIsActive] = useState(true);

    const [faqs, setfaqs] = useState([
        {
            question: "",
            answer: "",
        },
    ]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(keywordSchema),

        defaultValues: {
            name: "",
            shortDescription: "",
            description: "",
            extraDescription: "",
            size: "",
            icon: "",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
        },
    });

    /* =========================================================
       MAIN IMAGE
    ========================================================= */

    const handleMainImage = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setMainImage(file);

        if (mainImagePreview) {
            URL.revokeObjectURL(mainImagePreview);
        }

        setMainImagePreview(
            URL.createObjectURL(file)
        );

        event.target.value = "";
    };

    const removeMainImage = () => {
        setMainImage(null);

        if (mainImagePreview) {
            URL.revokeObjectURL(mainImagePreview);
        }

        setMainImagePreview("");
    };

    /* =========================================================
       ADDITIONAL IMAGES
    ========================================================= */

    const handleAdditionalImages = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (!files.length) {
            return;
        }

        const remaining =
            10 - additionalImages.length;

        if (remaining <= 0) {
            toast.error(
                "You can upload a maximum of 10 additional images."
            );

            event.target.value = "";
            return;
        }

        const selectedFiles =
            files.slice(0, remaining);

        setAdditionalImages((previous) => [
            ...previous,
            ...selectedFiles,
        ]);

        setAdditionalPreviews((previous) => [
            ...previous,
            ...selectedFiles.map((file) =>
                URL.createObjectURL(file)
            ),
        ]);

        if (files.length > remaining) {
            toast.warning(
                `Only ${remaining} additional image(s) were added.`
            );
        }

        event.target.value = "";
    };

    const removeAdditionalImage = (index) => {
        const preview =
            additionalPreviews[index];

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setAdditionalImages((previous) =>
            previous.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

        setAdditionalPreviews((previous) =>
            previous.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    /* =========================================================
       faqs / FAQ
    ========================================================= */

    const addSpecification = () => {
        setfaqs((previous) => [
            ...previous,
            {
                question: "",
                answer: "",
            },
        ]);
    };

    const removeSpecification = (index) => {
        setfaqs((previous) =>
            previous.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    const updateSpecification = (
        index,
        field,
        value
    ) => {
        setfaqs((previous) =>
            previous.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };

    const resetKeywordForm = () => {
        // Revoke main image preview URL
        if (mainImagePreview) {
            URL.revokeObjectURL(mainImagePreview);
        }

        // Revoke additional image preview URLs
        additionalPreviews.forEach((preview) => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        });

        // Reset React Hook Form
        reset({
            name: "",
            shortDescription: "",
            description: "",
            extraDescription: "",
            size: "",
            icon: "",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
        });

        // Reset images
        setMainImage(null);
        setMainImagePreview("");

        setAdditionalImages([]);
        setAdditionalPreviews([]);

        // Reset FAQ
        setfaqs([
            {
                question: "",
                answer: "",
            },
        ]);

        // Reset status
        setIsActive(true);
    };

    /* =========================================================
       SUBMIT
    ========================================================= */

    const onSubmit = async (values) => {
        try {
            // if (!mainImage) {
            //     toast.error(
            //         "Please select a main keyword image."
            //     );

            //     return;
            // }

            const validfaqs =
                faqs.filter(
                    (item) =>
                        item.question.trim() ||
                        item.answer.trim()
                );

            const incompleteSpecification =
                validfaqs.some(
                    (item) =>
                        !item.question.trim() ||
                        !item.answer.trim()
                );

            if (incompleteSpecification) {
                toast.error(
                    "Please complete all FAQ/specification fields."
                );

                return;
            }

            const formData = new FormData();

            /* -----------------------------------------
               BASIC INFORMATION
            ----------------------------------------- */

            formData.append(
                "name",
                values.name
            );

            formData.append(
                "shortDescription",
                values.shortDescription || ""
            );

            formData.append(
                "description",
                values.description || ""
            );

            formData.append(
                "extraDescription",
                values.extraDescription || ""
            );

            formData.append(
                "size",
                values.size || ""
            );

            formData.append(
                "icon",
                values.icon || ""
            );

            /* -----------------------------------------
               FAQ / faqs
            ----------------------------------------- */

            formData.append(
                "faqs",
                JSON.stringify(validfaqs)
            );

            /* -----------------------------------------
               SEO
            ----------------------------------------- */

            formData.append(
                "metaTitle",
                values.metaTitle || ""
            );

            formData.append(
                "metaDescription",
                values.metaDescription || ""
            );

            formData.append(
                "metaKeywords",
                values.metaKeywords || ""
            );

            /* -----------------------------------------
               STATUS
            ----------------------------------------- */

            formData.append(
                "isActive",
                String(isActive)
            );

            /* -----------------------------------------
               MAIN IMAGE
            ----------------------------------------- */

            if (mainImage) {
                formData.append("img", mainImage);
            }

            /* -----------------------------------------
               ADDITIONAL IMAGES
            ----------------------------------------- */

            additionalImages.forEach((file) => {
                formData.append(
                    "images",
                    file
                );
            });

            /*
             * Do NOT send slug.
             *
             * Backend generates slug automatically
             * from keyword name.
             */

            await keywordService.createKeyword(
                formData
            );

            toast.success(
                "Keyword created successfully."
            );

            // navigate("/admin/keywords", {
            //     replace: true,
            // });

            resetKeywordForm();

        } catch (error) {
            console.error(
                "Create keyword error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to create keyword."
            );
        }
    };

    /* =========================================================
       UI
    ========================================================= */

    return (
        <div>
            <PageHeader
                title="Add Keyword"
                description="Create a new keyword landing page for your store."
                action={
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/admin/keywords"
                            )
                        }
                    >
                        <ArrowLeft size={17} />
                        Back to Keywords
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                {/* =================================================
                    KEYWORD INFORMATION
                ================================================= */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Keyword Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Enter the basic information for this
                            keyword page.
                        </p>
                    </div>

                    <div className="space-y-5 p-5">
                        <Input
                            label="Keyword Name"
                            name="name"
                            placeholder="Enter keyword name"
                            required
                            error={
                                errors.name?.message
                            }
                            {...register("name")}
                        />

                        <Textarea
                            label="Short Description"
                            name="shortDescription"
                            placeholder="Enter a short description"
                            rows={3}
                            error={
                                errors.shortDescription
                                    ?.message
                            }
                            {...register(
                                "shortDescription"
                            )}
                        />

                        <Textarea
                            label="Description"
                            name="description"
                            placeholder="Enter keyword description"
                            rows={7}
                            error={
                                errors.description
                                    ?.message
                            }
                            {...register(
                                "description"
                            )}
                        />

                        <Textarea
                            label="Extra Description"
                            name="extraDescription"
                            placeholder="Enter additional keyword content"
                            rows={6}
                            error={
                                errors.extraDescription
                                    ?.message
                            }
                            {...register(
                                "extraDescription"
                            )}
                        />
                    </div>
                </section>

                {/* =================================================
                    KEYWORD DETAILS
                ================================================= */}

                {/* <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Keyword Details
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure additional keyword information.
                        </p>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-2">
                        <Input
                            label="Size"
                            name="size"
                            placeholder="e.g. Small, Medium, Large"
                            error={
                                errors.size?.message
                            }
                            {...register("size")}
                        />

                        <Input
                            label="Icon"
                            name="icon"
                            placeholder="Enter icon name or icon URL"
                            error={
                                errors.icon?.message
                            }
                            {...register("icon")}
                        />
                    </div>
                </section> */}

                {/* =================================================
                    faqs / FAQ
                ================================================= */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                faqs / FAQ
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Add questions and answers for this
                                keyword page.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={addSpecification}
                        >
                            <Plus size={17} />
                            Add FAQ
                        </Button>
                    </div>

                    <div className="space-y-5 p-5">
                        {faqs.map(
                            (
                                specification,
                                index
                            ) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">
                                            FAQ{" "}
                                            {index + 1}
                                        </p>

                                        {faqs.length >
                                            1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSpecification(
                                                            index
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>
                                            )}
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label="Question"
                                            placeholder="Enter question"
                                            value={
                                                specification.question
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSpecification(
                                                    index,
                                                    "question",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                        <Textarea
                                            label="Answer"
                                            placeholder="Enter answer"
                                            rows={4}
                                            value={
                                                specification.answer
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSpecification(
                                                    index,
                                                    "answer",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </section>

                {/* =================================================
                    SEO
                ================================================= */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            SEO Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure search engine metadata for this
                            keyword page.
                        </p>
                    </div>

                    <div className="space-y-5 p-5">
                        <Input
                            label="Meta Title"
                            name="metaTitle"
                            placeholder="Enter SEO title"
                            error={
                                errors.metaTitle
                                    ?.message
                            }
                            {...register(
                                "metaTitle"
                            )}
                        />

                        <Textarea
                            label="Meta Description"
                            name="metaDescription"
                            placeholder="Enter SEO description"
                            rows={4}
                            error={
                                errors.metaDescription
                                    ?.message
                            }
                            {...register(
                                "metaDescription"
                            )}
                        />

                        <Textarea
                            label="Meta Keywords"
                            name="metaKeywords"
                            placeholder="keyword 1, keyword 2, keyword 3"
                            rows={3}
                            error={
                                errors.metaKeywords
                                    ?.message
                            }
                            {...register(
                                "metaKeywords"
                            )}
                        />
                    </div>
                </section>

                {/* =================================================
                    IMAGES
                ================================================= */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Keyword Images
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Upload one main image and up to 10
                            additional images.
                        </p>
                    </div>

                    <div className="space-y-6 p-5">
                        {/* Main Image */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Main Image
                                {/* <span className="ml-1 text-red-500">
                                    *
                                </span> */}
                            </label>

                            {mainImagePreview ? (
                                <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-slate-200">
                                    <img
                                        src={
                                            mainImagePreview
                                        }
                                        alt="Main keyword"
                                        className="h-full w-full object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            removeMainImage
                                        }
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                                    <ImagePlus
                                        size={32}
                                        className="text-slate-400"
                                    />

                                    <span className="mt-2 text-sm font-medium text-slate-600">
                                        Choose image
                                    </span>

                                    <span className="mt-1 text-xs text-slate-400">
                                        JPG, PNG, WEBP
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={
                                            handleMainImage
                                        }
                                    />
                                </label>
                            )}
                        </div>

                        {/* Additional Images */}

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">
                                    Additional Images
                                </label>

                                <span className="text-xs text-slate-400">
                                    {
                                        additionalImages.length
                                    }
                                    /10
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {additionalPreviews.map(
                                    (
                                        preview,
                                        index
                                    ) => (
                                        <div
                                            key={preview}
                                            className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200"
                                        >
                                            <img
                                                src={
                                                    preview
                                                }
                                                alt={`Keyword ${index +
                                                    1
                                                    }`}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAdditionalImage(
                                                        index
                                                    )
                                                }
                                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow"
                                            >
                                                <X
                                                    size={
                                                        14
                                                    }
                                                />
                                            </button>
                                        </div>
                                    )
                                )}

                                {additionalImages.length <
                                    10 && (
                                        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                                            <ImagePlus
                                                size={24}
                                                className="text-slate-400"
                                            />

                                            <span className="mt-1 text-xs text-slate-500">
                                                Add images
                                            </span>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                className="hidden"
                                                onChange={
                                                    handleAdditionalImages
                                                }
                                            />
                                        </label>
                                    )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    SETTINGS
                ================================================= */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Keyword Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure the visibility of this keyword
                            page.
                        </p>
                    </div>

                    <div className="p-5">
                        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Active Keyword
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Customers can see this keyword
                                    page when active.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) =>
                                    setIsActive(
                                        event.target
                                            .checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </section>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isSubmitting}
                            onClick={() =>
                                navigate("/admin/keywords")
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Create Keyword
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddKeyword;