const STORAGE_KEYS = {
  users: 'cantina_users',
  transactions: 'cantina_transactions',
  products: 'cantina_products',
  currentUser: 'cantina_logged_user',
  cart: 'cantina_cart'
};

const REGISTER_DRAFT_KEY = 'cantina_register_draft';

const defaultProducts = [
  { id: 'p1', name: 'Refrigerante', description: 'Bebida gelada', price: 4, category: 'Bebidas', icon: '🥤' },
  { id: 'p2', name: 'Sanduíche', description: 'Sanduíche natural', price: 6, category: 'Lanches', icon: '🥪' },
  { id: 'p3', name: 'Chocolate', description: 'Barra de chocolate', price: 3.5, category: 'Doces', icon: '🍫' },
  { id: 'p4', name: 'Fruta', description: 'Fruta fresca', price: 2.5, category: 'Saudáveis', icon: '🍎' },
  { id: 'p5', name: 'Água', description: 'Água mineral', price: 2, category: 'Bebidas', icon: '💧' },
  { id: 'p6', name: 'Biscoito', description: 'Pacote de biscoito', price: 3, category: 'Doces', icon: '🍪' }
];

const state = {
  currentPage: 'homePage',
  activeCategory: 'Todos',
  cart: [],
  currentUserId: null,
  selectedAmount: null,
  passwordChangeVerified: false,
  passwordVerificationCode: null
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function seedStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const defaultUser = {
      id: 'user-demo',
      name: 'Aluno Demo',
      matricula: '2024001',
      email: 'aluno@cantina.com',
      cpf: '123.456.789-09',
      senha: '123456',
      saldo: 32.5,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([defaultUser]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.transactions)) {
    const initialTransactions = [
      {
        id: createId('txn'),
        userId: 'user-demo',
        type: 'credit',
        amount: 20,
        description: 'Crédito adicionado',
        date: getDateString(),
        time: getTimeString(),
        balanceAfter: 20,
        paymentMethod: 'Pix'
      },
      {
        id: createId('txn'),
        userId: 'user-demo',
        type: 'credit',
        amount: 12.5,
        description: 'Crédito adicionado',
        date: getDateString(),
        time: getTimeString(),
        balanceAfter: 32.5,
        paymentMethod: 'Dinheiro'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(initialTransactions));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getTransactions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
}

function getProducts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function getCurrentUser() {
  const userId = localStorage.getItem(STORAGE_KEYS.currentUser);
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
}

function saveCurrentUser(userId) {
  localStorage.setItem(STORAGE_KEYS.currentUser, String(userId));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function clearRegisterDraft() {
  sessionStorage.removeItem(REGISTER_DRAFT_KEY);
}

function saveRegisterDraft() {
  const fields = ['registerName', 'registerMatricula', 'registerEmail', 'registerCpf', 'registerPassword', 'registerConfirmPassword'];
  const draft = fields.reduce((values, fieldId) => {
    values[fieldId] = document.getElementById(fieldId).value;
    return values;
  }, {});

  sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(draft));
}

function loadRegisterDraft() {
  const savedDraft = sessionStorage.getItem(REGISTER_DRAFT_KEY);
  if (!savedDraft) return;

  const draft = JSON.parse(savedDraft);
  Object.entries(draft).forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId);
    if (field) field.value = value;
  });
}

function clearAuthForms() {
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
}

function saveCart() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  localStorage.setItem(`${STORAGE_KEYS.cart}_${currentUser.id}`, JSON.stringify(state.cart));
}

function loadCart() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    state.cart = [];
    return;
  }

  const savedCart = localStorage.getItem(`${STORAGE_KEYS.cart}_${currentUser.id}`);
  state.cart = savedCart ? JSON.parse(savedCart) : [];
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function formatCurrency(value) {
  return moneyFormatter.format(Number(value || 0));
}

