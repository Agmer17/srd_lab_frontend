import type { Payment } from "./payment";
import type { Product } from "./product";
import type { User } from "./user";

export interface Order {
    id: string;
    user_id: string;
    product_id: string;
    ordered_price: number;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;

    user: User;
    product?: Product | null;
    payment: Payment[];
}


export interface OrderListDTO {
    id: string;
    user_id: string;
    product_id: string;
    ordered_price: number;
    status: string;
    created_at: string;
    updated_at: string;
    user?: OrderUserDTO | null;
    product: OrderProductDTO;
    payment: OrderPaymentSummary[];
}

export interface OrderUserDTO {
    full_name: string;
    email: string;
    profile_picture?: string | null;
    phone_number?: string | null;
}

type PaymentStatus = 'paid' | 'unpaid' | 'failed' | 'expired' | 'cancelled';

export interface OrderPaymentSummary {
    payment_id: string;
    method: string | null;
    status: PaymentStatus;
    amount: number;
}

export interface OrderProductDTO {
    name: string;
    slug: string;
}