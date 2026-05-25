export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null; // *string -> string | null
    price: number;
    status: string;
    is_featured: boolean; // bool -> boolean
    created_at: string;
    updated_at: string;
}