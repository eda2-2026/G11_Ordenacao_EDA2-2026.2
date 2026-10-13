import { executarBenchmark, linhasParaCsv, TAMANHOS_PADRAO } from "./benchmark.js";
import { obterCriterio } from "./criterios.js";
import { formatarNumero, formatarPercentual, formatarTempo } from "./formato.js";
import { gerarJogadores } from "./gerador.js";
import { ALGORITMOS } from "./ordenacao.js";

const MAXIMO_JOGADORES = 2_000_000;
const MAXIMO_TOP = 100;

function required(documentRef, selector) {
  const elemento = documentRef.querySelector(selector);

  if (!elemento) {
    throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
  }

  return elemento;
}

function criarCelula(documentRef, valor) {
  const celula = documentRef.createElement("td");

  if (valor !== null && typeof valor === "object") {
    if (valor.classe) {
      const selo = documentRef.createElement("span");
      selo.textContent = valor.texto;
      selo.className = valor.classe;
      celula.appendChild(selo);
    } else {
      celula.textContent = valor.texto;
    }
  } else {
    celula.textContent = String(valor);
  }

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

function inteiroValido(texto, { minimo, maximo }) {
  const numero = Number(String(texto).trim());

  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    return null;
  }

  return numero;
}

export function createRankingApp(documentRef, deps = {}) {
  const elements = {
    body: documentRef.body,
    datasetForm: required(documentRef, "#dataset-form"),
    quantityInput: required(documentRef, "#dataset-quantity"),
    seedInput: required(documentRef, "#dataset-seed"),
    generateButton: required(documentRef, "#generate-dataset"),
    datasetStatus: required(documentRef, "#dataset-status"),
    rankingForm: required(documentRef, "#ranking-form"),
    criterionSelect: required(documentRef, "#criterion-select"),
    criterionDescription: required(documentRef, "#criterion-description"),
    algorithmSelect: required(documentRef, "#algorithm-select"),
    topNInput: required(documentRef, "#top-n"),
    runRanking: required(documentRef, "#run-ranking"),
    rankingStatus: required(documentRef, "#ranking-status"),
    rankingBody: required(documentRef, "#ranking-body"),
    metricTime: required(documentRef, "#metric-time"),
    metricComparisons: required(documentRef, "#metric-comparisons"),
    metricMoves: required(documentRef, "#metric-moves"),
    metricSwaps: required(documentRef, "#metric-swaps"),
    compareAlgorithms: required(documentRef, "#compare-algorithms"),
    comparisonStatus: required(documentRef, "#comparison-status"),
    comparisonWinner: required(documentRef, "#comparison-winner"),
    comparisonBody: required(documentRef, "#comparison-body"),
    benchmarkCriterion: required(documentRef, "#benchmark-criterion"),
    runBenchmark: required(documentRef, "#run-benchmark"),
    benchmarkStatus: required(documentRef, "#benchmark-status"),
    benchmarkBody: required(documentRef, "#benchmark-body"),
    downloadBenchmark: required(documentRef, "#download-benchmark"),
  };

  const cederControle =
    deps.cederControle ?? (() => new Promise((resolve) => setTimeout(resolve, 0)));
  const benchmarkTamanhos = deps.benchmarkTamanhos ?? TAMANHOS_PADRAO;

  const state = {
    dados: null,
    origem: null,
    benchmarkLinhas: null,
    executando: false,
  };

  function atualizarDescricaoCriterio() {
    const criterio = obterCriterio(elements.criterionSelect.value);
    elements.criterionDescription.textContent = criterio.descricao;
  }

  async function gerarDataset() {
    if (state.executando) {
      return null;
    }

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

    state.executando = true;
    elements.generateButton.disabled = true;
    elements.datasetStatus.textContent = `Gerando ${formatarNumero(quantidade)} jogadores…`;
    await cederControle();

    const inicio = performance.now();
    const dados = gerarJogadores(quantidade, { seed });
    const tempoMs = performance.now() - inicio;

    state.dados = dados;
    state.origem = `sintético · seed ${seed}`;
    state.benchmarkLinhas = null;

    elements.datasetStatus.textContent =
      `${formatarNumero(quantidade)} jogadores gerados em ${formatarTempo(tempoMs)}.`;
    elements.rankingStatus.textContent = "Dataset pronto. Clique em “Gerar ranking”.";
    elements.comparisonStatus.textContent = "Dataset pronto. Clique em “Comparar”.";
    elements.runRanking.disabled = false;
    elements.compareAlgorithms.disabled = false;
    elements.downloadBenchmark.disabled = true;
    elements.body.dataset.state = "ready";
    elements.generateButton.disabled = false;
    state.executando = false;

    return { quantidade, seed, tempoMs };
  }

  function executarRanking() {
    if (!state.dados) {
      return null;
    }

    const criterio = obterCriterio(elements.criterionSelect.value);
    const algoritmo = ALGORITMOS[elements.algorithmSelect.value];
    const topN =
      inteiroValido(elements.topNInput.value, {
        minimo: 1,
        maximo: Math.min(MAXIMO_TOP, state.dados.length),
      }) ?? Math.min(10, state.dados.length);

    const copia = state.dados.slice();
    const inicio = performance.now();
    const metricas = algoritmo.funcao(copia, criterio.comparar);
    const tempoMs = performance.now() - inicio;

    const linhas = [];
    const total = Math.min(topN, copia.length);

    for (let i = 0; i < total; i += 1) {
      const jogador = copia[i];
      linhas.push([
        i + 1,
        jogador.nome,
        jogador.kd.toFixed(2),
        formatarPercentual(jogador.taxaVitoria),
        jogador.adr.toFixed(1),
        formatarNumero(jogador.pontuacao),
      ]);
    }

    substituirLinhas(documentRef, elements.rankingBody, linhas);
    elements.metricTime.textContent = formatarTempo(tempoMs);
    elements.metricComparisons.textContent = formatarNumero(metricas.comparacoes);
    elements.metricMoves.textContent = formatarNumero(metricas.movimentacoes);
    elements.metricSwaps.textContent = formatarNumero(metricas.trocas);
    elements.rankingStatus.textContent =
      `Top ${total} por ${criterio.rotulo} com ${algoritmo.rotulo} (${state.origem}).`;

    return { ordenados: copia, metricas, tempoMs };
  }

  function compararAlgoritmos() {
    if (!state.dados) {
      return null;
    }

    const criterio = obterCriterio(elements.criterionSelect.value);
    const referencia = state.dados
      .slice()
      .sort(criterio.comparar)
      .map((jogador) => jogador.nome);

    const resultados = [];

    for (const [id, algoritmo] of Object.entries(ALGORITMOS)) {
      const copia = state.dados.slice();
      const inicio = performance.now();
      const metricas = algoritmo.funcao(copia, criterio.comparar);
      const tempoMs = performance.now() - inicio;
      const correta = copia.every((jogador, indice) => jogador.nome === referencia[indice]);

      resultados.push({
        id,
        rotulo: algoritmo.rotulo,
        estavel: algoritmo.estavel,
        metricas,
        tempoMs,
        correta,
      });
    }

    substituirLinhas(
      documentRef,
      elements.comparisonBody,
      resultados.map((resultado) => [
        resultado.rotulo,
        formatarTempo(resultado.tempoMs),
        formatarNumero(resultado.metricas.comparacoes),
        formatarNumero(resultado.metricas.movimentacoes),
        resultado.estavel
          ? { texto: "Sim", classe: "badge badge-ok" }
          : { texto: "Não", classe: "badge badge-no" },
      ]),
    );

    const vencedor = resultados.reduce((melhor, atual) =>
      atual.tempoMs < melhor.tempoMs ? atual : melhor,
    );

    elements.comparisonWinner.textContent =
      `Mais rápido neste teste: ${vencedor.rotulo} (${formatarTempo(vencedor.tempoMs)}).`;
    elements.comparisonStatus.textContent =
      `Comparação concluída sobre ${formatarNumero(state.dados.length)} jogadores.`;

    return resultados;
  }

  async function rodarBenchmark() {
    if (state.executando) {
      return null;
    }

    state.executando = true;
    elements.runBenchmark.disabled = true;
    elements.downloadBenchmark.disabled = true;
    elements.body.dataset.state = "running";

    const descreverFase = (evento) => {
      if (evento.fase === "geracao") {
        return `Gerando ${formatarNumero(evento.tamanho)} jogadores…`;
      }

      return (
        `Ordenando ${formatarNumero(evento.tamanho)} jogadores com ` +
        `${ALGORITMOS[evento.algoritmo].rotulo}…`
      );
    };

    const inicio = performance.now();

    try {
      const linhas = await executarBenchmark({
        tamanhos: benchmarkTamanhos,
        criterio: elements.benchmarkCriterion.value,
        aoProgresso: (evento) => {
          elements.benchmarkStatus.textContent = descreverFase(evento);
        },
        cederControle,
      });

      const tempoTotalMs = performance.now() - inicio;
      state.benchmarkLinhas = linhas;

      substituirLinhas(
        documentRef,
        elements.benchmarkBody,
        linhas.map((linha) => [
          formatarNumero(linha.tamanho),
          linha.rotulo,
          formatarTempo(linha.tempoMs),
          linha.comparacoes === null ? "—" : formatarNumero(linha.comparacoes),
          linha.movimentacoes === null ? "—" : formatarNumero(linha.movimentacoes),
        ]),
      );

      elements.benchmarkStatus.textContent = `Benchmark concluído em ${formatarTempo(tempoTotalMs)}.`;
      elements.downloadBenchmark.disabled = false;
      elements.body.dataset.state = "ready";

      return linhas;
    } finally {
      state.executando = false;
      elements.runBenchmark.disabled = false;
    }
  }

  function baixarBenchmark() {
    if (!state.benchmarkLinhas) {
      return null;
    }

    const csv = linhasParaCsv(state.benchmarkLinhas);

    if (
      typeof Blob === "undefined" ||
      typeof URL === "undefined" ||
      typeof URL.createObjectURL !== "function"
    ) {
      return csv;
    }

    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = documentRef.createElement("a");

    link.href = url;
    link.download = "benchmark_ordenacao.csv";
    link.click();
    URL.revokeObjectURL(url);

    return csv;
  }

  elements.datasetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void gerarDataset();
  });
  elements.rankingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    executarRanking();
  });
  elements.compareAlgorithms.addEventListener("click", compararAlgoritmos);
  elements.runBenchmark.addEventListener("click", () => {
    void rodarBenchmark();
  });
  elements.downloadBenchmark.addEventListener("click", baixarBenchmark);
  elements.criterionSelect.addEventListener("change", atualizarDescricaoCriterio);

  for (const botao of documentRef.querySelectorAll?.("[data-quantity]") ?? []) {
    botao.addEventListener("click", () => {
      elements.quantityInput.value = botao.getAttribute("data-quantity");
    });
  }

  atualizarDescricaoCriterio();
  elements.runRanking.disabled = true;
  elements.compareAlgorithms.disabled = true;
  elements.downloadBenchmark.disabled = true;

  return {
    gerarDataset,
    executarRanking,
    compararAlgoritmos,
    rodarBenchmark,
    baixarBenchmark,
    getState: () => ({ ...state }),
  };
}

if (typeof document !== "undefined") {
  const start = () => createRankingApp(document);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
