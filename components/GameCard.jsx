import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { getFlag } from "../constants/flags";
import { supabase } from "../utils/supabase";

const USUARIO_RA = "60002797";

export default function GameCard({ game }) {
  const isBrasil = game.sigla_casa === "BRA" || game.sigla_fora === "BRA";
  const [favoritado, setFavoritado] = useState(false);

  useEffect(() => {
    async function verificarFavorito() {
      const { data } = await supabase
        .from("favoritos")
        .select("id")
        .eq("usuario_ra", USUARIO_RA)
        .eq("jogo_id", game.id)
        .maybeSingle();

      if (data) setFavoritado(true);
    }
    verificarFavorito();
  }, []);

  async function toggleFavorito() {
    if (favoritado) {
      await supabase
        .from("favoritos")
        .delete()
        .eq("usuario_ra", USUARIO_RA)
        .eq("jogo_id", game.id);

      setFavoritado(false);
    } else {
      await supabase
        .from("favoritos")
        .insert([{ usuario_ra: USUARIO_RA, jogo_id: game.id }]);

      setFavoritado(true);
    }
  }

  return (
    <View style={[styles.jogo, isBrasil && styles.jogoBrasil]}>
      <View style={styles.headerLinha}>
        <Text style={styles.grupo}>
          {game.grupo ? `GRUPO ${game.grupo} • ` : ""}
          {game.confronto}
        </Text>
        <TouchableOpacity onPress={toggleFavorito}>
          <Text style={[styles.estrela, favoritado && styles.estrelaAtiva]}>
            {favoritado ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linhaPrincipal}>
        <View style={styles.time}>
          <Image style={styles.bandeira} source={getFlag(game.sigla_casa)} />
          <Text style={styles.sigla}>{game.sigla_casa}</Text>
        </View>

        <View style={styles.horario}>
          <Text style={styles.hora}>{game.hora_brasilia}</Text>
          <Text style={styles.subTitulo}>VS</Text>
        </View>

        <View style={styles.time}>
          <Text style={styles.sigla}>{game.sigla_fora}</Text>
          <Image style={styles.bandeira} source={getFlag(game.sigla_fora)} />
        </View>
      </View>

      <View style={styles.local}>
        <Text style={styles.subTitulo}>{game.estadio}</Text>
        <Text style={styles.subTitulo}>
          {game.cidade} • {game.pais}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d3d",
    paddingBottom: 15,
  },
  jogoBrasil: {
    borderLeftWidth: 3,
    borderLeftColor: "#009c3b",
    paddingLeft: 10,
    backgroundColor: "#0a1f12",
  },
  headerLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  grupo: {
    color: "#8fa3b8",
    fontSize: 12,
  },
  estrela: {
    fontSize: 22,
    color: "#8fa3b8",
  },
  estrelaAtiva: {
    color: "#f2cc2f",
  },
  linhaPrincipal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bandeira: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  sigla: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  horario: {
    alignItems: "center",
  },
  hora: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  local: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subTitulo: {
    color: "#8fa3b8",
    fontSize: 12,
  },
});
