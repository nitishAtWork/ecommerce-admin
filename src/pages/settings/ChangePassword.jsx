
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
    CheckCircle2,
    LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import { API_ENDPOINTS } from "../../api/endpoints";

const initialForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

function PasswordField({
    id,
    label,
    name,
    value,
    onChange,
    visible,
    onToggle,
    autoComplete,
    disabled,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    id={id}
                    name={name}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    minLength={name === "currentPassword" ? undefined : 8}
                    required
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    disabled={disabled}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

export default function ChangePassword() {
    const navigate = useNavigate();
    const { loading: authLoading, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState(initialForm);

    const [visibility, setVisibility] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [saving, setSaving] = useState(false);
    // set success message state
    const [successMessage, setSuccessMessage] = useState("");

    if (authLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <LoaderCircle
                    size={28}
                    className="animate-spin text-blue-600"
                />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const toggleVisibility = (field) => {
        setVisibility((previous) => ({
            ...previous,
            [field]: !previous[field],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = formData;

        if (!currentPassword.trim()) {
            toast.error("Please enter your current password.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error(
                "Your new password must be at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("The new passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error(
                "Your new password must differ from your current password."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await apiClient.post(
                API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
                {
                    currentPassword,
                    newPassword,
                }
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data?.message ||
                    "Unable to change your password."
                );
            }

            // set success message
            setSuccessMessage(
                response.data?.message ||
                "Password changed successfully."
            );

            toast.success(
                response.data?.message ||
                "Password changed successfully."
            );

            setFormData(initialForm);

            setVisibility({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Unable to change your password."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                >
                    <ArrowLeft size={16} />
                    Back to dashboard
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <ShieldCheck size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Account Security
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Update your admin account password.
                        </p>
                    </div>
                </div>
            </div>

            {/* Security information */}
            <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <ShieldCheck size={24} />
                    </div>

                    <div>
                        <h2 className="font-semibold">
                            Protect your administrator account
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                            Use a unique password that you do not use on
                            other websites. Never share your administrator
                            credentials with anyone.
                        </p>
                    </div>
                </div>
            </div>

            {/* Password form */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Change Password
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Confirm your current password before choosing a new one.
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="rounded-xl bg-green-100 p-4">
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <PasswordField
                        id="currentPassword"
                        label="Current Password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        visible={visibility.currentPassword}
                        onToggle={() => toggleVisibility("currentPassword")}
                        autoComplete="current-password"
                        disabled={saving}
                    />

                    <PasswordField
                        id="newPassword"
                        label="New Password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        visible={visibility.newPassword}
                        onToggle={() => toggleVisibility("newPassword")}
                        autoComplete="new-password"
                        disabled={saving}
                    />

                    <PasswordField
                        id="confirmPassword"
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        visible={visibility.confirmPassword}
                        onToggle={() => toggleVisibility("confirmPassword")}
                        autoComplete="new-password"
                        disabled={saving}
                    />

                    {/* Requirements */}
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <div className="text-sm text-slate-600">
                                <p className="font-medium text-slate-800">
                                    Password requirements
                                </p>

                                <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5">
                                    <li>At least 8 characters long.</li>
                                    <li>Different from your current password.</li>
                                    <li>Use a unique password you have not reused elsewhere.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-5">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex min-w-48 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <LockKeyhole size={17} />
                                    Update Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
