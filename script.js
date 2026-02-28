let records = [];
let assets = { cash: 0, stock: 0 };
let holdings = [];

const RECORDS_KEY = 'familyFundRecords';
const ASSETS_KEY = 'familyFundAssets';
const HOLDINGS_KEY = 'familyFundHoldings';

function init() {
    loadData();
    renderAll();
    setupEvents();
}

function loadData() {
    const r = localStorage.getItem(RECORDS_KEY);
    if (r) records = JSON.parse(r);
    
    const a = localStorage.getItem(ASSETS_KEY);
    if (a) assets = JSON.parse(a);
    
    const h = localStorage.getItem(HOLDINGS_KEY);
    if (h) holdings = JSON.parse(h);
}

function saveData() {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    localStorage.setItem(HOLDINGS_KEY, JSON.stringify(holdings));
}

function renderAll() {
    renderRecords();
    renderHoldings();
    updateAssets();
    updatePieChart();
    setToday();
}

function setToday() {
    const d = new Date().toISOString().split('T')[0];
    const el = document.getElementById('recordDate');
    if (el) el.value = d;
}

function setupEvents() {
    const rf = document.getElementById('recordForm');
    if (rf) rf.addEventListener('submit', addRecord);
    
    const af = document.getElementById('assetForm');
    if (af) af.addEventListener('submit', addAsset);
    
    const hf = document.getElementById('holdingForm');
    if (hf) hf.addEventListener('submit', addHolding);
    
    document.querySelectorAll('.type-btn').forEach(function(b) {
        b.addEventListener('click', function() {
            document.querySelectorAll('.type-btn').forEach(function(x) { x.classList.remove('active'); });
            this.classList.add('active');
            document.getElementById('recordType').value = this.dataset.type;
        });
    });
    
    document.querySelectorAll('.asset-type-btn').forEach(function(b) {
        b.addEventListener('click', function() {
            document.querySelectorAll('.asset-type-btn').forEach(function(x) { x.classList.remove('active'); });
            this.classList.add('active');
            document.getElementById('assetType').value = this.dataset.assetType;
        });
    });
}

function showAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('active');
    setToday();
}

function closeAddRecordModal() {
    document.getElementById('addRecordModal').classList.remove('active');
    const f = document.getElementById('recordForm');
    if (f) f.reset();
    setToday();
}

function showAddAssetModal() {
    document.getElementById('addAssetModal').classList.add('active');
}

function closeAddAssetModal() {
    document.getElementById('addAssetModal').classList.remove('active');
    const f = document.getElementById('assetForm');
    if (f) f.reset();
}

function showHoldingsModal() {
    document.getElementById('holdingsModal').classList.add('active');
    const el = document.getElementById('modalCashAmount');
    if (el) el.textContent = '¥' + assets.cash.toFixed(2);
}

function closeHoldingsModal() {
    document.getElementById('holdingsModal').classList.remove('active');
}

function showAddHoldingModal() {
    document.getElementById('addHoldingModal').classList.add('active');
}

function closeAddHoldingModal() {
    document.getElementById('addHoldingModal').classList.remove('active');
    const f = document.getElementById('holdingForm');
    if (f) f.reset();
}

function addRecord(e) {
    e.preventDefault();
    const rec = {
        id: Date.now(),
        type: document.getElementById('recordType').value,
        amount: parseFloat(document.getElementById('recordAmount').value),
        description: document.getElementById('recordDescription').value || '无说明',
        date: document.getElementById('recordDate').value
    };
    records.push(rec);
    saveData();
    renderRecords();
    closeAddRecordModal();
}

function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        records = records.filter(function(r) { return r.id !== id; });
        saveData();
        renderRecords();
    }
}

function addAsset(e) {
    e.preventDefault();
    const type = document.getElementById('assetType').value;
    const amount = parseFloat(document.getElementById('assetAmount').value);
    assets[type] += amount;
    saveData();
    updateAssets();
    updatePieChart();
    closeAddAssetModal();
}

function updateCashBalance() {
    const input = document.getElementById('cashBalanceInput');
    const amount = parseFloat(input.value);
    if (!isNaN(amount) && amount >= 0) {
        assets.cash = amount;
        saveData();
        updateAssets();
        updatePieChart();
        const el = document.getElementById('modalCashAmount');
        if (el) el.textContent = '¥' + assets.cash.toFixed(2);
        input.value = '';
        alert('现金余额已更新！');
    } else {
        alert('请输入有效的金额');
    }
}

function addHolding(e) {
    e.preventDefault();
    const h = {
        id: Date.now(),
        name: document.getElementById('holdingName').value,
        value: parseFloat(document.getElementById('holdingValue').value),
        shares: parseFloat(document.getElementById('holdingShares').value),
        price: parseFloat(document.getElementById('holdingPrice').value)
    };
    holdings.push(h);
    updateStockFromHoldings();
    saveData();
    renderHoldings();
    closeAddHoldingModal();
}

function deleteHolding(id) {
    if (confirm('确定要删除这个持仓吗？')) {
        holdings = holdings.filter(function(h) { return h.id !== id; });
        updateStockFromHoldings();
        saveData();
        renderHoldings();
    }
}

function updateStockFromHoldings() {
    assets.stock = holdings.reduce(function(t, h) { return t + h.value; }, 0);
    saveData();
    updateAssets();
    updatePieChart();
}

