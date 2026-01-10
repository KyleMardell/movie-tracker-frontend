"use client"; // optional here if using only dynamic import

import dynamic from "next/dynamic";

// Force dynamic import, disable SSR entirely
const DashboardClient = dynamic(() => import("./DashboardClient"), { ssr: false });

export default function Page() {
    return <DashboardClient />;
}