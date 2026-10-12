import assert from "node:assert/strict";
import test from "node:test";

import { heapSort } from "../js/algoritmos/heap-sort.js";

function compararNumero(a, b) {
  return a - b;
}

test("heap sort lida com listas vazias e unitárias", () => {
  assert.deepEqual(heapSort([], compararNumero), {
    comparacoes: 0,
    movimentacoes: 0,
    trocas: 0,
  });

  const unico = [42];
  heapSort(unico, compararNumero);
  assert.deepEqual(unico, [42]);
});

test("heap sort produz a mesma ordem que o sort nativo", () => {
  const dados = Array.from({ length: 500 }, (_, indice) =>
    (indice * 7919) % 137,
  );
  const referencia = dados.slice().sort(compararNumero);

  heapSort(dados, compararNumero);

  assert.deepEqual(dados, referencia);
});

test("heap sort lida com listas ordenadas, inversas e com valores repetidos", () => {
  const ordenada = Array.from({ length: 250 }, (_, indice) => indice);
  const inversa = ordenada.slice().reverse();
  const repetida = Array.from({ length: 300 }, (_, indice) => indice % 5);

  for (const dados of [ordenada, inversa, repetida]) {
    const referencia = dados.slice().sort(compararNumero);
    heapSort(dados, compararNumero);
    assert.deepEqual(dados, referencia);
  }
});

test("heap sort contabiliza comparações e movimentações", () => {
  const metricas = heapSort([8, 3, 6, 1, 9, 2, 5], compararNumero);

  assert.ok(metricas.comparacoes > 0);
  assert.ok(metricas.movimentacoes > 0);
  assert.ok(metricas.trocas > 0);
});