import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { CurriculumResourceType } from '@prisma/client';
import { FileInfo } from "@/types/curriculum";

interface UploadResponse {
	url: string;
	fileInfo: FileInfo;
}

interface ResourceUploadProps {
	type: 'VIDEO' | 'DOCUMENT';
	onUploadComplete: (url: string, fileInfo: FileInfo) => void;
}


export function ResourceUpload({ type, onUploadComplete }: ResourceUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			setProgress(0);

			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', type.toLowerCase());

			const xhr = new XMLHttpRequest();
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					const percentComplete = (event.loaded / event.total) * 100;
					setProgress(percentComplete);
				}
			};

			const response = await new Promise<UploadResponse>((resolve, reject) => {
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(JSON.parse(xhr.response));
					} else {
						reject(new Error('Upload failed'));
					}
				};
				xhr.onerror = () => reject(new Error('Upload failed'));
				xhr.open('POST', '/api/upload');
				xhr.send(formData);
			});

			onUploadComplete(response.url, response.fileInfo);
			toast({
				title: 'Upload Complete',
				description: 'File has been uploaded successfully',
			});
		} catch (error) {
			toast({
				title: 'Upload Failed',
				description: error instanceof Error ? error.message : 'Failed to upload file',
				variant: 'destructive',
			});
		} finally {
			setUploading(false);
			setProgress(0);
		}
	};

	return (
		<div className="space-y-4">
			<input
				type="file"
				accept={type === 'VIDEO' ? 'video/*' : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf'}
				onChange={handleFileChange}
				disabled={uploading}
				className="hidden"
				id="file-upload"
			/>
			<label htmlFor="file-upload">
				<Button disabled={uploading} asChild>
					<span>
						{uploading ? 'Uploading...' : `Upload ${type.toLowerCase()}`}
					</span>
				</Button>
			</label>
			{uploading && (
				<Progress value={progress} className="w-full" />
			)}
		</div>
	);
}