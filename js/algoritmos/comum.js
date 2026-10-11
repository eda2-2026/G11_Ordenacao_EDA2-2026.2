export function criarMetricas() {
  return { comparacoes: 0, movimentacoes: 0, trocas: 0 };
}

export function trocar(a, i, j, metricas) {
  const temporario = a[i];
  a[i] = a[j];
  a[j] = temporario;
  metricas.trocas += 1;
  metricas.movimentacoes += 3;
}
