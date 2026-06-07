import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ImageBackground, Image,
  SectionList, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { supabase } from "../utils/supabase";
import { formatarData, agruparPorData } from "../utils/jogosUtils";

const FILTROS = ["TODOS", "PENDENTE", "CONFIRMADO"];

export default function MeusPalpitesScreen({ navigation }) {
  const [palpites, setPalpites] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("TODOS");

  useEffect(() => {
    async function carregarPalpites() {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!usuario) {
        setCarregando(false);
        return;
      }

      const { data } = await supabase
        .from("palpites")
        .select("*, jogos(*)")
        .eq("id_usuario", usuario.id)
        .order("id", { ascending: true });

      setPalpites(data || []);
      setCarregando(false);
    }

    carregarPalpites();
  }, []);

  function jogoEncerrado(jogo) {
    if (!jogo) return false;
    const agora = new Date();
    const dataHoraJogo = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}`);
    return agora > dataHoraJogo;
  }

  const palpitesFiltrados = palpites.filter((p) => {
    if (filtro === "TODOS") return true;
    if (filtro === "PENDENTE") return p.situacao === "PENDENTE";
    if (filtro === "CONFIRMADO") return p.situacao !== "PENDENTE" && p.situacao !== null;
    return true;
  });

  // agrupa por data do jogo
  const agrupado = palpitesFiltrados.reduce((acc, p) => {
    const data = p.jogos?.data_brasilia || "sem-data";
    if (!acc[data]) acc[data] = [];
    acc[data].push(p);
    return acc;
  }, {});

  const secoes = Object.keys(agrupado)
    .sort()
    .map((data) => ({
      title: formatarData(data),
      data: agrupado[data],
    }));

  function renderPalpite({ item: p }) {
    const jogo = p.jogos;
    const encerrado = jogoEncerrado(jogo);

    return (
      <View style={[styles.card, encerrado && styles.cardEncerrado]}>
        <View style={styles.cardHeader}>
          <Text style={styles.confronto}>{jogo?.confronto}</Text>
          {encerrado
            ? <Text style={styles.tagEncerrado}>Encerrado</Text>
            : p.situacao === "PENDENTE"
              ? <Text style={styles.tagPendente}>Pendente</Text>
              : <Text style={styles.tagSemStatus}>Não confirmado</Text>
          }
        </View>

        <Text style={styles.horario}>
          {jogo?.hora_brasilia?.substring(0, 5)}h
          {jogo?.grupo ? ` • GRUPO ${jogo.grupo}` : ` • ${jogo?.fase}`}
        </Text>

        <View style={styles.placarContainer}>
          <Text style={styles.placarLabel}>{jogo?.sigla_casa}</Text>
          <View style={styles.placarBox}>
            <Text style={styles.placarNumero}>{p.placar_time_casa}</Text>
          </View>
          <Text style={styles.vs}>X</Text>
          <View style={styles.placarBox}>
            <Text style={styles.placarNumero}>{p.placar_time_fora}</Text>
          </View>
          <Text style={styles.placarLabel}>{jogo?.sigla_fora}</Text>
        </View>
      </View>
    );
  }

  if (carregando) {
    return (
      <ImageBackground style={styles.container} source={require("../assets/bg-overlay.png")}>
        <ActivityIndicator color="#f2cc2f" size="large" style={{ marginTop: 100 }} />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground style={styles.container} source={require("../assets/bg-overlay.png")}>
      <Image resizeMode="contain" style={styles.logo} source={require("../assets/unicopa.png")} />
      <Text style={styles.title}>MEUS PALPITES</Text>

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.botaoVoltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      {/* Filtros */}
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBotao, filtro === f && styles.filtroBotaoAtivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroTexto, filtro === f && styles.filtroTextoAtivo]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {palpitesFiltrados.length === 0 ? (
        <View style={styles.cardVazio}>
          <Text style={styles.cardVazioTexto}>
            {palpites.length === 0
              ? "Você ainda não cadastrou palpites."
              : "Nenhum palpite encontrado para esse filtro."}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPalpite}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={styles.lista}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#040b13",
    alignItems: "center",
  },
  logo: {
    marginTop: 20,
    width: 200,
    height: 50,
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  botaoVoltar: {
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e2d3d",
    backgroundColor: "#0c1b2a",
  },
  botaoVoltarTexto: {
    color: "#8fa3b8",
    fontSize: 13,
  },
  filtros: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  filtroBotao: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e2d3d",
    backgroundColor: "#0c1b2a",
  },
  filtroBotaoAtivo: {
    backgroundColor: "#f2cc2f",
    borderColor: "#f2cc2f",
  },
  filtroTexto: {
    color: "#8fa3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  filtroTextoAtivo: {
    color: "#040b13",
    fontWeight: "bold",
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    width: 352,
  },
  sectionHeader: {
    color: "#f2cc2f",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#0c1b2a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e2d3d",
  },
  cardEncerrado: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  confronto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
  },
  tagPendente: {
    color: "#f2cc2f",
    fontSize: 11,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#f2cc2f",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagEncerrado: {
    color: "#e74c3c",
    fontSize: 11,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagSemStatus: {
    color: "#8fa3b8",
    fontSize: 11,
    borderWidth: 1,
    borderColor: "#1e2d3d",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  horario: {
    color: "#8fa3b8",
    fontSize: 12,
    marginBottom: 10,
  },
  placarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  placarLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    width: 40,
    textAlign: "center",
  },
  placarBox: {
    backgroundColor: "#1e2d3d",
    borderRadius: 8,
    width: 40,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  placarNumero: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  vs: {
    color: "#8fa3b8",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardVazio: {
    marginTop: 40,
    backgroundColor: "#0c1b2a",
    width: 320,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e2d3d",
  },
  cardVazioTexto: {
    color: "#8fa3b8",
    fontSize: 15,
    textAlign: "center",
  },
});