// Telegram WebApp Integration
let tg = window.Telegram.WebApp;
let userId = tg.initData;
let orders = [];

// Initialize
window.addEventListener('load', () => {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    loadDashboard();
});

// Load Dashboard
async function loadDashboard() {
    try {
        const [balance, services] = await Promise.all([
            fetch('/api/balance').then(r => r.json()),
            fetch('/api/services').then(r => r.json())
        ]);

        displayBalance(balance);
        displayServices(services);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showMessage('خطأ في تحميل البيانات', 'error');
    }
}

// Display Balance
function displayBalance(data) {
    const balance = data.balance || (data.success === true ? data.balance : '0.00');
    document.getElementById('balance').textContent = parseFloat(balance).toFixed(2);
}

// Display Services
function displayServices(services) {
    const servicesDiv = document.getElementById('services');
    const selectElement = document.getElementById('serviceId');
    
    servicesDiv.innerHTML = '';
    
    if (Array.isArray(services) && services.length > 0) {
        services.forEach(service => {
            // Add to select
            const option = document.createElement('option');
            option.value = service.service || service.id;
            option.textContent = `${service.name} - ${service.rate}`;
            selectElement.appendChild(option);
            
            // Add to display
            const serviceEl = document.createElement('div');
            serviceEl.className = 'service-item';
            serviceEl.innerHTML = `
                <div class="service-name">${service.name}</div>
                <div class="service-price">
                    السعر: ${service.rate} | الحد الأدنى: ${service.min} | الحد الأقصى: ${service.max}
                </div>
            `;
            servicesDiv.appendChild(serviceEl);
        });
    } else {
        servicesDiv.innerHTML = '<p class="empty">لا توجد خدمات متاحة</p>';
    }
}

// Refresh Balance
async function refreshBalance() {
    try {
        const data = await fetch('/api/balance').then(r => r.json());
        displayBalance(data);
        showMessage('تم تحديث الرصيد', 'success');
    } catch (error) {
        showMessage('خطأ في تحديث الرصيد', 'error');
    }
}

// Place Order
document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceId').value;
    const link = document.getElementById('link').value;
    const quantity = document.getElementById('quantity').value;
    
    if (!serviceId || !link || !quantity) {
        showMessage('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: serviceId,
                link: link,
                quantity: parseInt(quantity)
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.order) {
            orders.unshift({ id: data.order, status: 'معالجة' });
            displayOrders();
            document.getElementById('orderForm').reset();
            showMessage(`✅ تم إنشاء الطلب #${data.order}`, 'success');
        } else {
            showMessage(data.error || 'خطأ في إنشاء الطلب', 'error');
        }
    } catch (error) {
        showMessage('خطأ في الاتصال بالخادم', 'error');
    }
});

// Display Orders
function displayOrders() {
    const ordersDiv = document.getElementById('orders');
    
    if (orders.length === 0) {
        ordersDiv.innerHTML = '<p class="empty">لا توجد طلبات حتى الآن</p>';
        return;
    }
    
    ordersDiv.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-id">الطلب #${order.id}</div>
            <div class="order-status">الحالة: ${order.status}</div>
        </div>
    `).join('');
}

// Show Message
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    const content = document.getElementById('content');
    content.insertBefore(message, content.firstChild);
    
    setTimeout(() => message.remove(), 3000);
}
