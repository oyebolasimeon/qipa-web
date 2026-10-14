"use client";

import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";

export default function PortfolioPage() {
  return (
    <div>
      <PageHeader title="Portfolio" subtitle="Properties and guests" />
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/properties"><Card>Properties</Card></Link>
        <Link href="/guests"><Card>Guests</Card></Link>
      </div>
    </div>
  );
}
