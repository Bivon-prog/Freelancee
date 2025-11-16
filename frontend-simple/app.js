// API Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let timerInterval = null;
let timerSeconds = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
        loadDashboardData();
    } else {
        showLoginPage();
    }
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Auth Functions
function showLogin() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadDashboardData();
        } else {
            errorEl.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorEl.textContent = 'Connection error. Make sure the backend is running.';
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadDashboardData();
        } else {
            errorEl.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        errorEl.textContent = 'Connection error. Make sure the backend is running.';
        console.error('Register error:', error);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showLoginPage();
}

// Page Navigation
function showLoginPage() {
    document.getElementById('login-page').classList.add('active');
    document.getElementById('dashboard-page').classList.remove('active');
}

function showDashboard() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(`${sectionName}-section`).classList.add('active');
    if (event && event.target) event.target.classList.add('active');
    
    switch(sectionName) {
        case 'invoices': loadInvoices(); break;
        case 'contracts': loadContracts(); break;
        case 'time-tracking': loadTimeEntries(); break;
        case 'resume-builder': loadResumes(); break;
    }
}

// Helper to extract MongoDB ObjectId as string
function extractId(id) {
    if (!id) return null;
    return typeof id === 'object' ? id.$oid : id;
}

// API Helper
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    
    const text = await response.text();
    
    if (!response.ok) {
        try {
            const error = JSON.parse(text);
            throw new Error(error.error || error.message || 'Request failed');
        } catch (e) {
            throw new Error(text || `Request failed with status ${response.status}`);
        }
    }
    
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid JSON response from server');
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    try {
        const [invoices, contracts, timeEntries, resumes] = await Promise.all([
            apiRequest('/invoices').catch(() => []),
            apiRequest('/contracts').catch(() => []),
            apiRequest('/time-tracking').catch(() => []),
            apiRequest('/resumes').catch(() => [])
        ]);
        
        document.getElementById('total-invoices').textContent = invoices.length;
        document.getElementById('pending-invoices').textContent = 
            invoices.filter(i => i.status === 'pending').length;
        document.getElementById('total-contracts').textContent = contracts.length;
        document.getElementById('total-resumes').textContent = resumes.length;
        
        const now = new Date();
        const thisMonth = timeEntries.filter(entry => {
            const entryDate = new Date(entry.start_time);
            return entryDate.getMonth() === now.getMonth() && 
                   entryDate.getFullYear() === now.getFullYear();
        });
        const totalHours = thisMonth.reduce((sum, entry) => {
            return sum + (entry.duration ? entry.duration / 3600 : 0);
        }, 0);
        document.getElementById('hours-tracked').textContent = totalHours.toFixed(1);
        document.getElementById('ai-documents').textContent = '0';
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// TOOL 1: Invoice Generator
async function loadInvoices() {
    const container = document.getElementById('invoices-list');
    container.innerHTML = '<div class="loading">Loading invoices...</div>';
    
    try {
        console.log('Loading invoices...');
        const invoices = await apiRequest('/invoices');
        console.log('Invoices loaded:', invoices);
        
        if (invoices.length === 0) {
            container.innerHTML = '<div class="empty-state">No invoices yet. Create your first invoice!</div>';
            return;
        }
        
        container.innerHTML = invoices.map(invoice => {
            const statusClass = invoice.status === 'paid' ? 'status-paid' : 
                               invoice.status === 'sent' ? 'status-pending' : 
                               invoice.status === 'overdue' ? 'status-badge' : 'status-active';
            const currency = invoice.currency || 'USD';
            const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'KSh';
            const invoiceId = extractId(invoice._id);
            
            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>Invoice #${invoice.invoice_number}</h3>
                        <p>${symbol}${invoice.total} • Due: ${new Date(invoice.due_date).toLocaleDateString()}</p>
                        <span class="status-badge ${statusClass}">${invoice.status}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-primary" onclick="viewInvoice('${invoiceId}')">View</button>
                        <button class="btn btn-small btn-secondary" onclick="updateInvoiceStatus('${invoiceId}')">Update Status</button>
                        <button class="btn btn-small btn-secondary" onclick="downloadInvoicePDF('${invoiceId}')">PDF</button>
                        <button class="btn btn-small btn-secondary" onclick="emailInvoice('${invoiceId}')">Email</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading invoices:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p>Error loading invoices</p>
                <p style="color: #666; font-size: 14px;">This might be due to old test data with invalid date formats.</p>
                <button class="btn btn-secondary" onclick="clearInvoiceData()">Clear Invoice Data & Retry</button>
            </div>
        `;
    }
}

async function clearInvoiceData() {
    if (confirm('This will delete all invoices. Are you sure?')) {
        try {
            const invoices = await apiRequest('/invoices').catch(() => []);
            // If we can't load them, we can't delete them individually
            alert('Please clear the MongoDB invoices collection manually or contact support.');
        } catch (error) {
            alert('Unable to clear data. Please clear the MongoDB invoices collection manually.');
        }
    }
}

function showCreateInvoiceModal() {
    const modal = createModal('Create Invoice', `
        <form id="create-invoice-form" class="invoice-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Client Name</label>
                    <input type="text" id="invoice-client" required>
                </div>
                <div class="form-group">
                    <label>Invoice Number</label>
                    <input type="text" id="invoice-number" value="INV-${Date.now()}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Issue Date</label>
                    <input type="date" id="invoice-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="invoice-due" required>
                </div>
            </div>
            <div class="invoice-items">
                <h4>Items</h4>
                <div id="invoice-items-list">
                    <div class="invoice-item">
                        <input type="text" placeholder="Description" class="form-control item-desc" required>
                        <input type="number" placeholder="Quantity" class="form-control item-qty" value="1" required>
                        <input type="number" placeholder="Rate" class="form-control item-rate" step="0.01" required>
                        <input type="number" placeholder="Amount" class="form-control item-amount" readonly>
                        <button type="button" class="btn-remove" onclick="removeInvoiceItem(this)">×</button>
                    </div>
                </div>
                <button type="button" class="btn-add" onclick="addInvoiceItem()">+ Add Item</button>
            </div>
            <div class="invoice-calculations">
                <div class="calc-row">
                    <label>Subtotal:</label>
                    <span id="invoice-subtotal">$0.00</span>
                </div>
                <div class="calc-row">
                    <label>Tax (%):</label>
                    <input type="number" id="invoice-tax" class="form-control-small" value="0" step="0.01" min="0" max="100">
                    <span id="invoice-tax-amount">$0.00</span>
                </div>
                <div class="calc-row">
                    <label>Discount ($):</label>
                    <input type="number" id="invoice-discount" class="form-control-small" value="0" step="0.01" min="0">
                </div>
                <div class="calc-row total-row">
                    <label>Total:</label>
                    <span id="invoice-total-amount">$0.00</span>
                </div>
            </div>
            <div class="form-group">
                <label>Currency</label>
                <select id="invoice-currency" class="form-control">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="KES">KES (KSh)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Payment Terms</label>
                <select id="invoice-payment-terms" class="form-control">
                    <option value="Due on receipt">Due on receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30" selected>Net 30</option>
                    <option value="Net 60">Net 60</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes (Optional)</label>
                <textarea id="invoice-notes" class="form-control" rows="3" placeholder="Thank you for your business!"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Invoice</button>
        </form>
    `);
    
    document.getElementById('create-invoice-form').addEventListener('submit', createInvoice);
    document.querySelectorAll('.item-qty, .item-rate').forEach(input => {
        input.addEventListener('input', calculateInvoiceTotal);
    });
    document.getElementById('invoice-tax').addEventListener('input', calculateInvoiceTotal);
    document.getElementById('invoice-discount').addEventListener('input', calculateInvoiceTotal);
}

function addInvoiceItem() {
    const list = document.getElementById('invoice-items-list');
    const item = document.createElement('div');
    item.className = 'invoice-item';
    item.innerHTML = `
        <input type="text" placeholder="Description" class="form-control item-desc" required>
        <input type="number" placeholder="Quantity" class="form-control item-qty" value="1" required>
        <input type="number" placeholder="Rate" class="form-control item-rate" step="0.01" required>
        <input type="number" placeholder="Amount" class="form-control item-amount" readonly>
        <button type="button" class="btn-remove" onclick="removeInvoiceItem(this)">×</button>
    `;
    list.appendChild(item);
    item.querySelectorAll('.item-qty, .item-rate').forEach(input => {
        input.addEventListener('input', calculateInvoiceTotal);
    });
}

function removeInvoiceItem(btn) {
    btn.parentElement.remove();
    calculateInvoiceTotal();
}

function calculateInvoiceTotal() {
    let subtotal = 0;
    document.querySelectorAll('.invoice-item').forEach(item => {
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        item.querySelector('.item-amount').value = amount.toFixed(2);
        subtotal += amount;
    });
    
    const taxPercent = parseFloat(document.getElementById('invoice-tax')?.value) || 0;
    const discount = parseFloat(document.getElementById('invoice-discount')?.value) || 0;
    
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount - discount;
    
    if (document.getElementById('invoice-subtotal')) {
        document.getElementById('invoice-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    }
    if (document.getElementById('invoice-tax-amount')) {
        document.getElementById('invoice-tax-amount').textContent = `$${taxAmount.toFixed(2)}`;
    }
    document.getElementById('invoice-total-amount').textContent = `$${total.toFixed(2)}`;
}

async function createInvoice(e) {
    e.preventDefault();
    const items = [];
    document.querySelectorAll('.invoice-item').forEach(item => {
        items.push({
            description: item.querySelector('.item-desc').value,
            quantity: parseFloat(item.querySelector('.item-qty').value),
            rate: parseFloat(item.querySelector('.item-rate').value),
            amount: parseFloat(item.querySelector('.item-amount').value)
        });
    });
    
    try {
        const clientName = document.getElementById('invoice-client').value;
        console.log('Creating/finding client:', clientName);
        let clientId = await getOrCreateClient(clientName);
        console.log('Client ID:', clientId);
        
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxPercent = parseFloat(document.getElementById('invoice-tax').value) || 0;
        const taxAmount = (subtotal * taxPercent) / 100;
        const discount = parseFloat(document.getElementById('invoice-discount').value) || 0;
        
        const invoiceData = {
            client_id: clientId,
            items: items,
            due_date: new Date(document.getElementById('invoice-due').value).toISOString(),
            tax: taxAmount,
            discount: discount,
            currency: document.getElementById('invoice-currency').value,
            notes: document.getElementById('invoice-notes').value || null,
            payment_terms: document.getElementById('invoice-payment-terms').value
        };
        
        console.log('Creating invoice with data:', invoiceData);
        
        await apiRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
        closeModal();
        loadInvoices();
    } catch (error) {
        console.error('Invoice creation error:', error);
        alert('Error creating invoice: ' + error.message);
    }
}

async function getOrCreateClient(name) {
    try {
        // Try to find existing client
        const clients = await apiRequest('/clients');
        const existing = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            const id = extractId(existing._id);
            console.log('Found existing client, ID:', id);
            return id;
        }
        
        // Create new client
        const newClient = await apiRequest('/clients', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                company: null,
                phone: null,
                address: null
            })
        });
        
        const id = extractId(newClient._id);
        console.log('Created new client, ID:', id);
        return id;
    } catch (error) {
        console.error('Client creation error:', error);
        throw new Error('Failed to create client: ' + error.message);
    }
}

async function viewInvoice(id) {
    try {
        const invoice = await apiRequest(`/invoices/${id}`);
        const currency = invoice.currency || 'USD';
        const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'KSh';
        
        const itemsHTML = invoice.items.map(item => `
            <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${symbol}${item.rate.toFixed(2)}</td>
                <td>${symbol}${item.amount.toFixed(2)}</td>
            </tr>
        `).join('');
        
        createModal(`Invoice #${invoice.invoice_number}`, `
            <div class="invoice-view">
                <div class="invoice-header">
                    <h3>Invoice #${invoice.invoice_number}</h3>
                    <span class="status-badge status-${invoice.status}">${invoice.status}</span>
                </div>
                <div class="invoice-details">
                    <p><strong>Issue Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
                    <p><strong>Payment Terms:</strong> ${invoice.payment_terms || 'N/A'}</p>
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                <div class="invoice-totals">
                    <div class="total-row"><span>Subtotal:</span><span>${symbol}${invoice.subtotal.toFixed(2)}</span></div>
                    <div class="total-row"><span>Tax:</span><span>${symbol}${invoice.tax.toFixed(2)}</span></div>
                    <div class="total-row"><span>Discount:</span><span>-${symbol}${invoice.discount.toFixed(2)}</span></div>
                    <div class="total-row total"><span>Total:</span><span>${symbol}${invoice.total.toFixed(2)}</span></div>
                </div>
                ${invoice.notes ? `<div class="invoice-notes"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}
            </div>
        `);
    } catch (error) {
        alert('Error loading invoice: ' + error.message);
    }
}

async function updateInvoiceStatus(id) {
    const status = prompt('Enter new status (draft, sent, paid, overdue):', 'sent');
    if (!status) return;
    
    const validStatuses = ['draft', 'sent', 'paid', 'overdue'];
    if (!validStatuses.includes(status.toLowerCase())) {
        alert('Invalid status. Use: draft, sent, paid, or overdue');
        return;
    }
    
    try {
        await apiRequest(`/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: status.toLowerCase() })
        });
        loadInvoices();
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

function downloadInvoicePDF(id) {
    alert('PDF Generation: This feature requires a PDF library.\n\nTo implement:\n1. Install jsPDF or PDFKit\n2. Create invoice template\n3. Generate and download PDF\n\nFor now, use the View button to see invoice details.');
}

function emailInvoice(id) {
    const email = prompt('Enter client email address:');
    if (!email) return;
    
    alert(`Email Sending: This feature requires email service integration.\n\nTo implement:\n1. Set up email service (SendGrid, AWS SES, etc.)\n2. Create email template\n3. Send invoice as PDF attachment\n\nEmail would be sent to: ${email}`);
}

// TOOL 2: AI Writing Assistant
async function generateAIContent() {
    const task = document.getElementById('ai-task').value;
    const tone = document.getElementById('ai-tone').value;
    const input = document.getElementById('ai-input').value;
    const output = document.getElementById('ai-output');
    
    if (!input.trim()) {
        alert('Please enter some text or a prompt');
        return;
    }
    
    output.classList.add('active');
    output.innerHTML = '<div class="spinner"></div>';
    
    try {
        const response = await apiRequest('/ai/generate', {
            method: 'POST',
            body: JSON.stringify({ task, tone, input })
        });
        
        output.textContent = response.content || 'AI generation complete!';
    } catch (error) {
        output.textContent = 'AI service not available. This is a demo placeholder.\n\nYour ' + task + ' request in ' + tone + ' tone:\n\n' + input;
    }
}

// TOOL 3: Contract Generator
async function loadContracts() {
    const container = document.getElementById('contracts-list');
    container.innerHTML = '<div class="loading">Loading contracts...</div>';
    
    try {
        const contracts = await apiRequest('/contracts');
        
        if (contracts.length === 0) {
            container.innerHTML = '<div class="empty-state">No contracts yet. Generate your first contract!</div>';
            return;
        }
        
        container.innerHTML = contracts.map(contract => {
            const contractId = extractId(contract._id);
            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${contract.title}</h3>
                        <p>${contract.type} • Created: ${new Date(contract.created_at).toLocaleDateString()}</p>
                        <span class="status-badge status-${contract.status}">${contract.status}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-primary" onclick="viewContract('${contractId}')">View</button>
                        <button class="btn btn-small btn-secondary" onclick="downloadContract('${contractId}')">Download</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading contracts</div>';
    }
}

function showCreateContractModal() {
    const modal = createModal('Create Contract', `
        <form id="create-contract-form" class="contract-editor">
            <div class="form-group">
                <label>Contract Type</label>
                <select id="contract-type" class="form-control">
                    <option value="freelance">Freelance Contract</option>
                    <option value="employment">Employment Agreement</option>
                    <option value="partnership">Partnership Agreement</option>
                    <option value="service">Service Agreement</option>
                    <option value="nda">Non-Disclosure Agreement</option>
                </select>
            </div>
            <div class="form-group">
                <label>Contract Title</label>
                <input type="text" id="contract-title" class="form-control" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Party A (Your Name/Company)</label>
                    <input type="text" id="contract-party-a" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Party B (Client/Partner)</label>
                    <input type="text" id="contract-party-b" class="form-control" required>
                </div>
            </div>
            <div class="form-group">
                <label>Scope of Work</label>
                <textarea id="contract-scope" class="form-control" rows="4" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Amount</label>
                    <input type="number" id="contract-amount" class="form-control" step="0.01">
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" id="contract-duration" class="form-control" placeholder="e.g., 3 months">
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Generate Contract</button>
        </form>
    `);
    
    document.getElementById('create-contract-form').addEventListener('submit', createContract);
}

async function createContract(e) {
    e.preventDefault();
    
    try {
        await apiRequest('/contracts', {
            method: 'POST',
            body: JSON.stringify({
                type: document.getElementById('contract-type').value,
                title: document.getElementById('contract-title').value,
                party_a: document.getElementById('contract-party-a').value,
                party_b: document.getElementById('contract-party-b').value,
                scope: document.getElementById('contract-scope').value,
                amount: document.getElementById('contract-amount').value,
                duration: document.getElementById('contract-duration').value,
                status: 'draft'
            })
        });
        closeModal();
        loadContracts();
    } catch (error) {
        alert('Error creating contract: ' + error.message);
    }
}

function viewContract(id) { alert('View contract: ' + id); }
function downloadContract(id) { alert('Download contract: ' + id); }

// TOOL 4: Time Tracking
let currentFilteredEntries = [];

function startTimer() {
    const description = document.getElementById('timer-description').value;
    if (!description.trim()) {
        alert('Please enter what you are working on');
        return;
    }
    
    timerSeconds = 0;
    document.getElementById('timer-start').style.display = 'none';
    document.getElementById('timer-stop').style.display = 'inline-block';
    document.getElementById('timer-description').disabled = true;
    document.getElementById('timer-billable').disabled = true;
    document.getElementById('timer-rate').disabled = true;
    
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer-start').style.display = 'inline-block';
    document.getElementById('timer-stop').style.display = 'none';
    document.getElementById('timer-description').disabled = false;
    document.getElementById('timer-billable').disabled = false;
    document.getElementById('timer-rate').disabled = false;
    
    const hours = (timerSeconds / 3600).toFixed(2);
    const description = document.getElementById('timer-description').value;
    const isBillable = document.getElementById('timer-billable').checked;
    const rate = parseFloat(document.getElementById('timer-rate').value) || null;
    
    saveTimeEntry(description, hours, isBillable, rate);
    
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timer-description').value = '';
    document.getElementById('timer-rate').value = '';
}

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    document.getElementById('timer-display').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function saveTimeEntry(description, hours, isBillable = true, rate = null) {
    try {
        const now = new Date();
        const startTime = new Date(now.getTime() - (hours * 3600000));
        
        await apiRequest('/time-tracking', {
            method: 'POST',
            body: JSON.stringify({
                project_id: null,
                description,
                start_time: startTime.toISOString(),
                is_billable: isBillable,
                hourly_rate: rate
            })
        });
        
        const entries = await apiRequest('/time-tracking');
        const latestEntry = entries[entries.length - 1];
        if (latestEntry && !latestEntry.end_time) {
            await apiRequest(`/time-tracking/${latestEntry._id}/stop`, {
                method: 'POST',
                body: JSON.stringify({
                    end_time: now.toISOString()
                })
            });
        }
        
        loadTimeEntries();
    } catch (error) {
        alert('Error saving time entry: ' + error.message);
    }
}

async function getOrCreateDefaultProject() {
    try {
        const projects = await apiRequest('/projects');
        let defaultProject = projects.find(p => p.name === 'General');
        
        if (!defaultProject) {
            defaultProject = await apiRequest('/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'General',
                    description: 'Default project for time tracking',
                    status: 'active',
                    client_id: null
                })
            });
        }
        
        return defaultProject._id;
    } catch (error) {
        throw new Error('Failed to create default project');
    }
}

async function loadTimeEntries() {
    const container = document.getElementById('time-entries-list');
    container.innerHTML = '<div class="loading">Loading time entries...</div>';
    
    try {
        const entries = await apiRequest('/time-tracking');
        currentFilteredEntries = entries;
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state">No time entries yet. Start tracking your time!</div>';
            updateTimeSummary([]);
            return;
        }
        
        filterTimeEntries();
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading time entries</div>';
    }
}

function filterTimeEntries() {
    const period = document.getElementById('time-filter-period').value;
    const billableFilter = document.getElementById('time-filter-billable').value;
    const container = document.getElementById('time-entries-list');
    
    // Show/hide custom date inputs
    const showCustom = period === 'custom';
    document.getElementById('time-filter-start').style.display = showCustom ? 'block' : 'none';
    document.getElementById('time-filter-end').style.display = showCustom ? 'block' : 'none';
    
    let filtered = [...currentFilteredEntries];
    
    // Filter by period
    const now = new Date();
    if (period === 'today') {
        filtered = filtered.filter(e => {
            const date = new Date(e.start_time);
            return date.toDateString() === now.toDateString();
        });
    } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(e => new Date(e.start_time) >= weekAgo);
    } else if (period === 'month') {
        filtered = filtered.filter(e => {
            const date = new Date(e.start_time);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
    } else if (period === 'custom') {
        const start = document.getElementById('time-filter-start').value;
        const end = document.getElementById('time-filter-end').value;
        if (start && end) {
            filtered = filtered.filter(e => {
                const date = new Date(e.start_time);
                return date >= new Date(start) && date <= new Date(end);
            });
        }
    }
    
    // Filter by billable
    if (billableFilter === 'billable') {
        filtered = filtered.filter(e => e.is_billable);
    } else if (billableFilter === 'non-billable') {
        filtered = filtered.filter(e => !e.is_billable);
    }
    
    // Display entries
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No entries match the selected filters</div>';
        updateTimeSummary([]);
        return;
    }
    
    container.innerHTML = filtered.map(entry => {
        const entryId = extractId(entry._id);
        const hours = entry.duration ? (entry.duration / 3600).toFixed(2) : '0.00';
        const date = new Date(entry.start_time).toLocaleDateString();
        const billableBadge = entry.is_billable ? 
            '<span class="status-badge status-active">Billable</span>' : 
            '<span class="status-badge">Non-billable</span>';
        const earnings = entry.is_billable && entry.hourly_rate ? 
            `$${(hours * entry.hourly_rate).toFixed(2)}` : '-';
        
        return `
            <div class="list-item">
                <div class="item-info">
                    <h3>${entry.description}</h3>
                    <p>${hours} hours • ${date} • ${billableBadge} • Earnings: ${earnings}</p>
                </div>
                <div class="time-entry-actions">
                    <button class="btn btn-small btn-edit" onclick="editTimeEntry('${entryId}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="deleteTimeEntry('${entryId}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    updateTimeSummary(filtered);
}

function updateTimeSummary(entries) {
    const totalHours = entries.reduce((sum, e) => sum + (e.duration ? e.duration / 3600 : 0), 0);
    const billableHours = entries.filter(e => e.is_billable).reduce((sum, e) => sum + (e.duration ? e.duration / 3600 : 0), 0);
    const totalEarnings = entries.reduce((sum, e) => {
        if (e.is_billable && e.hourly_rate && e.duration) {
            return sum + ((e.duration / 3600) * e.hourly_rate);
        }
        return sum;
    }, 0);
    
    document.getElementById('total-hours').textContent = totalHours.toFixed(2);
    document.getElementById('billable-hours').textContent = billableHours.toFixed(2);
    document.getElementById('total-earnings').textContent = `$${totalEarnings.toFixed(2)}`;
}

function showAddTimeEntryModal() {
    const modal = createModal('Log Time Entry', `
        <form id="add-time-form" class="auth-form">
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="time-description" required>
            </div>
            <div class="form-group">
                <label>Hours</label>
                <input type="number" id="time-hours" step="0.25" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="time-date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="manual-time-billable" checked> Billable
                </label>
            </div>
            <div class="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" id="manual-time-rate" step="0.01" placeholder="Optional">
            </div>
            <button type="submit" class="btn btn-primary">Log Time</button>
        </form>
    `);
    
    document.getElementById('add-time-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTimeEntry(
            document.getElementById('time-description').value,
            document.getElementById('time-hours').value,
            document.getElementById('manual-time-billable').checked,
            parseFloat(document.getElementById('manual-time-rate').value) || null
        );
        closeModal();
    });
}

function editTimeEntry(id) {
    const entry = currentFilteredEntries.find(e => extractId(e._id) === id);
    if (!entry) return;
    
    const hours = entry.duration ? (entry.duration / 3600).toFixed(2) : '0';
    const date = new Date(entry.start_time).toISOString().split('T')[0];
    
    const modal = createModal('Edit Time Entry', `
        <form id="edit-time-form" class="auth-form">
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="edit-time-description" value="${entry.description}" required>
            </div>
            <div class="form-group">
                <label>Hours</label>
                <input type="number" id="edit-time-hours" value="${hours}" step="0.25" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="edit-time-date" value="${date}" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="edit-time-billable" ${entry.is_billable ? 'checked' : ''}> Billable
                </label>
            </div>
            <div class="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" id="edit-time-rate" value="${entry.hourly_rate || ''}" step="0.01">
            </div>
            <button type="submit" class="btn btn-primary">Update Entry</button>
        </form>
    `);
    
    document.getElementById('edit-time-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const hours = parseFloat(document.getElementById('edit-time-hours').value);
            const date = new Date(document.getElementById('edit-time-date').value);
            const startTime = new Date(date.getTime());
            const endTime = new Date(date.getTime() + (hours * 3600000));
            
            await apiRequest(`/time-tracking/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    description: document.getElementById('edit-time-description').value,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    is_billable: document.getElementById('edit-time-billable').checked,
                    hourly_rate: parseFloat(document.getElementById('edit-time-rate').value) || null
                })
            });
            closeModal();
            loadTimeEntries();
        } catch (error) {
            alert('Error updating entry: ' + error.message);
        }
    });
}

async function deleteTimeEntry(id) {
    if (confirm('Delete this time entry?')) {
        try {
            await apiRequest(`/time-tracking/${id}`, { method: 'DELETE' });
            loadTimeEntries();
        } catch (error) {
            alert('Error deleting entry');
        }
    }
}

async function generateInvoiceFromTime() {
    const billableFilter = document.getElementById('time-filter-billable');
    const originalValue = billableFilter.value;
    billableFilter.value = 'billable';
    filterTimeEntries();
    
    const billableEntries = currentFilteredEntries.filter(e => e.is_billable);
    
    if (billableEntries.length === 0) {
        alert('No billable time entries found for the selected period');
        billableFilter.value = originalValue;
        filterTimeEntries();
        return;
    }
    
    const totalHours = billableEntries.reduce((sum, e) => sum + (e.duration ? e.duration / 3600 : 0), 0);
    const totalAmount = billableEntries.reduce((sum, e) => {
        if (e.hourly_rate && e.duration) {
            return sum + ((e.duration / 3600) * e.hourly_rate);
        }
        return sum;
    }, 0);
    
    if (confirm(`Generate invoice for ${totalHours.toFixed(2)} billable hours ($${totalAmount.toFixed(2)})?`)) {
        try {
            const clientName = prompt('Enter client name:', 'Client');
            if (!clientName) return;
            
            const clientId = await getOrCreateClient(clientName);
            const items = [{
                description: `Time tracking services (${totalHours.toFixed(2)} hours)`,
                quantity: totalHours,
                rate: totalAmount / totalHours,
                amount: totalAmount
            }];
            
            await apiRequest('/invoices', {
                method: 'POST',
                body: JSON.stringify({
                    client_id: clientId,
                    items: items,
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    tax: 0,
                    discount: 0,
                    currency: 'USD',
                    notes: 'Generated from time tracking entries',
                    payment_terms: 'Net 30'
                })
            });
            
            alert('Invoice created successfully!');
            showSection('invoices');
        } catch (error) {
            alert('Error creating invoice: ' + error.message);
        }
    }
    
    billableFilter.value = originalValue;
    filterTimeEntries();
}

function exportTimeEntries() {
    const entries = currentFilteredEntries;
    if (entries.length === 0) {
        alert('No entries to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Description', 'Hours', 'Billable', 'Rate', 'Earnings'];
    const rows = entries.map(entry => {
        const hours = entry.duration ? (entry.duration / 3600).toFixed(2) : '0.00';
        const date = new Date(entry.start_time).toLocaleDateString();
        const billable = entry.is_billable ? 'Yes' : 'No';
        const rate = entry.hourly_rate || '0.00';
        const earnings = entry.is_billable && entry.hourly_rate ? 
            (hours * entry.hourly_rate).toFixed(2) : '0.00';
        
        return [date, entry.description, hours, billable, rate, earnings];
    });
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-entries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// TOOL 5: Resume Builder
async function loadResumes() {
    const container = document.getElementById('resumes-list');
    container.innerHTML = '<div class="loading">Loading resumes...</div>';
    
    try {
        const resumes = await apiRequest('/resumes');
        
        if (resumes.length === 0) {
            container.innerHTML = '<div class="empty-state">No resumes yet. Create your first resume!</div>';
            return;
        }
        
        container.innerHTML = resumes.map(resume => {
            const resumeId = extractId(resume._id);
            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${resume.title}</h3>
                        <p>${resume.name} • Updated: ${new Date(resume.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-primary" onclick="editResume('${resumeId}')">Edit</button>
                        <button class="btn btn-small btn-secondary" onclick="downloadResume('${resumeId}')">Download PDF</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading resumes</div>';
    }
}

function showCreateResumeModal() {
    const modal = createModal('Create Resume', `
        <form id="create-resume-form" class="resume-form">
            <div class="form-group">
                <label>Resume Title</label>
                <input type="text" id="resume-title" class="form-control" placeholder="e.g., Software Developer Resume" required>
            </div>
            
            <div class="resume-section">
                <h4>Personal Information</h4>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="resume-name" class="form-control" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="resume-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="resume-phone" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label>Professional Summary</label>
                    <textarea id="resume-summary" class="form-control" rows="3"></textarea>
                </div>
            </div>
            
            <div class="resume-section">
                <h4>Skills</h4>
                <div class="form-group">
                    <label>Skills (comma-separated)</label>
                    <input type="text" id="resume-skills" class="form-control" placeholder="JavaScript, React, Node.js">
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary">Create Resume</button>
        </form>
    `);
    
    document.getElementById('create-resume-form').addEventListener('submit', createResume);
}

async function createResume(e) {
    e.preventDefault();
    
    try {
        await apiRequest('/resumes', {
            method: 'POST',
            body: JSON.stringify({
                title: document.getElementById('resume-title').value,
                name: document.getElementById('resume-name').value,
                email: document.getElementById('resume-email').value,
                phone: document.getElementById('resume-phone').value,
                summary: document.getElementById('resume-summary').value,
                skills: document.getElementById('resume-skills').value.split(',').map(s => s.trim())
            })
        });
        closeModal();
        loadResumes();
    } catch (error) {
        alert('Error creating resume: ' + error.message);
    }
}

function editResume(id) { alert('Edit resume: ' + id); }
function downloadResume(id) { alert('Download resume PDF: ' + id); }

// TOOL 6: Resume Optimizer
async function optimizeResume() {
    const resumeText = document.getElementById('resume-text').value;
    const jobDescription = document.getElementById('job-description').value;
    const results = document.getElementById('optimization-results');
    
    if (!resumeText.trim()) {
        alert('Please paste your resume text');
        return;
    }
    
    results.classList.add('active');
    results.innerHTML = '<div class="spinner"></div>';
    
    try {
        const response = await apiRequest('/ai/optimize-resume', {
            method: 'POST',
            body: JSON.stringify({ resume: resumeText, job_description: jobDescription })
        });
        
        displayOptimizationResults(response);
    } catch (error) {
        // Demo results if AI service not available
        displayOptimizationResults({
            score: 75,
            suggestions: [
                'Add more quantifiable achievements with numbers and percentages',
                'Include relevant keywords from the job description',
                'Strengthen action verbs in your experience section',
                'Add a professional summary at the top',
                'Ensure consistent formatting throughout'
            ],
            missing_keywords: ['leadership', 'project management', 'agile'],
            strengths: ['Clear structure', 'Good use of bullet points', 'Relevant experience']
        });
    }
}

function displayOptimizationResults(data) {
    const results = document.getElementById('optimization-results');
    
    results.innerHTML = `
        <div class="score-card">
            <h4>Resume Score</h4>
            <div class="score-value">${data.score}/100</div>
            <p>${data.score >= 80 ? 'Excellent!' : data.score >= 60 ? 'Good, but can be improved' : 'Needs improvement'}</p>
        </div>
        
        <div class="score-card">
            <h4>Suggestions for Improvement</h4>
            <ul class="suggestions-list">
                ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        
        ${data.missing_keywords && data.missing_keywords.length > 0 ? `
            <div class="score-card">
                <h4>Missing Keywords</h4>
                <p>Consider adding these keywords from the job description:</p>
                <p><strong>${data.missing_keywords.join(', ')}</strong></p>
            </div>
        ` : ''}
        
        ${data.strengths && data.strengths.length > 0 ? `
            <div class="score-card">
                <h4>Strengths</h4>
                <ul class="suggestions-list">
                    ${data.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
}

// Modal Helper
function createModal(title, content) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                ${content}
            </div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('modal-container').innerHTML = '';
}
