import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { apiUrl } = body;

        if (!apiUrl) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        const backendUrl = apiUrl.replace(/\/$/, "").replace(/\/api$/, "");
        const envContent = `BACKEND_URL="${backendUrl}"\n`;
        const envPath = path.join(process.cwd(), '.env.local');

        fs.writeFileSync(envPath, envContent, { flag: 'w' });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
    }
}
