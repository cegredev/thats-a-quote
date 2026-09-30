export type Quote = {
	id: string;
	createdAt: number;
	text: string;
	person: string | null;
	context: string | null;
	quotedAt: number;
};

export type QuoteSearch = {
	text?: string;
	person?: string;
};
