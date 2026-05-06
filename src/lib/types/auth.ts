interface RefreshSessionData {
    user_id: string
    role: "ADMIN" | "USER"
}

type AccessTokenPayload = {
    user_id: string;
    role: "ADMIN" | "USER";
    iss: string;
    exp: number;
    iat: number;
};

type RefreshTokenPayload = {
    uuid: string
    iss: string;
    exp: number;
    iat: number;
}

type RefreshSessionResponse = {
    access_token: string
    id: string
    role: "ADMIN" | "USER"
    avatar: string
}