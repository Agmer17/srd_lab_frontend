export function parseError(error: any): string {
	if (typeof error === "string") return error;

	if (typeof error === "object") {
		return Object.entries(error)
			.map(([field, msg]) => `${field}: ${msg}`)
			.join(", ");
	}

	return "Unknown error";
}

export function formatCurrency(val: number) {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(val);
}

export const formatDate = (d?: string | null) =>
	d
		? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
		: '-';