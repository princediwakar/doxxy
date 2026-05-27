"use client";

import dynamic from "next/dynamic";

const StickyBottomCTA = dynamic(() => import("@/components/landing/StickyBottomCTA"), {
  ssr: false,
});

export default StickyBottomCTA;
