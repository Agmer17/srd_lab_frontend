import type { FileCategory, PostChatDto } from "./types/chat";

export function categorize(file: File): FileCategory {
    const mime = file.type;
    const name = file.name.toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (name.match(/\.(doc|docx)$/)) return 'word';
    if (name.match(/\.(xls|xlsx)$/)) return 'excel';
    if (name.match(/\.(ppt|pptx)$/)) return 'ppt';
    if (mime.startsWith('text/') || name.endsWith('.txt')) return 'text';
    return 'other';
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function postChatToForm(dto: PostChatDto): FormData {

    const formData = new FormData()
    formData.append("text", dto.text)
    formData.append("room_id", dto.room_id)
    dto.attachment.forEach((f) => formData.append("attachment", f))

    return formData
}

