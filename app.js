// app.js
import { db } from './supabaseClient.js';

let allProducts = [];
let chatList = [];

// Regras de Bloqueio Anti-Bypass (Telefone, WhatsApp, Links, Redes Sociais)
const phoneRegex = /(\(?\d{2}\)?\s?)?(9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/;
const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,})/i;
const forbiddenWords = ['whatsapp', 'whats', 'zap', 'instagram', 'insta', 'telefone', 'celular', 'chama no', '@'];

// Inicialização ao carregar o documento
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  await checkConnection();
  await loadProducts();
  await loadChatMessages();
  subscribeRealtime();

  // Registrar Formulários no DOM
  const pForm = document.getElementById('productForm');
  if (pForm) pForm.addEventListener('submit', handleCreateProduct);

  const cForm = document.getElementById('chatForm');
  if (cForm) cForm.addEventListener('submit', handleSendMessage);

  const lFilter = document.getElementById('locationFilter');
  if (lFilter) lFilter.addEventListener('change', renderProducts);
});

// Verificar Conexão com o Supabase
async function checkConnection() {
  const statusEl = document.getElementById('connectionStatus');
  if (!statusEl) return;

  try {
    const { error } = await db.from('products').select('count', { count: 'exact', head: true });
    if (!error) {
      statusEl.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span class="text-emerald-400 font-medium">Banco Conectado (Tempo Real)</span>
      `;
    }
  } catch (e) {
    statusEl.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-rose-500"></span>
      <span class="text-rose-400">Erro de Conexão</span>
    `;
  }
}

// Carregar Lista de Produtos Virgem
async function loadProducts() {
  const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    allProducts = data;
    renderProducts();
  }
}

// Renderizar Produtos na Vitrine do Campus
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const filterEl = document.getElementById('locationFilter');
  if (!grid) return;

  const filter = filterEl ? filterEl.value : 'ALL';
  const filtered = filter === 'ALL' ? allProducts : allProducts.filter(p => p.active_location === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
        <i data-lucide="package-open" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <p class="font-medium">Nenhum produto cadastrado neste local ainda.</p>
        <p class="text-xs">Seja o primeiro empreendedor a anunciar na SATC!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition duration-300 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
            ${p.active_location || 'Campus SATC'}
          </span>
          <span class="text-xs text-slate-400">Limite: ${p.daily_limit || 10}/dia</span>
        </div>
        <h4 class="font-bold text-white text-base">${p.title}</h4>
        <p class="text-xs text-slate-400 mt-1">Preço Final: R$ ${Number(p.final_price || p.price).toFixed(2)}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Criar Novo Produto
async function handleCreateProduct(e) {
  e.preventDefault();
  const title = document.getElementById('pTitle').value;
  const price = parseFloat(document.getElementById('pPrice').value);
  const location = document.getElementById('pLocation').value;
  const limit = parseInt(document.getElementById('pLimit').value);

  const fee = price * 0.10; // 10% da plataforma
  const finalPrice = price + fee;

  const { error } = await db.from('products').insert([{
    title: title,
    price: price,
    platform_fee: fee,
    final_price: finalPrice,
    active_location: location,
    daily_limit: limit,
    category: 'Geral'
  }]);

  if (!error) {
    document.getElementById('productForm').reset();
    await loadProducts();
  } else {
    alert('Erro ao cadastrar produto: ' + error.message);
  }
}

// Enviar Mensagem com Filtro Anti-Bypass
async function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const alertEl = document.getElementById('chatAlert');
  if (!input) return;

  const text = input.value.trim();
  if (alertEl) alertEl.classList.add('hidden');
  if (!text) return;

  const lower = text.toLowerCase();
  const hasPhone = phoneRegex.test(text);
  const hasUrl = urlRegex.test(text);
  const hasForbiddenWord = forbiddenWords.some(w => lower.includes(w));

  // Bloqueio se violar regras
  if (hasPhone || hasUrl || hasForbiddenWord) {
    if (alertEl) alertEl.classList.remove('hidden');

    await db.from('chat_messages').insert([{
      message_text: '[Mensagem bloqueada: tentativa de envio de contato externo]',
      is_blocked: true
    }]);

    input.value = '';
    return;
  }

  // Envio Limpo
  const { error } = await db.from('chat_messages').insert([{
    message_text: text,
    is_blocked: false
  }]);

  if (!error) {
    input.value = '';
  }
}

// Carregar Chat
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
    container.innerHTML = `<p class="text-slate-500 text-center italic my-auto">Nenhuma mensagem registrada no banco ainda.</p>`;
    return;
  }

  container.innerHTML = chatList.map(msg => `
    <div class="p-2.5 rounded-xl ${msg.is_blocked ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-200'}">
      ${msg.is_blocked ? `<div class="font-semibold text-[10px] text-rose-400 mb-0.5">[BLOQUEADO PELO FILTRO]</div>` : ''}
      <p class="${msg.is_blocked ? 'italic text-rose-200/80' : ''}">${msg.message_text}</p>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
  if (window.lucide) lucide.createIcons();
}

// Inscrição em Tempo Real (Realtime)
function subscribeRealtime() {
  db.channel('public_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadProducts())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => loadChatMessages())
    .subscribe();
}