export function criarJogador(nome, kills, deaths, vitorias, partidas, adr, pontuacao) {
  return {
    nome,
    kills,
    deaths,
    vitorias,
    partidas,
    adr,
    pontuacao,
    kd: deaths > 0 ? kills / deaths : kills,
    taxaVitoria: partidas > 0 ? vitorias / partidas : 0,
  };
}
