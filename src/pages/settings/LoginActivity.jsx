
import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    RefreshCw,
    Monitor,
    Clock,
    Globe,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import loginActivityService from "../../services/loginActivity.service";

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

const STATUS_STYLES = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    expired: "bg-amber-50 text-amber-700 ring-amber-200",
    revoked: "bg-red-50 text-red-700 ring-red-200",
};

export default function LoginActivity() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadActivity = useCallback(async (refresh = false) => {
        try {
            refresh ? setRefreshing(true) : setLoading(true);

            const data =
                await loginActivityService.getLoginActivity();

            setSessions(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to load login activity."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadActivity();
    }, [loadActivity]);

    const counts = sessions.reduce(
        (result, session) => {
            result[session.status] =
                (result[session.status] || 0) + 1;
            return result;
        },
        { active: 0, expired: 0, revoked: 0 }
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-600" size={24} />
                        <h1 className="text-2xl font-bold text-slate-900">
                            Login Activity
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                        Review your login sessions, including expired
                        and revoked sessions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadActivity(true)}
                    disabled={loading || refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: "Active sessions",
                        count: counts.active,
                        style: "text-emerald-700 bg-emerald-50",
                    },
                    {
                        label: "Expired sessions",
                        count: counts.expired,
                        style: "text-amber-700 bg-amber-50",
                    },
                    {
                        label: "Revoked sessions",
                        count: counts.revoked,
                        style: "text-red-700 bg-red-50",
                    },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-slate-200 bg-white p-5"
                    >
                        <p className="text-sm text-slate-500">
                            {item.label}
                        </p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">
                            {loading ? "—" : item.count}
                        </p>
                        <span
                            className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${item.style}`}
                        >
                            Session history
                        </span>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Session history
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {sessions.length} recorded session
                            {sessions.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <ShieldCheck className="text-slate-400" size={21} />
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Loading login activity...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-10 text-center">
                        <Monitor
                            size={32}
                            className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="font-medium text-slate-800">
                            No login activity found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Session history will appear here when available.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">
                                        Device / Browser
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        IP Address
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Login Time
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Last Activity
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {sessions.map((session) => {
                                    const status =
                                        STATUS_STYLES[session.status]
                                            ? session.status
                                            : "expired";

                                    return (
                                        <tr
                                            key={session._id}
                                            className="hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <Monitor
                                                        size={19}
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />
                                                    <div>
                                                        <div className="font-medium">
                                                            {session.deviceInfo?.browser}{" "}
                                                            {session.deviceInfo?.browserVersion}
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            {session.deviceInfo?.os}{" "}
                                                            {session.deviceInfo?.osVersion}
                                                            {" · "}
                                                            {session.deviceInfo?.device}
                                                        </div>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Session ID:{" "}
                                                            {String(
                                                                session._id
                                                            ).slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>


                                            <td className="px-5 py-4 text-slate-600">
                                                <span className="inline-flex items-center gap-2">
                                                    <Globe size={15} />
                                                    {session.ipAddress || "—"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {formatDate(session.createdAt)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                <span className="inline-flex items-center gap-2">
                                                    <Clock size={15} />
                                                    {formatDate(
                                                        session.lastUsedAt ||
                                                        session.createdAt
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[status]}`}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
