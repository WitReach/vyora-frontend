import PageRenderer from "../../components/PageRenderer";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  try {
    const [pageRes, settingsRes] = await Promise.all([
      fetch(`${apiUrl}/pages/${slug}`, { cache: 'no-store' }),
      fetch(`${apiUrl}/settings`, { cache: 'no-store' })
    ]);

    if (!pageRes.ok) {
      if (pageRes.status === 404) return { page: null, settings: {} };
      console.error("Failed to fetch CMS page", pageRes.status, pageRes.statusText);
      return { page: null, settings: {} };
    }

    const page = await pageRes.json();
    const settings = settingsRes.ok ? await settingsRes.json() : {};

    return { page, settings };
  } catch (error) {
    console.error("Error fetching CMS data", error);
    return { page: null, settings: {} };
  }
}

export default async function CMSPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { page, settings } = await getData(slug);

  if (!page || !page.content) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageRenderer content={page.content} layout={page.layout} settings={settings} />
    </main>
  );
}
