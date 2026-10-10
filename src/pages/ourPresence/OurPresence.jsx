import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import JoditEditor from "jodit-react";
import editorConfig from "../../components/ui/EditorConfig";

import {
    FiImage,
    FiSave,
    FiRefreshCw,
    FiX,
} from "react-icons/fi";

import { toast } from "sonner";

import ourPresenceService from "../../services/ourPresence.service";


const defaultValues = {
    name: "",
    shortDescription: "",
    description: "",
    extraDescription: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
};


export default function OurPresence() {
    const queryClient = useQueryClient();

    const descriptionEditor = useRef(null);
    const extraDescriptionEditor = useRef(null);

    const [description, setDescription] = useState("");
    const [extraDescription, setExtraDescription] = useState("");

    const [mainImage, setMainImage] = useState(null);
    const [mainPreview, setMainPreview] = useState("");
    const [removeMainImage, setRemoveMainImage] = useState(false);

    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Existing images that should be deleted from server
    const [removeImages, setRemoveImages] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
    } = useForm({
        defaultValues,
    });


    // ==========================================
    // GET DATA
    // ==========================================

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["our-presence"],
        queryFn: ourPresenceService.get,
    });


    // ==========================================
    // SET FORM DATA
    // ==========================================

    useEffect(() => {
        if (!data?.ourPresence) {
            return;
        }

        const item = data.ourPresence;

        reset({
            name: item.name || "",
            shortDescription: item.shortDescription || "",
            description: item.description || "",
            extraDescription: item.extraDescription || "",
            metaTitle: item.metaTitle || "",
            metaDescription: item.metaDescription || "",
            metaKeywords: item.metaKeywords || "",
        });

        setMainPreview(item.img || "");
        setRemoveMainImage(false);

        setDescription(item.description || "");
        setExtraDescription(item.extraDescription || "");

        setGalleryImages([]);

        setGalleryPreviews(
            Array.isArray(item.images)
                ? item.images
                : []
        );

        setRemoveImages([]);
    }, [data, reset]);

    const handleRemoveMainImage = () => {
        // Existing server image
        if (mainPreview && !mainImage) {
            setRemoveMainImage(true);
            setMainPreview("");
            return;
        }

        // Newly selected image
        setMainImage(null);
        setMainPreview(data?.ourPresence?.img || "");
    };

    // ==========================================
    // UPDATE
    // ==========================================

    const updateMutation = useMutation({
        mutationFn: ourPresenceService.update,

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                "Our Presence updated successfully"
            );

            setMainImage(null);
            setGalleryImages([]);

            queryClient.invalidateQueries({
                queryKey: ["our-presence"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update Our Presence"
            );
        },
    });


    // ==========================================
    // MAIN IMAGE
    // ==========================================

    const handleMainImage = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setMainImage(file);
        setRemoveMainImage(false);

        setMainPreview(
            URL.createObjectURL(file)
        );
    };

    const handleRemoveGalleryImage = (image) => {
        const isNewImage =
            image.startsWith("blob:");

        if (!isNewImage) {
            // Existing database image
            setRemoveImages((prev) =>
                prev.includes(image)
                    ? prev
                    : [...prev, image]
            );

            setGalleryPreviews((prev) =>
                prev.filter(
                    (item) => item !== image
                )
            );

            return;
        }

        // New image
        const index =
            galleryPreviews.indexOf(image);

        if (index === -1) {
            return;
        }

        setGalleryImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setGalleryPreviews((prev) =>
            prev.filter((_, i) => i !== index)
        );

        URL.revokeObjectURL(image);
    };

    // ==========================================
    // GALLERY IMAGES
    // ==========================================

    const handleGalleryImages = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (!files.length) {
            return;
        }

        setGalleryImages((prev) => [
            ...prev,
            ...files,
        ]);

        const newPreviews = files.map((file) =>
            URL.createObjectURL(file)
        );

        setGalleryPreviews((prev) => [
            ...prev,
            ...newPreviews,
        ]);

        event.target.value = "";
    };


    // ==========================================
    // SUBMIT
    // ==========================================

    const onSubmit = (values) => {
        const formData = new FormData();

        formData.append(
            "name",
            values.name || ""
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


        // ==========================================
        // MAIN IMAGE
        // ==========================================

        if (mainImage) {
            formData.append(
                "img",
                mainImage
            );
        }


        // ==========================================
        // REMOVE MAIN IMAGE
        // ==========================================

        if (removeMainImage) {
            formData.append(
                "removeMainImage",
                "true"
            );
        }


        // ==========================================
        // NEW GALLERY IMAGES
        // ==========================================

        galleryImages.forEach((file) => {
            formData.append(
                "images",
                file
            );
        });


        // ==========================================
        // REMOVE EXISTING GALLERY IMAGES
        // ==========================================

        if (removeImages.length > 0) {
            formData.append(
                "removeImages",
                JSON.stringify(removeImages)
            );
        }

        updateMutation.mutate(formData);
    };


    // ==========================================
    // RESET
    // ==========================================

    const handleReset = () => {
        const item = data?.ourPresence;

        if (!item) {
            return;
        }

        reset({
            name: item.name || "",
            shortDescription:
                item.shortDescription || "",
            description:
                item.description || "",
            extraDescription:
                item.extraDescription || "",
            metaTitle:
                item.metaTitle || "",
            metaDescription:
                item.metaDescription || "",
            metaKeywords:
                item.metaKeywords || "",
        });

        setDescription(item.description || "");
        setExtraDescription(item.extraDescription || "");

        setMainImage(null);

        setGalleryImages([]);

        setRemoveMainImage(false);

        setRemoveImages([]);

        setMainPreview(
            item.img || ""
        );

        setGalleryPreviews(
            Array.isArray(item.images)
                ? item.images
                : []
        );
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <FiRefreshCw className="animate-spin text-2xl text-blue-600" />
            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (isError) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="text-lg font-semibold text-red-700">
                    Unable to load Our Presence
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error?.response?.data?.message ||
                        "Something went wrong."}
                </p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-6xl">

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Our Presence
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage Our Presence content and images.
                    </p>
                </div>


                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >

                    {/* ================================= */}
                    {/* CONTENT */}
                    {/* ================================= */}

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">
                                Content
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Use <code>subdomain</code> where the
                                current location name should appear.
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
                                    placeholder="Enter name"
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


                            {/* Extra Description */}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Extra Description
                                </label>

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
                    </div>


                    {/* ================================= */}
                    {/* IMAGES */}
                    {/* ================================= */}

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">
                                Images
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Upload one main image and multiple
                                additional images.
                            </p>
                        </div>


                        <div className="grid gap-8 p-5">

                            {/* MAIN IMAGE */}

                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700">
                                    Main Image
                                </label>

                                <div className="relative">

                                    <label className="flex min-h-[220px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">

                                        {mainPreview ? (
                                            <img
                                                src={mainPreview}
                                                alt="Main preview"
                                                className="h-[210px] w-full rounded-lg object-contain"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <FiImage className="mx-auto mb-3 text-3xl text-slate-400" />

                                                <p className="text-sm font-medium text-slate-600">
                                                    Click to upload main image
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    PNG, JPG, WEBP
                                                </p>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleMainImage}
                                            className="hidden"
                                        />
                                    </label>


                                    {/* REMOVE MAIN IMAGE */}

                                    {mainPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveMainImage}
                                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700"
                                            title="Remove main image"
                                        >
                                            <FiX />
                                        </button>
                                    )}

                                </div>
                            </div>


                            {/* MULTIPLE IMAGES */}

                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700">
                                    Additional Images
                                </label>

                                <label className="flex min-h-[180px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">

                                    <div className="text-center">
                                        <FiImage className="mx-auto mb-3 text-3xl text-slate-400" />

                                        <p className="text-sm font-medium text-slate-600">
                                            Click to upload images
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            You can select multiple images
                                        </p>
                                    </div>

                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleGalleryImages}
                                        className="hidden"
                                    />
                                </label>


                                {/* PREVIEWS */}

                                {galleryPreviews.length > 0 && (
                                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                                        {galleryPreviews.map(
                                            (image, index) => (
                                                <div
                                                    key={`${image}-${index}`}
                                                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                                >

                                                    <img
                                                        src={image}
                                                        alt={`Gallery ${index + 1}`}
                                                        className="h-36 w-full object-cover"
                                                    />


                                                    {/* REMOVE BUTTON */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveGalleryImage(
                                                                image
                                                            )
                                                        }
                                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition group-hover:opacity-100 hover:bg-red-700"
                                                        title="Remove image"
                                                    >
                                                        <FiX />
                                                    </button>


                                                    {/* NEW IMAGE LABEL */}

                                                    {image.startsWith("blob:") && (
                                                        <span className="absolute bottom-2 left-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-medium text-white">
                                                            New
                                                        </span>
                                                    )}

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                            </div>

                        </div>
                    </div>


                    {/* ================================= */}
                    {/* SEO */}
                    {/* ================================= */}

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">
                                SEO Settings
                            </h2>
                        </div>

                        <div className="grid gap-5 p-5">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Meta Title
                                </label>

                                <input
                                    {...register("metaTitle")}
                                    placeholder="Enter meta title"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                        </div>
                    </div>


                    {/* ================================= */}
                    {/* STICKY ACTIONS */}
                    {/* ================================= */}

                    <div className="sticky bottom-0 z-20 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">

                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={handleReset}
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
                                {updateMutation.isPending ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave />
                                        Save Changes
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
}