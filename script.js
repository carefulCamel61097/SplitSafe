/* --- Service Worker Registration --- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.error('SW Registration failed!', err));
    });
}

/* --- Data & Translations --- */
const translations = {
    en: {
        label: "Eng",
        flag: "🇬🇧",
        expenses_list: "Expenses",
        add_expense: "Add Expense",
        name: "Name",
        amount: "Amount",
        desc: "Description (Optional)",
        total: "Total",
        participants: "Participants",
        recorded_expenses: "Recorded Expenses",
        paid: " paid ",
        clear_all: "Clear All",
        finish: "Finish & Settle",
        delete: "Delete",
        transactions: "Transactions",
        equal_split: "Equal Split",
        back: "Back to Expenses",
        share: "Share",
        noTrans: "No transactions needed!",
        pays: " pays ",
        settleTitle: "Settlement Plan",
    },
    th: {
        label: "ไทย",
        flag: "🇹🇭",
        expenses_list: "ค่าใช้จ่าย",
        add_expense: "เพิ่มรายการ",
        name: "ชื่อ",
        amount: "จำนวนเงิน",
        desc: "คำอธิบาย (ไม่บังคับ)",
        total: "ยอดรวม",
        participants: "ผู้ร่วมจ่าย",
        recorded_expenses: "ค่าใช้จ่ายที่บันทึกไว้",
        paid: " จ่ายแล้ว ",
        clear_all: "ลบทั้งหมด",
        finish: "คำนวณการจ่ายเงิน",
        delete: "ลบ",
        transactions: "ธุรกรรม",
        equal_split: "จ่ายคนละ",
        back: "ย้อนกลับ",
        share: "แชร์ให้เพื่อน",
        noTrans: "ไม่มีหนี้ค้างชำระ!",
        pays: " จ่ายให้ ",
        settleTitle: "แผนการชำระหนี้",
    },
    zh: {
        label: "中文",
        flag: "🇨🇳",
        expenses_list: "费用",
        add_expense: "添加费用",
        name: "名称",
        amount: "金额",
        desc: "描述（可选）",
        total: "总计",
        participants: "参与者",
        recorded_expenses: "已记录的费用",
        paid: " 已支付 ",
        clear_all: "全部清除",
        finish: "完成并结算",
        delete: "删除",
        transactions: "交易",
        equal_split: "均摊",
        back: "返回费用",
        share: "共享",
        noTrans: "无需交易！",
        pays: " 支付 ",
        settleTitle: "结算方案",
    }
};

const currencies = {
    USD: { symbol: "$", label: "USD" },
    THB: { symbol: "฿", label: "THB" },
    CNY: { symbol: "¥", label: "CNY" },
};

/* --- State Management --- */
let currentLang = localStorage.getItem('ss_lang') || 'en';
let currentCurr = localStorage.getItem('ss_curr') || 'USD';
let expenses = JSON.parse(localStorage.getItem('splitSafeExpenses')) || [];

/* --- Storage & Initialization Helpers --- */
function saveData() {
    localStorage.setItem('splitSafeExpenses', JSON.stringify(expenses));
}

function syncDropdowns() {
    document.getElementById('langSelect').value = currentLang;
    document.getElementById('currSelect').value = currentCurr;
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        addExpense();
    }
}

/* --- Settings & Localization --- */
function changeLang() {
    currentLang = document.getElementById('langSelect').value;
    localStorage.setItem('ss_lang', currentLang);
    applyTranslations();
    updateUI();
    if (document.getElementById('view-settle').style.display === 'block') {
        calculateSettlement();
    }
}

function changeCurr() {
    currentCurr = document.getElementById('currSelect').value;
    localStorage.setItem('ss_curr', currentCurr);
    updateUI();
    if (document.getElementById('view-settle').style.display === 'block') {
        calculateSettlement();
    }
}

function applyTranslations() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });

    document.getElementById('nameInput').placeholder = t.name;
    document.getElementById('amountInput').placeholder = "0.00";
    document.getElementById('descInput').placeholder = t.desc;
}

/* --- Core App Functions --- */
function addExpense() {
    const nameInput = document.getElementById('nameInput');
    const amountInput = document.getElementById('amountInput');
    const descInput = document.getElementById('descInput');

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const desc = descInput.value;

    if (!name || isNaN(amount)) return;

    expenses.push({ name, amount, desc });
    saveData();

    if (document.activeElement) {
        document.activeElement.blur();
    }

    updateUI();

    nameInput.value = '';
    amountInput.value = '';
    descInput.value = '';
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    saveData();
    updateUI();
}

function clearAll() {
    expenses = [];
    saveData();
    updateUI();
}

function updateUI() {
    const list = document.getElementById('list');
    const t = translations[currentLang];
    const c = currencies[currentCurr];

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
                <strong>${exp.name}</strong> ${t.paid} ${c.symbol}${exp.amount.toFixed(2)}
                <br><small style="color:gray">${exp.desc || ''}</small>
            </div>
            <div class="delete-icon" onclick="deleteExpense(${index})">×</div>
        `;
        list.appendChild(li);
    });

    const currSymElements = document.querySelectorAll('#currSym');
    currSymElements.forEach(el => el.innerText = c.symbol);

    document.getElementById('totalDisplay').innerText = total.toFixed(2);
    document.getElementById('participantCount').innerText = participants.size;

    document.getElementById('langSelect').value = currentLang;
    document.getElementById('currSelect').value = currentCurr;
}

/* --- Navigation & Settlement Logic --- */
function showSettlePage() {
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
    const t = translations[currentLang];
    const c = currencies[currentCurr];
    settleList.innerHTML = '';

    if (expenses.length === 0) {
        document.getElementById('equalSplitDisplay').innerText = `${c.symbol}0.00`;
        settleList.innerHTML = `<p style="text-align:center; color:gray; padding:20px;">${t.noTrans}</p>`;
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
    document.getElementById('equalSplitDisplay').innerText = ` ${c.symbol}${share.toFixed(2)}`;

    let debtors = [];
    let creditors = [];
    participantNames.forEach(name => {
        let net = balances[name] - share;
        if (net < -0.01) debtors.push({ name, net: Math.abs(net) });
        else if (net > 0.01) creditors.push({ name, net });
    });

    if (debtors.length === 0) {
        settleList.innerHTML = `<p style="text-align:center; color:gray; padding:20px;">${t.noTrans}</p>`;
        return;
    }

    while (debtors.length > 0 && creditors.length > 0) {
        let debtor = debtors[0];
        let creditor = creditors[0];
        let amount = Math.min(debtor.net, creditor.net);

        const p = document.createElement('div');
        p.className = "expense-item";
        p.innerHTML = `<span><strong>${debtor.name}</strong> ${t.pays} <strong>${creditor.name}</strong></span> <strong>${c.symbol}${amount.toFixed(2)}</strong>`;
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

/* --- Application Boot --- */
window.addEventListener('load', () => {
    syncDropdowns();
    applyTranslations();
    updateUI();
});