import {
  ArrowLeft,
  Edit,
  Package,
  Star,
  Tag,
  Warehouse,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";

import productService from "../../services/product.service";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

import {
  getImageUrl,
} from "../../utils/getImageUrl";

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
        Loading product...
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <PageHeader
          title="Product Details"
          description="Unable to load product."
        />

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {error?.response?.data?.message ||
            "Product not found."}
        </div>
      </div>
    );
  }

  const product =
    data?.data?.product ||
    data?.product;

  if (!product) {
    return (
      <div>
        <PageHeader
          title="Product Details"
          description="Product not found."
        />
      </div>
    );
  }

  const mainImage =
    product.img ||
    product.images?.[0];

  return (
    <div>

      <PageHeader
        title="Product Details"
        description="View product information."
        action={
          <div className="flex gap-2">

            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
            >
              <ArrowLeft size={17} />
              Back
            </Button>

            <Button
              onClick={() =>
                navigate(
                  `/admin/products/${id}/edit`
                )
              }
            >
              <Edit size={17} />
              Edit Product
            </Button>

          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Images */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">

          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">

            {mainImage ? (
              <img
                src={getImageUrl(mainImage)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <Package size={48} />
              </div>
            )}

          </div>

          {product.images?.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">

              {product.images.map(
                (image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* Product Information */}
        <div className="space-y-6 lg:col-span-2">

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-2xl font-bold text-slate-900">
                    {product.name}
                  </h2>

                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                      <Star
                        size={13}
                        fill="currentColor"
                      />
                      Featured
                    </span>
                  )}

                </div>

                {product.brand && (
                  <p className="mt-1 text-sm text-slate-500">
                    {product.brand}
                  </p>
                )}

              </div>

              <span
                className={
                  product.isActive
                    ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                }
              >
                {product.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

            <div className="mt-6">

              {product.shortDescription && (
                <p className="text-sm leading-6 text-slate-600">
                  {product.shortDescription}
                </p>
              )}

              <div className="mt-5 border-t border-slate-100 pt-5">

                <h3 className="text-sm font-semibold text-slate-900">
                  Description
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {product.description || "-"}
                </p>

              </div>

            </div>

          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Tag size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Price
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatCurrency(
                      product.price
                    )}
                  </p>
                </div>

              </div>

              {product.compareAtPrice && (
                <p className="mt-2 text-xs text-slate-400 line-through">
                  {formatCurrency(
                    product.compareAtPrice
                  )}
                </p>
              )}

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Warehouse size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Stock
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {product.stock ?? 0}
                  </p>
                </div>

              </div>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Package size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    SKU
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {product.sku || "-"}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Additional Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              Product Information
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">

              <InfoItem
                label="Product ID"
                value={product._id}
              />

              <InfoItem
                label="Slug"
                value={product.slug}
              />

              <InfoItem
                label="Brand"
                value={product.brand}
              />

              <InfoItem
                label="SKU"
                value={product.sku}
              />

              <InfoItem
                label="Featured"
                value={
                  product.isFeatured
                    ? "Yes"
                    : "No"
                }
              />

              <InfoItem
                label="Status"
                value={
                  product.isActive
                    ? "Active"
                    : "Inactive"
                }
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

export default ProductDetails;