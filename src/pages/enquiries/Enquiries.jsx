import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiMail,
  FiPhone,
  FiSearch,
  FiTrash2,
  FiCheck,
  FiCircle,
} from "react-icons/fi";
import { toast } from "sonner";

import enquiryService from "../../services/enquiryService";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function Enquiries() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [deleteId, setDeleteId] = useState(null);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["enquiries"],
    queryFn: enquiryService.getAll,
  });

  const enquiries = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: enquiryService.delete,

    onSuccess: () => {
      toast.success("Enquiry deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["enquiries"],
      });
      setDeleteId(null);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete enquiry"
      );
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: enquiryService.toggleRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enquiries"],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update enquiry"
      );
    },
  });

  const filteredEnquiries = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch =
        !keyword ||
        enquiry.name?.toLowerCase().includes(keyword) ||
        enquiry.email?.toLowerCase().includes(keyword) ||
        enquiry.phone?.toLowerCase().includes(keyword) ||
        enquiry.subject?.toLowerCase().includes(keyword) ||
        enquiry.queryFor?.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" ||
        (filter === "read" && enquiry.read === true) ||
        (filter === "unread" && enquiry.read !== true);

      return matchesSearch && matchesFilter;
    });
  }, [enquiries, search, filter]);

  const unreadCount = enquiries.filter(
    (item) => !item.read
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enquiries
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer enquiries and messages.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-600">
            Unread Enquiries
          </p>

          <p className="text-xl font-bold text-blue-700">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, email, phone, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Enquiries</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-red-500">
            Failed to load enquiries.
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <FiMail className="mb-3 text-4xl text-gray-300" />

            <h3 className="font-semibold text-gray-800">
              No enquiries found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no enquiries matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Query For
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredEnquiries.map((enquiry) => (
                  <tr
                    key={enquiry._id}
                    className={`transition hover:bg-gray-50 ${
                      !enquiry.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {enquiry.name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <p
                            className={`text-sm ${
                              !enquiry.read
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-800"
                            }`}
                          >
                            {enquiry.name || "-"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {enquiry.email || enquiry.phone || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="max-w-[240px] px-6 py-4">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {enquiry.subject || "No subject"}
                      </p>
                    </td>

                    {/* Query For */}
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {enquiry.queryFor || "-"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {enquiry.createdAt
                        ? new Date(
                            enquiry.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          toggleReadMutation.mutate(
                            enquiry._id
                          )
                        }
                        disabled={toggleReadMutation.isPending}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          enquiry.read
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {enquiry.read ? (
                          <>
                            <FiCheck />
                            Read
                          </>
                        ) : (
                          <>
                            <FiCircle />
                            Unread
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/enquiries/${enquiry._id}`
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="View enquiry"
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteId(enquiry._id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete enquiry"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}