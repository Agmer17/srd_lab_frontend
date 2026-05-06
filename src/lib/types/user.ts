export interface User {
    id: string;
    global_role: "ADMIN" | "USER"; // Bisa dibuat enum atau union kalau rolenya terbatas
    full_name: string;
    email: string;
    phone_number: string | null;
    profile_picture: string;
    gender: "male" | "female" | string;
    oauth_provider: "GOOGLE" | string;
    oauth_provider_user_id: string;
    created_at: string; // ISO Date string
    updated_at: string; // ISO Date string
    deleted_at: string | null;
}
