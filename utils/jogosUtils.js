import { supabase } from "./supabase";
import dados from "../assets/dados.json";

export const importarJogosParaSupabase = async () => {
  const jogos = dados.jogos;

  const { error } = await supabase
    .from("jogos")
    .upsert(jogos, { onConflict: "id" });

  if (error) {
    console.log("Erro ao importar jogos:", error.message);
    return { sucesso: false, mensagem: error.message };
  }

  console.log("Jogos importados com sucesso!");
  return { sucesso: true, mensagem: "Jogos importados com sucesso!" };
};

export const formatarData = (data) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
};

export const agruparPorData = (jogos) => {
  const agrupado = jogos.reduce((acc, jogo) => {
    const data = jogo.data_brasilia;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(jogo);
    return acc;
  }, {});

  // ordena os jogos de cada dia por horário crescente
  Object.keys(agrupado).forEach((data) => {
    agrupado[data].sort((a, b) =>
      a.hora_brasilia.localeCompare(b.hora_brasilia)
    );
  });

  return agrupado;
};