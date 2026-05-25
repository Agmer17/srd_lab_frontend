export interface Payment {
    payment_id: string; // json:"payment_id"
    order_id: string;
    method: string | null;
    status: string;
    amount: number;
    fee: number;
    total_payment: number | null;
    payment_number: string | null;
    expired_at: string | null;
    paid_at: string | null;
    created_at: string;
}