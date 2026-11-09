import turma from "../../dados/turma.json";

// Os números já vêm no HTML; só o relógio precisa rodar no navegador.
const alvo = Date.parse(turma.proxima_turma);
const unidades = ["cd-days", "cd-hours", "cd-minutes", "cd-seconds"].map(
  (id) => document.getElementById(id),
);

if (unidades.every(Boolean)) {
  let intervalo;
  function atualizar() {
    const segundos = Math.max(0, Math.floor((alvo - Date.now()) / 1000));
    const valores = [
      Math.floor(segundos / 86400),
      Math.floor((segundos % 86400) / 3600),
      Math.floor((segundos % 3600) / 60),
      segundos % 60,
    ];
    unidades.forEach((elemento, indice) => {
      elemento.textContent = String(valores[indice]).padStart(2, "0");
    });
    if (segundos === 0 && intervalo) clearInterval(intervalo);
  }
  atualizar();
  if (alvo > Date.now()) intervalo = setInterval(atualizar, 1000);
}
