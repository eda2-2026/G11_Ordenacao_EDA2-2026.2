import { criarMetricas, trocar } from "./comum.js";

export function quickSort(a, comparar) {
  const metricas = criarMetricas();

  if (a.length < 2) {
    return metricas;
  }

  const pilha = [[0, a.length - 1]];

  while (pilha.length > 0) {
    let [inicio, fim] = pilha.pop();

    while (inicio < fim) {
      const pivo = a[Math.floor((inicio + fim) / 2)];
      let esquerda = inicio;
      let direita = fim;

      while (esquerda <= direita) {
        while (esquerda <= direita) {
          metricas.comparacoes += 1;
          if (comparar(a[esquerda], pivo) >= 0) {
            break;
          }
          esquerda += 1;
        }

        while (esquerda <= direita) {
          metricas.comparacoes += 1;
          if (comparar(a[direita], pivo) <= 0) {
            break;
          }
          direita -= 1;
        }

        if (esquerda <= direita) {
          if (esquerda !== direita) {
            trocar(a, esquerda, direita, metricas);
          }
          esquerda += 1;
          direita -= 1;
        }
      }

      const tamanhoEsquerda = direita - inicio;
      const tamanhoDireita = fim - esquerda;

      if (tamanhoEsquerda < tamanhoDireita) {
        if (esquerda < fim) {
          pilha.push([esquerda, fim]);
        }
        fim = direita;
      } else {
        if (inicio < direita) {
          pilha.push([inicio, direita]);
        }
        inicio = esquerda;
      }
    }
  }

  return metricas;
}