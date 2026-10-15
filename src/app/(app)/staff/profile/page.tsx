"use client";

import Link from "next/link";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Button, Glass, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function StaffProfilePage() {
  const { session, signOut } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" />
      <Glass className="mb-4">
        <div className="font-semibold">
          {session?.user.firstName} {session?.user.lastName}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{session?.user.email}</div>
        <div className="mt-2 text-sm">{session?.membership.role.replace(/_/g, " ")}</div>
        <div className="text-sm text-[var(--text-muted)]">{session?.organization.name}</div>
        <Link href="/profile/edit" className="mt-3 inline-block text-sm text-[var(--mist)]">
          Edit profile
        </Link>
      </Glass>
      <WorkspaceSwitcher />
      <Button variant="danger" className="mt-6 w-full" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