function updateAssets() {
    const total = assets.cash + assets.stock;
    const tEl = document.getElementById('totalAssets');
    const cEl = document.getElementById('cashAmount');
    const sEl = document.getElementById('stockAmount');
    if (tEl) tEl.textContent = '¥' + total.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    if (cEl) cEl.textContent = '¥' + assets.cash.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    if (sEl) sEl.textContent = '¥' + assets.stock.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function updatePieChart() {
    const pc = document.getElementById('pieChart');
    if (!pc) return;
    const total = assets.cash + assets.stock;
    if (total === 0) {
        pc.style.background = 'conic-gradient(#e0e0e0 0deg 360deg)';
        return;
    }
    const cashDeg = (assets.cash / total) * 360;
    pc.style.background = 'conic-gradient(#6699cc 0deg ' + cashDeg + 'deg, #4caf50 ' + cashDeg + 'deg 360deg)';
}

function renderRecords() {
    const list = document.getElementById('recordsList');
    if (!list) return;
    list.innerHTML = '';
    const sorted = records.slice().sort(function(a,b) { return new Date(b.date) - new Date(a.date); });
    sorted.forEach(function(r) {
        const item = document.createElement('div');
        item.className = 'record-item';
        const typeText = r.type === 'income' ? '收入' : '支出';
        const prefix = r.type === 'income' ? '+' : '-';
        item.innerHTML = '<div class="record-info"><span class="record-type-tag ' + r.type + '">' + typeText + '</span><div class="record-description">' + r.description + '</div><div class="record-date">' + r.date + '</div></div><div class="record-amount ' + r.type + '">' + prefix + '¥' + r.amount.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2}) + '</div><button class="record-delete-btn" onclick="deleteRecord(' + r.id + ')">×</button>';
        list.appendChild(item);
    });
}

function renderHoldings() {
    const list = document.getElementById('holdingsList');
    if (!list) return;
    list.innerHTML = '';
    holdings.forEach(function(h) {
        const item = document.createElement('div');
        item.className = 'holding-item';
        item.innerHTML = '<div class="holding-header"><div class="holding-name">' + h.name + '</div><div class="holding-actions"><button class="check-price-btn">查价</button><button class="delete-holding-btn" onclick="deleteHolding(' + h.id + ')">×</button></div></div><div class="holding-value">¥' + h.value.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2}) + '</div><div class="holding-details">份额: ' + h.shares.toLocaleString('zh-CN') + '<br>单价: ¥' + h.price.toFixed(4) + '</div>';
        list.appendChild(item);
    });
}

function exportToExcel() {
    if (records.length === 0) {
        alert('没有记录可导出');
        return;
    }
    let csv = '日期,类型,说明,金额\n';
    const sorted = records.slice().sort(function(a,b) { return new Date(b.date) - new Date(a.date); });
    sorted.forEach(function(r) {
        const typeText = r.type === 'income' ? '收入' : '支出';
        csv += r.date + ',' + typeText + ',' + r.description + ',' + r.amount + '\n';
    });
    const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = '家族基金收支明细.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function goBack() {
    history.back();
}

function extractAmountFromText(text) {
    const patterns = [
        /[¥￥$]\s*([\d,]+\.?\d*)/,
        /([\d,]+\.?\d*)\s*[¥￥$]/,
        /金额[:：]\s*([\d,]+\.?\d*)/,
        /([\d,]+\.?\d*)\s*元/,
        /([\d,]+\.?\d*)/
    ];
    
    for (let pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let numStr;
            if (match[1]) {
                numStr = match[1];
            } else {
                numStr = match[0];
            }
            numStr = numStr.replace(/[¥￥$元,，:：]/g, '').trim();
            const num = parseFloat(numStr);
            if (!isNaN(num) && num > 0) {
                return num;
            }
        }
    }
    return null;
}

async function recognizeRecordImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        alert('正在识别图片，请稍候...\n(首次使用需要下载语言包)');
        
        const result = await Tesseract.recognize(file, 'chi_sim+eng', {
            logger: m => console.log(m)
        });
        
        const text = result.data.text;
        console.log('识别结果:', text);
        
        const amount = extractAmountFromText(text);
        if (amount) {
            document.getElementById('recordAmount').value = amount;
            document.getElementById('recordDescription').value = '图片识别';
            alert('识别成功！金额: ¥' + amount);
        } else {
            alert('未能识别到金额，请手动输入');
        }
    } catch (error) {
        console.error('识别错误:', error);
        alert('识别失败，请检查网络连接或手动输入');
    }
    
    event.target.value = '';
}

async function recognizeCashImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        alert('正在识别现金余额，请稍候...\n(首次使用需要下载语言包)');
        
        const result = await Tesseract.recognize(file, 'chi_sim+eng', {
            logger: m => console.log(m)
        });
        
        const text = result.data.text;
        console.log('识别结果:', text);
        
        const amount = extractAmountFromText(text);
        if (amount) {
            document.getElementById('cashBalanceInput').value = amount;
            alert('识别成功！现金余额: ¥' + amount);
        } else {
            alert('未能识别到金额，请手动输入');
        }
    } catch (error) {
        console.error('识别错误:', error);
        alert('识别失败，请检查网络连接或手动输入');
    }
    
    event.target.value = '';
}

async function recognizeHoldingImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        alert('正在识别股票截图，请稍候...\n(首次使用需要下载语言包)');
        
        const result = await Tesseract.recognize(file, 'chi_sim+eng', {
            logger: m => console.log(m)
        });
        
        const text = result.data.text;
        console.log('识别结果:', text);
        
        const amount = extractAmountFromText(text);
        
        showAddHoldingModal();
        
        if (amount) {
            document.getElementById('holdingValue').value = amount;
            alert('识别成功！市值: ¥' + amount + '\n请补充其他信息');
        } else {
            alert('未能完全识别，请手动填写完整信息');
        }
    } catch (error) {
        console.error('识别错误:', error);
        alert('识别失败，请检查网络连接或手动输入');
        showAddHoldingModal();
    }
    
    event.target.value = '';
}

document.addEventListener('DOMContentLoaded', init);
