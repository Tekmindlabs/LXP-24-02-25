import { NextRequest, NextResponse } from 'next/server';
import { localStorage } from '@/lib/storage/local-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File;
		const type = formData.get('type') as 'video' | 'document';

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		if (!type || !['video', 'document'].includes(type)) {
			return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const url = await localStorage.saveFile(buffer, file.name, file.type, type);

		const fileInfo = await localStorage.getFileInfo(url);

		return NextResponse.json({ url, fileInfo });
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Upload failed' },
			{ status: 500 }
		);
	}
}



