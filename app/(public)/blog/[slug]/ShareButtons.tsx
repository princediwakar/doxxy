"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : "";

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex gap-3">
      <Button variant="outline" size="sm" onClick={shareTwitter}>
        Twitter
      </Button>
      <Button variant="outline" size="sm" onClick={shareLinkedIn}>
        LinkedIn
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        Copy Link
      </Button>
    </div>
  );
}
