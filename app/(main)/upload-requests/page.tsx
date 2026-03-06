"use client";

import { UploadRequests } from "./upload-requests";

export default function UploadRequestsPage() {
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <UploadRequests />
      </div>
    </main>
  );
}
