if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Registered!', reg))
      .catch(err => console.error('SW Registration failed!', err));
  });
}

// 1. New function to detect Enter key
function handleEnter(event) {
    if (event.key === 'Enter') {
        addExpense();
    }
}

// 1. Initial Load from Memory
// This runs as soon as the script loads
let expenses = JSON.parse(localStorage.getItem('splitSafeExpenses')) || [];

// 2. The Trigger
// We must wait for the page to be ready before we try to draw the list
window.addEventListener('load', () => {
    updateUI();
});

function addExpense() {
    const nameInput = document.getElementById('nameInput');
    const amountInput = document.getElementById('amountInput');
    const descInput = document.getElementById('descInput');

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const desc = descInput.value;

    if (!name || isNaN(amount)) return;

    expenses.push({ name, amount, desc });

    // SAVE POINT 1: Save after adding
    saveData();

    // 2. THIS CLOSES THE KEYBOARD
    // It tells the phone: "Stop focusing on whatever box is active right now"
    if (document.activeElement) {
        document.activeElement.blur();
    }

    updateUI();

    // Reset inputs
    nameInput.value = '';
    amountInput.value = '';
    descInput.value = '';
}

// ... (keep previous variables and addExpense)

function deleteExpense(index) {
    expenses.splice(index, 1);
    // SAVE POINT 2: Save after deleting
    saveData();
    updateUI();
}

function clearAll() {
    expenses = [];
    // SAVE POINT 3: Save after clearing
    saveData();
    updateUI();
}

// THE STORAGE ENGINE
function saveData() {
    localStorage.setItem('splitSafeExpenses', JSON.stringify(expenses));
}

function updateUI() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    let total = 0;
    let participants = new Set();

    expenses.forEach((exp, index) => {
        total += exp.amount;
        participants.add(exp.name.toLowerCase().trim());

        const li = document.createElement('li');
        li.className = "expense-item";
        li.innerHTML = `
            <div class="expense-info">
                <strong>${exp.name}</strong> paid $${exp.amount.toFixed(2)}
                <br><small style="color:gray">${exp.desc || 'No description'}</small>
            </div>
            <div class="delete-icon" onclick="deleteExpense(${index})">×</div>
        `;
        list.appendChild(li);
    });

    document.getElementById('participantCount').innerText = `Participants: ${participants.size}`;
    document.getElementById('totalDisplay').innerText = `Total: $${total.toFixed(2)}`;
}

// NAVIGATION Logic
function showSettlePage() {
    // Removed the alert check so it always transitions
    document.getElementById('view-expenses').style.display = 'none';
    document.getElementById('view-settle').style.display = 'block';
    calculateSettlement();
}

function showExpensePage() {
    document.getElementById('view-settle').style.display = 'none';
    document.getElementById('view-expenses').style.display = 'block';
}

function calculateSettlement() {
    const settleList = document.getElementById('settlementList');
    settleList.innerHTML = '';

    // Handle the empty state first
    if (expenses.length === 0) {
        document.getElementById('equalSplitDisplay').innerText = `$0.00`;
        settleList.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">No transactions needed.</p>';
        return;
    }

    const balances = {};
    let total = 0;

    expenses.forEach(exp => {
        const name = exp.name.trim();
        balances[name] = (balances[name] || 0) + exp.amount;
        total += exp.amount;
    });

    const participantNames = Object.keys(balances);
    const share = total / participantNames.length;
    document.getElementById('equalSplitDisplay').innerText = `$${share.toFixed(2)}`;

    let debtors = [];
    let creditors = [];
    participantNames.forEach(name => {
        let net = balances[name] - share;
        if (net < -0.01) debtors.push({ name, net: Math.abs(net) });
        else if (net > 0.01) creditors.push({ name, net });
    });

    // If everyone is equal or only one person paid everything for themselves
    if (debtors.length === 0) {
        settleList.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">No transactions needed.</p>';
        return;
    }

    // Matching Logic (stays the same)
    while (debtors.length > 0 && creditors.length > 0) {
        let debtor = debtors[0];
        let creditor = creditors[0];
        let amount = Math.min(debtor.net, creditor.net);

        const p = document.createElement('div');
        p.className = "expense-item";
        p.innerHTML = `<span><strong>${debtor.name}</strong> pays <strong>${creditor.name}</strong></span> <strong>$${amount.toFixed(2)}</strong>`;
        settleList.appendChild(p);

        debtor.net -= amount;
        creditor.net -= amount;
        if (debtor.net < 0.01) debtors.shift();
        if (creditor.net < 0.01) creditors.shift();
    }
}

function shareResults() {
    const text = document.getElementById('settlementList').innerText;
    if (navigator.share) {
        navigator.share({ title: 'SplitSafe Settlement', text: text });
    } else {
        alert("Text copied to clipboard!");
        navigator.clipboard.writeText(text);
    }
}