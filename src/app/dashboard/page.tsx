export const dynamic = "force-dynamic"; // critical
export const fetchCache = "force-no-store"; // critical

import DashboardPage from "./DashboardClient";

export default function Page() {
    return <DashboardPage />;
}