import { criarMetricas, trocar } from "./comum.js";

function descer(a, inicio, fim, comparar, metricas) {
  let raiz = inicio;

  while (raiz * 2 + 1 <= fim) {
    let filho = raiz * 2 + 1;
    const filhoDireita = filho + 1;

    if (filhoDireita <= fim) {
      metricas.comparacoes += 1;
      if (comparar(a[filho], a[filhoDireita]) < 0) {
        filho = filhoDireita;
      }
    }

    metricas.comparacoes += 1;
    if (comparar(a[raiz], a[filho]) >= 0) {
      return;
    }

    trocar(a, raiz, filho, metricas);
    raiz = filho;
  }
}

export function heapSort(a, comparar) {
  const metricas = criarMetricas();
  const ultimo = a.length - 1;

  for (let inicio = Math.floor((ultimo - 1) / 2); inicio >= 0; inicio -= 1) {
    descer(a, inicio, ultimo, comparar, metricas);
  }

  for (let fim = ultimo; fim > 0; fim -= 1) {
    trocar(a, 0, fim, metricas);
    descer(a, 0, fim - 1, comparar, metricas);
  }

  return metricas;
}