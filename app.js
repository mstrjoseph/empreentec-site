import { db } from './supabaseClient.js';

let currentUser = JSON.parse(localStorage.getItem('empreentec_user')) || null;
let allProducts = [];
let chatList = [];
let userCoords = null;

const phoneRegex = /(\(?\d{2}\)?\s?)?(9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/;
const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,})/i;
const forbiddenWords = ['whatsapp', 'whats', 'zap', 'instagram', 'insta', 'telefone', 'celular', 'chama no', '@'];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  updateUserUI();
  initGeolocation();
  await checkConnection();
  await loadProducts();
  await loadChatMessages();
  subscribeRealtime();

  document.getElementById('productForm')?.addEventListener('submit', handleCreateProduct);
  document.getElementById('chatForm')?.addEventListener('submit', handleSendMessage);
  document.getElementById('locationFilter')?.addEventListener('change', renderProducts);
});

// GEOLOCALIZAÇÃO ESTILO MERCADO LIVRE
function initGeolocation() {
  const geoStatus = document.getElementById('geoStatus');
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
        userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (geoStatus) {
          geoStatus.innerHTML = `<i data-lucide="crosshair" class="w-3.5 h-3.5 text-emerald-400 inline"></i> GPS Ativo: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
          if (window.lucide) lucide.createIcons();
        }
      },
      (err) => {
        if (geoStatus) geoStatus.innerHTML = `<span class="text-amber-400">Localização padrão: Campus SATC</span>`;
      },
      { enableHighAccuracy: true }
    );
  }
}

// GESTÃO DE CADASTRO/SESSÃO
window.openAuthModal = (role) => {
  document.getElementById('authRole').value = role;
  document.getElementById('modalTitle').innerText = role === 'empreendedor' ? 'Cadastro de Empreendedor' : 'Cadastro de Cliente';
  document.getElementById('authModal').classList.remove('hidden');
};

window.closeAuthModal = () => {
  document.getElementById('authModal').classList.add('hidden');
};

window.handleRegister = async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const doc = document.getElementById('regDoc').value;
  const role = document.getElementById('authRole').value;

  const newUser = { id: 'usr_' + Date.now(), name, doc, role };
  currentUser = newUser;
  localStorage.setItem('empreentec_user', JSON.stringify(newUser));

  updateUserUI();
  closeAuthModal();
};

function updateUserUI() {
  const profileContainer = document.getElementById('userProfileArea');
  if (!profileContainer) return;

  if (currentUser) {
    profileContainer.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="font-bold text-white">${currentUser.name}</span>
        <span class="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full uppercase">${currentUser.role}</span>
      </div>
    `;
  } else {
    profileContainer.innerHTML = `
      <button onclick="openAuthModal('cliente')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700">Sou Cliente</button>
      <button onclick="openAuthModal('empreendedor')" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl">Sou Empreendedor</button>
    `;
  }
}

// CONEXÃO & BANCO
async function checkConnection() {
  const statusEl = document.getElementById('connectionStatus');
  if (!statusEl) return;
  try {
    const { error } = await db.from('products').select('count', { count: 'exact', head: true });
    if (!error) {
      statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="text-emerald-400 font-medium">Conectado em Tempo Real</span>`;
    }
  } catch (e) {
    statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500"></span><span class="text-rose-400">Erro de Conexão</span>`;
  }
}

async function loadProducts() {
  const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    allProducts = data;
    renderProducts();
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const filterEl = document.getElementById('locationFilter');
  if (!grid) return;

  const filter = filterEl ? filterEl.value : 'ALL';
  const filtered = filter === 'ALL' ? allProducts : allProducts.filter(p => p.active_location === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
        <p class="font-medium">Nenhum produto anunciado neste local.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
            ${p.active_location || 'Campus SATC'}
          </span>
          <span class="text-xs text-slate-400">Limite: ${p.daily_limit || 10}/dia</span>
        </div>
        <h4 class="font-bold text-white text-base">${p.title}</h4>
        <p class="text-xs text-emerald-400 font-semibold mt-1">R$ ${Number(p.final_price || p.price).toFixed(2)}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

async function handleCreateProduct(e) {
  e.preventDefault();
  if (!currentUser) {
    alert('Por favor, faça seu cadastro antes de anunciar!');
    openAuthModal('empreendedor');
    return;
  }

  const title = document.getElementById('pTitle').value;
  const price = parseFloat(document.getElementById('pPrice').value);
  const location = document.getElementById('pLocation').value;
  const limit = parseInt(document.getElementById('pLimit').value);

  const fee = price * 0.10;
  const finalPrice = price + fee;

  const { error } = await db.from('products').insert([{
    title,
    price,
    platform_fee: fee,
    final_price: finalPrice,
    active_location: location,
    daily_limit: limit,
    category: 'Geral'
  }]);

  if (!error) {
    document.getElementById('productForm').reset();
  }
}

// CHAT EM TEMPO REAL SEM RECARREGAR A PÁGINA
async function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const alertEl = document.getElementById('chatAlert');
  if (!input) return;

  const text = input.value.trim();
  if (alertEl) alertEl.classList.add('hidden');
  if (!text) return;

  if (!currentUser) {
    alert('Por favor, cadastre-se para participar do chat!');
    openAuthModal('cliente');
    return;
  }

  const lower = text.toLowerCase();
  const hasPhone = phoneRegex.test(text);
  const hasUrl = urlRegex.test(text);
  const hasForbiddenWord = forbiddenWords.some(w => lower.includes(w));

  if (hasPhone || hasUrl || hasForbiddenWord) {
    if (alertEl) alertEl.classList.remove('hidden');

    await db.from('chat_messages').insert([{
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      message_text: '[Mensagem bloqueada por conter contacto externo]',
      is_blocked: true
    }]);

    input.value = '';
    return;
  }

  const { error } = await db.from('chat_messages').insert([{
    sender_name: currentUser.name,
    sender_role: currentUser.role,
    message_text: text,
    is_blocked: false
  }]);

  if (!error) {
    input.value = '';
  }
}

async function loadChatMessages() {
  const { data, error } = await db.from('chat_messages').select('*').order('created_at', { ascending: true });
  if (!error && data) {
    chatList = data;
    renderChat();
  }
}

function renderChat() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  if (chatList.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-center italic my-auto">Sem mensagens. Seja o primeiro a escrever!</p>`;
    return;
  }

  container.innerHTML = chatList.map(msg => {
    const isMe = currentUser && currentUser.name === msg.sender_name;
    const isSeller = msg.sender_role === 'empreendedor';

    return `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2">
        <div class="flex items-center gap-1 mb-0.5 text-[10px] text-slate-400">
          <span class="font-bold ${isSeller ? 'text-emerald-400' : 'text-slate-300'}">${msg.sender_name || 'Usuário'}</span>
          <span class="text-[9px] px-1 bg-slate-800 rounded text-slate-500">${isSeller ? 'Vendedor' : 'Cliente'}</span>
        </div>
        <div class="max-w-[85%] p-2.5 rounded-xl ${
          msg.is_blocked
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 italic'
            : isMe
            ? 'bg-emerald-600 text-white rounded-tr-none'
            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
        }">
          ${msg.is_blocked ? '<span class="font-semibold text-rose-400">[BLOQUEADO] </span>' : ''}
          ${msg.message_text}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
  if (window.lucide) lucide.createIcons();
}

function subscribeRealtime() {
  db.channel('realtime_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
      allProducts.unshift(payload.new);
      renderProducts();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
      chatList.push(payload.new);
      renderChat();
    })
    .subscribe();
}