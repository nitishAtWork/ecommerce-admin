import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Store,
    ShieldCheck,
    ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

function Login() {
    const navigate = useNavigate();

    const {
        login,
        loginWithOTP,
        sendLoginOTP,
        isAuthenticated,
    } = useAuth();

    const [mode, setMode] = useState("otp");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setTimeout(() => {
            setResendCooldown((current) =>
                Math.max(0, current - 1)
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendCooldown]);

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const getErrorMessage = (err, fallback) =>
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        fallback;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (name === "email" && otpSent) {
            setOtpSent(false);
            setOtp("");
            setResendCooldown(0);
        }

        setError("");
        setSuccess("");
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError("");
        setSuccess("");
        setOtp("");
        setOtpSent(false);
        setResendCooldown(0);
    };

    const handleSendOTP = async () => {
        setError("");
        setSuccess("");

        const email = formData.email.trim();

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        if (resendCooldown > 0) {
            setError(
                `Please wait ${resendCooldown} seconds before requesting another OTP.`
            );
            return;
        }

        try {
            setSendingOTP(true);

            await sendLoginOTP(email);

            setOtpSent(true);
            setOtp("");
            setResendCooldown(60);

            setSuccess(
                "OTP sent successfully. Please check your email."
            );
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to send OTP.")
            );
        } finally {
            setSendingOTP(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await login(
                formData.email.trim(),
                formData.password
            );

            navigate("/admin", { replace: true });
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Invalid email or password."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!otpSent) {
            setError("Please request an OTP first.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            await loginWithOTP({
                email: formData.email.trim(),
                otp,
            });

            navigate("/admin", { replace: true });
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Invalid or expired OTP."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo and heading */}
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <Store size={28} />
                    </div>

                    <h1 className="mt-4 text-2xl font-bold text-slate-900">
                        Ecommerce Admin
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Sign in securely to manage your store
                    </p>
                </div>

                {/* Login card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {mode === "otp"
                                ? "Sign in with a one-time verification code."
                                : "Enter your admin credentials to continue."}
                        </p>
                    </div>

                    {/* Login mode switch */}
                    <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => switchMode("otp")}
                            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                mode === "otp"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <ShieldCheck size={16} />
                                Login with OTP
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode("password")}
                            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                mode === "password"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            Password
                        </button>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                        >
                            {success}
                        </div>
                    )}

                    {/* Password login */}
                    {mode === "password" && (
                        <form
                            onSubmit={handlePasswordSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="password-email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@example.com"
                                        autoComplete="username"
                                        required
                                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                disabled={loading}
                                className="w-full cursor-pointer"
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </form>
                    )}

                    {/* OTP login */}
                    {mode === "otp" && (
                        <form
                            onSubmit={handleOTPSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="otp-email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="otp-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@example.com"
                                        autoComplete="email"
                                        required
                                        readOnly={otpSent}
                                        className={`w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                            otpSent ? "bg-slate-50" : "bg-white"
                                        }`}
                                    />
                                </div>
                            </div>

                            {!otpSent ? (
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={sendingOTP}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Mail size={18} />
                                    {sendingOTP ? "Sending OTP..." : "Send OTP"}
                                </button>
                            ) : (
                                <>
                                    <div>
                                        <label
                                            htmlFor="otp"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Enter 6-digit OTP
                                        </label>

                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            value={otp}
                                            onChange={(event) =>
                                                setOtp(
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6)
                                                )
                                            }
                                            placeholder="Enter verification code"
                                            maxLength={6}
                                            required
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs text-slate-500">
                                                OTP sent to {formData.email}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={handleSendOTP}
                                                disabled={
                                                    sendingOTP ||
                                                    resendCooldown > 0
                                                }
                                                className="text-xs font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                                            >
                                                {sendingOTP
                                                    ? "Sending..."
                                                    : resendCooldown > 0
                                                    ? `Resend in ${resendCooldown}s`
                                                    : "Resend OTP"}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <ShieldCheck size={18} />
                                        {loading
                                            ? "Verifying..."
                                            : "Verify & Sign In"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOtpSent(false);
                                            setOtp("");
                                            setError("");
                                            setSuccess("");
                                            setResendCooldown(0);
                                        }}
                                        className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800"
                                    >
                                        <ArrowLeft size={15} />
                                        Change email
                                    </button>
                                </>
                            )}
                        </form>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Authorized administrators only
                </p>
            </div>
        </div>
    );
}

export default Login;