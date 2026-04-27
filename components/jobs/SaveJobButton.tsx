"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveJobAction, unsaveJobAction } from "@/app/actions/savedJob";

interface SaveJobButtonProps {
  jobId: string;
  initialSaved: boolean;
}

export function SaveJobButton({ jobId, initialSaved }: SaveJobButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const next = !saved;
      setSaved(next);
      const res = next
        ? await saveJobAction(jobId)
        : await unsaveJobAction(jobId);
      if (res.error) {
        setSaved(!next);
        const msg = res.error._form?.[0];
        if (msg === "AUTH_REQUIRED") {
          router.push(`/sign-in?callbackUrl=/jobs`);
        }
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
        saved
          ? "bg-primary text-white hover:opacity-95"
          : "bg-primary text-white hover:opacity-95"
      } disabled:opacity-60`}
    >
      <Bookmark
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
