import { ALGORITMOS } from "./ordenacao.js";

function compararDecrescente(a, b) {
  if (a < b) {
    return 1;
  }
  if (a > b) {
    return -1;
  }
  return 0;
}

export function compararSemNome(a, b) {
  return (
    compararDecrescente(a.kd, b.kd) ||
    compararDecrescente(a.taxaVitoria, b.taxaVitoria) ||
    compararDecrescente(a.adr, b.adr)
  );
}

export function criarAmostraEstabilidade() {
  const valoresKd = [2, 1, 3];
  const amostra = [];

  for (let rodada = 0; rodada < 6; rodada += 1) {
    for (let grupo = 0; grupo < valoresKd.length; grupo += 1) {
      const ordem = amostra.length;
      amostra.push({
        nome: `jogador_${String(ordem).padStart(2, "0")}`,
        kd: valoresKd[grupo],
        taxaVitoria: 0.5,
        adr: 70,
        pontuacao: 1000,
        ordem,
      });
    }
  }

  return amostra;
}

function verificarEstabilidade(ordenados, comparar) {
  for (let indice = 0; indice < ordenados.length - 1; indice += 1) {
    if (
      comparar(ordenados[indice], ordenados[indice + 1]) === 0 &&
      ordenados[indice].ordem > ordenados[indice + 1].ordem
    ) {
      return false;
    }
  }

  return true;
}

export function testarEstabilidade() {
  const amostra = criarAmostraEstabilidade();

  return Object.fromEntries(
    Object.entries(ALGORITMOS).map(([id, algoritmo]) => {
      const ordenados = amostra.slice();
      algoritmo.funcao(ordenados, compararSemNome);
      const estavel = verificarEstabilidade(ordenados, compararSemNome);

      return [
        id,
        {
          rotulo: algoritmo.rotulo,
          estavel,
          declarado: algoritmo.estavel,
          coerente: estavel === algoritmo.estavel,
        },
      ];
    }),
  );
}