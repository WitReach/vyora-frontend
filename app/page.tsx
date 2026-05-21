import PageRenderer from "../components/PageRenderer";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  try {
    const [pageRes, settingsRes] = await Promise.all([
      fetch(`${apiUrl}/home-page`, { cache: 'no-store' }),
      fetch(`${apiUrl}/settings`, { cache: 'no-store' })
    ]);

    if (!pageRes.ok) {
      if (pageRes.status !== 503) {
        console.error("Failed to fetch home page", pageRes.status, pageRes.statusText);
      }
      return { page: null, settings: {} };
    }

    const page = await pageRes.json();
    const settings = settingsRes.ok ? await settingsRes.json() : {};

    return { page, settings };
  } catch (error) {
    console.error("Error fetching home data", error);
    return { page: null, settings: {} };
  }
}

export default async function Home() {
  const { page, settings } = await getData();

  if (!page || !page.content) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
        <p className="text-xl text-gray-600">We are setting things up. Please check back later!</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageRenderer content={page.content} layout={page.layout} settings={settings} />
    </main>
  );
}
