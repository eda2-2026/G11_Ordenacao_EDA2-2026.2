import assert from "node:assert/strict";
import test from "node:test";

import { quickSort } from "../js/algoritmos/quick-sort.js";
import { ALGORITMOS } from "../js/ordenacao.js";

function compararNumero(a, b) {
  return a - b;
}

test("quick sort lida com listas vazias e unitárias", () => {
  assert.deepEqual(quickSort([], compararNumero), {
    comparacoes: 0,
    movimentacoes: 0,
    trocas: 0,
  });

  const unico = [42];
  quickSort(unico, compararNumero);
  assert.deepEqual(unico, [42]);
});

test("quick sort produz a mesma ordem que o sort nativo", () => {
  const dados = Array.from({ length: 500 }, (_, indice) =>
    (indice * 7919) % 137,
  );
  const referencia = dados.slice().sort(compararNumero);

  quickSort(dados, compararNumero);

  assert.deepEqual(dados, referencia);
});

test("quick sort lida com listas ordenadas, inversas e com valores repetidos", () => {
  const ordenada = Array.from({ length: 250 }, (_, indice) => indice);
  const inversa = ordenada.slice().reverse();
  const repetida = Array.from({ length: 300 }, (_, indice) => indice % 5);

  for (const dados of [ordenada, inversa, repetida]) {
    const referencia = dados.slice().sort(compararNumero);
    quickSort(dados, compararNumero);
    assert.deepEqual(dados, referencia);
  }
});

test("quick sort contabiliza comparações e movimentações", () => {
  const metricas = quickSort([8, 3, 6, 1, 9, 2, 5], compararNumero);

  assert.ok(metricas.comparacoes > 0);
  assert.ok(metricas.movimentacoes > 0);
  assert.ok(metricas.trocas > 0);
});

test("fachada registra os três algoritmos e sua estabilidade", () => {
  assert.deepEqual(Object.keys(ALGORITMOS), ["quick", "merge", "heap"]);
  assert.equal(ALGORITMOS.quick.rotulo, "Quick Sort");
  assert.equal(ALGORITMOS.quick.funcao, quickSort);
  assert.equal(ALGORITMOS.quick.estavel, false);
  assert.equal(ALGORITMOS.merge.rotulo, "Merge Sort");
  assert.equal(ALGORITMOS.merge.estavel, true);
  assert.equal(ALGORITMOS.heap.rotulo, "Heap Sort");
  assert.equal(ALGORITMOS.heap.estavel, false);
});