import os

files = [
    'src/routes/api/orders/create/+server.ts',
    'src/routes/api/orders/[id]/+server.ts',
    'src/routes/api/payment/create/[order_id]/+server.ts',
    'src/routes/api/payment/detail/[payment_id]/+server.ts',
    'src/routes/api/payment/sync/[payment_id]/+server.ts',
    'src/routes/api/payment/cancel/[payment_id]/+server.ts'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Standardize the API response structure to match ApiResponse<T>
    content = content.replace(
        'return json(data, { status: res.status });',
        'return json({ success: res.ok, data: data.data !== undefined ? data.data : data, error: data.error || (data.message && !res.ok ? data.message : undefined) }, { status: res.status });'
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
        
print("Proxies updated.")
