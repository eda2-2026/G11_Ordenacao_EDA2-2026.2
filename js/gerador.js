import { criarJogador } from "./jogador.js";
import { criarNormal, criarRng, inteiroEntre } from "./rng.js";

export const PARAMETROS_PADRAO = Object.freeze({
  kdLogMedia: 0,
  kdLogSigma: 0.35,
  adrMedia: 75,
  adrSigma: 18,
  pontuacaoMedia: 15000,
  pontuacaoSigma: 7000,
  partidasMin: 50,
  partidasMax: 2000,
  mortesMin: 300,
  mortesMax: 40000,
  taxaVitoriaMedia: 0.5,
  taxaVitoriaSigma: 0.08,
});

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function arredondar(valor, casas) {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

export function gerarJogadores(
  quantidade,
  { seed = 42, parametros = PARAMETROS_PADRAO } = {},
) {
  const aleatorio = criarRng(seed);
  const normal = criarNormal(aleatorio);
  const jogadores = new Array(quantidade);

  for (let i = 0; i < quantidade; i += 1) {
    const partidas = inteiroEntre(aleatorio, parametros.partidasMin, parametros.partidasMax);
    const taxaVitoria = limitar(
      parametros.taxaVitoriaMedia + normal() * parametros.taxaVitoriaSigma,
      0,
      1,
    );
    const mortes = inteiroEntre(aleatorio, parametros.mortesMin, parametros.mortesMax);
    const kdAmostrado = limitar(
      Math.exp(parametros.kdLogMedia + normal() * parametros.kdLogSigma),
      0.05,
      3.5,
    );
    const adr = arredondar(
      limitar(parametros.adrMedia + normal() * parametros.adrSigma, 10, 180),
      1,
    );
    const pontuacao = Math.max(
      0,
      Math.round(parametros.pontuacaoMedia + normal() * parametros.pontuacaoSigma),
    );
    const kills = Math.round(mortes * arredondar(kdAmostrado, 2));
    const vitorias = Math.round(partidas * taxaVitoria);
    const nome = `jogador_${String(i).padStart(7, "0")}`;

    jogadores[i] = criarJogador(nome, kills, mortes, vitorias, partidas, adr, pontuacao);
  }

  return jogadores;
}