function getDateString(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getTimeString(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function setPage(pageId) {
  state.currentPage = pageId;

  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageId);
  });

  document.querySelectorAll('.nav-button, .mobile-nav-button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === pageId);
  });
}

function loginUser(identifier, password) {
  const users = getUsers();
  const foundUser = users.find(user => {
    const emailMatch = user.email.toLowerCase() === identifier.toLowerCase();
    const matriculaMatch = user.matricula === identifier;
    return (emailMatch || matriculaMatch) && user.senha === password;
  });

  if (!foundUser) {
    showToast('Matrícula/e-mail ou senha inválidos.');
    return;
  }

  saveCurrentUser(foundUser.id);
  loadCart();
  renderApp();
  setPage('homePage');
  showToast('Login realizado com sucesso!');
}

function registerUser(payload) {
  const users = getUsers();
  const alreadyExists = users.some(user => user.matricula === payload.matricula || user.email.toLowerCase() === payload.email.toLowerCase());

  if (alreadyExists) {
    showToast('Já existe uma conta com essa matrícula ou e-mail.');
    return;
  }

  const newUser = {
    id: createId('user'),
    name: payload.name.trim(),
    matricula: payload.matricula.trim(),
    email: payload.email.trim().toLowerCase(),
    cpf: payload.cpf.trim(),
    senha: payload.password,
    saldo: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  clearRegisterDraft();
  saveCurrentUser(newUser.id);
  loadCart();
  renderApp();
  setPage('homePage');
  showToast('Conta criada com sucesso! Bem-vindo à Cantina da Honestidade.');
}

function logout() {
  clearCurrentUser();
  clearRegisterDraft();
  clearAuthForms();
  state.cart = [];
  renderApp();
  setPage('homePage');
}

function getUserTransactions(userId) {
  return getTransactions().filter(transaction => transaction.userId === userId).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
}

function getUserSummary(user) {
  const transactions = getUserTransactions(user.id);
  const purchases = transactions.filter(item => item.type === 'purchase' || item.type === 'drink');
  const totalGasto = purchases.reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);
  const lastPurchase = purchases[0];

  return {
    totalGasto,
    qtdCompras: purchases.length,
    lastPurchase
  };
}

function renderHome() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const summary = getUserSummary(currentUser);

  const name = currentUser.name.split(' ')[0];
  document.getElementById('welcomeTitle').textContent = `Olá, ${name}! 👋`;
  document.getElementById('homeSaldo').textContent = formatCurrency(currentUser.saldo);

  const summaryGrid = document.getElementById('summaryGrid');
  const lastText = summary.lastPurchase ? `${summary.lastPurchase.description} — ${formatCurrency(Math.abs(summary.lastPurchase.amount))}` : 'Nenhuma compra ainda';

  summaryGrid.innerHTML = `
    <div class="summary-card">
      <div class="label">Saldo atual</div>
      <strong>${formatCurrency(currentUser.saldo)}</strong>
    </div>
    <div class="summary-card">
      <div class="label">Total gasto</div>
      <strong>${formatCurrency(summary.totalGasto)}</strong>
    </div>
    <div class="summary-card">
      <div class="label">Número de compras</div>
      <strong>${summary.qtdCompras}</strong>
    </div>
    <div class="summary-card">
      <div class="label">Última compra</div>
      <strong>${lastText}</strong>
    </div>
  `;

  const purchases = getUserTransactions(currentUser.id).filter(transaction => transaction.type === 'purchase' || transaction.type === 'drink');
  const recentList = document.getElementById('recentPurchasesList');

  recentList.innerHTML = purchases.slice(0, 4).map(item => `
    <div class="list-item">
      <div>
        <div class="item-title">${item.description}</div>
        <div class="item-subtitle">${item.date} • ${item.time}</div>
      </div>
      <strong>${formatCurrency(Math.abs(item.amount))}</strong>
    </div>
  `).join('') || '<div class="list-item"><div><div class="item-title">Ainda não há compras</div></div></div>';
}

