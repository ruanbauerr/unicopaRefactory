import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../utils/supabase";

export default function PalpitesScreen({ navigation }) {
  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState({});
  const [mensagens, setMensagens] = useState({});

  useEffect(() => {
    async function iniciar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!usuario) {
        console.log("Usuário não encontrado na tabela usuarios");
        setCarregando(false);
        return;
      }

      setUsuarioId(usuario.id);

      const { data: jogosData } = await supabase
        .from("jogos")
        .select("*")
        .order("data_brasilia", { ascending: true });

      setJogos(jogosData || []);

      const { data: palpitesData } = await supabase
        .from("palpites")
        .select("*")
        .eq("id_usuario", usuario.id);

      const palpitesMap = {};
      palpitesData?.forEach((p) => {
        palpitesMap[p.id_jogo] = {
          id: p.id,
          casa: String(p.placar_time_casa ?? ""),
          fora: String(p.placar_time_fora ?? ""),
        };
      });
      setPalpites(palpitesMap);
      setCarregando(false);
    }

    iniciar();
  }, []);

  function jogoEncerrado(jogo) {
    const agora = new Date();
    const dataHoraJogo = new Date(
      `${jogo.data_brasilia}T${jogo.hora_brasilia}`,
    );
    return agora > dataHoraJogo;
  }

  function atualizarPalpite(jogoId, campo, valor) {
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: {
        ...prev[jogoId],
        [campo]: valor.replace(/[^0-9]/g, ""),
      },
    }));
  }

  async function salvarPalpite(jogo) {
    const palpite = palpites[jogo.id];
    if (!palpite || palpite.casa === "" || palpite.fora === "") {
      setMensagens((prev) => ({
        ...prev,
        [jogo.id]: "Preencha os dois placares!",
      }));
      return;
    }

    setSalvando((prev) => ({ ...prev, [jogo.id]: true }));

    const dados = {
      id_usuario: usuarioId,
      id_jogo: jogo.id,
      placar_time_casa: parseInt(palpite.casa),
      placar_time_fora: parseInt(palpite.fora),
    };

    let error;

    if (palpite.id) {
      ({ error } = await supabase
        .from("palpites")
        .update(dados)
        .eq("id", palpite.id));
    } else {
      const { data, error: insertError } = await supabase
        .from("palpites")
        .insert([dados])
        .select()
        .single();
      error = insertError;
      if (data) {
        setPalpites((prev) => ({
          ...prev,
          [jogo.id]: { ...prev[jogo.id], id: data.id },
        }));
      }
    }

    setSalvando((prev) => ({ ...prev, [jogo.id]: false }));
    setMensagens((prev) => ({
      ...prev,
      [jogo.id]: error ? "Erro ao salvar!" : "Palpite salvo! ✓",
    }));

    setTimeout(() => {
      setMensagens((prev) => ({ ...prev, [jogo.id]: "" }));
    }, 3000);
  }

  function renderJogo({ item: jogo }) {
    const encerrado = jogoEncerrado(jogo);
    const palpite = palpites[jogo.id] || { casa: "", fora: "" };
    const estaSalvando = salvando[jogo.id];
    const mensagem = mensagens[jogo.id];

    return (
      <View style={[styles.card, encerrado && styles.cardEncerrado]}>
        <Text style={styles.fase}>
          {jogo.grupo ? `GRUPO ${jogo.grupo} • ` : ""}
          {jogo.fase}
        </Text>
        <Text style={styles.confronto}>{jogo.confronto}</Text>
        <Text style={styles.horario}>
          {jogo.data_brasilia?.substring(8, 10)}/
          {jogo.data_brasilia?.substring(5, 7)} às{" "}
          {jogo.hora_brasilia?.substring(0, 5)}
        </Text>

        {encerrado ? (
          <Text style={styles.encerradoTexto}>Palpites encerrados</Text>
        ) : (
          <View style={styles.placarContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={2}
              value={palpite.casa}
              onChangeText={(v) => atualizarPalpite(jogo.id, "casa", v)}
              placeholder="0"
              placeholderTextColor="#8fa3b8"
            />
            <Text style={styles.vs}>X</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={2}
              value={palpite.fora}
              onChangeText={(v) => atualizarPalpite(jogo.id, "fora", v)}
              placeholder="0"
              placeholderTextColor="#8fa3b8"
            />
            <TouchableOpacity
              style={styles.botao}
              onPress={() => salvarPalpite(jogo)}
              disabled={estaSalvando}
            >
              {estaSalvando ? (
                <ActivityIndicator color="#040b13" size="small" />
              ) : (
                <Text style={styles.botaoTexto}>
                  {palpite.id ? "Atualizar" : "Salvar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {mensagem ? (
          <Text
            style={[
              styles.mensagem,
              mensagem.includes("Erro") || mensagem.includes("Preencha")
                ? styles.mensagemErro
                : styles.mensagemSucesso,
            ]}
          >
            {mensagem}
          </Text>
        ) : null}
      </View>
    );
  }

  if (carregando) {
    return (
      <ImageBackground
        style={styles.container}
        source={require("../assets/bg-overlay.png")}
      >
        <ActivityIndicator
          color="#f2cc2f"
          size="large"
          style={{ marginTop: 100 }}
        />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/bg-overlay.png")}
    >
      <Image
        resizeMode="contain"
        style={styles.logo}
        source={require("../assets/unicopa.png")}
      />
      <Text style={styles.title}>PALPITES</Text>

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botaoVoltarTexto}>← Voltar para os jogos</Text>
      </TouchableOpacity>

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJogo}
        contentContainerStyle={styles.lista}
      />
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
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    width: 352,
  },
  card: {
    backgroundColor: "#0c1b2a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e2d3d",
  },
  cardEncerrado: {
    opacity: 0.6,
  },
  fase: {
    color: "#8fa3b8",
    fontSize: 11,
    marginBottom: 4,
  },
  confronto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  horario: {
    color: "#f2cc2f",
    fontSize: 12,
    marginBottom: 10,
  },
  placarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    backgroundColor: "#1e2d3d",
    color: "white",
    borderRadius: 8,
    width: 44,
    height: 40,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  vs: {
    color: "#8fa3b8",
    fontWeight: "bold",
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#f2cc2f",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
    justifyContent: "center",
    marginLeft: 8,
  },
  botaoTexto: {
    color: "#040b13",
    fontWeight: "bold",
    fontSize: 13,
  },
  encerradoTexto: {
    color: "#8fa3b8",
    fontSize: 12,
    fontStyle: "italic",
  },
  mensagem: {
    fontSize: 12,
    marginTop: 8,
  },
  mensagemSucesso: {
    color: "#009c3b",
  },
  mensagemErro: {
    color: "#e74c3c",
  },
});
