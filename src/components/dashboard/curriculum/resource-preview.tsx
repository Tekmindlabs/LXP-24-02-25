import { CurriculumResourceType } from '@prisma/client';

interface ResourcePreviewProps {
	type: CurriculumResourceType;
	url: string;
	mimeType?: string;
}

export function ResourcePreview({ type, url, mimeType }: ResourcePreviewProps) {
	if (type === 'VIDEO') {
		return (
			<div className="relative aspect-video w-full">
				<video
					src={url}
					controls
					className="w-full h-full"
					preload="metadata"
				>
					Your browser does not support the video tag.
				</video>
			</div>
		);
	}

	if (type === 'DOCUMENT') {
		if (mimeType?.includes('pdf')) {
			return (
				<div className="relative aspect-[4/5] w-full">
					<iframe
						src={`${url}#view=FitH`}
						className="w-full h-full border-0"
						title="PDF document viewer"
					/>
				</div>
			);
		}

		// For other document types, show download link
		return (
			<div className="p-4 border rounded-md">
				<p className="mb-2">Document Preview not available</p>
				<a
					href={url}
					download
					className="text-blue-600 hover:text-blue-800 underline"
				>
					Download Document
				</a>
			</div>
		);
	}

	return null;
}