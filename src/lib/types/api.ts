
type ApiSuccess<T> = {
	success: true;
	message: string;
	data: T;
};

type ApiError = {
	success: false;
	error: string | Record<string, string>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;