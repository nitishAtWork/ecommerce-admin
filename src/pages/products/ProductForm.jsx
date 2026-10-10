import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import JoditEditor from "jodit-react";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import editorConfig from "../../components/ui/EditorConfig";
import productService from "../../services/product.service";
import { getImageUrl } from "../../utils/getImageUrl";

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  shortDescription: z.string().trim()
    .max(500, "Short description cannot exceed 500 characters.")
    .optional().or(z.literal("")),
  description: z.string().trim().min(5, "Description is required."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  compareAtPrice: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative."),
  size: z.string().trim().optional().or(z.literal("")),
  deliveryCharge: z.coerce.number().nonnegative("Delivery charge cannot be negative.").optional(),
  sku: z.string().trim().min(1, "SKU is required."),
  brand: z.string().trim().optional().or(z.literal("")),
});

const defaultValues = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: 0,
  size: "",
  deliveryCharge: 0,
  sku: "",
  brand: "",
};

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const descriptionEditor = useRef(null);

  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [removedExistingImages, setRemovedExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const {
    register,
    reset,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!isEdit || !data) return;

    const product =
      data?.data?.product ||
      data?.data?.data?.product ||
      data?.product ||
      data?.data?.data ||
      data?.data;

    if (!product || typeof product !== "object") return;

    const productDescription = product.description || "";
    reset({
      name: product.name || "",
      shortDescription: product.shortDescription || "",
      description: productDescription,
      price: product.price ?? "",
      compareAtPrice: product.compareAtPrice ?? "",
      stock: product.stock ?? 0,
      size: product.size || "",
      deliveryCharge: product.deliveryCharge ?? 0,
      sku: product.sku || "",
      brand: product.brand || "",
    });
    setDescription(productDescription);
    setIsFeatured(Boolean(product.isFeatured));
    setIsActive(product.isActive !== false);
    setMainImage(null);
    setMainImagePreview(product.img ? getImageUrl(product.img) : "");
    setExistingImages(
      Array.isArray(product.images)
        ? product.images.filter(Boolean).map((image) => ({
            original: image,
            url: getImageUrl(image),
          }))
        : []
    );
    setRemovedExistingImages([]);
    setNewImages([]);
    setNewImagePreviews([]);
  }, [data, isEdit, reset]);

  const handleMainImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setMainImage(file);
    setMainImagePreview((previous) => {
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  };

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview((previous) => {
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
      return "";
    });
  };

  const handleAdditionalImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const remaining = 10 - existingImages.length - newImages.length;
    if (remaining <= 0) {
      toast.error("Maximum 10 additional images allowed.");
      return;
    }

    const selectedFiles = files.slice(0, remaining);
    setNewImages((previous) => [...previous, ...selectedFiles]);
    setNewImagePreviews((previous) => [
      ...previous,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ]);

    if (files.length > remaining) {
      toast.warning(`Only ${remaining} additional image(s) were added.`);
    }
  };

  const removeExistingImage = (index) => {
    const image = existingImages[index];
    if (!image) return;

    setRemovedExistingImages((previous) => [...previous, image.original]);
    setExistingImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeNewImage = (index) => {
    const preview = newImagePreviews[index];
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    setNewImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    setNewImagePreviews((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  const onSubmit = async (values) => {
    try {
      // Validate the Jodit-controlled value as well as the rest of the form.
      setValue("description", description, { shouldDirty: true, shouldValidate: true });
      const descriptionIsValid = await trigger("description");
      if (!descriptionIsValid) {
        toast.error("Please enter a product description.");
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("description", description);
      formData.append("shortDescription", values.shortDescription || "");
      formData.append("price", String(values.price));

      if (values.compareAtPrice !== "" && values.compareAtPrice !== undefined) {
        formData.append("compareAtPrice", String(values.compareAtPrice));
      }

      formData.append("stock", String(values.stock));
      formData.append("size", values.size || "");
      formData.append("deliveryCharge", String(values.deliveryCharge ?? 0));
      formData.append("sku", values.sku.trim().toUpperCase());
      formData.append("brand", values.brand || "");
      formData.append("isFeatured", String(isFeatured));
      formData.append("isActive", String(isActive));

      // The backend generates the slug from the product name.
      if (mainImage) formData.append("img", mainImage);
      newImages.forEach((file) => formData.append("images", file));

      if (isEdit) {
        existingImages.forEach((image) => formData.append("existingImages", image.original));
        removedExistingImages.forEach((image) => formData.append("removeImages", image));
        await productService.updateProduct(id, formData);
        toast.success("Product updated successfully.");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created successfully.");
      }

      navigate("/admin/products", { replace: true });
    } catch (submitError) {
      console.error(`${isEdit ? "Update" : "Create"} product error:`, submitError);
      toast.error(
        submitError?.response?.data?.message ||
        `Failed to ${isEdit ? "update" : "create"} product.`
      );
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading product...
        </div>
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div>
        <PageHeader title="Edit Product" description="Unable to load product." />
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {error?.response?.data?.message || "Product could not be loaded."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Product" : "Add Product"}
        description={isEdit ? "Update product information." : "Create a new product for your store."}
        action={
          <Button type="button" variant="secondary" onClick={() => navigate("/admin/products")}>
            <ArrowLeft size={17} />
            Back to Products
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Product Information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the basic information and rich-text description for this product.
            </p>
          </div>
          <div className="space-y-5 p-5">
            <Input
              label="Product Name"
              name="name"
              placeholder="Enter product name"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <JoditEditor
                ref={descriptionEditor}
                value={description}
                config={editorConfig}
                onBlur={(value) => {
                  setDescription(value);
                  setValue("description", value, { shouldDirty: true, shouldValidate: true });
                }}
                onChange={(value) => {
                  setDescription(value);
                  setValue("description", value, { shouldDirty: true, shouldValidate: true });
                }}
              />
              {errors.description?.message && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Pricing &amp; Inventory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure pricing, stock and product identification.
            </p>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Input label="Price" name="price" type="number" min="0" step="0.01" placeholder="0.00" required error={errors.price?.message} {...register("price")} />
            <Input label="Compare At Price" name="compareAtPrice" type="number" min="0" step="0.01" placeholder="0.00" error={errors.compareAtPrice?.message} {...register("compareAtPrice")} />
            <Input label="Size" name="size" placeholder="e.g. 8 inch, Medium, Large" error={errors.size?.message} {...register("size")} />
            <Input label="Delivery Charge" name="deliveryCharge" type="number" min="0" step="0.01" placeholder="0.00" error={errors.deliveryCharge?.message} {...register("deliveryCharge")} />
            <Input label="Stock" name="stock" type="number" min="0" step="1" placeholder="0" required error={errors.stock?.message} {...register("stock")} />
            <Input label="SKU" name="sku" placeholder="PRODUCT-001" required error={errors.sku?.message} {...register("sku")} />
            <Input label="Brand" name="brand" placeholder="Enter brand" error={errors.brand?.message} {...register("brand")} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Product Images</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload one main image and up to 10 additional images.
            </p>
          </div>
          <div className="space-y-7 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Main Image</label>
              {mainImagePreview ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-slate-200">
                  <img src={mainImagePreview} alt="Main product" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow"
                    aria-label="Remove main image preview"
                  >
                    <X size={17} />
                  </button>
                  <label className="absolute inset-x-0 bottom-0 cursor-pointer bg-black/60 py-2 text-center text-xs text-white">
                    Replace image
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImage} />
                  </label>
                </div>
              ) : (
                <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                  <ImagePlus size={32} className="text-slate-400" />
                  <span className="mt-2 text-sm font-medium text-slate-600">Choose image</span>
                  <span className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImage} />
                </label>
              )}
              {isEdit && (
                <p className="mt-2 text-xs text-slate-400">
                  Select a new image to replace the saved image. Confirm backend support before using removal without replacement.
                </p>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700">Additional Images</label>
                  <p className="mt-1 text-xs text-slate-400">Remove existing images or add new ones.</p>
                </div>
                <span className="text-xs text-slate-400">{existingImages.length + newImages.length}/10</span>
              </div>

              <div className="flex flex-wrap gap-4">
                {existingImages.map((image, index) => (
                  <div key={`${image.original}-${index}`} className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200">
                    <img src={image.url} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow"
                      aria-label={`Remove existing image ${index + 1}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {newImagePreviews.map((preview, index) => (
                  <div key={preview} className="relative h-28 w-28 overflow-hidden rounded-lg border-2 border-blue-300">
                    <img src={preview} alt={`New product image ${index + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">New</span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow"
                      aria-label={`Remove new image ${index + 1}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {existingImages.length + newImages.length < 10 && (
                  <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                    <ImagePlus size={24} className="text-slate-400" />
                    <span className="mt-1 text-xs text-slate-500">Add images</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleAdditionalImages} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Product Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Configure product visibility and featured status.</p>
          </div>
          <div className="space-y-4 p-5">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
              <span>
                <span className="block text-sm font-medium text-slate-900">Active Product</span>
                <span className="mt-1 block text-xs text-slate-500">Make this product available in the store.</span>
              </span>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
              <span>
                <span className="block text-sm font-medium text-slate-900">Featured Product</span>
                <span className="mt-1 block text-xs text-slate-500">Show this product as featured.</span>
              </span>
              <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>
        </section>

        <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
