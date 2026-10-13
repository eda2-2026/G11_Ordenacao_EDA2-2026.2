import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createRankingApp } from "../js/app.js";
import { createFakeRankingDocument } from "./helpers/fake-dom.js";

const semEspera = async () => {};

test("HTML contém todos os controles obrigatórios", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const requiredIds = [
    "dataset-form",
    "dataset-quantity",
    "dataset-seed",
    "generate-dataset",
    "dataset-status",
    "criterion-select",
    "criterion-description",
    "algorithm-select",
    "top-n",
    "run-ranking",
    "ranking-body",
    "metric-time",
    "metric-comparisons",
    "metric-moves",
    "metric-swaps",
    "compare-algorithms",
    "comparison-body",
    "comparison-winner",
    "benchmark-criterion",
    "run-benchmark",
    "benchmark-body",
    "download-benchmark",
  ];

  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /js\/app\.js/);
  assert.match(html, /css\/style\.css/);
});

test("controles começam bloqueados antes de gerar o dataset", () => {
  const fakeDom = createFakeRankingDocument();

  createRankingApp(fakeDom.document, { cederControle: semEspera });

  assert.equal(fakeDom.get("#run-ranking").disabled, true);
  assert.equal(fakeDom.get("#compare-algorithms").disabled, true);
  assert.equal(fakeDom.get("#download-benchmark").disabled, true);
});

test("gerar dataset libera ranking e comparação", async () => {
  const fakeDom = createFakeRankingDocument({ quantidade: "120", seed: "7" });
  const app = createRankingApp(fakeDom.document, { cederControle: semEspera });

  const resultado = await app.gerarDataset();

  assert.equal(resultado.quantidade, 120);
  assert.match(fakeDom.get("#dataset-status").textContent, /120/);
  assert.equal(fakeDom.get("#run-ranking").disabled, false);
  assert.equal(fakeDom.get("#compare-algorithms").disabled, false);
  assert.equal(app.getState().dados.length, 120);
});

test("quantidade inválida mantém o ranking bloqueado", async () => {
  const fakeDom = createFakeRankingDocument({ quantidade: "0" });
  const app = createRankingApp(fakeDom.document, { cederControle: semEspera });

  const resultado = await app.gerarDataset();

  assert.equal(resultado, null);
  assert.match(fakeDom.get("#dataset-status").textContent, /quantidade inteira/);
  assert.equal(fakeDom.get("#run-ranking").disabled, true);
});

test("ranking renderiza o Top N com métricas preenchidas", async () => {
  const fakeDom = createFakeRankingDocument({ quantidade: "150" });
  const app = createRankingApp(fakeDom.document, { cederControle: semEspera });

  await app.gerarDataset();
  fakeDom.get("#top-n").value = "5";
  fakeDom.get("#algorithm-select").value = "quick";

  const resultado = app.executarRanking();
  const corpo = fakeDom.get("#ranking-body");

  assert.equal(corpo.children.length, 5);
  assert.equal(resultado.ordenados.length, 150);
  assert.equal(corpo.children[0].children[0].textContent, "1");
  assert.notEqual(fakeDom.get("#metric-comparisons").textContent, "—");
  assert.match(fakeDom.get("#ranking-status").textContent, /Quick Sort/);
});

test("comparação executa os três algoritmos e aponta o vencedor", async () => {
  const fakeDom = createFakeRankingDocument({ quantidade: "200" });
  const app = createRankingApp(fakeDom.document, { cederControle: semEspera });

  await app.gerarDataset();

  const resultados = app.compararAlgoritmos();

  assert.equal(resultados.length, 3);
  assert.equal(fakeDom.get("#comparison-body").children.length, 3);

  const primeiraLinha = fakeDom.get("#comparison-body").children[0];
  assert.equal(primeiraLinha.children.length, 5);
  assert.equal(primeiraLinha.children[4].children[0].className, "badge badge-no");
  assert.equal(primeiraLinha.children[4].children[0].textContent, "Não");

  assert.ok(resultados.every((resultado) => resultado.correta));
  assert.match(fakeDom.get("#comparison-winner").textContent, /Mais rápido/);
});

test("benchmark usa os tamanhos injetados e libera o download do CSV", async () => {
  const fakeDom = createFakeRankingDocument();
  const app = createRankingApp(fakeDom.document, {
    cederControle: semEspera,
    benchmarkTamanhos: [30, 150],
  });

  const linhas = await app.rodarBenchmark();

  assert.equal(linhas.length, 8);
  assert.equal(fakeDom.get("#benchmark-body").children.length, 8);
  assert.equal(fakeDom.get("#benchmark-body").children[0].children.length, 5);
  assert.equal(fakeDom.get("#download-benchmark").disabled, false);
  assert.match(fakeDom.get("#benchmark-status").textContent, /concluído/);

  const csv = app.baixarBenchmark();

  assert.match(csv, /^tamanho;algoritmo;tempo_ms;comparacoes;movimentacoes;correta/);
});
