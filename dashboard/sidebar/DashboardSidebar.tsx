'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Home,
  ClipboardList,
  Box,
  Layers,
  Star,
  Mail,
  Wine,
  MapPin,
  UtensilsCrossed,
  Image,
  Calendar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('owner');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (data.user?.role) setUserRole(data.user.role);
      })
      .catch(() => {});
  }, []);

  const allLinks = [
    {
      link: "/dashboard",
      label: "Acasă",
      icon: <Home size={20} />,
      isActive: pathname === "/dashboard",
      staffAccess: false,
    },
    {
      link: "/dashboard/orders",
      label: "Comenzi",
      icon: <ClipboardList size={20} />,
      isActive: pathname.includes("dashboard/orders"),
      staffAccess: true,
    },
    {
      link: "/dashboard/products",
      label: "Produse",
      icon: <Box size={20} />,
      isActive: pathname.includes("dashboard/products"),
      staffAccess: false,
    },
    {
      link: "/dashboard/wines",
      label: "Vinuri",
      icon: <Wine size={20} />,
      isActive: pathname.includes("dashboard/wines"),
      staffAccess: false,
    },
    {
      link: "/dashboard/categories",
      label: "Categorii",
      icon: <Layers size={20} />,
      isActive: pathname.includes("dashboard/categories"),
      staffAccess: false,
    },
    {
      link: "/dashboard/delivery-zones",
      label: "Zone de Livrare",
      icon: <MapPin size={20} />,
      isActive: pathname.includes("dashboard/delivery-zones"),
      staffAccess: false,
    },
    {
      link: "/dashboard/location-gallery",
      label: "Galerie Locație",
      icon: <Image size={20} />,
      isActive: pathname.includes("dashboard/location-gallery"),
      staffAccess: false,
    },
    {
      link: "/dashboard/event-gallery",
      label: "Galerie Evenimente",
      icon: <Calendar size={20} />,
      isActive: pathname.includes("dashboard/event-gallery"),
      staffAccess: false,
    },
    {
      link: "/dashboard/evenimente",
      label: "Evenimente",
      icon: <Calendar size={20} />,
      isActive: pathname.includes("dashboard/evenimente"),
      staffAccess: false,
    },
    {
      link: "/dashboard/menu-manager",
      label: "Meniu",
      icon: <UtensilsCrossed size={20} />,
      isActive: pathname.includes("dashboard/menu-manager"),
      staffAccess: false,
    },
    {
      link: "/dashboard/reviews",
      label: "Recenzii",
      icon: <Star size={20} />,
      isActive: pathname.includes("dashboard/reviews"),
      staffAccess: false,
    },
    {
      link: "/dashboard/messages",
      label: "Mesaje",
      icon: <Mail size={20} />,
      isActive: pathname.includes("dashboard/messages"),
      staffAccess: false,
    },
  ];

  const dashboardLinks = userRole === 'staff'
    ? allLinks.filter(l => l.staffAccess)
    : allLinks;

  return (
    <nav className="w-64 min-h-[88vh] px-3 py-4 rounded-2xl border-2 border-gray-200 hidden lg:block bg-white/80 backdrop-blur-sm shadow-sm">
      {/* Sidebar Links */}
      <div>
        <ul className="flex flex-col gap-2 items-start justify-center">
          {dashboardLinks.map((link) => (
            <li key={link.label} className="w-full">
              <Link
                href={link.link}
                className={cn(
                  "flex items-center text-base font-semibold w-full gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  link.isActive 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                )}
              >
                <span className={cn(
                  "transition-transform duration-300",
                  link.isActive ? "scale-110" : "group-hover:scale-110"
                )}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default DashboardSidebar;