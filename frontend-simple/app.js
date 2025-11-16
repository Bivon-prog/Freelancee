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
    
    return response.json();
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
        const invoices = await apiRequest('/invoices');
        
        if (invoices.length === 0) {
            container.innerHTML = '<div class="empty-state">No invoices yet. Create your first invoice!</div>';
            return;
        }
        
        container.innerHTML = invoices.map(invoice => `
            <div class="list-item">
                <div class="item-info">
                    <h3>Invoice #${invoice.invoice_number}</h3>
                    <p>Amount: $${invoice.total_amount} • Due: ${new Date(invoice.due_date).toLocaleDateString()}</p>
                    <span class="status-badge status-${invoice.status}">${invoice.status}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-primary" onclick="viewInvoice('${invoice._id}')">View</button>
                    <button class="btn btn-small btn-secondary" onclick="downloadInvoice('${invoice._id}')">Download PDF</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading invoices</div>';
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
            <div class="invoice-total">
                <h3>Total: $<span id="invoice-total-amount">0.00</span></h3>
            </div>
            <button type="submit" class="btn btn-primary">Create Invoice</button>
        </form>
    `);
    
    document.getElementById('create-invoice-form').addEventListener('submit', createInvoice);
    document.querySelectorAll('.item-qty, .item-rate').forEach(input => {
        input.addEventListener('input', calculateInvoiceTotal);
    });
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
    let total = 0;
    document.querySelectorAll('.invoice-item').forEach(item => {
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        item.querySelector('.item-amount').value = amount.toFixed(2);
        total += amount;
    });
    document.getElementById('invoice-total-amount').textContent = total.toFixed(2);
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
        // First create a client if needed
        const clientName = document.getElementById('invoice-client').value;
        let clientId = await getOrCreateClient(clientName);
        
        await apiRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify({
                client_id: clientId,
                items: items,
                due_date: new Date(document.getElementById('invoice-due').value).toISOString(),
                tax: 0,
                discount: 0,
                currency: 'USD',
                notes: null,
                payment_terms: null
            })
        });
        closeModal();
        loadInvoices();
    } catch (error) {
        alert('Error creating invoice: ' + error.message);
    }
}

async function getOrCreateClient(name) {
    try {
        // Try to find existing client
        const clients = await apiRequest('/clients');
        const existing = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing._id;
        
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
        return newClient._id;
    } catch (error) {
        throw new Error('Failed to create client');
    }
}

function viewInvoice(id) { alert('View invoice: ' + id); }
function downloadInvoice(id) { alert('Download PDF for invoice: ' + id); }

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
        
        container.innerHTML = contracts.map(contract => `
            <div class="list-item">
                <div class="item-info">
                    <h3>${contract.title}</h3>
                    <p>${contract.type} • Created: ${new Date(contract.created_at).toLocaleDateString()}</p>
                    <span class="status-badge status-${contract.status}">${contract.status}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-primary" onclick="viewContract('${contract._id}')">View</button>
                    <button class="btn btn-small btn-secondary" onclick="downloadContract('${contract._id}')">Download</button>
                </div>
            </div>
        `).join('');
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
    
    const hours = (timerSeconds / 3600).toFixed(2);
    const description = document.getElementById('timer-description').value;
    
    saveTimeEntry(description, hours);
    
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timer-description').value = '';
}

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    document.getElementById('timer-display').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function saveTimeEntry(description, hours) {
    try {
        // Get or create a default project
        const projectId = await getOrCreateDefaultProject();
        const now = new Date();
        const startTime = new Date(now.getTime() - (hours * 3600000)); // hours ago
        
        await apiRequest('/time-tracking', {
            method: 'POST',
            body: JSON.stringify({
                project_id: projectId,
                description,
                start_time: startTime.toISOString(),
                is_billable: true,
                hourly_rate: null
            })
        });
        
        // Get the created entry and stop it
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
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state">No time entries yet. Start tracking your time!</div>';
            return;
        }
        
        container.innerHTML = entries.map(entry => {
            const hours = entry.duration ? (entry.duration / 3600).toFixed(2) : '0.00';
            const date = new Date(entry.start_time).toLocaleDateString();
            return `
                <div class="list-item">
                    <div class="item-info">
                        <h3>${entry.description}</h3>
                        <p>${hours} hours • ${date}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-secondary" onclick="deleteTimeEntry('${entry._id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading time entries</div>';
    }
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
            <button type="submit" class="btn btn-primary">Log Time</button>
        </form>
    `);
    
    document.getElementById('add-time-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTimeEntry(
            document.getElementById('time-description').value,
            document.getElementById('time-hours').value
        );
        closeModal();
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
        
        container.innerHTML = resumes.map(resume => `
            <div class="list-item">
                <div class="item-info">
                    <h3>${resume.title}</h3>
                    <p>${resume.name} • Updated: ${new Date(resume.updated_at).toLocaleDateString()}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-primary" onclick="editResume('${resume._id}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="downloadResume('${resume._id}')">Download PDF</button>
                </div>
            </div>
        `).join('');
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
