class BudgetTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('budgetTransactions')) || [];
        this.pieChart = null;
        this.barChart = null;
        this.chartType = 'pie'; // 'pie' or 'doughnut'
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

    // ... (previous methods remain the same until getExpenseByCategory)

    getExpenseByCategory() {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        const categories = {};
        
        expenses.forEach(expense => {
            categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
        });

        return categories;
    }

    getCategoryColor(category) {
        const colorMap = {
            // Income categories
            'salary': '#27ae60',
            'freelance': '#2ecc71',
            'bonus': '#55efc4',
            'investment': '#00b894',
            'rental': '#81ecec',
            'gift': '#74b9ff',
            'refund': '#a29bfe',
            'side-business': '#fd79a8',
            
            // Essential expenses
            'rent': '#e74c3c',
            'utilities': '#e67e22',
            'internet': '#f39c12',
            'groceries': '#d35400',
            'transportation': '#c0392b',
            'insurance': '#e84118',
            'medical': '#ff7979',
            'debt': '#eb4d4b',
            
            // Lifestyle & Entertainment
            'dining': '#c0392b',
            'entertainment': '#16a085',
            'shopping': '#2980b9',
            'subscriptions': '#3498db',
            'hobbies': '#8e44ad',
            'fitness': '#0097e6',
            
            // Holidays & Travel
            'flights': '#9b59b6',
            'accommodation': '#8e44ad',
            'meals-travel': '#6c5ce7',
            'activities': '#a29bfe',
            'souvenirs': '#fd79a8',
            'travel-insurance': '#e84393',
            'vacation-fund': '#ff7675',
            
            // Family & Education
            'childcare': '#fd79a8',
            'pets': '#e84393',
            'gifts-donations': '#ff9ff3',
            'family-activities': '#f368e0',
            'education': '#a29bfe',
            'books': '#786fa6',
            
            // Savings & Investments
            'emergency-fund': '#00d2d3',
            'retirement': '#54a0ff',
            'investments': '#5f27cd',
            'savings-goal': '#341f97',
            
            // Vehicle & Home
            'car-maintenance': '#ff9f43',
            'home-maintenance': '#ff6b6b',
            'furniture': '#ee5a24',
            'renovation': '#feca57',
            'parking': '#ff9ff3',
            
            // Other
            'other': '#95afc0',
            'fees': '#c8d6e5',
            'work-expenses': '#8395a7'
        };

        return colorMap[category] || '#95a5a6';
    }

    getCategoryDisplayName(category) {
        const nameMap = {
            'salary': 'Salary/Wages',
            'freelance': 'Freelance Work',
            'bonus': 'Bonus & Commissions',
            'investment': 'Investment Income',
            'rental': 'Rental Income',
            'gift': 'Gifts & Inheritance',
            'refund': 'Refunds & Rebates',
            'side-business': 'Side Business',
            'rent': 'Rent/Mortgage',
            'utilities': 'Utilities',
            'internet': 'Internet & Phone',
            'groceries': 'Groceries',
            'transportation': 'Transportation',
            'insurance': 'Insurance',
            'medical': 'Medical & Healthcare',
            'debt': 'Debt Payments',
            'dining': 'Dining Out',
            'entertainment': 'Entertainment',
            'shopping': 'Shopping',
            'subscriptions': 'Subscriptions',
            'hobbies': 'Hobbies & Leisure',
            'fitness': 'Fitness & Sports',
            'flights': 'Flights',
            'accommodation': 'Accommodation',
            'meals-travel': 'Meals (Travel)',
            'activities': 'Activities & Tours',
            'souvenirs': 'Souvenirs',
            'travel-insurance': 'Travel Insurance',
            'vacation-fund': 'Vacation Savings',
            'childcare': 'Childcare & Education',
            'pets': 'Pets & Pet Care',
            'gifts-donations': 'Gifts & Donations',
            'family-activities': 'Family Activities',
            'education': 'Education & Courses',
            'books': 'Books & Learning',
            'emergency-fund': 'Emergency Fund',
            'retirement': 'Retirement Savings',
            'investments': 'Investments',
            'savings-goal': 'Savings Goal',
            'car-maintenance': 'Car Maintenance',
            'home-maintenance': 'Home Maintenance',
            'furniture': 'Furniture & Appliances',
            'renovation': 'Home Renovation',
            'parking': 'Parking & Tolls',
            'other': 'Other Expenses',
            'fees': 'Bank Fees',
            'work-expenses': 'Work Expenses'
        };

        return nameMap[category] || category;
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
                    backgroundColor: [],
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
                            usePointStyle: true,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = this.getCategoryDisplayName(context.label);
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
        const backgroundColors = pieLabels.map(label => this.getCategoryColor(label));

        this.pieChart.data.labels = pieLabels;
        this.pieChart.data.datasets[0].data = pieData;
        this.pieChart.data.datasets[0].backgroundColor = backgroundColors;
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

    toggleChartType() {
        this.chartType = this.chartType === 'pie' ? 'doughnut' : 'pie';
        this.pieChart.config.type = this.chartType;
        this.pieChart.update();
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
                
                const displayCategory = this.getCategoryDisplayName(transaction.category);
                
                return `
                <div class="transaction-item ${transaction.type}" data-category="${transaction.category}">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${displayCategory} • ${formattedDate}</div>
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

    // ... (rest of the methods remain the same)

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