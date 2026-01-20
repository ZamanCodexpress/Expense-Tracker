// Expense Tracker Application
// Data storage key
const STORAGE_KEY = 'expenseTrackerData';

// Initialize application
let expenses = [];
let categoryChart = null;
let weeklyChart = null;
let monthlyChart = null;

// Category colors for charts
const categoryColors = {
    fuel: '#f59e0b',
    food: '#10b981',
    travel: '#3b82f6',
    utilities: '#8b5cf6',
    entertainment: '#ec4899',
    shopping: '#f97316',
    other: '#6b7280'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    setupEventListeners();
    setDefaultDate();
    renderExpenses();
    updateAnalytics();
    renderCharts();
});

// Load expenses from localStorage
function loadExpenses() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        expenses = JSON.parse(stored);
        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('expenseForm').addEventListener('submit', handleAddExpense);
    
    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', handleUpdateExpense);
    
    // Filter changes
    document.getElementById('filterCategory').addEventListener('change', renderExpenses);
    document.getElementById('filterDateFrom').addEventListener('change', renderExpenses);
    document.getElementById('filterDateTo').addEventListener('change', renderExpenses);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('editModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Handle add expense
function handleAddExpense(e) {
    e.preventDefault();
    
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value.trim();
    
    if (!date || !category || !amount || amount <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const expense = {
        id: Date.now().toString(),
        date: date,
        category: category,
        amount: amount,
        description: description || 'No description'
    };
    
    expenses.unshift(expense); // Add to beginning
    saveExpenses();
    renderExpenses();
    updateAnalytics();
    renderCharts();
    
    // Reset form
    document.getElementById('expenseForm').reset();
    setDefaultDate();
}

// Handle update expense
function handleUpdateExpense(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    const category = document.getElementById('editCategory').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const description = document.getElementById('editDescription').value.trim();
    
    if (!date || !category || !amount || amount <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const index = expenses.findIndex(exp => exp.id === id);
    if (index !== -1) {
        expenses[index] = {
            id: id,
            date: date,
            category: category,
            amount: amount,
            description: description || 'No description'
        };
        saveExpenses();
        renderExpenses();
        updateAnalytics();
        renderCharts();
        closeModal();
    }
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        renderExpenses();
        updateAnalytics();
        renderCharts();
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
        document.getElementById('editId').value = expense.id;
        document.getElementById('editDate').value = expense.date;
        document.getElementById('editCategory').value = expense.category;
        document.getElementById('editAmount').value = expense.amount;
        document.getElementById('editDescription').value = expense.description;
        document.getElementById('editModal').style.display = 'block';
    }
}

// Close modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Render expenses table
function renderExpenses() {
    const tbody = document.getElementById('expensesTableBody');
    const filterCategory = document.getElementById('filterCategory').value;
    const filterDateFrom = document.getElementById('filterDateFrom').value;
    const filterDateTo = document.getElementById('filterDateTo').value;
    
    // Filter expenses
    let filteredExpenses = expenses.filter(expense => {
        const matchesCategory = !filterCategory || expense.category === filterCategory;
        const expenseDate = new Date(expense.date);
        const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
        const toDate = filterDateTo ? new Date(filterDateTo) : null;
        
        const matchesFrom = !fromDate || expenseDate >= fromDate;
        const matchesTo = !toDate || expenseDate <= toDate;
        
        return matchesCategory && matchesFrom && matchesTo;
    });
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No expenses found matching your filters.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredExpenses.map(expense => {
        const date = new Date(expense.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <tr>
                <td>${date}</td>
                <td><span class="category-badge category-${expense.category}">${expense.category}</span></td>
                <td>${expense.description}</td>
                <td class="amount">$${expense.amount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-edit" onclick="editExpense('${expense.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Clear filters
function clearFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    renderExpenses();
}

// Update analytics
function updateAnalytics() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const weekTotal = getWeekExpenses();
    const monthTotal = getMonthExpenses();
    
    document.getElementById('totalExpenses').textContent = `$${total.toFixed(2)}`;
    document.getElementById('weekExpenses').textContent = `$${weekTotal.toFixed(2)}`;
    document.getElementById('monthExpenses').textContent = `$${monthTotal.toFixed(2)}`;
}

// Get week expenses
function getWeekExpenses() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    return expenses
        .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= weekStart && expDate <= now;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
}

// Get month expenses
function getMonthExpenses() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses
        .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= monthStart && expDate <= now;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
}

// Get category totals
function getCategoryTotals() {
    const totals = {};
    expenses.forEach(exp => {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
}

// Get weekly spending data
function getWeeklySpending() {
    const now = new Date();
    const weeks = [];
    const weekLabels = [];
    
    // Get last 4 weeks
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekTotal = expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= weekStart && expDate <= weekEnd;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        weeks.push(weekTotal);
        const weekNum = Math.ceil((now - weekStart) / (1000 * 60 * 60 * 24 * 7));
        weekLabels.push(`Week ${weekNum}`);
    }
    
    return { labels: weekLabels, data: weeks };
}

// Get monthly spending data
function getMonthlySpending() {
    const now = new Date();
    const months = [];
    const monthLabels = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const monthTotal = expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= monthStart && expDate <= monthEnd;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        months.push(monthTotal);
        monthLabels.push(monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    
    return { labels: monthLabels, data: months };
}

// Render charts
function renderCharts() {
    renderCategoryChart();
    renderWeeklyChart();
    renderMonthlyChart();
}

// Render category pie chart
function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    const categoryTotals = getCategoryTotals();
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(cat => categoryColors[cat] || categoryColors.other);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    if (labels.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Render weekly bar chart
function renderWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    const weeklyData = getWeeklySpending();
    
    if (weeklyChart) {
        weeklyChart.destroy();
    }
    
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Spending ($)',
                data: weeklyData.data,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Render monthly bar chart
function renderMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    const monthlyData = getMonthlySpending();
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Spending ($)',
                data: monthlyData.data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

