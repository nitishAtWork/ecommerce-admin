import {
    IndianRupee,
    ShoppingCart,
    Package,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Eye,
} from "lucide-react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import dashboardService from "../../services/dashboard.service";

const PERIODS = [
    {
        value: "7d",
        label: "Last 7 days",
    },
    {
        value: "30d",
        label: "Last 30 days",
    },
    {
        value: "3m",
        label: "Last 3 months",
    },
    {
        value: "1y",
        label: "Last year",
    },
];

function Dashboard() {
    const navigate = useNavigate();

    const [period, setPeriod] =
        useState("7d");

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["dashboard", period],

        queryFn: () =>
            dashboardService.getDashboard(
                period
            ),

        staleTime: 60 * 1000,
    });

    const dashboard =
        data?.data || {};

    const stats =
        dashboard.stats || {};

    const sales =
        dashboard.sales || [];

    const recentOrders =
        dashboard.recentOrders || [];

    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(
                stats.revenue?.value
            ),
            change:
                stats.revenue?.change || 0,
            icon: IndianRupee,
        },

        {
            title: "Total Orders",
            value:
                stats.orders?.value || 0,
            change:
                stats.orders?.change || 0,
            icon: ShoppingCart,
        },

        {
            title: "Total Products",
            value:
                stats.products?.value || 0,
            change:
                stats.products?.change || 0,
            icon: Package,
        },

        {
            title: "Customers",
            value:
                stats.customers?.value || 0,
            change:
                stats.customers?.change || 0,
            icon: Users,
        },
    ];

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Overview of your ecommerce store."
            />

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isLoading
                    ? Array.from({
                          length: 4,
                      }).map((_, index) => (
                          <StatSkeleton
                              key={index}
                          />
                      ))
                    : statCards.map(
                          (stat) => {
                              const Icon =
                                  stat.icon;

                              const positive =
                                  Number(
                                      stat.change
                                  ) >= 0;

                              return (
                                  <div
                                      key={
                                          stat.title
                                      }
                                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                  >
                                      <div className="flex items-start justify-between">
                                          <div>
                                              <p className="text-sm font-medium text-slate-500">
                                                  {
                                                      stat.title
                                                  }
                                              </p>

                                              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                                  {
                                                      stat.value
                                                  }
                                              </h3>
                                          </div>

                                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                              <Icon
                                                  size={
                                                      20
                                                  }
                                              />
                                          </div>
                                      </div>

                                      <div className="mt-4 flex items-center gap-1 text-xs">
                                          {positive ? (
                                              <ArrowUpRight
                                                  size={
                                                      15
                                                  }
                                                  className="text-green-600"
                                              />
                                          ) : (
                                              <ArrowDownRight
                                                  size={
                                                      15
                                                  }
                                                  className="text-red-600"
                                              />
                                          )}

                                          <span
                                              className={
                                                  positive
                                                      ? "font-medium text-green-600"
                                                      : "font-medium text-red-600"
                                              }
                                          >
                                              {positive
                                                  ? "+"
                                                  : ""}
                                              {
                                                  stat.change
                                              }
                                              %
                                          </span>

                                          <span className="text-slate-400">
                                              vs previous period
                                          </span>
                                      </div>
                                  </div>
                              );
                          }
                      )}
            </div>

            {isError && (
                <div className="mt-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span>
                        {error?.response?.data
                            ?.message ||
                            "Failed to load dashboard."}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            refetch()
                        }
                        className="font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Dashboard Sections */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
                {/* Sales */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Sales Overview
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Revenue performance
                                over the selected
                                period.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={period}
                                onChange={(e) =>
                                    setPeriod(
                                        e.target
                                            .value
                                    )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {PERIODS.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.value
                                            }
                                            value={
                                                item.value
                                            }
                                        >
                                            {
                                                item.label
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <button
                                type="button"
                                onClick={() =>
                                    refetch()
                                }
                                disabled={
                                    isFetching
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw
                                    size={
                                        16
                                    }
                                    className={
                                        isFetching
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    <SalesChart
                        sales={sales}
                        loading={
                            isLoading
                        }
                    />
                </div>

                {/* Recent Orders */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Recent Orders
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Latest customer
                                orders
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/orders"
                                )
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            View all
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        {isLoading ? (
                            Array.from({
                                length: 4,
                            }).map(
                                (_, index) => (
                                    <RecentOrderSkeleton
                                        key={
                                            index
                                        }
                                    />
                                )
                            )
                        ) : recentOrders.length ===
                          0 ? (
                            <div className="py-10 text-center text-sm text-slate-400">
                                No orders found.
                            </div>
                        ) : (
                            recentOrders.map(
                                (
                                    order
                                ) => (
                                    <div
                                        key={
                                            order._id
                                        }
                                        className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">
                                                #
                                                {order.orderNumber ||
                                                    order._id?.slice(
                                                        -8
                                                    )?.toUpperCase()}
                                            </p>

                                            <p className="mt-1 max-w-40 truncate text-xs text-slate-500">
                                                {order
                                                    .user
                                                    ?.name ||
                                                    order
                                                        .shippingAddress
                                                        ?.fullName ||
                                                    "Guest Customer"}
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {formatCurrency(
                                                    order.totalAmount ??
                                                        order.total ??
                                                        0
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <OrderStatusBadge
                                                status={
                                                    order.orderStatus
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/orders/${order._id}`
                                                    )
                                                }
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                title="View order"
                                            >
                                                <Eye
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------- */
/* Sales Chart */
/* -------------------------------- */

function SalesChart({ sales, loading }) {
    if (loading) {
        return (
            <div className="mt-6 h-[330px] animate-pulse rounded-xl bg-slate-50" />
        );
    }

    if (!sales.length) {
        return (
            <div className="mt-6 flex h-[330px] items-center justify-center rounded-xl bg-slate-50">
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">
                        No sales data available
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Try selecting a different period.
                    </p>
                </div>
            </div>
        );
    }

    const chartData = sales.map((item) => ({
        ...item,
        revenue: Number(item.revenue || 0),
        orders: Number(item.orders || 0),
    }));

    const totalRevenue = chartData.reduce(
        (sum, item) => sum + item.revenue,
        0
    );

    const totalOrders = chartData.reduce(
        (sum, item) => sum + item.orders,
        0
    );

    const averageRevenue =
        chartData.length > 0
            ? totalRevenue / chartData.length
            : 0;

    return (
        <div className="mt-6">
            {/* Chart Summary */}
            <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">
                        Revenue
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(totalRevenue)}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">
                        Orders
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                        {totalOrders.toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">
                        Avg. Revenue
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(averageRevenue)}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 5,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#2563eb"
                                    stopOpacity={0.25}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#2563eb"
                                    stopOpacity={0.02}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                        />

                        <XAxis
                            dataKey="date"
                            tickFormatter={formatChartDate}
                            tick={{
                                fontSize: 11,
                                fill: "#94a3b8",
                            }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />

                        <YAxis
                            tickFormatter={formatCompactCurrency}
                            tick={{
                                fontSize: 11,
                                fill: "#94a3b8",
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={65}
                        />

                        <Tooltip
                            content={<SalesTooltip />}
                        />

                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 6,
                                strokeWidth: 3,
                                stroke: "#ffffff",
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function SalesTooltip({ active, payload }) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    const data = payload[0]?.payload;

    if (!data) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <p className="text-xs font-medium text-slate-400">
                {formatChartDate(data.date)}
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
                {formatCurrency(data.revenue)}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />

                <span className="text-xs text-slate-500">
                    {data.orders}{" "}
                    {data.orders === 1
                        ? "order"
                        : "orders"}
                </span>
            </div>
        </div>
    );
}

/* -------------------------------- */
/* Status Badge */
/* -------------------------------- */

function OrderStatusBadge({
    status,
}) {
    const normalized = String(
        status || "PENDING"
    ).toUpperCase();

    const config = {
        PENDING: {
            label: "Pending",
            className:
                "border-amber-200 bg-amber-50 text-amber-700",
        },

        CONFIRMED: {
            label: "Confirmed",
            className:
                "border-blue-200 bg-blue-50 text-blue-700",
        },

        PROCESSING: {
            label: "Processing",
            className:
                "border-indigo-200 bg-indigo-50 text-indigo-700",
        },

        SHIPPED: {
            label: "Shipped",
            className:
                "border-cyan-200 bg-cyan-50 text-cyan-700",
        },

        DELIVERED: {
            label: "Delivered",
            className:
                "border-green-200 bg-green-50 text-green-700",
        },

        CANCELLED: {
            label: "Cancelled",
            className:
                "border-red-200 bg-red-50 text-red-700",
        },
    };

    const current =
        config[normalized] ||
        config.PENDING;

    return (
        <span
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${current.className}`}
        >
            {current.label}
        </span>
    );
}

/* -------------------------------- */
/* Skeletons */
/* -------------------------------- */

function StatSkeleton() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />

                    <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
            </div>

            <div className="mt-4 h-3 w-40 animate-pulse rounded bg-slate-100" />
        </div>
    );
}

function RecentOrderSkeleton() {
    return (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />

                <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
    );
}

/* -------------------------------- */
/* Helpers */
/* -------------------------------- */

function formatCurrency(value) {
    return `₹${Number(
        value || 0
    ).toLocaleString("en-IN")}`;
}

function getChartLabels(sales) {
    if (!sales.length) {
        return [];
    }

    const indexes = [
        0,
        Math.floor(
            sales.length / 3
        ),
        Math.floor(
            (sales.length * 2) / 3
        ),
        sales.length - 1,
    ];

    return indexes
        .filter(
            (value, index) =>
                indexes.indexOf(
                    value
                ) === index
        )
        .map((index) => ({
            key: sales[index].date,
            label: formatChartDate(
                sales[index].date
            ),
        }));
}

function formatChartDate(date) {
    if (!date) {
        return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
        }
    );
}

function formatCompactCurrency(value) {
    const amount = Number(value || 0);

    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return `₹${amount}`;
}

export default Dashboard;