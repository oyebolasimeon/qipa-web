"use client";

import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";

export default function OperationsPage() {
  return (
    <div>
      <PageHeader title="Operations" subtitle="Tasks, team and platforms" />
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/tasks"><Card>Tasks</Card></Link>
        <Link href="/channels"><Card>Booking platforms</Card></Link>
        <Link href="/maintenance/issues"><Card>Maintenance issues</Card></Link>
      </div>
    </div>
  );
}
