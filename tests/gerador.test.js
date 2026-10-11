import assert from "node:assert/strict";
import test from "node:test";

import { gerarJogadores } from "../js/gerador.js";

test("a mesma seed gera exatamente os mesmos jogadores", () => {
  const primeira = gerarJogadores(200, { seed: 42 });
  const segunda = gerarJogadores(200, { seed: 42 });

  assert.deepEqual(primeira, segunda);
});

test("seeds diferentes geram dados diferentes", () => {
  const primeira = gerarJogadores(50, { seed: 1 });
  const segunda = gerarJogadores(50, { seed: 2 });

  assert.notDeepEqual(primeira, segunda);
});

test("gera a quantidade solicitada com campos consistentes", () => {
  const jogadores = gerarJogadores(300, { seed: 11 });

  assert.equal(jogadores.length, 300);

  for (const jogador of jogadores) {
    assert.ok(jogador.partidas >= 50 && jogador.partidas <= 2000);
    assert.ok(jogador.deaths >= 300 && jogador.deaths <= 40000);
    assert.ok(jogador.adr >= 10 && jogador.adr <= 180);
    assert.ok(jogador.pontuacao >= 0);
    assert.ok(jogador.vitorias >= 0 && jogador.vitorias <= jogador.partidas);
    assert.ok(Number.isInteger(jogador.kills));
    assert.equal(jogador.kd, jogador.kills / jogador.deaths);
    assert.equal(jogador.taxaVitoria, jogador.vitorias / jogador.partidas);
  }
});

test("K/D arredondado provoca empates nos dados gerados", () => {
  const jogadores = gerarJogadores(1000, { seed: 42 });
  const kds = new Set(jogadores.map((jogador) => jogador.kd));

  assert.ok(kds.size < jogadores.length);
});
