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
            const value = contract.value ? `$${contract.value}` : 'N/A';
            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${contract.title}</h3>
                        <p>Value: ${value} • Created: ${new Date(contract.created_at).toLocaleDateString()}</p>
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
        console.error('Error loading contracts:', error);
        container.innerHTML = `<div class="empty-state">Error loading contracts: ${error.message}</div>`;
    }
}

function showCreateContractModal() {
    const modal = createModal('Create Contract', `
        <form id="create-contract-form" class="contract-editor">
            <div class="form-group">
                <label>Contract Type</label>
                <select id="contract-type" class="form-control" onchange="showContractTypeInfo()">
                    <option value="freelance">Freelance Contract</option>
                    <option value="employment">Employment Agreement</option>
                    <option value="partnership">Partnership Agreement</option>
                    <option value="service">Service Agreement</option>
                    <option value="nda">Non-Disclosure Agreement (NDA)</option>
                </select>
                <div id="contract-type-info" style="margin-top: 10px; padding: 10px; background: #f0f9ff; border-left: 3px solid #3b82f6; font-size: 13px; color: #1e40af;">
                    <strong>Freelance Contract:</strong> For independent contractors providing services to clients. Includes terms for services, payment, IP rights, and termination.
                </div>
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
            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn btn-secondary" onclick="previewContract()">Preview Contract</button>
                <button type="submit" class="btn btn-primary">Generate & Save Contract</button>
            </div>
        </form>
        <div id="contract-preview" style="display: none; margin-top: 20px;">
            <h4>Contract Preview:</h4>
            <div class="contract-document" id="preview-content"></div>
        </div>
    `);
    
    document.getElementById('create-contract-form').addEventListener('submit', createContract);
}

function showContractTypeInfo() {
    const type = document.getElementById('contract-type').value;
    const infoDiv = document.getElementById('contract-type-info');
    
    const descriptions = {
        freelance: '<strong>Freelance Contract:</strong> For independent contractors providing services to clients. Includes terms for services, payment, IP rights, and termination.',
        employment: '<strong>Employment Agreement:</strong> For hiring employees. Covers position, salary, benefits, confidentiality, non-compete, and termination terms.',
        partnership: '<strong>Partnership Agreement:</strong> For business partnerships. Defines capital contributions, profit sharing, management rights, and dissolution terms.',
        service: '<strong>Service Agreement:</strong> For service providers. Outlines services, fees, standards, warranties, liability, and dispute resolution.',
        nda: '<strong>Non-Disclosure Agreement:</strong> For protecting confidential information. Defines what\'s confidential, obligations, term, and exclusions.'
    };
    
    infoDiv.innerHTML = descriptions[type];
}

function previewContract() {
    const contractData = {
        type: document.getElementById('contract-type').value,
        title: document.getElementById('contract-title').value,
        party_a: document.getElementById('contract-party-a').value,
        party_b: document.getElementById('contract-party-b').value,
        scope: document.getElementById('contract-scope').value,
        amount: document.getElementById('contract-amount').value,
        duration: document.getElementById('contract-duration').value
    };
    
    // Validate required fields
    if (!contractData.party_a || !contractData.party_b || !contractData.scope) {
        alert('Please fill in Party A, Party B, and Scope of Work to preview');
        return;
    }
    
    // Generate preview
    const contractDocument = CONTRACT_TEMPLATES[contractData.type](contractData);
    
    // Show preview
    document.getElementById('contract-preview').style.display = 'block';
    document.getElementById('preview-content').innerHTML = contractDocument.replace(/\n/g, '<br>');
    
    // Scroll to preview
    document.getElementById('contract-preview').scrollIntoView({ behavior: 'smooth' });
}

async function createContract(e) {
    e.preventDefault();
    
    try {
        const contractData = {
            type: document.getElementById('contract-type').value,
            title: document.getElementById('contract-title').value,
            party_a: document.getElementById('contract-party-a').value,
            party_b: document.getElementById('contract-party-b').value,
            scope: document.getElementById('contract-scope').value,
            amount: document.getElementById('contract-amount').value,
            duration: document.getElementById('contract-duration').value
        };
        
        // Generate contract document from template
        const contractDocument = CONTRACT_TEMPLATES[contractData.type](contractData);
        
        // Get or create client
        const clientId = await getOrCreateClient(contractData.party_b);
        
        await apiRequest('/contracts', {
            method: 'POST',
            body: JSON.stringify({
                client_id: clientId,
                title: contractData.title,
                content: contractDocument,
                start_date: new Date().toISOString(),
                end_date: null,
                value: parseFloat(contractData.amount) || null,
                currency: 'USD'
            })
        });
        closeModal();
        loadContracts();
    } catch (error) {
        alert('Error creating contract: ' + error.message);
    }
}

