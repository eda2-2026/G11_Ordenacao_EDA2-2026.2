export function criarRng(seed) {
  let estado = seed >>> 0;

  return function proximo() {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function criarNormal(aleatorio) {
  let reserva = null;

  return function normal() {
    if (reserva !== null) {
      const valor = reserva;
      reserva = null;
      return valor;
    }

    let u = 0;

    while (u === 0) {
      u = aleatorio();
    }

    const v = aleatorio();
    const raio = Math.sqrt(-2 * Math.log(u));
    const angulo = 2 * Math.PI * v;

    reserva = raio * Math.sin(angulo);
    return raio * Math.cos(angulo);
  };
}

export function inteiroEntre(aleatorio, minimo, maximo) {
  return minimo + Math.floor(aleatorio() * (maximo - minimo + 1));
}
