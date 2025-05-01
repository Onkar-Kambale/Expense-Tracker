document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expense-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const categoryInput = document.getElementById('category');
    const dateInput = document.getElementById('date');
    const expenseList = document.getElementById('expense-list');
    const emptyState = document.getElementById('empty-state');
    const totalExpensesElement = document.getElementById('total-expenses');
    const expenseCountElement = document.getElementById('expense-count');
    const averageExpenseElement = document.getElementById('average-expense');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const chartContainer = document.getElementById('chart-container');
    
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    dateInput.value = formattedDate;
    
    let expenses = loadExpenses();
    let currentFilter = 'all';
    let chart = null;
    
    renderExpenses();
    updateSummary();
    renderChart();
    
    expenseForm.addEventListener('submit', handleAddExpense);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.dataset.category;
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            renderExpenses();
        });
    });
    
    function handleAddExpense(e) {
        e.preventDefault();
        
        const description = descriptionInput.value;
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;
        
        const newExpense = {
            id: generateId(),
            description,
            amount,
            category,
            date,
            timestamp: new Date().getTime()
        };
        
        expenses.push(newExpense);
        saveExpenses();
        
        expenseForm.reset();
        dateInput.value = formattedDate;
        
        renderExpenses();
        updateSummary();
        renderChart();
    }
    
    function handleDeleteExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        
        renderExpenses();
        updateSummary();
        renderChart(); 
    }
    
    function renderExpenses() {
        const filteredExpenses = currentFilter === 'all' ? 
            expenses : 
            expenses.filter(expense => expense.category === currentFilter);
        
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredExpenses.length === 0) {
            emptyState.style.display = 'block';
            expenseList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            expenseList.style.display = 'block';
        }
        
        expenseList.innerHTML = '';
        
        filteredExpenses.forEach(expense => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            
            const formattedDate = formatDate(expense.date);
            const formattedAmount = formatCurrency(expense.amount);
            
            li.innerHTML = `
                <div class="expense-details">
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-meta">
                        <span class="expense-category">${expense.category}</span>
                        <span class="expense-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="expense-amount">${formattedAmount}</div>
                <div class="expense-actions">
                    <button class="btn-delete" data-id="${expense.id}">Delete</button>
                </div>
            `;
            
            const deleteButton = li.querySelector('.btn-delete');
            deleteButton.addEventListener('click', function() {
                handleDeleteExpense(this.dataset.id);
            });
            
            expenseList.appendChild(li);
        });
    }
    
    function updateSummary() {
        const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
        const count = expenses.length;
        const average = count > 0 ? totalAmount / count : 0;
        
        totalExpensesElement.textContent = formatCurrency(totalAmount);
        expenseCountElement.textContent = count;
        averageExpenseElement.textContent = formatCurrency(average);
    }
    
    function renderChart() {
        if (chart) {
            chart.destroy();
        }
        
        const categories = {};
        
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += expense.amount;
        });
        
        const categoryLabels = Object.keys(categories);
        const categoryValues = Object.values(categories);
        
        const backgroundColors = categoryLabels.map(() => 
            `rgba(${Math.floor(Math.random() * 255)}, 
                  ${Math.floor(Math.random() * 255)}, 
                  ${Math.floor(Math.random() * 255)}, 0.7)`);
        
        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);
        
        if (categoryLabels.length === 0) {
            const noDataMessage = document.createElement('div');
            noDataMessage.className = 'empty-state';
            noDataMessage.innerHTML = '<p>Add expenses to see chart</p>';
            chartContainer.appendChild(noDataMessage);
            return;
        }
        
        chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: categoryValues,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Expenses by Category',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    
    function formatCurrency(amount) {
        return '₹' + amount.toFixed(2);
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
    
    function loadExpenses() {
        const saved = localStorage.getItem('expenses');
        return saved ? JSON.parse(saved) : [];
    }
});