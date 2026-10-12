import assert from "node:assert/strict";
import test from "node:test";

import {
  executarBenchmark,
  linhasParaCsv,
  TAMANHOS_PADRAO,
} from "../js/benchmark.js";

const semEspera = async () => {};

test("define os tamanhos padrão de escala do benchmark", () => {
  assert.deepEqual(TAMANHOS_PADRAO, [100, 10_000, 1_000_000]);
  assert.ok(Object.isFrozen(TAMANHOS_PADRAO));
});

test("executa três algoritmos e a referência nativa para cada tamanho", async () => {
  const eventos = [];
  const linhas = await executarBenchmark({
    tamanhos: [30, 150],
    criterio: "kd",
    aoProgresso: (evento) => eventos.push(evento),
    cederControle: semEspera,
  });

  assert.equal(linhas.length, 8);
  assert.deepEqual(
    linhas.filter((linha) => linha.tamanho === 30).map((linha) => linha.algoritmo),
    ["quick", "merge", "heap", "nativo"],
  );
  assert.ok(linhas.every((linha) => linha.correta));
  assert.ok(linhas.slice(0, 3).every((linha) => linha.comparacoes > 0));
  assert.ok(linhas.slice(0, 3).every((linha) => linha.movimentacoes >= 0));

  const nativo = linhas.find((linha) => linha.algoritmo === "nativo");
  assert.equal(nativo.rotulo, "Array.sort (nativo)");
  assert.equal(nativo.comparacoes, null);
  assert.equal(nativo.movimentacoes, null);
  assert.ok(eventos.some((evento) => evento.fase === "geracao"));
  assert.ok(eventos.some((evento) => evento.fase === "ordenacao"));
});

test("benchmark é reproduzível para a mesma seed e critério", async () => {
  const opcoes = { tamanhos: [80], criterio: "pontuacao", cederControle: semEspera };
  const primeiraExecucao = await executarBenchmark(opcoes);
  const segundaExecucao = await executarBenchmark(opcoes);

  assert.deepEqual(
    primeiraExecucao.map((linha) => [linha.algoritmo, linha.correta]),
    segundaExecucao.map((linha) => [linha.algoritmo, linha.correta]),
  );
});

test("executarBenchmark rejeita tamanhos inválidos", async () => {
  await assert.rejects(executarBenchmark({ tamanhos: [10, 0] }), {
    name: "RangeError",
    message: "Os tamanhos do benchmark devem ser inteiros positivos.",
  });
});

test("linhasParaCsv exporta cabeçalho, métricas ausentes e campos escapados", () => {
  const csv = linhasParaCsv([
    {
      tamanho: 100,
      algoritmo: 'Nativo; "JS"',
      rotulo: "Nativo",
      tempoMs: 1.25,
      comparacoes: null,
      movimentacoes: null,
      correta: true,
    },
  ]);

  assert.equal(
    csv,
    "tamanho;algoritmo;tempo_ms;comparacoes;movimentacoes;correta\n" +
      '100;"Nativo; ""JS""";1.25;;;true',
  );
});