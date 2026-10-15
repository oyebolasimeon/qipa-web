"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ContactManagerPage() {
  const { session } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const send = useMutation({
    mutationFn: () =>
      apiRequest("/api/owners/contact-manager", {
        method: "POST",
        token: session?.token,
        body: { message: message.trim() },
      }),
    onSuccess: () => {
      setMessage("");
      setSent(true);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not send"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Message manager" subtitle="Send a note to the operator team" />
      <ErrorBanner message={error} />
      {sent ? <p className="mb-4 text-sm text-[var(--mist)]">Sent. The manager will see this in Ocupai.</p> : null}
      <Field label="Your note" value={message} onChange={setMessage} placeholder="Saw a complaint in inbox about the WiFi…" multiline />
      <Button className="w-full" loading={send.isPending} onClick={() => send.mutate()}>
        Send
      </Button>
    </div>
  );
}