function renderWallet() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const transactions = getUserTransactions(currentUser.id);
  const totalCredito = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalGasto = transactions
    .filter(item => item.type === 'purchase' || item.type === 'drink')
    .reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);

  document.getElementById('walletSaldo').textContent = formatCurrency(currentUser.saldo);
  document.getElementById('walletCredits').textContent = formatCurrency(totalCredito);
  document.getElementById('walletSpent').textContent = formatCurrency(totalGasto);

  const walletHistoryList = document.getElementById('walletHistoryList');
  walletHistoryList.innerHTML = transactions.slice(0, 10).map(item => `
    <div class="transaction-item">
      <div>
        <div class="item-title">${item.description}</div>
        <div class="item-subtitle">${item.date} • ${item.time} • ${item.paymentMethod || '—'}</div>
      </div>
      <div>
        <div class="item-title ${item.amount >= 0 ? 'positive' : 'negative'}">${(item.amount >= 0 ? '+' : '-') + formatCurrency(Math.abs(item.amount))}</div>
        <div class="item-subtitle">Saldo após: ${formatCurrency(item.balanceAfter)}</div>
      </div>
    </div>
  `).join('') || '<div class="transaction-item"><div><div class="item-title">Nenhuma movimentação</div></div></div>';
}

function renderCreditPage() {
  const buttons = document.querySelectorAll('.amount-button');
  buttons.forEach(button => {
    button.classList.toggle('selected', Number(button.dataset.value) === Number(state.selectedAmount));
  });
}

function addCredit(value, paymentMethod) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const validValue = Number(value);
  if (!validValue || validValue <= 0) {
    showToast('Informe um valor válido para adicionar crédito.');
    return;
  }

  const newBalance = currentUser.saldo + validValue;
  currentUser.saldo = newBalance;

  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    saveUsers(users);
  }

  const transactions = getTransactions();
  transactions.push({
    id: createId('txn'),
    userId: currentUser.id,
    type: 'credit',
    amount: validValue,
    description: 'Crédito adicionado',
    paymentMethod,
    date: getDateString(),
    time: getTimeString(),
    balanceAfter: newBalance
  });

  saveTransactions(transactions);
  showToast('Crédito adicionado com sucesso! 🧡');
  state.selectedAmount = null;
  document.getElementById('customCreditValue').value = '';
  renderApp();
  setPage('homePage');
}

