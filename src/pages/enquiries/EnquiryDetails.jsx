import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiSave,
  FiUser,
} from "react-icons/fi";
import { toast } from "sonner";

import enquiryService from "../../services/enquiryService";

export default function EnquiryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["enquiry", id],
    queryFn: () => enquiryService.getById(id),
    enabled: Boolean(id),
  });

  const enquiry = data?.data;

  useEffect(() => {
    if (enquiry) {
      setComment(enquiry.comment || "");
      setStatus(enquiry.status || "");
    }
  }, [enquiry]);

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      enquiryService.update(id, payload),

    onSuccess: () => {
      toast.success("Enquiry updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["enquiry", id],
      });

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

  const markReadMutation = useMutation({
    mutationFn: () => enquiryService.markAsRead(id),

    onSuccess: () => {
      toast.success("Marked as read");

      queryClient.invalidateQueries({
        queryKey: ["enquiry", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["enquiries"],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to mark enquiry as read"
      );
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      comment,
      status,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (isError || !enquiry) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-600">
          Failed to load enquiry.
        </p>

        <button
          type="button"
          onClick={() => navigate("/admin/enquiries")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Enquiries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/enquiries")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Enquiry Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage customer enquiry.
            </p>
          </div>
        </div>

        {!enquiry.read && (
          <button
            type="button"
            onClick={() => markReadMutation.mutate()}
            disabled={markReadMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <FiCheck />
            Mark as Read
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main enquiry */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer information */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Customer Information
              </h2>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <InfoItem
                icon={<FiUser />}
                label="Name"
                value={enquiry.name}
              />

              <InfoItem
                icon={<FiPhone />}
                label="Phone"
                value={enquiry.phone}
              />

              <InfoItem
                icon={<FiMail />}
                label="Email"
                value={enquiry.email}
              />

              <InfoItem
                icon={<FiGlobe />}
                label="Query For"
                value={enquiry.queryFor}
              />

              <InfoItem
                icon={<FiMapPin />}
                label="Company"
                value={enquiry.company}
              />

              <InfoItem
                icon={<FiMapPin />}
                label="Address"
                value={enquiry.address}
              />
            </div>
          </div>

          {/* Message */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Enquiry Message
                </h2>
              </div>
            </div>

            <div className="p-6">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                {enquiry.subject || "No subject"}
              </p>

              <div className="rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                {enquiry.message || "No message provided."}
              </div>
            </div>
          </div>

          {/* Additional information */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>

            <div className="space-y-4 p-6">
              <InfoItem
                icon={<FiGlobe />}
                label="Current URL"
                value={enquiry.currentUrl}
              />

              <InfoItem
                label="IP Address"
                value={enquiry.ip}
              />

              <InfoItem
                label="User Agent"
                value={enquiry.userAgent}
              />

              <InfoItem
                label="Created At"
                value={
                  enquiry.createdAt
                    ? new Date(
                        enquiry.createdAt
                      ).toLocaleString("en-IN")
                    : "-"
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Enquiry Status
              </h2>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">
                  In Progress
                </option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Internal comment */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Internal Comment
              </h2>
            </div>

            <div className="p-6">
              <textarea
                rows={7}
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Add an internal note..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/enquiries")
            }
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave />

            {updateMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {icon && <span>{icon}</span>}
        {label}
      </div>

      <p className="break-words text-sm font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}