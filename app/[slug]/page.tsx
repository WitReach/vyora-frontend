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

    let page = null;
    let shortlink = null;

    if (pageRes.ok) {
      page = await pageRes.json();
    } else if (pageRes.status === 404) {
      // Fallback: check if slug is a shortlink
      const shortlinkRes = await fetch(`${apiUrl}/shortlinks/${slug}`, { cache: 'no-store' });
      if (shortlinkRes.ok) {
        shortlink = await shortlinkRes.json();
      }
    }

    const settings = settingsRes.ok ? await settingsRes.json() : {};

    return { page, settings, shortlink };
  } catch (error) {
    console.error("Error fetching CMS or shortlink data", error);
    return { page: null, settings: {}, shortlink: null };
  }
}

import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = params;
  const { page, shortlink } = await getData(slug);

  if (shortlink) {
    const { url, meta } = shortlink;
    if (meta) {
      return {
        title: meta.title,
        description: meta.description,
        openGraph: {
          title: meta.title,
          description: meta.description,
          images: meta.image ? [meta.image] : [],
          url: url,
        },
        alternates: {
          canonical: url,
        }
      };
    }
    return { alternates: { canonical: url } };
  }

  if (page) {
    // Generate page metadata here if applicable
    return {
      title: page.title || 'Page',
    };
  }

  return {};
}

export default async function CMSPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { page, settings, shortlink } = await getData(slug);

  if (shortlink) {
    return (
      <>
        <meta httpEquiv="refresh" content={`0; url=${shortlink.url}`} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Redirecting you to the destination...</p>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.location.replace("${shortlink.url}");`
              }}
            />
          </div>
        </div>
      </>
    );
  }

  if (!page || !page.content) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageRenderer content={page.content} layout={page.layout} settings={settings} />
    </main>
  );
}
