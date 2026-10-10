import { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

import ConfirmModal from "../../components/ui/ConfirmModal";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import productService from "../../services/product.service";
import useDebounce from "../../hooks/useDebounce";
import { formatCurrency } from "../../utils/formatCurrency";

function Products() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const queryClient =
    useQueryClient();

  const [deleteProduct, setDeleteProduct] =
    useState(null);

  const deleteMutation =
    useMutation({
      mutationFn: (id) =>
        productService.deleteProduct(id),

      onSuccess: () => {
        toast.success(
          "Product deleted successfully."
        );

        setDeleteProduct(null);

        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
      },

      onError: (error) => {
        toast.error(
          error.response?.data?.message ||
          "Failed to delete product."
        );
      },
    });

  const debouncedSearch = useDebounce(search, 500);

  /*
   * Reset pagination when search/filter changes
   */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      {
        page,
        limit,
        search: debouncedSearch,
        status,
      },
    ],

    queryFn: () =>
      productService.getProducts({
        page,
        limit,
        ...(debouncedSearch
          ? { search: debouncedSearch }
          : {}),
        ...(status !== "all"
          ? {
            isActive: status === "active",
          }
          : {}),
      }),
  });

  const products = data?.data?.products || [];

  // console.log("Products data:", data);

  const pagination = data?.data?.pagination || {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const handleEdit = (id) => {
    navigate(`/admin/products/${id}/edit`);
  };

  const handleDelete = (product) => {
    setDeleteProduct(product);
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your ecommerce products."
        action={
          <Button
            onClick={() =>
              navigate("/admin/products/add")
            }
          >
            <Plus size={18} />
            Add Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>
            {error?.response?.data?.message ||
              "Failed to load products."}
          </span>

          <button
            type="button"
            onClick={() => refetch()}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  SKU
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Price
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {isLoading ? (
                <ProductTableSkeleton />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="flex flex-col items-center justify-center py-16">

                      <PackageOpen
                        size={42}
                        className="text-slate-300"
                      />

                      <h3 className="mt-3 text-sm font-semibold text-slate-700">
                        No products found
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filters.
                      </p>

                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {(pagination.page - 1) *
                  pagination.limit +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(
                  pagination.page *
                  pagination.limit,
                  pagination.total
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {pagination.total}
              </span>{" "}
              products
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage ||
                  isFetching
                }
                onClick={() =>
                  setPage((previous) =>
                    Math.max(previous - 1, 1)
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm text-slate-600">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage ||
                  isFetching
                }
                onClick={() =>
                  setPage((previous) =>
                    previous + 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>

            </div>

          </div>
        )}

      </div>
      <ConfirmModal
        open={Boolean(deleteProduct)}
        title="Delete product?"
        description={
          deleteProduct
            ? `Are you sure you want to delete "${deleteProduct.name}"? The product will be removed from the active product list.`
            : ""
        }
        confirmText="Delete Product"
        loading={deleteMutation.isPending}
        onCancel={() =>
          setDeleteProduct(null)
        }
        onConfirm={() => {
          if (deleteProduct) {
            deleteMutation.mutate(
              deleteProduct._id
            );
          }
        }}
      />
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const queryClient = useQueryClient();

  const image = getImageUrl(
    product.img || product.images?.[0]
  );

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      productService.toggleProductStatus(id, isActive),
    onSuccess: () => {
      toast.success(
        "Product status updated successfully."
      );
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to update product status."
      );
    },
  });

  return (
    <tr className="hover:bg-slate-50/70">

      {/* Product */}
      <td className="px-5 py-4">

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <PackageOpen size={20} />
              </div>
            )}
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-medium text-slate-900 max-w-70">
              {product.name}
            </p>

            {product.brand && (
              <p className="mt-0.5 text-xs text-slate-400">
                {product.brand}
              </p>
            )}

          </div>

        </div>

      </td>

      {/* SKU */}
      <td className="px-5 py-4 text-sm text-slate-600">
        {product.sku || "-"}
      </td>

      {/* Price */}
      <td className="px-5 py-4">

        <div className="text-sm font-medium text-slate-900">
          {formatCurrency(product.price)}
        </div>

        {product.compareAtPrice && (
          <div className="text-xs text-slate-400 line-through">
            {formatCurrency(product.compareAtPrice)}
          </div>
        )}

      </td>

      {/* Stock */}
      <td className="px-5 py-4">

        <span
          className={
            product.stock > 0
              ? "text-sm text-slate-700"
              : "text-sm font-medium text-red-600"
          }
        >
          {product.stock ?? 0}
        </span>

      </td>

      {/* Status */}
      {/* Status */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={product.isActive}
            disabled={toggleStatusMutation.isPending}
            onClick={() =>
              toggleStatusMutation.mutate({
                id: product._id,
                isActive: !product.isActive,
              })
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${product.isActive ? "bg-green-500" : "bg-slate-300"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${product.isActive
                ? "translate-x-6"
                : "translate-x-1"
                }`}
            />
          </button>

          <span
            className={`text-xs font-medium ${product.isActive
              ? "text-green-600"
              : "text-slate-500"
              }`}
          >
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right max-w-32">

        <div className="relative flex items-center gap-3 justify-end">

          <button
            type="button"
            title="View Product"
            onClick={() => {
              setMenuOpen(false);

              window.location.href =
                `/admin/products/${product._id}`;
            }}
            className="flex cursor-pointer w-full items-center py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={21} />
          </button>

          <button
            type="button"
            title="Edit Product"
            onClick={() => {
              setMenuOpen(false);
              onEdit(product._id);
            }}
               className="rounded-lg border border-gray-200 p-2.5 text-blue-600 transition hover:bg-blue-50"
          >
            <Pencil size={18} />
          </button>


          <button
            type="button"
            title="Delete Product"
            onClick={() => {
              setMenuOpen(false);
              onDelete(product);
            }}
            className="rounded-lg border border-gray-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>

          {/* <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (previous) => !previous
              )
            }
            className="rounded-lg p-2 cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreVertical size={18} />
          </button> */}

          {/* {menuOpen && (
            <div className="absolute right-6 z-20 mt-1 w-fit overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(product);
                }}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>

            </div>
          )} */}

        </div>

      </td>

    </tr>
  );
}

function ProductTableSkeleton() {
  return Array.from({ length: 5 }).map(
    (_, index) => (
      <tr key={index}>

        {Array.from({ length: 6 }).map(
          (_, cellIndex) => (
            <td
              key={cellIndex}
              className="px-5 py-5"
            >
              <div className="h-4 animate-pulse rounded bg-slate-100" />
            </td>
          )
        )}

      </tr>
    )
  );
}

export default Products;