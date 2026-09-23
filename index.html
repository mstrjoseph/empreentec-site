<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EmpreenTEC - Ecossistema Empreendedor SATC</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #030705; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="relative min-h-screen flex flex-col justify-between">

  <!-- HEADER -->
  <header class="border-b border-emerald-950/60 bg-slate-950/90 sticky top-0 z-20 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">eT</div>
        <div>
          <h1 class="font-bold text-base text-white tracking-wide">empreen<span class="text-emerald-400">TEC</span></h1>
          <p id="geoStatus" class="text-[10px] text-slate-400">Obtendo localização...</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div id="connectionStatus" class="text-xs text-slate-400"></div>
        <div id="userProfileArea" class="flex gap-2"></div>
      </div>
    </div>
  </header>

  <!-- MAIN -->
  <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-8">

    <!-- VITRINE COM FILTRO DE BLOCOS -->
    <section class="bg-slate-900/60 border border-emerald-900/30 rounded-2xl p-5">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="map-pin" class="text-emerald-400"></i> Produtos & Locais no Campus SATC
          </h2>
        </div>
        <select id="locationFilter" class="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none">
          <option value="ALL">Todos os Blocos</option>
          <option value="Bloco XXI">Bloco XXI (Engenharias)</option>
          <option value="Bloco XVIII">Bloco XVIII</option>
          <option value="Pátio Central">Pátio Central</option>
          <option value="Biblioteca">Biblioteca</option>
        </select>
      </div>

      <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
    </section>

    <!-- FORMULÁRIO DE ANÚNCIO E CHAT SEGURO -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-2 bg-slate-900/60 border border-emerald-900/30 rounded-2xl p-5">
        <h3 class="text-base font-bold text-white mb-4">Anunciar Produto</h3>
        <form id="productForm" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" id="pTitle" required placeholder="Título do Produto" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
            <input type="number" step="0.01" id="pPrice" required placeholder="Preço (R$)" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select id="pLocation" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
              <option value="Bloco XXI">Bloco XXI (Engenharias)</option>
              <option value="Bloco XVIII">Bloco XVIII</option>
              <option value="Pátio Central">Pátio Central</option>
            </select>
            <input type="number" id="pLimit" value="10" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
          </div>
          <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs">Publicar Produto</button>
        </form>
      </div>

      <!-- CHAT EM TEMPO REAL -->
      <div class="bg-slate-900/80 border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between h-[450px]">
        <div class="border-b border-slate-800 pb-2">
          <h3 class="font-bold text-xs text-white flex items-center gap-1.5">
            <i data-lucide="shield-check" class="text-emerald-400 w-4 h-4"></i> Chat Protegido
          </h3>
        </div>

        <div id="chatMessages" class="flex-1 my-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-y-auto space-y-2"></div>

        <div id="chatAlert" class="hidden mb-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-[11px]">
          Contatos externos não são permitidos!
        </div>

        <form id="chatForm" class="flex gap-2">
          <input type="text" id="chatInput" placeholder="Sua mensagem..." class="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
          <button type="submit" class="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
          </button>
        </form>
      </div>

    </div>
  </main>

  <!-- MODAL DE CADASTRO DE USUÁRIO -->
  <div id="authModal" class="hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
      <h3 id="modalTitle" class="text-base font-bold text-white mb-4">Identificação do Usuário</h3>
      <form onsubmit="handleRegister(event)" class="space-y-3">
        <input type="hidden" id="authRole" value="cliente">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Nome Completo</label>
          <input type="text" id="regName" required placeholder="Digite seu nome..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1">CPF ou Matrícula SATC</label>
          <input type="text" id="regDoc" required placeholder="000.000.000-00" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeAuthModal()" class="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancelar</button>
          <button type="submit" class="flex-1 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-xs">Salvar & Continuar</button>
        </div>
      </form>
    </div>
  </div>

  <script type="module" src="./app.js"></script>
</body>
</html>