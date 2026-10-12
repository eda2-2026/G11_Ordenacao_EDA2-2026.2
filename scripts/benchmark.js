import { executarBenchmark } from "../js/benchmark.js";

const linhas = await executarBenchmark({
  aoProgresso(evento) {
    if (evento.fase === "geracao") {
      console.log(`Gerando ${evento.tamanho.toLocaleString("pt-BR")} jogadores...`);
      return;
    }

    console.log(
      `Executando ${evento.algoritmo} com ${evento.tamanho.toLocaleString("pt-BR")} jogadores...`,
    );
  },
});

console.table(
  linhas.map((linha) => ({
    tamanho: linha.tamanho.toLocaleString("pt-BR"),
    algoritmo: linha.rotulo,
    tempo_ms: linha.tempoMs.toFixed(2),
    comparacoes: linha.comparacoes?.toLocaleString("pt-BR") ?? "—",
    movimentacoes: linha.movimentacoes?.toLocaleString("pt-BR") ?? "—",
    correta: linha.correta ? "sim" : "não",
  })),
);