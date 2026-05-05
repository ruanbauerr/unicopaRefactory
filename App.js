import { StyleSheet, Text, View, Image, ImageBackground, SectionList } from "react-native";
import GameCard from "./components/GameCard";
import dados from "./assets/dados.json";
import { formatarData } from "./constants/formatData";

export default function App() {
  const jogos = dados.jogos;

  const agruparPorData = (jogos) => {
    return jogos.reduce((acc, jogo) => {
      const data = jogo.data_brasilia;
      if (!acc[data]) {
        acc[data] = [];
      }
      acc[data].push(jogo);

      return acc;
    }, {});
  };

  const jogosAgrupados = agruparPorData(jogos);
  
  const jogosTratados = Object.keys(jogosAgrupados).map((data) =>{
    return {
       title: formatarData(data),
      data: jogosAgrupados[data],
    };
  });

 

  return (
    <ImageBackground
      style={styles.container}
      source={require("./assets/bg-overlay.png")}
    >
      <Image style={styles.logo} source={require("./assets/unicopa.png")} />

      <Text style={styles.title}>CALENDÁRIO</Text>

      <SectionList
      sections={jogosTratados}
      keyExtractor={(item, index) => item?.id ? item.id.toString() : index}
      renderItem= {()=> null}
      renderSectionHeader={({section}) => (
        <View style={styles.card}>
          <Text style={styles.data}>{section.title}</Text>
            {
              section.data.map((jogo) => (
                <GameCard key={jogo.id} game={jogo} />
              ))
            }
          
        </View>
      )
    
    }


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
    resizeMode: "contain",
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
