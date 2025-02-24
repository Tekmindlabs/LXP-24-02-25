import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos

const ALLOWED_MIME_TYPES = {
	video: ['video/mp4', 'video/webm', 'video/ogg'],
	document: [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'text/plain',
		'application/rtf'
	],
	image: [
		'image/jpeg',
		'image/png',
		'image/gif'
	]
};

type FileType = 'video' | 'document' | 'image';

interface FileInfo {
	size: number;
	createdAt: Date;
	updatedAt: Date;
	mimeType: string;
	publicUrl: string;
}

// Ensure upload directory exists
async function ensureUploadDir() {
	try {
		await fs.access(UPLOAD_DIR);
	} catch {
		await fs.mkdir(UPLOAD_DIR, { recursive: true });
	}
}

// Generate unique filename
function generateFileName(originalName: string): string {
	const ext = path.extname(originalName);
	const hash = crypto.randomBytes(8).toString('hex');
	const timestamp = Date.now();
	return `${timestamp}-${hash}${ext}`;
}

// Validate file type
function validateFileType(mimeType: string, type: FileType): void {
	if (!ALLOWED_MIME_TYPES[type].includes(mimeType)) {
		throw new Error(`Invalid file type. Allowed types for ${type}: ${ALLOWED_MIME_TYPES[type].join(', ')}`);
	}
}

// Validate file
function validateFile(file: Buffer, mimeType: string, type: FileType): void {
	if (file.length > MAX_FILE_SIZE) {
		throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
	}
	validateFileType(mimeType, type);
}

export const localStorage = {
	async saveFile(file: Buffer, originalName: string, mimeType: string, type: FileType): Promise<string> {
		try {
			validateFile(file, mimeType, type);
			await ensureUploadDir();
			
			const fileName = generateFileName(originalName);
			const subDir = type;
			const uploadPath = path.join(UPLOAD_DIR, subDir);
			
			await fs.mkdir(uploadPath, { recursive: true });
			const filePath = path.join(uploadPath, fileName);
			await fs.writeFile(filePath, file);

			return `/uploads/${subDir}/${fileName}`;

		} catch (error) {
			console.error('Error saving file:', error);
			throw error;
		}
	},

	async deleteFile(filePath: string): Promise<void> {
		const fullPath = path.join(process.cwd(), 'public', filePath);
		try {
			await fs.unlink(fullPath);
			
			// Clean up empty directories
			const dirPath = path.dirname(fullPath);
			const files = await fs.readdir(dirPath);
			if (files.length === 0 && dirPath !== UPLOAD_DIR) {
				await fs.rmdir(dirPath);
			}
		} catch (error) {
			console.error('Error deleting file:', error);
			throw error;
		}
	},

	async getFileInfo(filePath: string): Promise<FileInfo> {
		const fullPath = path.join(process.cwd(), 'public', filePath);
		try {
			const stats = await fs.stat(fullPath);
			const publicUrl = filePath.startsWith('/') ? filePath : `/${filePath}`;
			
			return {
				size: stats.size,
				createdAt: stats.birthtime,
				updatedAt: stats.mtime,
				mimeType: path.extname(filePath).toLowerCase() === '.pdf' ? 'application/pdf' : 
								 path.extname(filePath).toLowerCase() === '.doc' ? 'application/msword' :
								 path.extname(filePath).toLowerCase() === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
								 'application/octet-stream',
				publicUrl
			};
		} catch (error) {
			console.error('Error getting file info:', error);
			throw error;
		}
	},

	async listFiles(subDir?: string): Promise<string[]> {
		const dirPath = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
		try {
			const files = await fs.readdir(dirPath);
			return files.map(file => `/uploads${subDir ? `/${subDir}` : ''}/${file}`);
		} catch (error) {
			console.error('Error listing files:', error);
			throw error;
		}
	},

	async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
		try {
			const now = Date.now();
			const files = await this.listFiles();
			
			await Promise.all(files.map(async (filePath) => {
				try {
					const info = await this.getFileInfo(filePath);
					if (now - info.createdAt.getTime() > maxAge) {
						await this.deleteFile(filePath);
					}
				} catch (error) {
					console.error(`Error processing file ${filePath}:`, error);
				}
			}));
		} catch (error) {
			console.error('Error cleaning up old files:', error);
			throw error;
		}
	}
};