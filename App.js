import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  SectionList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./utils/supabase";
import dados from "./assets/dados.json";
import { formatarData, agruparPorData } from "./utils/jogosUtils";
import DiaCard from "./components/DiaCard";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

const Stack = createNativeStackNavigator();
const GRUPOS = ["TODOS", "A", "B", "C", "D", "E", "F", "G", "H"];

function HomeScreen() {
  const [jogos, setJogos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState("TODOS");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarJogos() {
      const jogosJSON = dados.jogos;
      await supabase.from("jogos").upsert(jogosJSON, { onConflict: "id" });

      const { data, error } = await supabase
        .from("jogos")
        .select("*")
        .order("data_brasilia", { ascending: true });

      if (!error) {
        setJogos(data);
      } else {
        console.log("Erro ao carregar jogos:", error.message);
      }

      setCarregando(false);
    }

    async function inserirUsuario() {
      const { data, error } = await supabase.from("usuarios").insert([
        {
          nome: "Ruan",
          ra: "60002797",
          email: "ruanbauer4@gmail.com",
          senha: "123456",
          telefone: "46999805172",
          data_nascimento: "2006-04-18",
        },
      ]);

      if (!error) {
        console.log("Usuário inserido com sucesso!");
      } else {
        console.log("Erro ao inserir usuário:", error);
      }
    }

    carregarJogos();
    inserirUsuario();
  }, []);

  const jogosFiltrados =
    grupoSelecionado === "TODOS"
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
      <Image
        resizeMode="contain"
        style={styles.logo}
        source={require("./assets/unicopa.png")}
      />

      <Text style={styles.title}>CALENDÁRIO</Text>

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
            style={[
              styles.filtroBotao,
              grupoSelecionado === grupo && styles.filtroBotaoAtivo,
            ]}
          >
            <Text
              style={[
                styles.filtroTexto,
                grupoSelecionado === grupo && styles.filtroTextoAtivo,
              ]}
            >
              {grupo === "TODOS" ? "TODOS" : `GRUPO ${grupo}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {carregando ? (
        <Text style={styles.msgInfo}>Carregando jogos...</Text>
      ) : jogos.length === 0 ? (
        <View style={styles.cardVazio}>
          <Text style={styles.cardVazioTexto}>Nenhum jogo carregado</Text>
        </View>
      ) : (
        <SectionList
          sections={jogosTratados}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          renderItem={() => null}
          renderSectionHeader={({ section }) => (
            <DiaCard
              data={section.title}
              jogos={section.data}
              dataISO={section.dataISO}
            />
          )}
        />
      )}
    </ImageBackground>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
  },
  filtroScroll: {
    marginTop: 12,
    marginBottom: 4,
    flexShrink: 0,
    maxHeight: 50,
    width: "100%",
    alignSelf: "center",
  },
  filtroContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
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
    fontSize: 16,
    fontWeight: "600",
  },
  msgInfo: {
    color: "#8fa3b8",
    marginTop: 40,
    fontSize: 14,
  },
});
