function compararDecrescente(a, b) {
  if (a < b) {
    return 1;
  }
  if (a > b) {
    return -1;
  }
  return 0;
}

function compararCrescente(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function criarComparador(campos) {
  return (a, b) => {
    for (const campo of campos) {
      const resultado = compararDecrescente(a[campo], b[campo]);
      if (resultado !== 0) {
        return resultado;
      }
    }

    return compararCrescente(a.nome, b.nome);
  };
}

export const CRITERIOS = Object.freeze({
  kd: Object.freeze({
    rotulo: "K/D",
    descricao:
      "Maior K/D primeiro; empates por taxa de vitória, ADR, pontuação e nome.",
    comparar: criarComparador(["kd", "taxaVitoria", "adr", "pontuacao"]),
  }),
  taxaVitoria: Object.freeze({
    rotulo: "Taxa de vitória",
    descricao:
      "Maior taxa de vitória primeiro; empates por K/D, ADR, pontuação e nome.",
    comparar: criarComparador(["taxaVitoria", "kd", "adr", "pontuacao"]),
  }),
  adr: Object.freeze({
    rotulo: "ADR",
    descricao: "Maior ADR primeiro; empates por K/D, taxa de vitória, pontuação e nome.",
    comparar: criarComparador(["adr", "kd", "taxaVitoria", "pontuacao"]),
  }),
  pontuacao: Object.freeze({
    rotulo: "Pontuação",
    descricao: "Maior pontuação primeiro; empates por K/D, taxa de vitória, ADR e nome.",
    comparar: criarComparador(["pontuacao", "kd", "taxaVitoria", "adr"]),
  }),
});

export function obterCriterio(nome) {
  const criterio = CRITERIOS[nome];
  if (!criterio) {
    throw new RangeError(`Critério desconhecido: ${nome}`);
  }
  return criterio;
}

export function listarCriterios() {
  return Object.keys(CRITERIOS);
}