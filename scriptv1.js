class BudgetTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('budgetTransactions')) || [];
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
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
            date: new Date().toLocaleDateString()
        };

        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateUI();
        this.transactionForm.reset();
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToLocalStorage();
        this.updateUI();
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

        this.transactionsList.innerHTML = this.transactions
            .map(transaction => `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${transaction.category} • ${transaction.date}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <button class="delete-btn" onclick="budgetTracker.deleteTransaction('${transaction.id}')">
                        Delete
                    </button>
                </div>
            `).join('');
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
