import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";

const stats = [
  {
    title: "Total Revenue",
    value: "₹1,24,580",
    change: "+12.5%",
    positive: true,
    icon: IndianRupee,
  },
  {
    title: "Total Orders",
    value: "1,248",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "356",
    change: "+4.3%",
    positive: true,
    icon: Package,
  },
  {
    title: "Customers",
    value: "2,845",
    change: "-2.4%",
    positive: false,
    icon: Users,
  },
];

function Dashboard() {
  return (
    <div>

      <PageHeader
        title="Dashboard"
        description="Overview of your ecommerce store."
      />

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1 text-xs">

                {stat.positive ? (
                  <ArrowUpRight
                    size={15}
                    className="text-green-600"
                  />
                ) : (
                  <ArrowDownRight
                    size={15}
                    className="text-red-600"
                  />
                )}

                <span
                  className={
                    stat.positive
                      ? "font-medium text-green-600"
                      : "font-medium text-red-600"
                  }
                >
                  {stat.change}
                </span>

                <span className="text-slate-400">
                  vs last month
                </span>

              </div>

            </div>
          );
        })}

      </div>

      {/* Dashboard Sections */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">

        {/* Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Sales Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revenue performance over the selected period.
              </p>
            </div>

            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>

          </div>

          <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
            Sales chart will be added here
          </div>

        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer orders
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </button>

          </div>

          <div className="mt-5 space-y-4">

            {[
              ["#ORD-1001", "₹2,499", "Processing"],
              ["#ORD-1002", "₹1,899", "Delivered"],
              ["#ORD-1003", "₹4,250", "Pending"],
              ["#ORD-1004", "₹999", "Delivered"],
            ].map(([order, amount, status]) => (

              <div
                key={order}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {order}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {amount}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {status}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;