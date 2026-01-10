export const dynamic = "force-dynamic"; // critical
export const fetchCache = "force-no-store"; // critical

import DashboardClient from "./DashboardClient";

export default function Page() {
    return <DashboardClient />;
}