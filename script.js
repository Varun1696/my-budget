const list = document.getElementById('list');
const form = document.getElementById('form');
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyBudget = localStorage.getItem('monthlyBudget') || 0;

function updateDOM() {
    list.innerHTML = '';
    let income = 0, expense = 0;

    transactions.forEach(t => {
        const item = document.createElement('li');
        item.innerHTML = `${t.description} <span>${t.amount < 0 ? '-' : '+'}$${Math.abs(t.amount)}</span>`;
        list.appendChild(item);
        if (t.amount > 0) income += t.amount; else expense += Math.abs(t.amount);
    });

    const total = income - expense;
    document.getElementById('total-balance').innerText = `$${total.toFixed(2)}`;
    document.getElementById('total-income').innerText = `$${income.toFixed(2)}`;
    document.getElementById('total-expense').innerText = `$${expense.toFixed(2)}`;
    
    updateProgress(expense);
}

function updateProgress(spent) {
    if (monthlyBudget <= 0) return;
    const perc = Math.min((spent / monthlyBudget) * 100, 100);
    document.getElementById('budget-progress-bar').style.width = perc + '%';
    document.getElementById('budget-status').innerText = `${perc.toFixed(0)}% of budget spent`;
}

// --- DATA SYNC FUNCTIONS ---

function exportData() {
    const dataStr = JSON.stringify({ transactions, monthlyBudget });
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'my_budget_backup.json');
    linkElement.click();
}

function importData(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const importedData = JSON.parse(e.target.result);
        transactions = importedData.transactions;
        monthlyBudget = importedData.monthlyBudget;
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('monthlyBudget', monthlyBudget);
        updateDOM();
        alert('Data Imported Successfully!');
    };
    reader.readAsText(event.target.files[0]);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = { 
        id: Date.now(), 
        description: document.getElementById('description').value, 
        amount: +document.getElementById('amount.value'),
        date: document.getElementById('date').value 
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDOM();
    form.reset();
});

window.onload = updateDOM;
