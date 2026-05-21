import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Head from 'next/head';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getShortlinkData(code: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  try {
    const res = await fetch(`${apiUrl}/shortlinks/${code}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching shortlink', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const data = await getShortlinkData(params.code);
  if (!data) return {};

  const { url, meta } = data;
  
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

  return {
    alternates: {
      canonical: url,
    }
  };
}

export default async function ShortlinkRedirect({ params }: { params: { code: string } }) {
  const data = await getShortlinkData(params.code);
  
  if (!data || !data.url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-500">The link you are trying to visit does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // We render a client-side redirect and meta refresh instead of server-side 307
  // so that social bots will definitively parse the meta tags we just generated.
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${data.url}`} />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Redirecting you to the destination...</p>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.location.replace("${data.url}");`
            }}
          />
        </div>
      </div>
    </>
  );
}
