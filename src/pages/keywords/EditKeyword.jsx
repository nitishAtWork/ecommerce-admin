import { useEffect, useState } from "react";

import {
    ArrowLeft,
    ImagePlus,
    X,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";

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

import {
    useQuery,
} from "@tanstack/react-query";

import {
    toast,
} from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";

import keywordService from "../../services/keyword.service";
import { getImageUrl } from "../../utils/getImageUrl";

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

function EditKeyword() {
    const navigate = useNavigate();

    const { id } = useParams();

    /* =====================================================
       IMAGE STATE
    ===================================================== */

    const [mainImage, setMainImage] =
        useState(null);

    const [mainImagePreview, setMainImagePreview] =
        useState("");

    const [existingImages, setExistingImages] =
        useState([]);

    const [
        removedExistingImages,
        setRemovedExistingImages,
    ] = useState([]);

    const [newImages, setNewImages] =
        useState([]);

    const [newImagePreviews, setNewImagePreviews] =
        useState([]);

    /* =====================================================
       STATUS
    ===================================================== */

    const [isActive, setIsActive] =
        useState(true);

    /* =====================================================
       faqs / FAQ
    ===================================================== */

    const [faqs, setfaqs] =
        useState([]);

    /* =====================================================
       FORM
    ===================================================== */

    const {
        register,
        reset,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(
            keywordSchema
        ),
    });

    /* =====================================================
       LOAD KEYWORD
    ===================================================== */

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            "keyword",
            id,
        ],

        queryFn: () =>
            keywordService.getKeywordById(id),

        enabled: Boolean(id),
    });

    /* =====================================================
       POPULATE FORM
    ===================================================== */

    useEffect(() => {
        if (!data) {
            return;
        }

        const keyword =
            data?.data?.keyword ||
            data?.keyword;

        if (!keyword) {
            return;
        }

        reset({
            name: keyword.name || "",

            shortDescription:
                keyword.shortDescription || "",

            description:
                keyword.description || "",

            extraDescription:
                keyword.extraDescription || "",

            size:
                keyword.size || "",

            icon:
                keyword.icon || "",

            metaTitle:
                keyword.metaTitle || "",

            metaDescription:
                keyword.metaDescription || "",

            metaKeywords:
                keyword.metaKeywords || "",
        });

        /* ---------------------------------------------
           Status
        --------------------------------------------- */

        setIsActive(
            keyword.isActive !== false
        );

        /* ---------------------------------------------
           faqs / FAQ
        --------------------------------------------- */

        if (
            Array.isArray(
                keyword.faqs
            )
        ) {
            setfaqs(
                keyword.faqs.map(
                    (item) => ({
                        question:
                            item.question || "",

                        answer:
                            item.answer || "",
                    })
                )
            );
        } else {
            setfaqs([]);
        }

        /* ---------------------------------------------
           Main image
        --------------------------------------------- */

        if (keyword.img) {
            setMainImagePreview(
                getImageUrl(keyword.img)
            );
        } else {
            setMainImagePreview("");
        }

        /* ---------------------------------------------
           Existing additional images
        --------------------------------------------- */

        if (
            Array.isArray(keyword.images)
        ) {
            setExistingImages(
                keyword.images
                    .filter(Boolean)
                    .map((image) => ({
                        original: image,
                        url: getImageUrl(image),
                    }))
            );
        } else {
            setExistingImages([]);
        }

        setRemovedExistingImages([]);
        setNewImages([]);
        setNewImagePreviews([]);
    }, [data, reset]);

    /* =====================================================
       MAIN IMAGE REPLACEMENT
    ===================================================== */

    const handleMainImage = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            mainImagePreview &&
            mainImagePreview.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                mainImagePreview
            );
        }

        setMainImage(file);

        setMainImagePreview(
            URL.createObjectURL(file)
        );

        event.target.value = "";
    };

    /* =====================================================
       REMOVE MAIN IMAGE
    ===================================================== */

    const removeMainImage = () => {
        if (
            mainImagePreview &&
            mainImagePreview.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                mainImagePreview
            );
        }

        setMainImage(null);
        setMainImagePreview("");
    };

    /* =====================================================
       ADD NEW ADDITIONAL IMAGES
    ===================================================== */

    const handleAdditionalImages = (
        event
    ) => {
        const files = Array.from(
            event.target.files || []
        );

        if (!files.length) {
            return;
        }

        const currentCount =
            existingImages.length +
            newImages.length;

        const remaining =
            10 - currentCount;

        if (remaining <= 0) {
            toast.error(
                "Maximum 10 additional images allowed."
            );

            event.target.value = "";

            return;
        }

        const selectedFiles =
            files.slice(0, remaining);

        setNewImages((previous) => [
            ...previous,
            ...selectedFiles,
        ]);

        setNewImagePreviews(
            (previous) => [
                ...previous,
                ...selectedFiles.map(
                    (file) =>
                        URL.createObjectURL(
                            file
                        )
                ),
            ]
        );

        if (
            files.length > remaining
        ) {
            toast.warning(
                `Only ${remaining} image(s) were added.`
            );
        }

        event.target.value = "";
    };

    /* =====================================================
       REMOVE EXISTING IMAGE
    ===================================================== */

    const removeExistingImage = (
        index
    ) => {
        const image =
            existingImages[index];

        if (!image) {
            return;
        }

        setRemovedExistingImages(
            (previous) => [
                ...previous,
                image.original,
            ]
        );

        setExistingImages(
            (previous) =>
                previous.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        );
    };

    /* =====================================================
       REMOVE NEW IMAGE
    ===================================================== */

    const removeNewImage = (
        index
    ) => {
        const preview =
            newImagePreviews[index];

        if (preview) {
            URL.revokeObjectURL(
                preview
            );
        }

        setNewImages(
            (previous) =>
                previous.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        );

        setNewImagePreviews(
            (previous) =>
                previous.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        );
    };

    /* =====================================================
       SPECIFICATION / FAQ
    ===================================================== */

    const addSpecification = () => {
        setfaqs(
            (previous) => [
                ...previous,
                {
                    question: "",
                    answer: "",
                },
            ]
        );
    };

    const removeSpecification = (
        index
    ) => {
        setfaqs(
            (previous) =>
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
        setfaqs(
            (previous) =>
                previous.map(
                    (
                        item,
                        itemIndex
                    ) =>
                        itemIndex === index
                            ? {
                                ...item,
                                [field]:
                                    value,
                            }
                            : item
                )
        );
    };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const onSubmit = async (
        values
    ) => {
        try {
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

            if (
                incompleteSpecification
            ) {
                toast.error(
                    "Please complete all FAQ/specification fields."
                );

                return;
            }

            const formData =
                new FormData();

            /* ---------------------------------------------
               BASIC INFORMATION
            --------------------------------------------- */

            formData.append(
                "name",
                values.name
            );

            formData.append(
                "description",
                values.description || ""
            );

            formData.append(
                "shortDescription",
                values.shortDescription || ""
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

            /* ---------------------------------------------
               faqs
            --------------------------------------------- */

            formData.append(
                "faqs",
                JSON.stringify(
                    validfaqs
                )
            );

            /* ---------------------------------------------
               SEO
            --------------------------------------------- */

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

            /* ---------------------------------------------
               STATUS
            --------------------------------------------- */

            formData.append(
                "isActive",
                String(isActive)
            );

            /* ---------------------------------------------
               MAIN IMAGE
               Only send if replaced.
            --------------------------------------------- */

            if (mainImage) {
                formData.append(
                    "img",
                    mainImage
                );
            }

            /* ---------------------------------------------
               NEW ADDITIONAL IMAGES
            --------------------------------------------- */

            newImages.forEach(
                (file) => {
                    formData.append(
                        "images",
                        file
                    );
                }
            );

            /* ---------------------------------------------
               EXISTING IMAGES TO KEEP
            --------------------------------------------- */

            existingImages.forEach(
                (image) => {
                    formData.append(
                        "existingImages",
                        image.original
                    );
                }
            );

            /* ---------------------------------------------
               EXISTING IMAGES TO REMOVE
            --------------------------------------------- */

            removedExistingImages.forEach(
                (image) => {
                    formData.append(
                        "removeImages",
                        image
                    );
                }
            );

            /*
             * Do NOT send slug.
             *
             * Backend generates / updates the slug
             * automatically from the keyword name.
             */

            await keywordService.updateKeyword(
                id,
                formData
            );

            toast.success(
                "Keyword updated successfully."
            );

            navigate(
                "/admin/keywords",
                {
                    replace: true,
                }
            );
        } catch (error) {
            console.error(
                "Update keyword error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update keyword."
            );
        }
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2
                        size={18}
                        className="animate-spin"
                    />

                    Loading keyword...
                </div>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (isError) {
        return (
            <div>
                <PageHeader
                    title="Edit Keyword"
                    description="Unable to load keyword."
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                    {error?.response?.data
                        ?.message ||
                        "Keyword could not be loaded."}
                </div>
            </div>
        );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div>
            <PageHeader
                title="Edit Keyword"
                description="Update keyword information."
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
                onSubmit={handleSubmit(
                    onSubmit
                )}
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
                            Update the keyword information.
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
                            placeholder="Enter short description"
                            rows={3}
                            error={
                                errors
                                    .shortDescription
                                    ?.message
                            }
                            {...register(
                                "shortDescription"
                            )}
                        />

                        <Textarea
                            label="Description"
                            name="description"
                            placeholder="Enter description"
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
                            placeholder="Enter additional description"
                            rows={6}
                            error={
                                errors
                                    .extraDescription
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
                            Update additional keyword details.
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
                                Manage questions and answers.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                addSpecification
                            }
                        >
                            <Plus size={17} />

                            Add FAQ
                        </Button>
                    </div>

                    <div className="space-y-5 p-5">
                        {faqs.length ===
                            0 && (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <p className="text-sm text-slate-500">
                                        No FAQ/faqs
                                        added yet.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            addSpecification
                                        }
                                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Add your first
                                        FAQ
                                    </button>
                                </div>
                            )}

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
                                            {index +
                                                1}
                                        </p>

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
                            Update search engine metadata.
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
                                errors
                                    .metaDescription
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
                            Manage the main and additional keyword images.
                        </p>
                    </div>

                    <div className="space-y-7 p-5">
                        {/* -----------------------------------------
                            MAIN IMAGE
                        ----------------------------------------- */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Main Image
                            </label>

                            {mainImagePreview ? (
                                <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-slate-200">
                                    <img
                                        src={
                                            mainImagePreview
                                        }
                                        alt="Keyword"
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

                            <p className="mt-2 text-xs text-slate-400">
                                Select a new image only if
                                you want to replace the
                                current one.
                            </p>
                        </div>

                        {/* -----------------------------------------
                            ADDITIONAL IMAGES
                        ----------------------------------------- */}

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Additional Images
                                    </label>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Remove old images or
                                        add new ones.
                                    </p>
                                </div>

                                <span className="text-xs text-slate-400">
                                    {existingImages.length +
                                        newImages.length}
                                    /10
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {/* Existing images */}

                                {existingImages.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                image.original
                                            }
                                            className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200"
                                        >
                                            <img
                                                src={
                                                    image.url
                                                }
                                                alt={`Keyword ${index +
                                                    1
                                                    }`}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeExistingImage(
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

                                {/* New images */}

                                {newImagePreviews.map(
                                    (
                                        preview,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                preview
                                            }
                                            className="relative h-28 w-28 overflow-hidden rounded-lg border-2 border-blue-300"
                                        >
                                            <img
                                                src={
                                                    preview
                                                }
                                                alt={`New image ${index +
                                                    1
                                                    }`}
                                                className="h-full w-full object-cover"
                                            />

                                            <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                                New
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeNewImage(
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

                                {/* Add */}

                                {existingImages.length +
                                    newImages.length <
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
                                                multiple
                                                accept="image/jpeg,image/png,image/webp"
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
                    </div>

                    <div className="space-y-4 p-5">
                        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Active Keyword
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Make this keyword page
                                    available in the store.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(
                                    event
                                ) =>
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
                                navigate(
                                    "/admin/keywords"
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Update Keyword
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditKeyword;