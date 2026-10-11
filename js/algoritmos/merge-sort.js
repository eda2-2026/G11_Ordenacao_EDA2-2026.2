import { criarMetricas } from "./comum.js";

function intercalar(a, auxiliar, lo, meio, hi, comparar, metricas) {
  for (let k = lo; k <= hi; k += 1) {
    auxiliar[k] = a[k];
    metricas.movimentacoes += 1;
  }

  let i = lo;
  let j = meio + 1;

  for (let k = lo; k <= hi; k += 1) {
    if (i > meio) {
      a[k] = auxiliar[j];
      j += 1;
    } else if (j > hi) {
      a[k] = auxiliar[i];
      i += 1;
    } else {
      metricas.comparacoes += 1;

      if (comparar(auxiliar[j], auxiliar[i]) < 0) {
        a[k] = auxiliar[j];
        j += 1;
      } else {
        a[k] = auxiliar[i];
        i += 1;
      }
    }

    metricas.movimentacoes += 1;
  }
}

function mergeRecursivo(a, auxiliar, lo, hi, comparar, metricas) {
  if (lo >= hi) {
    return;
  }

  const meio = (lo + hi) >> 1;
  mergeRecursivo(a, auxiliar, lo, meio, comparar, metricas);
  mergeRecursivo(a, auxiliar, meio + 1, hi, comparar, metricas);
  intercalar(a, auxiliar, lo, meio, hi, comparar, metricas);
}

export function mergeSort(a, comparar) {
  const metricas = criarMetricas();
  const total = a.length;

  if (total < 2) {
    return metricas;
  }

  const auxiliar = new Array(total);
  mergeRecursivo(a, auxiliar, 0, total - 1, comparar, metricas);
  return metricas;
}