async function viewContract(id) {
    try {
        const contract = await apiRequest(`/contracts/${id}`);
        
        // Determine contract type from content
        let contractType = 'Contract';
        if (contract.content) {
            if (contract.content.includes('FREELANCE')) contractType = 'Freelance Agreement';
            else if (contract.content.includes('EMPLOYMENT')) contractType = 'Employment Agreement';
            else if (contract.content.includes('PARTNERSHIP')) contractType = 'Partnership Agreement';
            else if (contract.content.includes('SERVICE AGREEMENT')) contractType = 'Service Agreement';
            else if (contract.content.includes('NON-DISCLOSURE')) contractType = 'Non-Disclosure Agreement';
        }
        
        createModal(`${contract.title}`, `
            <div class="contract-view">
                <div class="contract-header">
                    <div>
                        <h3>${contract.title}</h3>
                        <p><strong>Type:</strong> ${contractType}</p>
                        <p><strong>Created:</strong> ${new Date(contract.created_at).toLocaleDateString()}</p>
                        ${contract.value ? `<p><strong>Value:</strong> $${contract.value}</p>` : ''}
                    </div>
                    <span class="status-badge status-${contract.status}">${contract.status}</span>
                </div>
                <div class="contract-document">
                    ${contract.content ? contract.content.replace(/\n/g, '<br>') : 'No document generated'}
                </div>
                <div class="contract-actions">
                    <button class="btn btn-primary" onclick="downloadContractPDF('${extractId(contract._id)}')">Download PDF</button>
                    <button class="btn btn-secondary" onclick="updateContractStatus('${extractId(contract._id)}')">Update Status</button>
                </div>
            </div>
        `);
    } catch (error) {
        console.error('Contract view error:', error);
        alert('Error loading contract: ' + error.message);
    }
}

async function updateContractStatus(id) {
    const status = prompt('Enter new status (draft, active, completed, cancelled):', 'active');
    if (!status) return;
    
    const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
        alert('Invalid status. Use: draft, active, completed, or cancelled');
        return;
    }
    
    try {
        await apiRequest(`/contracts/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: status.toLowerCase() })
        });
        closeModal();
        loadContracts();
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

function downloadContractPDF(id) {
    alert('PDF Generation: This feature requires a PDF library.\n\nTo implement:\n1. Install jsPDF or PDFKit\n2. Format contract document\n3. Generate and download PDF\n\nFor now, use the View button and copy the text.');
}

function downloadContract(id) {
    downloadContractPDF(id);
}

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
                        <p>${resume.personal_info.full_name} • ${resume.template} template • Updated: ${new Date(resume.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-primary" onclick="viewResume('${resumeId}')">Preview</button>
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
            
            <div class="form-group">
                <label>Template Style</label>
                <select id="resume-template" class="form-control">
                    <option value="modern">Modern - Clean and professional</option>
                    <option value="classic">Classic - Traditional format</option>
                    <option value="creative">Creative - Bold and colorful</option>
                    <option value="minimal">Minimal - Simple and elegant</option>
                    <option value="executive">Executive - Senior professional</option>
                </select>
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
                    <label>Location</label>
                    <input type="text" id="resume-location" class="form-control" placeholder="City, Country">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Website</label>
                        <input type="url" id="resume-website" class="form-control" placeholder="https://yourwebsite.com">
                    </div>
                    <div class="form-group">
                        <label>LinkedIn</label>
                        <input type="url" id="resume-linkedin" class="form-control" placeholder="https://linkedin.com/in/yourprofile">
                    </div>
                </div>
                <div class="form-group">
                    <label>GitHub</label>
                    <input type="url" id="resume-github" class="form-control" placeholder="https://github.com/yourusername">
                </div>
                <div class="form-group">
                    <label>Professional Summary</label>
                    <textarea id="resume-summary" class="form-control" rows="3" placeholder="Brief overview of your professional background"></textarea>
                </div>
            </div>
            
            <div class="resume-section">
                <h4>Work Experience</h4>
                <div id="experience-list">
                    <div class="experience-item">
                        <input type="text" placeholder="Job Title" class="form-control exp-title" required>
                        <input type="text" placeholder="Company" class="form-control exp-company" required>
                        <input type="text" placeholder="Location (optional)" class="form-control exp-location">
                        <div class="form-row">
                            <input type="text" placeholder="Start Date (e.g., Jan 2020)" class="form-control exp-start">
                            <input type="text" placeholder="End Date (or Present)" class="form-control exp-end">
                        </div>
                        <textarea placeholder="Responsibilities and achievements" class="form-control exp-desc" rows="3"></textarea>
                    </div>
                </div>
                <button type="button" class="btn-add" onclick="addExperience()">+ Add Experience</button>
            </div>
            
            <div class="resume-section">
                <h4>Education</h4>
                <div id="education-list">
                    <div class="education-item">
                        <input type="text" placeholder="Degree" class="form-control edu-degree" required>
                        <input type="text" placeholder="Field of Study" class="form-control edu-field" required>
                        <input type="text" placeholder="Institution" class="form-control edu-school" required>
                        <div class="form-row">
                            <input type="text" placeholder="Start Year" class="form-control edu-start">
                            <input type="text" placeholder="End Year (or Expected)" class="form-control edu-year">
                        </div>
                        <input type="text" placeholder="GPA (optional)" class="form-control edu-gpa">
                    </div>
                </div>
                <button type="button" class="btn-add" onclick="addEducation()">+ Add Education</button>
            </div>
            
            <div class="resume-section">
                <h4>Skills</h4>
                <div class="form-group">
                    <label>Skills (comma-separated)</label>
                    <input type="text" id="resume-skills" class="form-control" placeholder="JavaScript, React, Node.js, Python">
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary">Create Resume</button>
        </form>
    `);
    
    document.getElementById('create-resume-form').addEventListener('submit', createResume);
}

