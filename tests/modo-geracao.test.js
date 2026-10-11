import assert from "node:assert/strict";
import test from "node:test";

import { ativarModoGeracao } from "../js/modo-geracao.js";
import { createFakeRankingDocument } from "./helpers/fake-dom.js";

const semEspera = async () => {};

test("modo de geração gera jogadores e mostra a prévia sem ordenação", async () => {
  const fakeDom = createFakeRankingDocument({ quantidade: "120", seed: "7" });
  const modo = ativarModoGeracao(fakeDom.document, { cederControle: semEspera });

  const jogadores = await modo.gerarPrevia();

  assert.equal(jogadores.length, 120);
  assert.match(fakeDom.get("#dataset-status").textContent, /120/);
  assert.match(fakeDom.get("#dataset-status").textContent, /seed 7/);
  assert.equal(fakeDom.get("#ranking-body").children.length, 10);
  assert.match(fakeDom.get("#ranking-status").textContent, /indisponível/);
  assert.match(fakeDom.get("#comparison-status").textContent, /indisponível/);
  assert.match(fakeDom.get("#benchmark-status").textContent, /indisponível/);
});

test("modo de geração valida a quantidade informada", async () => {
  const fakeDom = createFakeRankingDocument({ quantidade: "0" });
  const modo = ativarModoGeracao(fakeDom.document, { cederControle: semEspera });

  const resultado = await modo.gerarPrevia();

  assert.equal(resultado, null);
  assert.match(fakeDom.get("#dataset-status").textContent, /quantidade inteira/);
});
