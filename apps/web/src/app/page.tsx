"use client";
import InteractiveArgoMap from "@/components/home/interactive-argo-map";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Layer */}
      <div className="fixed inset-0 z-10">
        <InteractiveArgoMap />
      </div>
    </div>
  );
}
