"use client";

import { useState } from "react";

export default function Installer() {
  const [url, setUrl] = useState("https://occ.dopestyle.in");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");

    try {
        const res = await fetch("/api/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiUrl: url }),
        });

        if (res.ok) {
            setStatus("success");
        } else {
            setStatus("error");
        }
    } catch (err) {
        setStatus("error");
    }
  };

  if (status === "success") {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-gray-50">
              <div className="text-center">
                  <h1 className="text-2xl font-bold text-green-600">Connected Successfully!</h1>
                  <p className="mt-2 text-gray-600">Configuration saved to <strong>.env.local</strong></p>
                  <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="font-medium text-yellow-800">Critical Next Step for Live Servers:</p>
                      <p className="mt-1 text-sm text-yellow-700">Because Next.js requires the API URL to be compiled for maximum speed, you must run your production build command now.</p>
                      <pre className="mt-3 inline-block rounded bg-black px-4 py-2 text-left text-sm text-green-400">
                          <code>npm run build<br/>npm run start</code>
                      </pre>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Connect to Store</h1>
        <p className="mb-6 text-sm text-gray-500">
            Please enter the base URL of your live Admin/Backend installation (e.g. https://admin.yourdomain.com).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Backend URL</label>
            <input
              type="url"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
              placeholder="https://occ.yourdomain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded bg-primary py-2 font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {status === "saving" ? "Connecting..." : "Connect Store"}
          </button>
          
          {status === "error" && (
              <p className="text-center text-sm text-red-500">Failed to save configuration.</p>
          )}
        </form>
      </div>
    </div>
  );
}
