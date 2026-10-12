import assert from "node:assert/strict";
import test from "node:test";

import { CRITERIOS, listarCriterios, obterCriterio } from "../js/criterios.js";

function criarJogador(nome, valores = {}) {
  return {
    nome,
    kd: 1,
    taxaVitoria: 0.5,
    adr: 70,
    pontuacao: 1000,
    ...valores,
  };
}

test("registra os quatro critérios usados pela interface", () => {
  assert.deepEqual(listarCriterios(), ["kd", "taxaVitoria", "adr", "pontuacao"]);

  for (const nome of listarCriterios()) {
    const criterio = obterCriterio(nome);
    assert.equal(typeof criterio.rotulo, "string");
    assert.ok(criterio.descricao.length > 0);
    assert.equal(typeof criterio.comparar, "function");
    assert.equal(criterio, CRITERIOS[nome]);
  }
});

test("cada critério ordena o atributo principal em ordem decrescente", () => {
  const valores = {
    kd: [2, 1],
    taxaVitoria: [0.8, 0.4],
    adr: [100, 60],
    pontuacao: [2000, 900],
  };

  for (const [nome, [maior, menor]] of Object.entries(valores)) {
    const jogadorMaior = criarJogador("maior", { [nome]: maior });
    const jogadorMenor = criarJogador("menor", { [nome]: menor });
    const comparar = obterCriterio(nome).comparar;

    assert.ok(comparar(jogadorMaior, jogadorMenor) < 0, `${nome} deve ser decrescente`);
    assert.ok(comparar(jogadorMenor, jogadorMaior) > 0, `${nome} deve ser decrescente`);
  }
});

test("K/D desempata por taxa de vitória, ADR e pontuação", () => {
  const comparar = obterCriterio("kd").comparar;

  assert.ok(
    comparar(
      criarJogador("b", { kd: 2, taxaVitoria: 0.8 }),
      criarJogador("a", { kd: 2, taxaVitoria: 0.6 }),
    ) < 0,
  );
  assert.ok(
    comparar(
      criarJogador("b", { kd: 2, taxaVitoria: 0.8, adr: 90 }),
      criarJogador("a", { kd: 2, taxaVitoria: 0.8, adr: 70 }),
    ) < 0,
  );
  assert.ok(
    comparar(
      criarJogador("b", { kd: 2, taxaVitoria: 0.8, adr: 90, pontuacao: 1500 }),
      criarJogador("a", { kd: 2, taxaVitoria: 0.8, adr: 90, pontuacao: 1200 }),
    ) < 0,
  );
});

test("cada critério aplica seus próprios desempates secundários", () => {
  const desempates = {
    kd: ["taxaVitoria", 0.8],
    taxaVitoria: ["kd", 2],
    adr: ["kd", 2],
    pontuacao: ["kd", 2],
  };

  for (const [nome, [campo, valorMaior]] of Object.entries(desempates)) {
    const comparar = obterCriterio(nome).comparar;
    const jogadorMaior = criarJogador("b", { [campo]: valorMaior });
    const jogadorMenor = criarJogador("a", { [campo]: valorMaior - 0.2 });

    assert.ok(comparar(jogadorMaior, jogadorMenor) < 0, `${nome} deve desempatar por ${campo}`);
  }
});

test("desempates finais usam o nome em ordem crescente", () => {
  const comparar = obterCriterio("kd").comparar;

  assert.ok(comparar(criarJogador("ana"), criarJogador("bia")) < 0);
  assert.equal(comparar(criarJogador("ana"), criarJogador("ana")), 0);
});

test("obterCriterio rejeita identificadores desconhecidos", () => {
  assert.throws(() => obterCriterio("invalido"), {
    name: "RangeError",
    message: "Critério desconhecido: invalido",
  });
});