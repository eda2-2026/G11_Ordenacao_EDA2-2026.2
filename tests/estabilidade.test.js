import assert from "node:assert/strict";
import test from "node:test";

import {
  compararSemNome,
  criarAmostraEstabilidade,
  testarEstabilidade,
} from "../js/estabilidade.js";

test("a amostra contém grupos empatados e ordem original identificável", () => {
  const amostra = criarAmostraEstabilidade();

  assert.equal(amostra.length, 18);
  assert.deepEqual(
    amostra.map((jogador) => jogador.ordem),
    Array.from({ length: amostra.length }, (_, indice) => indice),
  );
  assert.equal(compararSemNome(amostra[0], amostra[3]), 0);
  assert.notEqual(compararSemNome(amostra[0], amostra[1]), 0);
});

test("compararSemNome ordena por K/D, taxa de vitória e ADR", () => {
  const base = { kd: 1, taxaVitoria: 0.5, adr: 70 };

  assert.ok(compararSemNome({ ...base, kd: 2 }, base) < 0);
  assert.ok(
    compararSemNome({ ...base, taxaVitoria: 0.8 }, base) < 0,
  );
  assert.ok(compararSemNome({ ...base, adr: 90 }, base) < 0);
  assert.equal(compararSemNome({ ...base, nome: "a" }, { ...base, nome: "b" }), 0);
});

test("testarEstabilidade identifica empiricamente os algoritmos", () => {
  const resultados = testarEstabilidade();

  assert.equal(resultados.quick.estavel, false);
  assert.equal(resultados.merge.estavel, true);
  assert.equal(resultados.heap.estavel, false);
  assert.ok(Object.values(resultados).every((resultado) => resultado.coerente));
});

test("testarEstabilidade não altera a amostra reutilizável", () => {
  const antes = criarAmostraEstabilidade();

  testarEstabilidade();

  assert.deepEqual(criarAmostraEstabilidade(), antes);
});