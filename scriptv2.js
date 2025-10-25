class BudgetTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('budgetTransactions')) || [];
        this.pieChart = null;
        this.barChart = null;
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
        this.initializeCharts();
    }

    initializeElements() {
        this.transactionForm = document.getElementById('transaction-form');
        this.descriptionInput = document.getElementById('description');
        this.amountInput = document.getElementById('amount');
        this.typeInput = document.getElementById('type');
        this.categoryInput = document.getElementById('category');
        this.transactionsList = document.getElementById('transactions-list');
        this.totalIncomeElement = document.getElementById('total-income');
        this.totalExpensesElement = document.getElementById('total-expenses');
        this.balanceElement = document.getElementById('balance');
    }

    attachEventListeners() {
        this.transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });
    }

    addTransaction() {
        const description = this.descriptionInput.value.trim();
        const amount = parseFloat(this.amountInput.value);
        const type = this.typeInput.value;
        const category = this.categoryInput.value;

        if (!description || isNaN(amount) || amount <= 0 || !type || !category) {
            alert('Please fill in all fields correctly.');
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            description,
            amount,
            type,
            category,
            date: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateUI();
        this.updateCharts();
        this.transactionForm.reset();
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToLocalStorage();
        this.updateUI();
        this.updateCharts();
    }

    calculateTotals() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        return { income, expenses, balance };
    }

    getExpenseByCategory() {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        const categories = {};
        
        expenses.forEach(expense => {
            categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
        });

        return categories;
    }

    getMonthlyData() {
        const monthlyData = {};
        
        this.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    label: monthName,
                    income: 0,
                    expenses: 0
                };
            }
            
            if (transaction.type === 'income') {
                monthlyData[monthYear].income += transaction.amount;
            } else {
                monthlyData[monthYear].expenses += transaction.amount;
            }
        });

        // Sort by date
        return Object.keys(monthlyData)
            .sort()
            .map(key => monthlyData[key]);
    }

    initializeCharts() {
        const pieCtx = document.getElementById('pie-chart').getContext('2d');
        const barCtx = document.getElementById('bar-chart').getContext('2d');

        this.pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        data: [],
                        backgroundColor: '#27ae60',
                        borderColor: '#219a52',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: [],
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Update Pie Chart (Expenses by Category)
        const expenseData = this.getExpenseByCategory();
        const pieLabels = Object.keys(expenseData);
        const pieData = Object.values(expenseData);

        this.pieChart.data.labels = pieLabels;
        this.pieChart.data.datasets[0].data = pieData;
        this.pieChart.update();

        // Update Bar Chart (Monthly Overview)
        const monthlyData = this.getMonthlyData();
        const barLabels = monthlyData.map(data => data.label);
        const incomeData = monthlyData.map(data => data.income);
        const expenseDataBar = monthlyData.map(data => data.expenses);

        this.barChart.data.labels = barLabels;
        this.barChart.data.datasets[0].data = incomeData;
        this.barChart.data.datasets[1].data = expenseDataBar;
        this.barChart.update();
    }

    updateUI() {
        const { income, expenses, balance } = this.calculateTotals();

        // Update summary cards
        this.totalIncomeElement.textContent = this.formatCurrency(income);
        this.totalExpensesElement.textContent = this.formatCurrency(expenses);
        this.balanceElement.textContent = this.formatCurrency(balance);

        // Update balance color based on value
        this.balanceElement.style.color = balance >= 0 ? '#27ae60' : '#e74c3c';

        // Update transactions list
        this.renderTransactions();
    }

    renderTransactions() {
        if (this.transactions.length === 0) {
            this.transactionsList.innerHTML = `
                <div class="empty-state">
                    No transactions yet. Add your first transaction above!
                </div>
            `;
            return;
        }

        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        this.transactionsList.innerHTML = sortedTransactions
            .map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                return `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${transaction.category} • ${formattedDate}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <button class="delete-btn" onclick="budgetTracker.deleteTransaction('${transaction.id}')">
                        Delete
                    </button>
                </div>
            `}).join('');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    saveToLocalStorage() {
        localStorage.setItem('budgetTransactions', JSON.stringify(this.transactions));
    }
}

// Initialize the budget tracker when the page loads
const budgetTracker = new BudgetTracker();
