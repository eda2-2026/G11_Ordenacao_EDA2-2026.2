import assert from "node:assert/strict";
import test from "node:test";

import { mergeSort } from "../js/algoritmos/merge-sort.js";

function compararNumero(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function comparar(a, b) {
  return (
    compararNumero(b.kd, a.kd) ||
    compararNumero(b.taxaVitoria, a.taxaVitoria) ||
    compararNumero(b.adr, a.adr) ||
    compararNumero(a.nome, b.nome)
  );
}

function compararSemNome(a, b) {
  return (
    compararNumero(b.kd, a.kd) ||
    compararNumero(b.taxaVitoria, a.taxaVitoria) ||
    compararNumero(b.adr, a.adr)
  );
}

function criarAmostra(quantidade, seed = 7) {
  let estado = seed >>> 0;
  const aleatorio = () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
  const jogadores = [];

  for (let i = 0; i < quantidade; i += 1) {
    jogadores.push({
      nome: `jogador_${String(i).padStart(4, "0")}`,
      kd: Math.round(aleatorio() * 250) / 100,
      taxaVitoria: Math.round(aleatorio() * 100) / 100,
      adr: Math.round(aleatorio() * 150),
    });
  }

  return jogadores;
}

function nomes(jogadores) {
  return jogadores.map((jogador) => jogador.nome);
}

test("merge sort lida com listas vazias e unitárias", () => {
  assert.doesNotThrow(() => mergeSort([], comparar));

  const unico = [{ nome: "a", kd: 1, taxaVitoria: 0.5, adr: 70 }];
  mergeSort(unico, comparar);

  assert.deepEqual(nomes(unico), ["a"]);
});

test("merge sort produz a mesma ordem que o sort nativo", () => {
  const dados = criarAmostra(300);
  const referencia = nomes(dados.slice().sort(comparar));
  const copia = dados.slice();

  mergeSort(copia, comparar);

  assert.deepEqual(nomes(copia), referencia);
});

test("merge sort lida com lista já ordenada e com ordem inversa", () => {
  const ordenada = criarAmostra(200).sort(comparar);
  const inversa = ordenada.slice().reverse();
  const referencia = nomes(ordenada);

  const copiaOrdenada = ordenada.slice();
  mergeSort(copiaOrdenada, comparar);
  assert.deepEqual(nomes(copiaOrdenada), referencia);

  const copiaInversa = inversa.slice();
  mergeSort(copiaInversa, comparar);
  assert.deepEqual(nomes(copiaInversa), referencia);
});

test("merge sort lida com muitos empates parciais", () => {
  const dados = [];

  for (let i = 0; i < 200; i += 1) {
    const grupo = i % 4;
    dados.push({
      nome: `empate_${String(i).padStart(3, "0")}`,
      kd: 1 + grupo * 0.1,
      taxaVitoria: 0.5,
      adr: 70 + grupo,
    });
  }

  const referencia = nomes(dados.slice().sort(comparar));
  const copia = dados.slice();

  mergeSort(copia, comparar);

  assert.deepEqual(nomes(copia), referencia);
});

test("merge sort contabiliza comparações e movimentações", () => {
  const metricas = mergeSort(criarAmostra(250), comparar);

  assert.ok(metricas.comparacoes > 0);
  assert.ok(metricas.movimentacoes > 0);
  assert.ok(metricas.trocas >= 0);
});

test("merge sort é estável: empates mantêm a ordem de entrada", () => {
  const dados = [];

  for (let i = 0; i < 120; i += 1) {
    dados.push({
      nome: `baixo_${String(i).padStart(3, "0")}`,
      kd: 1,
      taxaVitoria: 0.5,
      adr: 70,
      ordem: i,
    });
  }

  for (let i = 0; i < 120; i += 1) {
    dados.push({
      nome: `alto_${String(i).padStart(3, "0")}`,
      kd: 2,
      taxaVitoria: 0.5,
      adr: 70,
      ordem: 120 + i,
    });
  }

  mergeSort(dados, compararSemNome);

  for (let i = 0; i < dados.length - 1; i += 1) {
    if (compararSemNome(dados[i], dados[i + 1]) === 0) {
      assert.ok(dados[i].ordem < dados[i + 1].ordem);
    }
  }
});
