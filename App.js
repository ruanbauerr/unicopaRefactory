import { StyleSheet, Text, View, Image, ImageBackground, SectionList } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";
import GameCard from "./components/GameCard";
import dados from "./assets/dados.json";
import { formatarData, agruparPorData } from "./utils/jogosUtils";
import DiaCard from "./components/DiaCard";

export default function App() {
  const [jogos, setJogos] = useState([])

  useEffect(() => {
    async function carregarJogos(){
      const { data, error } = await supabase
        .from('jogos')
        .select('*')
        .order('data_brasilia', { ascending: false })

        if(!error){
          setJogos(data)
        }
    }
    carregarJogos();
  }, []);

  const jogosAgrupados = agruparPorData(jogos);
  
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