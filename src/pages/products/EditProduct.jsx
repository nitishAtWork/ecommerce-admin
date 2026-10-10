import { useEffect, useState } from "react";
import {
    ArrowLeft,
    ImagePlus,
    X,
    Loader2,
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
import productService from "../../services/product.service";
import { getImageUrl } from "../../utils/getImageUrl";

const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Product name is required."),

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
        .min(5, "Description is required."),

    price: z.coerce
        .number()
        .positive(
            "Price must be greater than 0."
        ),

    compareAtPrice: z
        .union([
            z.coerce.number().positive(),
            z.literal(""),
        ])
        .optional(),

    stock: z.coerce
        .number()
        .int(
            "Stock must be a whole number."
        )
        .min(
            0,
            "Stock cannot be negative."
        ),

    size: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    deliveryCharge: z.coerce
        .number()
        .nonnegative(
            "Delivery charge cannot be negative."
        )
        .optional(),

    sku: z
        .string()
        .trim()
        .min(
            1,
            "SKU is required."
        ),

    brand: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),
});

function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [mainImage, setMainImage] =
        useState(null);

    const [mainImagePreview, setMainImagePreview] =
        useState("");

    const [existingImages, setExistingImages] =
        useState([]);

    const [removedExistingImages, setRemovedExistingImages] =
        useState([]);

    const [newImages, setNewImages] =
        useState([]);

    const [newImagePreviews, setNewImagePreviews] =
        useState([]);

    const [isFeatured, setIsFeatured] =
        useState(false);

    const [isActive, setIsActive] =
        useState(true);

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
            productSchema
        ),
    });

    /*
     * Load product
     */
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            "product",
            id,
        ],

        queryFn: () =>
            productService.getProductById(id),
        enabled: Boolean(id),
    });

    /*
     * Populate form after API response
     */
    useEffect(() => {
        if (!data) {
            return;
        }

        const product =
            data?.data?.product ||
            data?.product;

        if (!product) {
            return;
        }

        reset({
            name: product.name || "",

            shortDescription:
                product.shortDescription || "",

            description:
                product.description || "",

            price:
                product.price ?? "",

            compareAtPrice:
                product.compareAtPrice ?? "",

            stock:
                product.stock ?? 0,

            sku:
                product.sku || "",

            brand:
                product.brand || "",

            size:
                product.size || "",

            deliveryCharge:
                product.deliveryCharge ?? 0,
        });

        setIsFeatured(
            Boolean(product.isFeatured)
        );

        setIsActive(
            product.isActive !== false
        );

        /*
         * Main image
         */
        if (product.img) {
            setMainImagePreview(
                getImageUrl(product.img)
            );
        }

        /*
         * Existing additional images
         */
        if (
            Array.isArray(product.images)
        ) {
            setExistingImages(
                product.images
                    .filter(Boolean)
                    .map((image) => ({
                        original: image,
                        url: getImageUrl(image),
                    }))
            );
        }
    }, [data, reset]);

    /*
     * Main image replacement
     */
    const handleMainImage = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            mainImagePreview &&
            mainImagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                mainImagePreview
            );
        }

        setMainImage(file);

        setMainImagePreview(
            URL.createObjectURL(file)
        );
    };

    /*
     * Remove current main image
     *
     * We don't immediately delete it from server.
     * The backend will receive the new image if
     * one is selected.
     */
    const removeMainImage = () => {
        if (
            mainImagePreview &&
            mainImagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                mainImagePreview
            );
        }

        setMainImage(null);
        setMainImagePreview("");
    };

    /*
     * Add new additional images
     */
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

        setNewImagePreviews((previous) => [
            ...previous,
            ...selectedFiles.map(
                (file) =>
                    URL.createObjectURL(file)
            ),
        ]);

        if (
            files.length > remaining
        ) {
            toast.warning(
                `Only ${remaining} image(s) were added.`
            );
        }

        event.target.value = "";
    };

    /*
     * Remove existing server image
     */
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

    /*
     * Remove newly selected image
     */
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

    /*
     * Submit
     */
    const onSubmit = async (
        values
    ) => {
        try {
            const formData =
                new FormData();

            formData.append(
                "name",
                values.name
            );

            formData.append(
                "description",
                values.description
            );

            formData.append(
                "shortDescription",
                values.shortDescription || ""
            );

            formData.append(
                "price",
                values.price
            );

            if (
                values.compareAtPrice !==
                "" &&
                values.compareAtPrice !==
                undefined
            ) {
                formData.append(
                    "compareAtPrice",
                    values.compareAtPrice
                );
            }

            formData.append(
                "stock",
                values.stock
            );

            formData.append(
                "size",
                values.size
            );

            formData.append(
                "deliveryCharge",
                values.deliveryCharge
            );

            formData.append(
                "sku",
                values.sku.toUpperCase()
            );

            formData.append(
                "brand",
                values.brand || ""
            );

            formData.append(
                "isFeatured",
                String(isFeatured)
            );

            formData.append(
                "isActive",
                String(isActive)
            );

            /*
             * Only send img when a new main
             * image was selected.
             */
            if (mainImage) {
                formData.append(
                    "img",
                    mainImage
                );
            }

            /*
             * Send new additional images.
             */
            newImages.forEach(
                (file) => {
                    formData.append(
                        "images",
                        file
                    );
                }
            );

            /*
             * Existing images that should remain.
             *
             * We send their original paths so
             * backend can preserve them.
             */
            existingImages.forEach(
                (image) => {
                    formData.append(
                        "existingImages",
                        image.original
                    );
                }
            );

            /*
             * Existing images removed by admin.
             */
            removedExistingImages.forEach(
                (image) => {
                    formData.append(
                        "removeImages",
                        image
                    );
                }
            );

            /*
             * IMPORTANT:
             *
             * Do NOT send slug.
             */

            await productService.updateProduct(
                id,
                formData
            );

            toast.success(
                "Product updated successfully."
            );

            navigate(
                "/admin/products",
                {
                    replace: true,
                }
            );
        } catch (error) {
            console.error(
                "Update product error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update product."
            );
        }
    };

    /*
     * Loading
     */
    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2
                        size={18}
                        className="animate-spin"
                    />

                    Loading product...
                </div>
            </div>
        );
    }

    /*
     * Error
     */
    if (isError) {
        return (
            <div>
                <PageHeader
                    title="Edit Product"
                    description="Unable to load product."
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                    {error?.response?.data?.message ||
                        "Product could not be loaded."}
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Edit Product"
                description="Update product information."
                action={
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                    >
                        <ArrowLeft size={17} />
                        Back to Products
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit(
                    onSubmit
                )}
                className="space-y-6"
            >
                {/* Product Information */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Product Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Update the product information.
                        </p>
                    </div>

                    <div className="space-y-5 p-5">

                        <Input
                            label="Product Name"
                            name="name"
                            placeholder="Enter product name"
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
                            placeholder="Enter description"
                            rows={7}
                            required
                            error={
                                errors.description
                                    ?.message
                            }
                            {...register(
                                "description"
                            )}
                        />

                    </div>
                </section>

                {/* Pricing */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Pricing & Inventory
                        </h2>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-2">

                        <Input
                            label="Price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            error={
                                errors.price?.message
                            }
                            {...register("price")}
                        />

                        <Input
                            label="Compare At Price"
                            name="compareAtPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            error={
                                errors.compareAtPrice
                                    ?.message
                            }
                            {...register(
                                "compareAtPrice"
                            )}
                        />

                        <Input
                            label="Stock"
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            required
                            error={
                                errors.stock?.message
                            }
                            {...register("stock")}
                        />

                        <Input
                            label="Size"
                            name="size"
                            placeholder="e.g. 8 inch, Medium, Large"
                            error={errors.size?.message}
                            {...register("size")}
                        />

                        <Input
                            label="Delivery Charge"
                            name="deliveryCharge"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            error={errors.deliveryCharge?.message}
                            {...register("deliveryCharge")}
                        />


                        <Input
                            label="SKU"
                            name="sku"
                            required
                            error={
                                errors.sku?.message
                            }
                            {...register("sku")}
                        />

                        <Input
                            label="Brand"
                            name="brand"
                            error={
                                errors.brand?.message
                            }
                            {...register("brand")}
                        />

                    </div>
                </section>

                {/* Images */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Product Images
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage the main and additional product images.
                        </p>
                    </div>

                    <div className="space-y-7 p-5">

                        {/* Main Image */}
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
                                        alt="Product"
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
                                <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50">

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
                                Select a new image only if you want to replace the current one.
                            </p>

                        </div>

                        {/* Existing + New Images */}
                        <div>

                            <div className="mb-3 flex items-center justify-between">

                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Additional Images
                                    </label>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Remove old images or add new ones.
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
                                    (image, index) => (
                                        <div
                                            key={
                                                image.original
                                            }
                                            className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200"
                                        >

                                            <img
                                                src={image.url}
                                                alt={`Product ${index + 1}`}
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
                                                <X size={14} />
                                            </button>

                                        </div>
                                    )
                                )}

                                {/* New images */}
                                {newImagePreviews.map(
                                    (preview, index) => (
                                        <div
                                            key={preview}
                                            className="relative h-28 w-28 overflow-hidden rounded-lg border-2 border-blue-300"
                                        >

                                            <img
                                                src={preview}
                                                alt={`New image ${index + 1}`}
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
                                                <X size={14} />
                                            </button>

                                        </div>
                                    )
                                )}

                                {/* Add */}
                                {existingImages.length +
                                    newImages.length <
                                    10 && (
                                        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50">

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

                {/* Settings */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            Product Settings
                        </h2>
                    </div>

                    <div className="space-y-4 p-5">

                        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Active Product
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Make this product available in the store.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) =>
                                    setIsActive(
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                        </label>

                        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Featured Product
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Show this product as featured.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(event) =>
                                    setIsFeatured(
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                        </label>

                    </div>
                </section>

                {/* Actions */}
                <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isSubmitting}
                            onClick={() =>
                                navigate(
                                    "/admin/products"
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
                            Update Product
                        </Button>

                    </div>
                </div>

            </form>
        </div>
    );
}

export default EditProduct;