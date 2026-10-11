import { formatarNumero, formatarPercentual, formatarTempo } from "./formato.js";
import { gerarJogadores } from "./gerador.js";

const MAXIMO_JOGADORES = 2_000_000;
const MAXIMO_PREVIA = 10;

function required(documentRef, selector) {
  const elemento = documentRef.querySelector(selector);

  if (!elemento) {
    throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
  }

  return elemento;
}

function inteiroValido(texto, { minimo, maximo }) {
  const numero = Number(String(texto).trim());

  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    return null;
  }

  return numero;
}

function criarCelula(documentRef, valor) {
  const celula = documentRef.createElement("td");
  celula.textContent = String(valor);
  return celula;
}

function substituirLinhas(documentRef, corpo, linhas) {
  corpo.replaceChildren();

  for (const valores of linhas) {
    const linha = documentRef.createElement("tr");

    for (const valor of valores) {
      linha.appendChild(criarCelula(documentRef, valor));
    }

    corpo.appendChild(linha);
  }
}

export function ativarModoGeracao(documentRef, deps = {}) {
  const elements = {
    body: documentRef.body,
    datasetForm: required(documentRef, "#dataset-form"),
    quantityInput: required(documentRef, "#dataset-quantity"),
    seedInput: required(documentRef, "#dataset-seed"),
    datasetStatus: required(documentRef, "#dataset-status"),
    rankingStatus: required(documentRef, "#ranking-status"),
    comparisonStatus: required(documentRef, "#comparison-status"),
    benchmarkStatus: required(documentRef, "#benchmark-status"),
    runBenchmark: required(documentRef, "#run-benchmark"),
    rankingBody: required(documentRef, "#ranking-body"),
  };

  const cederControle =
    deps.cederControle ?? (() => new Promise((resolve) => setTimeout(resolve, 0)));

  function renderPrevia(jogadores) {
    const linhas = [];
    const total = Math.min(MAXIMO_PREVIA, jogadores.length);

    for (let i = 0; i < total; i += 1) {
      const jogador = jogadores[i];
      linhas.push([
        "—",
        jogador.nome,
        jogador.kd.toFixed(2),
        formatarPercentual(jogador.taxaVitoria),
        jogador.adr.toFixed(1),
        formatarNumero(jogador.pontuacao),
      ]);
    }

    substituirLinhas(documentRef, elements.rankingBody, linhas);
  }

  async function gerarPrevia() {
    const quantidade = inteiroValido(elements.quantityInput.value, {
      minimo: 1,
      maximo: MAXIMO_JOGADORES,
    });

    if (quantidade === null) {
      elements.datasetStatus.textContent =
        `Informe uma quantidade inteira entre 1 e ${formatarNumero(MAXIMO_JOGADORES)}.`;
      return null;
    }

    const seed = inteiroValido(elements.seedInput.value, {
      minimo: 0,
      maximo: 2 ** 31 - 1,
    });

    if (seed === null) {
      elements.datasetStatus.textContent = "Informe uma seed inteira maior ou igual a 0.";
      return null;
    }

    elements.datasetStatus.textContent = `Gerando ${formatarNumero(quantidade)} jogadores…`;
    await cederControle();

    const inicio = performance.now();
    const jogadores = gerarJogadores(quantidade, { seed });
    const tempoMs = performance.now() - inicio;

    renderPrevia(jogadores);
    elements.datasetStatus.textContent =
      `${formatarNumero(quantidade)} jogadores gerados em ${formatarTempo(tempoMs)} ` +
      `(seed ${seed}). Prévia sem ordenação — o ranking depende dos módulos de ordenação.`;
    elements.body.dataset.state = "ready";

    return jogadores;
  }

  elements.datasetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void gerarPrevia();
  });

  for (const botao of documentRef.querySelectorAll?.("[data-quantity]") ?? []) {
    botao.addEventListener("click", () => {
      elements.quantityInput.value = botao.getAttribute("data-quantity");
    });
  }

  elements.rankingStatus.textContent =
    "Ranking indisponível: aguardando os módulos de ordenação (Quick, Heap e critérios).";
  elements.comparisonStatus.textContent =
    "Comparação indisponível: aguardando os módulos de ordenação.";
  elements.benchmarkStatus.textContent =
    "Benchmark indisponível: aguardando os módulos de ordenação.";
  elements.runBenchmark.disabled = true;

  return { gerarPrevia };
}
