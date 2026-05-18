import { StyleSheet, Text, View, Image, ImageBackground, SectionList, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";
import GameCard from "./components/GameCard";
import dados from "./assets/dados.json";
import { formatarData, agruparPorData } from "./utils/jogosUtils";
import DiaCard from "./components/DiaCard";

const GRUPOS = ["TODOS", "A", "B", "C", "D", "E", "F", "G", "H"];

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState("TODOS");

  useEffect(() => {
    async function carregarJogos(){
      const { data, error } = await supabase
        .from('jogos')
        .select('*')
        .order('data_brasilia', { ascending: true })

        if(!error){
          setJogos(data)
        }
    }
    carregarJogos();
  }, []);

  const jogosFiltrados = grupoSelecionado === "TODOS"
    ? jogos
    : jogos.filter((jogo) => jogo.grupo === grupoSelecionado);

  const jogosAgrupados = agruparPorData(jogosFiltrados);
  
  const jogosTratados = Object.keys(jogosAgrupados).map((data) => {
    return {
      title: formatarData(data),
      dataISO: data,           
      data: jogosAgrupados[data],
    };
  });

  return (
    <ImageBackground
      style={styles.container}
      source={require("./assets/bg-overlay.png")}
    >
      <Image resizeMode="contain" style={styles.logo} source={require("./assets/unicopa.png")} />

      <Text style={styles.title}>CALENDÁRIO</Text>

      {/* Filtro de grupos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtroScroll}
        contentContainerStyle={styles.filtroContainer}
      >
        {GRUPOS.map((grupo) => (
          <TouchableOpacity
            key={grupo}
            onPress={() => setGrupoSelecionado(grupo)}
            style={[styles.filtroBotao, grupoSelecionado === grupo && styles.filtroBotaoAtivo]}
          >
            <Text style={[styles.filtroTexto, grupoSelecionado === grupo && styles.filtroTextoAtivo]}>
              {grupo === "TODOS" ? "TODOS" : `GRUPO ${grupo}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionList
        sections={jogosTratados}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
        renderItem={() => null}
        renderSectionHeader={({section}) => (
          <DiaCard
            data={section.title}
            jogos={section.data}
            dataISO={section.dataISO}   
          />
        )}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
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
  },
  filtroScroll: {
    marginTop: 12,
    marginBottom: 4,
    maxHeight: 40,
  },
  filtroContainer: {
    paddingHorizontal: 16,
    gap: 8,
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
  card: {
    marginTop: 20,
    backgroundColor: "#0c1b2a",
    width: 320,
    borderRadius: 12,
    padding: 15,
  },
  data: {
    color: "#f2cc2f",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});