function addExperience() {
    const list = document.getElementById('experience-list');
    const item = document.createElement('div');
    item.className = 'experience-item';
    item.innerHTML = `
        <input type="text" placeholder="Job Title" class="form-control exp-title" required>
        <input type="text" placeholder="Company" class="form-control exp-company" required>
        <input type="text" placeholder="Location (optional)" class="form-control exp-location">
        <div class="form-row">
            <input type="text" placeholder="Start Date" class="form-control exp-start">
            <input type="text" placeholder="End Date" class="form-control exp-end">
        </div>
        <textarea placeholder="Responsibilities" class="form-control exp-desc" rows="3"></textarea>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(item);
}

function addEducation() {
    const list = document.getElementById('education-list');
    const item = document.createElement('div');
    item.className = 'education-item';
    item.innerHTML = `
        <input type="text" placeholder="Degree" class="form-control edu-degree" required>
        <input type="text" placeholder="Field of Study" class="form-control edu-field" required>
        <input type="text" placeholder="Institution" class="form-control edu-school" required>
        <div class="form-row">
            <input type="text" placeholder="Start Year" class="form-control edu-start">
            <input type="text" placeholder="End Year" class="form-control edu-year">
        </div>
        <input type="text" placeholder="GPA (optional)" class="form-control edu-gpa">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(item);
}

async function createResume(e) {
    e.preventDefault();
    
    try {
        // Collect work experience
        const experience = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const position = item.querySelector('.exp-title')?.value;
            if (position) {
                experience.push({
                    position: position,
                    company: item.querySelector('.exp-company').value,
                    location: item.querySelector('.exp-location')?.value || null,
                    start_date: item.querySelector('.exp-start').value,
                    end_date: item.querySelector('.exp-end').value || null,
                    description: item.querySelector('.exp-desc').value,
                    achievements: []
                });
            }
        });
        
        // Collect education
        const education = [];
        document.querySelectorAll('.education-item').forEach(item => {
            const degree = item.querySelector('.edu-degree')?.value;
            if (degree) {
                education.push({
                    degree: degree,
                    institution: item.querySelector('.edu-school').value,
                    field: item.querySelector('.edu-field')?.value || '',
                    start_date: item.querySelector('.edu-start')?.value || '',
                    end_date: item.querySelector('.edu-year').value || null,
                    gpa: item.querySelector('.edu-gpa').value || null
                });
            }
        });
        
        await apiRequest('/resumes', {
            method: 'POST',
            body: JSON.stringify({
                title: document.getElementById('resume-title').value,
                personal_info: {
                    full_name: document.getElementById('resume-name').value,
                    email: document.getElementById('resume-email').value,
                    phone: document.getElementById('resume-phone').value,
                    location: document.getElementById('resume-location').value,
                    website: document.getElementById('resume-website')?.value || null,
                    linkedin: document.getElementById('resume-linkedin')?.value || null,
                    github: document.getElementById('resume-github')?.value || null
                },
                summary: document.getElementById('resume-summary').value,
                skills: document.getElementById('resume-skills').value.split(',').map(s => s.trim()).filter(s => s),
                experience: experience,
                education: education,
                template: document.getElementById('resume-template')?.value || 'modern'
            })
        });
        closeModal();
        loadResumes();
    } catch (error) {
        alert('Error creating resume: ' + error.message);
    }
}

