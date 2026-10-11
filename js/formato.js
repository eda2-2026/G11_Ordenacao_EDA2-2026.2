export function formatarNumero(valor) {
  return valor.toLocaleString("pt-BR");
}

export function formatarTempo(milissegundos) {
  if (milissegundos >= 1000) {
    return `${(milissegundos / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} s`;
  }

  if (milissegundos >= 1) {
    return `${milissegundos.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} ms`;
  }

  return `${Math.round(milissegundos * 1000).toLocaleString("pt-BR")} µs`;
}

export function formatarPercentual(valor) {
  return `${(valor * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