function renderProducts() {
  const search = document.getElementById('productSearch')?.value?.toLowerCase() || '';
  const category = state.activeCategory || 'Todos';
  const products = getProducts();

  const filteredProducts = products.filter(product => {
    const matchesCategory = category === 'Todos' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const categoryFilters = document.getElementById('categoryFilters');
  const categories = ['Todos', 'Bebidas', 'Lanches', 'Doces', 'Saudáveis'];
  categoryFilters.innerHTML = categories.map(item => `
    <button type="button" class="category-chip ${item === category ? 'active' : ''}" data-category="${item}">${item}</button>
  `).join('');

  grid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <div class="product-top" style="background:${product.category === 'Bebidas' ? '#fff4e6' : product.category === 'Lanches' ? '#fff0ee' : product.category === 'Doces' ? '#fff9de' : '#edf7ef'};">${product.icon}</div>
      <div class="product-body">
        <div class="product-header">
          <h3>${product.name}</h3>
          <span class="badge">${product.category}</span>
        </div>
        <p>${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatCurrency(product.price)}</span>
          <button type="button" class="add-to-cart" data-product-id="${product.id}">+</button>
        </div>
      </div>
    </article>
  `).join('') || '<div class="panel">Nenhum produto encontrado.</div>';
}

function addToCart(productId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const product = getProducts().find(item => item.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, icon: product.icon });
  }

  saveCart();
  renderCart();
  renderCartCount();
  showToast(`${product.name} adicionado ao carrinho.`);
}

function updateCartQuantity(productId, change) {
  const item = state.cart.find(entry => entry.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(entry => entry.id !== productId);
  }

  saveCart();
  renderCart();
  renderCartCount();
}

function renderCart() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const list = document.getElementById('cartItemsList');
  const totalValue = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  document.getElementById('cartUserBalance').textContent = formatCurrency(currentUser.saldo);
  document.getElementById('cartTotalValue').textContent = formatCurrency(totalValue);

  if (!state.cart.length) {
    list.innerHTML = `
      <div class="empty-cart">
        <div>🛒</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione algum produto para continuar.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = state.cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-info">
        <strong>${item.icon} ${item.name}</strong>
        <span>${formatCurrency(item.price)} cada</span>
      </div>
      <div class="cart-qty">
        <button type="button" data-action="decrease" data-product-id="${item.id}">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" data-product-id="${item.id}">+</button>
      </div>
    </div>
  `).join('');
}

function openCheckout() {
  if (!state.cart.length) {
    showToast('Seu carrinho está vazio.');
    return;
  }

  const currentUser = getCurrentUser();
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const before = Number(currentUser.saldo);

  document.getElementById('checkoutBefore').textContent = formatCurrency(before);
  document.getElementById('checkoutTotal').textContent = formatCurrency(total);
  document.getElementById('checkoutAfter').textContent = formatCurrency(before - total);

  const checkoutItems = document.getElementById('checkoutItems');
  checkoutItems.innerHTML = state.cart.map(item => `
    <div class="checkout-item">
      <span>${item.name} × ${item.quantity}</span>
      <strong>${formatCurrency(item.price * item.quantity)}</strong>
    </div>
  `).join('');

  setPage('checkoutPage');
}

function confirmPurchase() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  if (!state.cart.length) {
    showToast('Seu carrinho está vazio.');
    return;
  }

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (currentUser.saldo < total) {
    showToast('Ops! Seu saldo não é suficiente para realizar esta compra.');
    setPage('addCreditPage');
    return;
  }

  const before = Number(currentUser.saldo);
  const after = before - total;
  currentUser.saldo = after;

  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    saveUsers(users);
  }

  const transactions = getTransactions();
  const groupedItems = state.cart.map(item => `${item.name} × ${item.quantity}`).join(', ');

  transactions.push({
    id: createId('txn'),
    userId: currentUser.id,
    type: 'purchase',
    amount: -total,
    description: 'Compra da cantina',
    items: state.cart,
    date: getDateString(),
    time: getTimeString(),
    balanceAfter: after,
    paymentMethod: 'Saldo',
    summary: groupedItems
  });

  saveTransactions(transactions);
  state.cart = [];
  saveCart();
  renderApp();
  setPage('historyPage');
  showToast('Obrigado pela compra, retirar seu pedido na cantina');
}

function renderHistory() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const historyList = document.getElementById('historyList');
  const transactions = getUserTransactions(currentUser.id).filter(item => item.type === 'purchase' || item.type === 'credit' || item.type === 'drink');

  historyList.innerHTML = transactions.map(item => `
    <div class="history-item">
      <div class="history-header">
        <strong>${item.description}</strong>
        <span>${item.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(item.amount))}</span>
      </div>
      <div class="history-meta">
        <span>${item.date}</span>
        <span>${item.time}</span>
        <span>Saldo restante: ${formatCurrency(item.balanceAfter)}</span>
      </div>
      <div class="history-products">
        ${item.summary || item.items?.map(product => `${product.name} × ${product.quantity}`).join('<br>') || 'Detalhes indisponíveis'}
      </div>
    </div>
  `).join('') || '<div class="panel">Você ainda não realizou compras.</div>';
}

function renderGastos() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const expenses = getUserTransactions(currentUser.id)
    .filter(item => item.type === 'purchase' || item.type === 'drink')
    .map(item => ({ ...item, value: Math.abs(Number(item.amount || 0)) }));

  const totalMensal = expenses.reduce((sum, item) => sum + item.value, 0);
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1);

  const despesasSemana = Array.from({ length: 5 }, (_, index) => {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + index);
    return {
      label: ['Seg','Ter','Qua','Qui','Sex'][index],
      value: expenses.filter(item => {
        const transactionDate = new Date(item.date.split('/').reverse().join('-'));
        return transactionDate.toDateString() === dia.toDateString();
      }).reduce((sum, item) => sum + item.value, 0)
    };
  });

  const maxValue = Math.max(...despesasSemana.map(item => item.value), 1);
  document.getElementById('monthlySpent').textContent = formatCurrency(totalMensal);
  document.getElementById('weeklySpent').textContent = formatCurrency(despesasSemana.reduce((sum, item) => sum + item.value, 0));
  document.getElementById('purchaseCount').textContent = String(expenses.length);

  const frequencyMap = {};
  expenses.forEach(item => {
    if (item.summary) {
      const names = item.summary.split(',');
      names.forEach(name => {
        const productName = name.trim().split(' × ')[0];
        frequencyMap[productName] = (frequencyMap[productName] || 0) + 1;
      });
    }
  });

  const topProduct = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('favoriteProduct').textContent = topProduct ? topProduct[0] : '—';

  const chart = document.getElementById('gastosChart');
  chart.innerHTML = despesasSemana.map(item => `
    <div class="chart-column">
      <div class="chart-bar" style="height:${(item.value / maxValue) * 100}%"></div>
      <span class="chart-day">${item.label}</span>
    </div>
  `).join('');
}

function renderProfile() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const cpfMasked = currentUser.cpf.replace(/\d(?=\d{4})/g, '*');
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileRegister').textContent = `Matrícula: ${currentUser.matricula}`;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileCpf').textContent = cpfMasked;
  document.getElementById('profileCreated').textContent = new Date(currentUser.createdAt).toLocaleDateString('pt-BR');
  document.getElementById('currentUserBadge').textContent = currentUser.name.split(' ')[0];
}

function renderTotem() {
  const students = getUsers();
  const select = document.getElementById('totemStudentSelect');
  const options = students.map(user => `<option value="${user.id}">${user.name} — ${user.matricula}</option>`).join('');
  select.innerHTML = options;

  const selectedUser = students[0];
  if (selectedUser) {
    document.getElementById('totemBalance').textContent = formatCurrency(selectedUser.saldo);
  }

  const products = getProducts();
  const totemGrid = document.getElementById('totemProducts');
  totemGrid.innerHTML = products.slice(0, 4).map(product => `
    <div class="totem-product">
      <div class="emoji">${product.icon}</div>
      <strong>${product.name}</strong>
      <span>${formatCurrency(product.price)}</span>
      <button type="button" data-totem-product="${product.id}">Comprar</button>
    </div>
  `).join('');
}

function renderMachine() {
  const products = getProducts().filter(product => product.category === 'Bebidas');
  const root = document.getElementById('drinkMachineList');
  root.innerHTML = products.map(product => `
    <div class="drink-card">
      <div class="emoji">${product.icon}</div>
      <strong>${product.name}</strong>
      <span>${product.description}</span>
      <div>${formatCurrency(product.price)}</div>
      <button type="button" data-drink-id="${product.id}">Liberar bebida</button>
    </div>
  `).join('');
}

function buyDrink(productId) {
  const user = getCurrentUser();
  const product = getProducts().find(item => item.id === productId);
  if (!user || !product) return;

  if (user.saldo < product.price) {
    showToast('Saldo insuficiente para liberar esta bebida.');
    return;
  }

  const before = user.saldo;
  const after = before - product.price;
  user.saldo = after;

  const users = getUsers();
  const index = users.findIndex(item => item.id === user.id);
  if (index !== -1) {
    users[index] = user;
    saveUsers(users);
  }

  const transactions = getTransactions();
  transactions.push({
    id: createId('txn'),
    userId: user.id,
    type: 'drink',
    amount: -product.price,
    description: 'Máquina de bebidas',
    date: getDateString(),
    time: getTimeString(),
    balanceAfter: after,
    summary: `${product.name}`,
    paymentMethod: 'Saldo'
  });

  saveTransactions(transactions);
  showToast('Bebida liberada! 🥤');
  renderApp();
}

function validatePasswordChange(newPassword) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  if (!newPassword || newPassword.length < 6 || !/[^A-Za-z0-9]/.test(newPassword)) {
    showToast('A nova senha deve ter pelo menos 6 caracteres e adicionar um caractere especial, como ! ou @.');
    return false;
  }

  currentUser.senha = newPassword;
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    saveUsers(users);
  }

  showToast('Senha alterada com sucesso.');
  return true;
}

function resetPasswordChangeFlow() {
  state.passwordChangeVerified = false;
  state.passwordVerificationCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('identityStep').hidden = false;
  document.getElementById('newPasswordStep').hidden = true;
  document.getElementById('confirmIdentityForm').reset();
  document.getElementById('changePasswordForm').reset();

  const currentUser = getCurrentUser();
  const email = currentUser?.email || '';
  const maskedEmail = email.replace(/^(.{2}).*(@.*)$/, '$1***$2');
  document.getElementById('passwordEmail').textContent = maskedEmail || 'seu e-mail cadastrado';
  document.getElementById('emailCodePreview').textContent = state.passwordVerificationCode;
}

function renderCartCount() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cartItemCount');
  if (cartCountElement) {
    cartCountElement.textContent = String(count);
  }
}

function renderApp() {
  const currentUser = getCurrentUser();
  const authScreen = document.getElementById('authScreen');
  const registerScreen = document.getElementById('registerScreen');
  const mainApp = document.getElementById('mainApp');

  if (!currentUser) {
    authScreen.classList.add('active');
    registerScreen.classList.remove('active');
    mainApp.classList.remove('active');
    return;
  }

  authScreen.classList.remove('active');
  registerScreen.classList.remove('active');
  mainApp.classList.add('active');

  renderHome();
  renderWallet();
  renderProducts();
  renderCart();
  renderCartCount();
  renderHistory();
  renderGastos();
  renderProfile();
  renderTotem();
  renderMachine();
  renderCreditPage();
}

function addBackHomeButtons() {
  document.querySelectorAll('.page:not(#homePage) .page-header').forEach(header => {
    if (header.querySelector('.back-home-button')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-home-button';
    button.dataset.page = 'homePage';
    button.setAttribute('aria-label', 'Voltar para a página inicial');
    button.title = 'Voltar para a página inicial';
    button.textContent = '←';
    header.prepend(button);
  });
}

function initEvents() {
  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    loginUser(identifier, password);
  });

  document.getElementById('registerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const matricula = document.getElementById('registerMatricula').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const cpf = document.getElementById('registerCpf').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();

    if (password.length < 6 || !/[^A-Za-z0-9]/.test(password)) {
      showToast('A senha deve ter pelo menos 6 caracteres e adicionar um caractere especial, como ! ou @.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas precisam ser iguais.');
      return;
    }

    registerUser({ name, matricula, email, cpf, password });
  });

  document.getElementById('goToRegister').addEventListener('click', () => {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
    loadRegisterDraft();
  });

  document.getElementById('backToLogin').addEventListener('click', () => {
    saveRegisterDraft();
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('authScreen').classList.add('active');
  });

  document.querySelectorAll('#registerForm input').forEach(input => {
    input.addEventListener('input', saveRegisterDraft);
  });

  document.getElementById('logoutButton').addEventListener('click', logout);

  addBackHomeButtons();

  document.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (page === 'addCreditPage' || page === 'productsPage' || page === 'cartPage' || page === 'checkoutPage' || page === 'historyPage' || page === 'homePage' || page === 'walletPage' || page === 'gastosPage' || page === 'profilePage' || page === 'changePasswordPage' || page === 'totemPage' || page === 'drinkPage') {
        if (page === 'changePasswordPage') resetPasswordChangeFlow();
        setPage(page);
      }
    });
  });

  document.querySelectorAll('.cart-indicator').forEach(button => {
    button.addEventListener('click', () => setPage('cartPage'));
  });

  document.getElementById('productSearch').addEventListener('input', renderProducts);

  document.getElementById('categoryFilters').addEventListener('click', (event) => {
    const chip = event.target.closest('.category-chip');
    if (!chip) return;
    state.activeCategory = chip.dataset.category;
    renderProducts();
  });

  document.getElementById('productsGrid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');
    if (button) {
      addToCart(button.dataset.productId);
    }
  });

  document.getElementById('cartItemsList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const productId = button.dataset.productId;

    if (action === 'increase') updateCartQuantity(productId, 1);
    if (action === 'decrease') updateCartQuantity(productId, -1);
  });

  document.getElementById('goToCheckout').addEventListener('click', openCheckout);
  document.getElementById('confirmPurchaseButton').addEventListener('click', confirmPurchase);

  document.querySelectorAll('.amount-button').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedAmount = button.dataset.value;
      const customInput = document.getElementById('customCreditValue');
      customInput.value = '';
      renderCreditPage();
    });
  });

  document.getElementById('addCreditForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const customValue = Number(document.getElementById('customCreditValue').value);
    const selectedValue = Number(state.selectedAmount);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const finalValue = customValue || selectedValue;
    addCredit(finalValue, paymentMethod);
  });

  document.getElementById('confirmIdentityForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const enteredCode = document.getElementById('identityCode').value.trim();
    if (enteredCode !== state.passwordVerificationCode) {
      showToast('Código incorreto. Confira o número enviado para seu e-mail.');
      return;
    }

    state.passwordChangeVerified = true;
    document.getElementById('identityStep').hidden = true;
    document.getElementById('newPasswordStep').hidden = false;
    showToast('E-mail confirmado. Você pode criar uma nova senha.');
  });

  document.getElementById('resendIdentityCode').addEventListener('click', () => {
    resetPasswordChangeFlow();
    showToast('Um novo código foi enviado para seu e-mail.');
  });

  document.getElementById('changePasswordForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.passwordChangeVerified) return;

    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      showToast('As novas senhas precisam ser iguais.');
      return;
    }

    if (validatePasswordChange(newPassword)) {
      resetPasswordChangeFlow();
      setPage('profilePage');
    }
  });

  document.getElementById('totemStudentSelect').addEventListener('change', (event) => {
    const userId = event.target.value;
    const user = getUsers().find(item => item.id === userId);
    if (!user) return;
    document.getElementById('totemBalance').textContent = formatCurrency(user.saldo);
  });

  document.getElementById('totemProducts').addEventListener('click', (event) => {
    const button = event.target.closest('[data-totem-product]');
    if (!button) return;
    const user = getCurrentUser();
    const product = getProducts().find(item => item.id === button.dataset.totemProduct);
    if (!user || !product) return;

    if (user.saldo < product.price) {
      showToast('Ops! Seu saldo não é suficiente para esta compra.');
      return;
    }

    addToCart(product.id);
    setPage('cartPage');
  });

  document.getElementById('drinkMachineList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-drink-id]');
    if (!button) return;
    buyDrink(button.dataset.drinkId);
  });

  document.getElementById('forgotPassword').addEventListener('click', () => {
    showToast('Use a opção de cadastro para criar uma nova conta.');
  });
}

function main() {
  seedStorage();
  loadCart();
  initEvents();
  renderApp();
  setPage('homePage');
}

document.addEventListener('DOMContentLoaded', main);