import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import JoditEditor from "jodit-react";
import {
    FiArrowLeft,
    FiSave,
    FiX,
    FiImage,
    FiUpload,
} from "react-icons/fi";
import { toast } from "sonner";

import pageService from "../../services/page.service";

const emptyForm = {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    extraDescription: "",
    videoLink: "",
    isCustomSlug: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isActive: true,
};

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || fallback;

const editorConfig = {
    readonly: false,
    height: 300,
    toolbarAdaptive: false,
    buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "|",
        "align",
        "outdent",
        "indent",
        "|",
        "link",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
    ],
    uploader: {
        insertImageAsBase64URI: false,
    },
};

export default function PageForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const descriptionEditor = useRef(null);
    const shortDescriptionEditor = useRef(null);
    const extraDescriptionEditor = useRef(null);

    const [form, setForm] = useState(emptyForm);

    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [removeMainImage, setRemoveMainImage] = useState(false);

    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);

    const {
        data: page,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["page", id],
        queryFn: () => pageService.getById(id),
        enabled: isEdit,
    });

    useEffect(() => {
        if (!page) return;

        setForm({
            name: page.name || "",
            slug: page.slug || "",
            shortDescription: page.shortDescription || "",
            description: page.description || "",
            extraDescription: page.extraDescription || "",
            videoLink: page.videoLink || "",
            isCustomSlug: Boolean(page.isCustomSlug),
            metaTitle: page.metaTitle || "",
            metaDescription: page.metaDescription || "",
            metaKeywords: page.metaKeywords || "",
            isActive: page.isActive !== false,
        });

        setMainImagePreview(page.img || "");
        setExistingImages(
            Array.isArray(page.images) ? page.images : []
        );
    }, [page]);

    const editorOptions = useMemo(
        () => ({
            ...editorConfig,
            controls: {
                font: {
                    list: {
                        "": "Default",
                        Arial: "Arial",
                        Georgia: "Georgia",
                        "Times New Roman": "Times New Roman",
                        Verdana: "Verdana",
                    },
                },
            },
        }),
        []
    );


    const saveMutation = useMutation({
        mutationFn: ({ formData }) =>
            isEdit
                ? pageService.update(id, formData)
                : pageService.create(formData),

        onSuccess: () => {
            toast.success(
                isEdit
                    ? "Page updated successfully."
                    : "Page created successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["pages"],
            });

            if (isEdit) {
                queryClient.invalidateQueries({
                    queryKey: ["page", id],
                });

                // Navigate only when editing
                navigate("/admin/pages");
                return;
            }

            // Reset form after successful creation
            setForm(emptyForm);

            setMainImage(null);
            setMainImagePreview("");
            setRemoveMainImage(false);

            // Clear gallery files and previews
            galleryPreviews.forEach((preview) => {
                if (preview.url?.startsWith("blob:")) {
                    URL.revokeObjectURL(preview.url);
                }
            });

            setGalleryFiles([]);
            setGalleryPreviews([]);
            setExistingImages([]);
            setRemovedImages([]);

            // Reset file inputs
            document.querySelectorAll('input[type="file"]').forEach((input) => {
                input.value = "";
            });
        },

        onError: (error) => {
            toast.error(
                getErrorMessage(
                    error,
                    isEdit
                        ? "Failed to update page."
                        : "Failed to create page."
                )
            );
        },
    });


    const updateField = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleMainImage = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image.");
            event.target.value = "";
            return;
        }

        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
        setRemoveMainImage(false);
    };

    const handleGalleryImages = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const validFiles = files.filter((file) =>
            ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
                file.type
            )
        );

        if (validFiles.length !== files.length) {
            toast.error("Only JPG, PNG, WEBP, and AVIF images are allowed.");
        }

        const remainingSlots = Math.max(
            0,
            10 - existingImages.length - galleryFiles.length
        );

        const selectedFiles = validFiles.slice(0, remainingSlots);

        if (selectedFiles.length < validFiles.length) {
            toast.error("A maximum of 10 gallery images is allowed.");
        }

        setGalleryFiles((current) => [...current, ...selectedFiles]);

        setGalleryPreviews((current) => [
            ...current,
            ...selectedFiles.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            })),
        ]);

        event.target.value = "";
    };

    const removeNewGalleryImage = (index) => {
        setGalleryFiles((current) =>
            current.filter((_, i) => i !== index)
        );

        setGalleryPreviews((current) => {
            const preview = current[index];

            if (preview?.url) {
                URL.revokeObjectURL(preview.url);
            }

            return current.filter((_, i) => i !== index);
        });
    };

    const removeExistingGalleryImage = (image) => {
        setExistingImages((current) =>
            current.filter((item) => item !== image)
        );

        setRemovedImages((current) =>
            current.includes(image) ? current : [...current, image]
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.error("Page name is required.");
            return;
        }

        if (form.isCustomSlug && !form.slug.trim()) {
            toast.error("Enter a custom slug or disable custom slug.");
            return;
        }

        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("shortDescription", form.shortDescription);
        formData.append("description", form.description);
        formData.append("extraDescription", form.extraDescription);
        formData.append("videoLink", form.videoLink);
        formData.append("isCustomSlug", String(form.isCustomSlug));
        formData.append("metaTitle", form.metaTitle);
        formData.append("metaDescription", form.metaDescription);
        formData.append("metaKeywords", form.metaKeywords);
        formData.append("isActive", String(form.isActive));

        if (form.isCustomSlug) {
            formData.append("slug", form.slug.trim());
        }

        if (mainImage) {
            formData.append("img", mainImage);
        }

        if (removeMainImage && !mainImage) {
            formData.append("removeMainImage", "true");
        }

        galleryFiles.forEach((file) => {
            formData.append("images", file);
        });

        if (isEdit && removedImages.length) {
            formData.append(
                "removeImages",
                JSON.stringify(removedImages)
            );
        }

        saveMutation.mutate({ formData });
    };

    if (isEdit && isLoading) {
        return (
            <div className="p-8 text-center text-sm text-gray-500">
                Loading page...
            </div>
        );
    }

    if (isEdit && (isError || !page)) {
        return (
            <div className="m-6 rounded-xl border border-red-200 bg-white p-6">
                <p className="font-semibold text-red-600">
                    {getErrorMessage(error, "Unable to load this page.")}
                </p>
                <Link
                    to="/admin/pages"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600"
                >
                    <FiArrowLeft /> Back to pages
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    to="/admin/pages"
                    className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-100"
                    aria-label="Back to pages"
                >
                    <FiArrowLeft size={18} />
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "Edit Page" : "Add Page"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage page content, images, and SEO settings.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic information */}
                <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div className="border-b border-gray-100 pb-4">
                        <h2 className="font-semibold text-gray-900">
                            Basic Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Add the page title and URL settings.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Page Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={updateField}
                                required
                                maxLength={200}
                                placeholder="Enter page name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Page Slug
                            </label>
                            <input
                                name="slug"
                                value={form.slug}
                                onChange={updateField}
                                disabled={!form.isCustomSlug}
                                placeholder={
                                    form.isCustomSlug
                                        ? "enter-custom-slug"
                                        : "Generated automatically from page name"
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                            />

                            <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    name="isCustomSlug"
                                    checked={form.isCustomSlug}
                                    onChange={(event) => {
                                        const checked = event.target.checked;

                                        setForm((current) => ({
                                            ...current,
                                            isCustomSlug: checked,
                                            slug: checked
                                                ? current.slug
                                                : "",
                                        }));
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                Use custom slug
                            </label>
                        </div>

                        <div className="md:col-span-2">

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Short Description
                            </label>

                            <input
                                name="shortDescription"
                                value={form.shortDescription}
                                onChange={updateField}
                                maxLength={500}
                                placeholder="Enter a short description..."
                                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-right text-xs text-slate-400">
                                {form.shortDescription.length}/500 characters
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <JoditEditor
                                ref={descriptionEditor}
                                value={form.description}
                                config={editorOptions}
                                onBlur={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: value,
                                    }))
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Extra Description
                            </label>
                            <JoditEditor
                                ref={extraDescriptionEditor}
                                value={form.extraDescription}
                                config={editorOptions}
                                onBlur={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        extraDescription: value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* Images and video */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Media
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Upload a main image and up to 10 additional images.
                        </p>
                    </div>

                    <div className="grid gap-8 p-5">
                        {/* MAIN IMAGE */}
                        <div>
                            <label className="mb-3 block text-sm font-medium text-slate-700">
                                Main Image
                            </label>

                            <div className="relative max-w-xl">
                                <label className="flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-blue-400 hover:bg-blue-50">
                                    {mainImagePreview && !removeMainImage ? (
                                        <img
                                            src={mainImagePreview}
                                            alt="Main page preview"
                                            className="h-[240px] w-full rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <FiImage className="mx-auto mb-3 text-4xl text-slate-400" />

                                            <p className="text-sm font-medium text-slate-600">
                                                Click to upload main image
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                PNG, JPG, WEBP, AVIF
                                            </p>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/avif"
                                        onChange={handleMainImage}
                                        className="hidden"
                                    />
                                </label>

                                {mainImagePreview && !removeMainImage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (mainImagePreview.startsWith("blob:")) {
                                                URL.revokeObjectURL(mainImagePreview);
                                            }

                                            setMainImage(null);
                                            setMainImagePreview("");
                                            setRemoveMainImage(true);
                                        }}
                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700"
                                        title="Remove main image"
                                    >
                                        <FiX />
                                    </button>
                                )}

                                {mainImagePreview && !removeMainImage && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Click the image to replace it.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* GALLERY IMAGES */}
                        <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Additional Images
                                </label>

                                <span className="text-xs text-slate-500">
                                    {existingImages.length + galleryFiles.length}/10 images
                                </span>
                            </div>

                            <label className="flex min-h-[170px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-blue-400 hover:bg-blue-50">
                                <div className="text-center">
                                    <FiUpload className="mx-auto mb-3 text-3xl text-slate-400" />

                                    <p className="text-sm font-medium text-slate-600">
                                        Click to upload additional images
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Select multiple images at once
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    disabled={
                                        existingImages.length + galleryFiles.length >= 10
                                    }
                                    onChange={handleGalleryImages}
                                    className="hidden"
                                />
                            </label>

                            {/* IMAGE PREVIEWS */}
                            {(existingImages.length > 0 || galleryPreviews.length > 0) && (
                                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {existingImages.map((image) => (
                                        <div
                                            key={image}
                                            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <img
                                                src={image}
                                                alt="Existing gallery image"
                                                className="h-36 w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeExistingGalleryImage(image)
                                                }
                                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-100 shadow-md transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                                                title="Remove image"
                                            >
                                                <FiX />
                                            </button>

                                            <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/75 px-2 py-1 text-[10px] font-medium text-white">
                                                Saved
                                            </span>
                                        </div>
                                    ))}

                                    {galleryPreviews.map((preview, index) => (
                                        <div
                                            key={`${preview.file.name}-${index}`}
                                            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <img
                                                src={preview.url}
                                                alt={`New gallery image ${index + 1}`}
                                                className="h-36 w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeNewGalleryImage(index)}
                                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                                                title="Remove image"
                                            >
                                                <FiX />
                                            </button>

                                            <span className="absolute bottom-2 left-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-medium text-white">
                                                New
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* VIDEO LINK */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Video Link
                            </label>

                            <input
                                type="url"
                                name="videoLink"
                                value={form.videoLink}
                                onChange={updateField}
                                placeholder="https://www.youtube.com/..."
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>

                {/* SEO */}
                <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div className="border-b border-gray-100 pb-4">
                        <h2 className="font-semibold text-gray-900">
                            SEO Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure search-engine metadata for this page.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Meta Title
                        </label>
                        <input
                            name="metaTitle"
                            value={form.metaTitle}
                            onChange={updateField}
                            maxLength={200}
                            placeholder="Enter meta title"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Meta Description
                        </label>
                        <textarea
                            name="metaDescription"
                            value={form.metaDescription}
                            onChange={updateField}
                            rows={3}
                            placeholder="Enter meta description"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Meta Keywords
                        </label>
                        <input
                            name="metaKeywords"
                            value={form.metaKeywords}
                            onChange={updateField}
                            placeholder="keyword one, keyword two, keyword three"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </section>

                {/* Status and actions */}
                <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={updateField}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <span>
                            <span className="block text-sm font-semibold text-gray-900">
                                Active page
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">
                                Active pages can be shown on the public website.
                            </span>
                        </span>
                    </label>


                </section>
                <div className="sticky bottom-0 z-30 -mx-4 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:flex-row sm:px-6">
                    <Link
                        to="/admin/pages"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiSave size={17} />
                        {saveMutation.isPending
                            ? "Saving..."
                            : isEdit
                                ? "Update Page"
                                : "Create Page"}
                    </button>
                </div>
            </form>
        </div>
    );
}