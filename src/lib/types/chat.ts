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
    avatar?: string | null;
    last_message: string;
    last_message_at?: string | null;
}