async function viewResume(id) {
    try {
        const resume = await apiRequest(`/resumes/${id}`);
        const modal = createModal('Resume Preview', generateResumeHTML(resume), 'large');
    } catch (error) {
        alert('Error loading resume: ' + error.message);
    }
}

function generateResumeHTML(resume) {
    const template = resume.template || 'modern';
    const templates = {
        modern: generateModernTemplate(resume),
        classic: generateClassicTemplate(resume),
        creative: generateCreativeTemplate(resume),
        minimal: generateMinimalTemplate(resume),
        executive: generateExecutiveTemplate(resume)
    };
    
    return `
        <div class="resume-preview ${template}-template">
            ${templates[template] || templates.modern}
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn btn-primary" onclick="downloadResumePDF('${extractId(resume._id)}')">Download PDF</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
}

function generateModernTemplate(r) {
    return `
        <div class="resume-content modern">
            <div class="resume-header">
                <h1>${r.personal_info.full_name}</h1>
                <div class="contact-info">
                    ${r.personal_info.email} ${r.personal_info.phone ? '• ' + r.personal_info.phone : ''}
                    ${r.personal_info.location ? '• ' + r.personal_info.location : ''}
                </div>
                ${r.personal_info.linkedin || r.personal_info.github || r.personal_info.website ? `
                    <div class="links">
                        ${r.personal_info.linkedin ? `<a href="${r.personal_info.linkedin}">LinkedIn</a>` : ''}
                        ${r.personal_info.github ? `<a href="${r.personal_info.github}">GitHub</a>` : ''}
                        ${r.personal_info.website ? `<a href="${r.personal_info.website}">Website</a>` : ''}
                    </div>
                ` : ''}
            </div>
            
            ${r.summary ? `
                <div class="resume-section">
                    <h2>Professional Summary</h2>
                    <p>${r.summary}</p>
                </div>
            ` : ''}
            
            ${r.experience && r.experience.length > 0 ? `
                <div class="resume-section">
                    <h2>Work Experience</h2>
                    ${r.experience.map(exp => `
                        <div class="experience-entry">
                            <div class="entry-header">
                                <h3>${exp.position}</h3>
                                <span class="date">${exp.start_date} - ${exp.end_date || 'Present'}</span>
                            </div>
                            <div class="company">${exp.company}${exp.location ? ' • ' + exp.location : ''}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${r.education && r.education.length > 0 ? `
                <div class="resume-section">
                    <h2>Education</h2>
                    ${r.education.map(edu => `
                        <div class="education-entry">
                            <div class="entry-header">
                                <h3>${edu.degree} in ${edu.field}</h3>
                                <span class="date">${edu.end_date || edu.start_date}</span>
                            </div>
                            <div class="institution">${edu.institution}</div>
                            ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${r.skills && r.skills.length > 0 ? `
                <div class="resume-section">
                    <h2>Skills</h2>
                    <div class="skills-list">
                        ${r.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function generateClassicTemplate(r) {
    return `
        <div class="resume-content classic">
            <div class="resume-header">
                <h1>${r.personal_info.full_name}</h1>
                <div class="contact-line">
                    ${r.personal_info.email} | ${r.personal_info.phone || ''} | ${r.personal_info.location || ''}
                </div>
            </div>
            
            ${r.summary ? `<div class="section"><strong>OBJECTIVE</strong><p>${r.summary}</p></div>` : ''}
            
            ${r.experience && r.experience.length > 0 ? `
                <div class="section">
                    <strong>EXPERIENCE</strong>
                    ${r.experience.map(exp => `
                        <div class="entry">
                            <div><strong>${exp.position}</strong> - ${exp.company}</div>
                            <div><em>${exp.start_date} - ${exp.end_date || 'Present'}</em></div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${r.education && r.education.length > 0 ? `
                <div class="section">
                    <strong>EDUCATION</strong>
                    ${r.education.map(edu => `
                        <div class="entry">
                            <div><strong>${edu.degree}</strong> in ${edu.field}</div>
                            <div>${edu.institution} - ${edu.end_date || edu.start_date}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${r.skills && r.skills.length > 0 ? `
                <div class="section">
                    <strong>SKILLS</strong>
                    <p>${r.skills.join(', ')}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function generateCreativeTemplate(r) {
    return `
        <div class="resume-content creative">
            <div class="sidebar">
                <h1>${r.personal_info.full_name}</h1>
                <div class="contact">
                    <p>${r.personal_info.email}</p>
                    <p>${r.personal_info.phone || ''}</p>
                    <p>${r.personal_info.location || ''}</p>
                </div>
                ${r.skills && r.skills.length > 0 ? `
                    <div class="skills-sidebar">
                        <h3>Skills</h3>
                        ${r.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="main-content">
                ${r.summary ? `<div class="summary-box"><h3>About Me</h3><p>${r.summary}</p></div>` : ''}
                
                ${r.experience && r.experience.length > 0 ? `
                    <h2>Experience</h2>
                    ${r.experience.map(exp => `
                        <div class="exp-card">
                            <h3>${exp.position}</h3>
                            <div class="meta">${exp.company} | ${exp.start_date} - ${exp.end_date || 'Present'}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${r.education && r.education.length > 0 ? `
                    <h2>Education</h2>
                    ${r.education.map(edu => `
                        <div class="edu-card">
                            <h3>${edu.degree} in ${edu.field}</h3>
                            <div class="meta">${edu.institution} | ${edu.end_date || edu.start_date}</div>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        </div>
    `;
}

function generateMinimalTemplate(r) {
    return `
        <div class="resume-content minimal">
            <h1>${r.personal_info.full_name}</h1>
            <div class="contact-minimal">${r.personal_info.email} • ${r.personal_info.phone || ''}</div>
            
            ${r.summary ? `<p class="summary-minimal">${r.summary}</p>` : ''}
            
            ${r.experience && r.experience.length > 0 ? `
                <h2>Experience</h2>
                ${r.experience.map(exp => `
                    <div class="minimal-entry">
                        <div class="minimal-header">${exp.position}, ${exp.company} <span>${exp.start_date} - ${exp.end_date || 'Present'}</span></div>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            ` : ''}
            
            ${r.education && r.education.length > 0 ? `
                <h2>Education</h2>
                ${r.education.map(edu => `
                    <div class="minimal-entry">
                        <div class="minimal-header">${edu.degree} in ${edu.field}, ${edu.institution} <span>${edu.end_date || edu.start_date}</span></div>
                    </div>
                `).join('')}
            ` : ''}
            
            ${r.skills && r.skills.length > 0 ? `
                <h2>Skills</h2>
                <p>${r.skills.join(' • ')}</p>
            ` : ''}
        </div>
    `;
}

function generateExecutiveTemplate(r) {
    return `
        <div class="resume-content executive">
            <div class="exec-header">
                <h1>${r.personal_info.full_name}</h1>
                <div class="exec-contact">
                    ${r.personal_info.email} | ${r.personal_info.phone || ''} | ${r.personal_info.location || ''}
                </div>
            </div>
            
            ${r.summary ? `
                <div class="exec-summary">
                    <h2>Executive Summary</h2>
                    <p>${r.summary}</p>
                </div>
            ` : ''}
            
            ${r.experience && r.experience.length > 0 ? `
                <div class="exec-section">
                    <h2>Professional Experience</h2>
                    ${r.experience.map(exp => `
                        <div class="exec-entry">
                            <div class="exec-title">${exp.position}</div>
                            <div class="exec-org">${exp.company} | ${exp.start_date} - ${exp.end_date || 'Present'}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${r.education && r.education.length > 0 ? `
                <div class="exec-section">
                    <h2>Education & Credentials</h2>
                    ${r.education.map(edu => `
                        <div class="exec-entry">
                            <div class="exec-title">${edu.degree} in ${edu.field}</div>
                            <div class="exec-org">${edu.institution} | ${edu.end_date || edu.start_date}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${r.skills && r.skills.length > 0 ? `
                <div class="exec-section">
                    <h2>Core Competencies</h2>
                    <div class="exec-skills">${r.skills.join(' • ')}</div>
                </div>
            ` : ''}
        </div>
    `;
}

function downloadResumePDF(id) {
    alert('PDF download will be implemented with a PDF generation library. Resume ID: ' + id);
}

function downloadResume(id) {
    downloadResumePDF(id);
}

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
function createModal(title, content, size = 'normal') {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div class="modal ${size}">
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
