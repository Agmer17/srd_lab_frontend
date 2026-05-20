export interface ChatDataDto {
    id: string;
    chatroom_id: string;

    sender_id: string;
    sender_full_name: string;
    sender_profile_picture: string;

    text: string;

    chat_media?: ChatMediaType[];

    created_at: string;
}

export interface ChatMediaType {
    media_type: string;
    media_access_url: string;
}

export interface LatestChatDto {
    chatroom_id: string;
    type: string;
    project_id?: string | null;
    name: string;
    other_user_id: string | null;
    avatar?: string | null;
    last_message: string;
    last_message_at?: string | null;
}
export interface PostChatDto {
    text: string
    room_id: string
    attachment: File[]
}

export type FileCategory =
    | 'image'
    | 'video'
    | 'audio'
    | 'pdf'
    | 'word'
    | 'excel'
    | 'ppt'
    | 'text'
    | 'other';