import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import productService from "../../services/product.service";

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
    .positive("Price must be greater than 0."),

  compareAtPrice: z
    .union([
      z.coerce.number().positive(),
      z.literal(""),
    ])
    .optional(),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),

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
    .min(1, "SKU is required."),

  brand: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

function AddProduct() {
  const navigate = useNavigate();

  const [mainImage, setMainImage] =
    useState(null);

  const [mainImagePreview, setMainImagePreview] =
    useState("");

  const [additionalImages, setAdditionalImages] =
    useState([]);

  const [additionalPreviews, setAdditionalPreviews] =
    useState([]);

  const [isFeatured, setIsFeatured] =
    useState(false);

  const [isActive, setIsActive] =
    useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),

    defaultValues: {
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
    },
  });

  const handleMainImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMainImage(file);

    setMainImagePreview(
      URL.createObjectURL(file)
    );
  };

  const removeMainImage = () => {
    setMainImage(null);

    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    setMainImagePreview("");
  };

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

  const onSubmit = async (values) => {
    try {
      // if (!mainImage) {
      //   toast.error(
      //     "Please select a main product image."
      //   );

      //   return;
      // }

      const formData = new FormData();

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
        values.compareAtPrice !== "" &&
        values.compareAtPrice !== undefined
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
        values.size || ""
      );

      formData.append(
        "deliveryCharge",
        values.deliveryCharge || 0
      );

      formData.append(
        "sku",
        values.sku.toUpperCase()
      );

      if (values.brand) {
        formData.append(
          "brand",
          values.brand
        );
      }

      formData.append(
        "isFeatured",
        String(isFeatured)
      );

      formData.append(
        "isActive",
        String(isActive)
      );

      /*
       * IMPORTANT:
       * Backend expects main image as `img`.
       */
      if (mainImage) {
        formData.append("img", mainImage);
      }

      /*
       * Backend accepts up to 10 additional
       * images using `images`.
       */
      additionalImages.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      /*
       * Do NOT send slug.
       * Backend generates it from name.
       */

      await productService.createProduct(
        formData
      );

      toast.success(
        "Product created successfully."
      );

      navigate("/admin/products", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to create product."
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Product"
        description="Create a new product for your store."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            <ArrowLeft size={17} />
            Back to Products
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Product Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Product Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the basic information about the product.
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
              error={
                errors.shortDescription?.message
              }
              {...register("shortDescription")}
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Enter complete product description"
              rows={7}
              required
              error={
                errors.description?.message
              }
              {...register("description")}
            />

          </div>

        </section>

        {/* Pricing and Inventory */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Pricing & Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure pricing, stock and product identification.
            </p>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">

            <Input
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
              error={errors.price?.message}
              {...register("price")}
            />

            <Input
              label="Compare At Price"
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              error={
                errors.compareAtPrice?.message
              }
              {...register("compareAtPrice")}
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
              label="Stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              error={errors.stock?.message}
              {...register("stock")}
            />

            <Input
              label="SKU"
              name="sku"
              placeholder="PRODUCT-001"
              required
              error={errors.sku?.message}
              {...register("sku")}
            />

            <Input
              label="Brand"
              name="brand"
              placeholder="Enter brand"
              error={errors.brand?.message}
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
              Upload one main image and up to 10 additional images.
            </p>
          </div>

          <div className="space-y-6 p-5">

            {/* Main Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Main Image
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              {mainImagePreview ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-slate-200">

                  <img
                    src={mainImagePreview}
                    alt="Main product"
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeMainImage}
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
                    onChange={handleMainImage}
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
                  {additionalImages.length}/10
                </span>

              </div>

              <div className="flex flex-wrap gap-4">

                {additionalPreviews.map(
                  (preview, index) => (
                    <div
                      key={preview}
                      className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200"
                    >
                      <img
                        src={preview}
                        alt={`Product ${index + 1}`}
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
                        <X size={14} />
                      </button>
                    </div>
                  )
                )}

                {additionalImages.length < 10 && (
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

        {/* Product Settings */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Product Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure the visibility of this product.
            </p>
          </div>

          <div className="space-y-5 p-5">

            {/* Active */}
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Active Product
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Customers can see this product when active.
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

            {/* Featured */}
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Featured Product
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Mark this product as featured.
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
                navigate("/admin/products")
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Product
            </Button>

          </div>
        </div>

      </form>
    </div>
  );
}

export default AddProduct;