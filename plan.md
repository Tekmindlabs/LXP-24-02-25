# Video and Document Upload Implementation Plan

## Current Implementation
- Local storage implementation exists in `src/lib/storage/local-storage.ts`
- File upload handling with size validation (10MB limit)
- Curriculum resource types already include VIDEO and DOCUMENT in schema

## Required Changes

### 1. Update CurriculumResource Schema
- Already supports fileInfo for metadata storage
- No schema changes needed as it's already properly structured

### 2. File Upload API Endpoint
Location: `src/app/api/upload/route.ts`
- Add support for video and document MIME types
- Implement file validation for allowed formats
- Use existing local storage service

### 3. Curriculum Router Updates
Location: `src/server/api/routers/curriculum.ts`
- Update createResource mutation to handle file uploads
- Add file type validation
- Store file metadata in fileInfo field

### 4. Frontend Components
Location: `src/components/dashboard/curriculum/`
- Add file upload UI components
- Implement progress indicators
- Add preview functionality for videos and documents

### File Types to Support
Videos:
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

Documents:
- PDF (.pdf)
- Word (.doc, .docx)
- Text (.txt)
- Rich Text (.rtf)

## Implementation Steps

1. Update Local Storage Service
- Add MIME type validation
- Implement file type checking
- Add specific subdirectories for videos and documents

2. Create Upload API Route
- Handle multipart form data
- Validate file types and sizes
- Return file URLs and metadata

3. Update Curriculum Resource Creation
- Handle file uploads during resource creation
- Store file metadata and URLs
- Implement proper error handling

4. Frontend Implementation
- Add file upload components
- Implement progress tracking
- Add preview functionality