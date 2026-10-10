import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    StarCheck,
    FileKey,
    LocationEditIcon,
    ChevronDown,
    ChevronRight,
    BriefcaseBusiness,
    MapPinned,
    ContactIcon,
} from "lucide-react";
import { FaSearchLocation } from "react-icons/fa";


import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL;

const menuItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin",
        end: true,
        roles: ["ADMIN", "SUPERADMIN"],
    },
    {
        label: "Products",
        icon: Package,
        path: "/admin/products",
        roles: ["ADMIN", "SUPERADMIN"],
    },
    {
        label: "Keywords",
        icon: FileKey,
        path: "/admin/keywords",
        roles: ["SUPERADMIN"],
    },
    {
        label: "Location",
        icon: LocationEditIcon,
        roles: ["SUPERADMIN"],
        children: [
            {
                label: "Country",
                path: "/admin/locations/countries",
                roles: ["SUPERADMIN"],
            },
            {
                label: "State",
                path: "/admin/locations/states",
                roles: ["SUPERADMIN"],
            },
            {
                label: "City",
                path: "/admin/locations/cities",
                roles: ["SUPERADMIN"],
            },
        ],
    },
    {
        label: "Business Nature",
        icon: BriefcaseBusiness,
        path: "/admin/nature-of-business",
        roles: ["SUPERADMIN"],
    },
    {
        label: "Keyword In City",
        icon: FaSearchLocation,
        path: "/admin/keyword-in-city",
        roles: ["SUPERADMIN"],
    },
    {
        label: "Our Presence",
        icon: MapPinned,
        path: "/admin/our-presence",
        roles: ["SUPERADMIN"],
    },
    {
        label: "Orders",
        icon: ShoppingCart,
        path: "/admin/orders",
        roles: ["ADMIN", "SUPERADMIN"],
    },
    {
        label: "Customers",
        icon: Users,
        path: "/admin/customers",
        roles: ["ADMIN", "SUPERADMIN"],
    },
    {
        label: "Reviews",
        icon: StarCheck,
        path: "/admin/reviews",
        roles: ["ADMIN", "SUPERADMIN"],
    },
    {
        label: "Settings",
        icon: Settings,
        path: "/admin/settings",
        roles: ["ADMIN", "SUPERADMIN"],
    },
    {
        label: "Enquiry",
        icon: ContactIcon,
        path: "/admin/enquiries",
        roles: ["ADMIN", "SUPERADMIN"],
    },
];

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({
        Location: false,
    });
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith("/admin/locations")) {
            setOpenMenus((prev) => ({
                ...prev,
                Location: true,
            }));
        }
    }, [location.pathname]);

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };
    const {
        user,
        logout,
        isAuthenticated,
        loading,
    } = useAuth();

    const userRole = String(
        user?.role || ""
    ).toUpperCase();

    const finalMenu = menuItems.filter((item) => {
        /*
         * No roles specified means
         * everyone with admin access can see it.
         */
        if (!item.roles?.length) {
            return true;
        }

        return item.roles.includes(userRole);
    });

    const [siteInfo, setSiteInfo] = useState({});

    useEffect(() => {
        const fetchSiteInfo = async () => {
            try {
                const response = await fetch(`${BASE_URL}/website`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    setSiteInfo(result.data);
                } else {
                    console.error("Invalid API response:", result);
                }
            } catch (error) {
                console.error("Error fetching site info:", error);
            }
        };

        fetchSiteInfo();
    }, []);

    // console.log("Site info state:", siteInfo);


    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
        `}
            >

                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">

                    <div className="flex items-center justify-center gap-2 mx-auto">
                        <img src={siteInfo?.logo} alt={siteInfo?.name || "Logo"} title={siteInfo?.name || "Logo"} className="h-14 w-auto block mx-auto" />
                    </div>

                    {/* Mobile Close */}
                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    <ul className="space-y-1">

                        {finalMenu?.map((item) => {
                            const Icon = item.icon;

                            // Parent menu with children
                            if (item.children?.length) {
                                const isParentActive = item.children.some((child) =>
                                    location.pathname.startsWith(child.path)
                                );

                                const isOpen = openMenus[item.label] || isParentActive;

                                return (
                                    <li key={item.label}>

                                        {/* Parent */}
                                        <button
                                            type="button"
                                            onClick={() => toggleMenu(item.label)}
                                            className={`
                            flex w-full items-center justify-between
                            rounded-lg px-3 py-2.5
                            text-sm font-medium
                            transition-colors
                            ${isParentActive
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }
                        `}
                                        >
                                            <span className="flex items-center gap-3">

                                                <Icon
                                                    size={19}
                                                    strokeWidth={isParentActive ? 2.2 : 1.8}
                                                />

                                                <span>{item.label}</span>

                                            </span>

                                            {isOpen ? (
                                                <ChevronDown
                                                    size={16}
                                                    strokeWidth={2}
                                                />
                                            ) : (
                                                <ChevronRight
                                                    size={16}
                                                    strokeWidth={2}
                                                />
                                            )}
                                        </button>

                                        {/* Children */}
                                        <div
                                            className={`
                            grid transition-all duration-200 ease-in-out
                            ${isOpen
                                                    ? "grid-rows-[1fr] opacity-100"
                                                    : "grid-rows-[0fr] opacity-0"
                                                }
                        `}
                                        >
                                            <div className="overflow-hidden">

                                                <ul className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">

                                                    {item.children
                                                        .filter((child) => {
                                                            if (!child.roles?.length) {
                                                                return true;
                                                            }

                                                            return child.roles.includes(userRole);
                                                        })
                                                        .map((child) => (
                                                            <li key={child.path}>

                                                                <NavLink
                                                                    to={child.path}
                                                                    end
                                                                    onClick={closeSidebar}
                                                                    className={({ isActive }) =>
                                                                        `
                                                        flex items-center gap-2
                                                        rounded-lg px-3 py-2
                                                        text-sm font-medium
                                                        transition-colors
                                                        ${isActive
                                                                            ? "bg-blue-50 text-blue-600"
                                                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                                        }
                                                    `
                                                                    }
                                                                >
                                                                    {({ isActive }) => (
                                                                        <>
                                                                            <span
                                                                                className={`
                                                                h-1.5 w-1.5 rounded-full
                                                                ${isActive
                                                                                        ? "bg-blue-600"
                                                                                        : "bg-slate-300"
                                                                                    }
                                                            `}
                                                                            />

                                                                            <span>
                                                                                {child.label}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </NavLink>

                                                            </li>
                                                        ))}

                                                </ul>

                                            </div>
                                        </div>

                                    </li>
                                );
                            }

                            // Normal menu item
                            return (
                                <li key={item.path}>

                                    <NavLink
                                        to={item.path}
                                        end={item.end}
                                        onClick={closeSidebar}
                                        className={({ isActive }) =>
                                            `
                            flex items-center gap-3 rounded-lg
                            px-3 py-2.5
                            text-sm font-medium
                            transition-colors
                            ${isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }
                        `
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={19}
                                                    strokeWidth={isActive ? 2.2 : 1.8}
                                                />

                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>

                                </li>
                            );
                        })}

                    </ul>

                </nav>

                {/* Bottom Sidebar */}
                <div className="border-t border-slate-200 p-4">

                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* Main Area */}
            <div className="lg:ml-64">

                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

                    <div className="flex items-center gap-3">

                        {/* Mobile Menu */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                                Admin Panel
                            </h2>

                            <p className="hidden text-xs text-slate-500 sm:block">
                                Manage your ecommerce store
                            </p>
                        </div>

                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3">

                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-slate-900">
                                {user?.name || user?.email || "Admin"}
                            </p>

                            <p className="text-xs capitalize text-slate-500">
                                {user?.role || "Administrator"}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold uppercase text-blue-700">
                            {(user?.name || user?.email || "A").charAt(0)}
                        </div>

                    </div>

                </header>

                {/* Page Content */}
                <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;