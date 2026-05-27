const fs = require('fs');
const files = [
    'src/routes/api/orders/create/+server.ts',
    'src/routes/api/orders/[id]/+server.ts',
    'src/routes/api/payment/create/[order_id]/+server.ts',
    'src/routes/api/payment/detail/[payment_id]/+server.ts',
    'src/routes/api/payment/sync/[payment_id]/+server.ts',
    'src/routes/api/payment/cancel/[payment_id]/+server.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace: return json(data, { status: res.status });
    // With: return json({ success: res.ok, data: data.data || data, error: data.error }, { status: res.status });
    
    content = content.replace(
        /return json\(data, \{ status: res\.status \}\);/g,
        'return json({ success: res.ok, data: data.data || data, error: data.error }, { status: res.status });'
    );
    
    fs.writeFileSync(file, content);
});
console.log("Proxies updated.");
