const list = document.getElementById('transaction-list');
const form = document.getElementById('form');
const canvas = document.getElementById('spendingChart');
const ctx = canvas.getContext('2d');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const categoryColors = {
    'Food': '#fbbf24', 'Rent': '#818cf8', 'Shopping': '#f472b6', 
    'Transport': '#2dd4bf', 'Other': '#94a3b8', 'Salary': '#4ade80'
};

function updateUI() {
    list.innerHTML = '';
    let income = 0, expense = 0;
    const categoryTotals = {};

    transactions.forEach(t => {
        // Totals
        if (t.amount > 0) income += t.amount; 
        else {
            expense += Math.abs(t.amount);
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
        }

        // List Item
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${t.description} <small>(${t.category})</small></span>
            <span style="color: ${t.amount > 0 ? 'var(--income)' : 'var(--expense)'}">
                ${t.amount > 0 ? '+' : '-'}$${Math.abs(t.amount)}
            </span>
        `;
        list.appendChild(li);
    });

    document.getElementById('total-balance').innerText = `$${(income - expense).toFixed(2)}`;
    document.getElementById('total-income').innerText = `+$${income.toFixed(2)}`;
    document.getElementById('total-expense').innerText = `-$${expense.toFixed(2)}`;

    updateBudget(expense);
    drawPieChart(categoryTotals);
}

function updateBudget(spent) {
    const limit = parseFloat(document.getElementById('budget-limit').value) || 0;
    if (limit > 0) {
        const perc = Math.min((spent / limit) * 100, 100);
        document.getElementById('progress-bar').style.width = perc + '%';
        document.getElementById('progress-bar').style.backgroundColor = perc > 85 ? '#fb7185' : '#4ade80';
        document.getElementById('budget-text').innerText = `${perc.toFixed(0)}% of monthly budget used`;
    }
}

// Custom Native Canvas Pie Chart
function drawPieChart(data) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let startAngle = 0;
    
    // Resize canvas for sharp resolution
    canvas.width = 400; canvas.height = 400;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const legend = document.getElementById('chartLegend');
    legend.innerHTML = '';

    if (total === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.fill();
        return;
    }

    for (const [cat, val] of Object.entries(data)) {
        const sliceAngle = (2 * Math.PI * val) / total;
        
        ctx.fillStyle = categoryColors[cat] || '#fff';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        // Add to legend
        legend.innerHTML += `
            <div class="legend-item">
                <div class="dot" style="background:${categoryColors[cat]}"></div>
                ${cat} ($${val})
            </div>
        `;
        
        startAngle += sliceAngle;
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTx = {
        id: Date.now(),
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    transactions.push(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
    form.reset();
});

window.onload = updateUI;
