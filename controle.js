// elementos
const form = document.getElementById("form");
const descInput = document.getElementById("descricao");
const valorInput = document.getElementById("montante");
const balancoH1 = document.getElementById("balanco");
const receitaP = document.getElementById("din-positivo");
const despesaP = document.getElementById("din-negativo");
const transacoesUl = document.getElementById("transacoes");

const STORAGE_KEY = "if_financas";

// dados e ID incremental
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let nextId = transacoes.length
  ? Math.max(...transacoes.map(t => t.id)) + 1
  : 0;

// inicia
transacoes.forEach(renderTransacao);
recalculaTudo();

// evento submit
form.addEventListener("submit", e => {
  e.preventDefault();
  const tipo = form.elements["tipo"].value; // + ou -
  const desc = descInput.value.trim();
  const valNum = parseFloat(valorInput.value);

  if (!desc || isNaN(valNum)) {
    alert("Preencha descrição e valor!");
    return;
  }

  const transacao = {
    id: nextId++,
    descricao: desc,
    valor: tipo + valNum
  };

  transacoes.push(transacao);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
  renderTransacao(transacao);
  atualizarValores(transacao);

  descInput.value = "";
  valorInput.value = "";
});

// cria li
function renderTransacao(t) {
  const li = document.createElement("li");
  li.className = t.valor > 0 ? "positivo" : "negativo";
  li.dataset.id = t.id;
  li.innerHTML = `
    ${t.descricao}
    <span>R$${Math.abs(t.valor).toFixed(2)}</span>
    <button class="delete-btn">X</button>
  `;
  li.querySelector(".delete-btn")
    .addEventListener("click", () => removeTransacao(t.id));
  transacoesUl.appendChild(li);
}

// atualiza só a nova transação
function atualizarValores(t) {
  const v = Number(t.valor);
  // saldo
  let saldo = parseFloat(balancoH1.textContent.replace("R$", ""));
  saldo += v;
  balancoH1.textContent = `R$${saldo.toFixed(2)}`;
  // receita ou despesa
  const elem = v > 0 ? receitaP : despesaP;
  let atual = parseFloat(elem.textContent.replace(/[^0-9.]/g, ""));
  atual += Math.abs(v);
  const sinal = v > 0 ? "+ " : "- ";
  elem.textContent = sinal + `R$${atual.toFixed(2)}`;
}

// recalcula do zero (reload)
function recalculaTudo() {
  // limpa
  balancoH1.textContent = "R$0.00";
  receitaP.textContent = "+ R$0.00";
  despesaP.textContent = "- R$0.00";
  transacoesUl.innerHTML = "";
  // repopula
  transacoes.forEach(renderTransacao);
  transacoes.forEach(atualizarValores);
}

// remove sem recarregar tudo
function removeTransacao(id) {
  const idx = transacoes.findIndex(t => t.id === id);
  if (idx < 0) return;
  const [rem] = transacoes.splice(idx, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
  document.querySelector(`li[data-id="${id}"]`).remove();

  // Atualiza saldo
  let saldo = parseFloat(balancoH1.textContent.replace("R$",""));
  saldo -= rem.valor;  // se rem.valor for -50, saldo -= -50 => +50
  balancoH1.textContent = `R$${saldo.toFixed(2)}`;

  // Atualiza categoria
  if (rem.valor > 0) {
    let rec = parseFloat(receitaP.textContent.replace(/[^0-9.]/g,""));
    rec -= rem.valor;
    receitaP.textContent = `+ R$${rec.toFixed(2)}`;
  } else {
    let desp = parseFloat(despesaP.textContent.replace(/[^0-9.]/g,""));
    desp -= Math.abs(rem.valor);
    despesaP.textContent = `- R$${desp.toFixed(2)}`;
  }
}

