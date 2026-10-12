import { gerarJogadores } from "./gerador.js";
import { obterCriterio } from "./criterios.js";
import { ALGORITMOS } from "./ordenacao.js";

export const TAMANHOS_PADRAO = Object.freeze([100, 10_000, 1_000_000]);

const ALGORITMO_NATIVO = Object.freeze({
  id: "nativo",
  rotulo: "Array.sort (nativo)",
});

function obterAgora() {
  return globalThis.performance?.now() ?? Date.now();
}

function validarTamanhos(tamanhos) {
  if (
    !Array.isArray(tamanhos) ||
    tamanhos.some((tamanho) => !Number.isInteger(tamanho) || tamanho < 1)
  ) {
    throw new RangeError("Os tamanhos do benchmark devem ser inteiros positivos.");
  }
}

function conferirOrdem(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (let indice = 0; indice < a.length; indice += 1) {
    if (a[indice] !== b[indice]) {
      return false;
    }
  }

  return true;
}

export async function executarBenchmark(opcoes = {}) {
  const {
    tamanhos = TAMANHOS_PADRAO,
    criterio: nomeCriterio = "kd",
    aoProgresso,
    cederControle = () => new Promise((resolve) => setTimeout(resolve, 0)),
    seed = 42,
  } = opcoes;

  validarTamanhos(tamanhos);
  const criterio = obterCriterio(nomeCriterio);
  const linhas = [];
  const notificar = async (evento) => {
    if (typeof aoProgresso === "function") {
      await aoProgresso(evento);
    }
  };

  for (const tamanho of tamanhos) {
    await notificar({ fase: "geracao", tamanho });
    await cederControle();

    const dados = gerarJogadores(tamanho, { seed });
    const referencia = dados.slice();
    const inicioNativo = obterAgora();
    referencia.sort(criterio.comparar);
    const tempoNativoMs = obterAgora() - inicioNativo;
    const nomesReferencia = referencia.map((jogador) => jogador.nome);

    for (const [id, algoritmo] of Object.entries(ALGORITMOS)) {
      await notificar({ fase: "ordenacao", tamanho, algoritmo: id });
      await cederControle();

      const ordenados = dados.slice();
      const inicio = obterAgora();
      const metricas = algoritmo.funcao(ordenados, criterio.comparar);
      const tempoMs = obterAgora() - inicio;

      linhas.push({
        tamanho,
        algoritmo: id,
        rotulo: algoritmo.rotulo,
        tempoMs,
        comparacoes: metricas.comparacoes,
        movimentacoes: metricas.movimentacoes,
        correta: conferirOrdem(
          ordenados.map((jogador) => jogador.nome),
          nomesReferencia,
        ),
      });
    }

    linhas.push({
      tamanho,
      algoritmo: ALGORITMO_NATIVO.id,
      rotulo: ALGORITMO_NATIVO.rotulo,
      tempoMs: tempoNativoMs,
      comparacoes: null,
      movimentacoes: null,
      correta: true,
    });
  }

  return linhas;
}

function escaparCampoCsv(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  const texto = String(valor);
  if (/[;"\r\n]/.test(texto)) {
    return `"${texto.replaceAll('"', '""')}"`;
  }
  return texto;
}

export function linhasParaCsv(linhas) {
  const cabecalho = [
    "tamanho",
    "algoritmo",
    "tempo_ms",
    "comparacoes",
    "movimentacoes",
    "correta",
  ];
  const registros = linhas.map((linha) => [
    linha.tamanho,
    linha.algoritmo,
    linha.tempoMs,
    linha.comparacoes,
    linha.movimentacoes,
    linha.correta,
  ]);

  return [cabecalho, ...registros]
    .map((registro) => registro.map(escaparCampoCsv).join(";"))
    .join("\n");
}