'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full text-center space-y-8">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Store Under Maintenance
              </h2>
              <p className="mt-4 text-sm text-gray-600">
                We are currently upgrading our systems. We will be back online shortly!
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
