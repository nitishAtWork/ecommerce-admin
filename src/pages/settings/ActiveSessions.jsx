
import { useCallback, useEffect, useState } from "react";
import {
    Monitor,
    RefreshCw,
    ShieldCheck,
    LogOut,
    Clock,
    Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import sessionService from "../../services/session.service";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";

function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

function ActiveSessions() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [confirmAction, setConfirmAction] = useState(null);
    const [revokingSessionId, setRevokingSessionId] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const loadSessions = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const result = await sessionService.getActiveSessions();

            setSessions(Array.isArray(result) ? result : []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to load active sessions."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);


    const handleLogoutAll = async () => {
        try {
            setRevoking(true);

            await sessionService.logoutAllDevices();

            toast.success("All sessions have been revoked.");

            setConfirmAction(null);
            await logout();
            navigate("/admin/login", { replace: true });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to log out all devices."
            );
        } finally {
            setRevoking(false);
        }
    };

    const handleLogoutSession = async (session) => {
        try {
            setRevokingSessionId(session._id);

            await sessionService.logoutSession(session._id);

            setSessions((currentSessions) =>
                currentSessions.filter(
                    (item) => item._id !== session._id
                )
            );

            toast.success("Session logged out successfully.");
            setConfirmAction(null);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to log out this session."
            );
        } finally {
            setRevokingSessionId(null);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Active Sessions
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review the devices currently signed in to your admin account.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => loadSessions(true)}
                    disabled={refreshing || loading}
                    className="cursor-pointer"
                >
                    <span className="inline-flex items-center gap-2">
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </span>
                </Button>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                    <ShieldCheck
                        size={22}
                        className="shrink-0 text-blue-600"
                    />
                    <div>
                        <h2 className="font-semibold text-blue-900">
                            Keep your account secure
                        </h2>
                        <p className="mt-1 text-sm text-blue-800">
                            If you notice an unfamiliar device, revoke your
                            sessions and sign in again.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Signed-in devices
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {sessions.length} active session
                            {sessions.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    <Monitor size={20} className="text-slate-400" />
                </div>

                {loading ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        Loading sessions...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center">
                        <Monitor
                            size={32}
                            className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="font-medium text-slate-700">
                            No active sessions found
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sessions.map((session) => (
                            <div
                                key={session._id}
                                className="group flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-md sm:p-5"
                            >
                                {/* Device information */}
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                                        <Monitor size={21} strokeWidth={1.8} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="break-words font-semibold leading-6 text-slate-900">
                                            {session.deviceInfo?.browser || "Unknown Browser"}
                                            {session.deviceInfo?.browserVersion
                                                ? ` ${session.deviceInfo.browserVersion}`
                                                : ""}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {session.deviceInfo?.os || "Unknown OS"}
                                            {session.deviceInfo?.osVersion
                                                ? ` ${session.deviceInfo.osVersion}`
                                                : ""}
                                            <span className="mx-1.5 text-slate-300">•</span>
                                            {session.deviceInfo?.device || "Unknown Device"}
                                        </p>
                                    </div>
                                </div>

                                {/* Session metadata */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="flex min-w-0 items-start gap-2.5">
                                        <Globe
                                            size={16}
                                            className="mt-0.5 shrink-0 text-slate-400"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                IP Address
                                            </p>
                                            <p className="mt-1 break-all text-sm font-medium text-slate-700">
                                                {session.ipAddress || "IP unavailable"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-2.5">
                                        <Clock
                                            size={16}
                                            className="mt-0.5 shrink-0 text-slate-400"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Last Active
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {formatDate(
                                                    session.lastUsedAt || session.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expiry information */}
                                {session.expiresAt && (
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                                        <Clock size={14} className="shrink-0 text-slate-400" />

                                        <p className="text-xs text-slate-500">
                                            Expires on{" "}
                                            <span className="font-medium text-slate-700">
                                                {formatDate(session.expiresAt)}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setConfirmAction({
                                            type: "single",
                                            session,
                                        })
                                    }
                                    disabled={Boolean(revokingSessionId) || revoking}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
                                >
                                    <LogOut size={15} />
                                    Log out
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-red-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Log out all devices
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Revoke all sessions for your account, including
                            sessions on this device.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setConfirmAction({ type: "all" })}
                        disabled={revoking || Boolean(revokingSessionId)}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <LogOut size={16} />
                        Log out all devices
                    </button>
                </div>
            </div>
            <ConfirmModal
                open={Boolean(confirmAction)}
                title={
                    confirmAction?.type === "all"
                        ? "Log out all devices?"
                        : "Log out this device?"
                }
                description={
                    confirmAction?.type === "all"
                        ? "This will revoke all your active sessions, including this device. You will need to sign in again."
                        : `Are you sure you want to log out ${confirmAction?.session?.deviceInfo?.browser ||
                        "this device"
                        }? This session will be revoked.`
                }
                confirmText={
                    confirmAction?.type === "all"
                        ? "Log out all devices"
                        : "Log out device"
                }
                loading={revoking || Boolean(revokingSessionId)}
                onCancel={() => {
                    if (!revoking && !revokingSessionId) {
                        setConfirmAction(null);
                    }
                }}
                onConfirm={() => {
                    if (confirmAction?.type === "all") {
                        handleLogoutAll();
                    } else if (confirmAction?.type === "single") {
                        handleLogoutSession(confirmAction.session);
                    }
                }}
            />
        </div>
    );
}

export default ActiveSessions;
