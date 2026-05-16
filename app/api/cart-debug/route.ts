import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/products/ha-ha-inhale-tee', { cache: 'no-store' });
        const json = await res.json();
        return NextResponse.json(json);
    } catch (e) {
        return NextResponse.json({ error: String(e) });
    }
}
