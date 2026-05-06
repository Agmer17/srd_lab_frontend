export function parseError(error: any): string {
	if (typeof error === "string") return error;

	if (typeof error === "object") {
		return Object.entries(error)
			.map(([field, msg]) => `${field}: ${msg}`)
			.join(", ");
	}

	return "Unknown error";
}


export const formatDate = (d?: string) =>
		d
			? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
			: '-';