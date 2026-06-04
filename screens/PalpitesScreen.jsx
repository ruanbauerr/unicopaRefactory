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
  Modal,
  ScrollView,
} from "react-native";
import { supabase } from "../utils/supabase";

export default function PalpitesScreen({ navigation }) {
  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    async function iniciar() {
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

      setUsuarioId(usuario.id);

      const { data: jogosData } = await supabase
        .from("jogos")
        .select("*")
        .order("data_brasilia", { ascending: true });

      setJogos(jogosData || []);

      // carrega palpites já salvos
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
          situacao: p.situacao,
          confirmado: p.situacao === "PENDENTE",
        };
      });

      const temConfirmado = palpitesData?.some((p) => p.situacao === "PENDENTE");
      if (temConfirmado) setConfirmado(true);

      setPalpites(palpitesMap);
      setCarregando(false);
    }

    iniciar();
  }, []);

  function jogoEncerrado(jogo) {
    const agora = new Date();
    const dataHoraJogo = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}`);
    return agora > dataHoraJogo;
  }

  function atualizarPalpite(jogoId, campo, valor) {
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: {
        ...prev[jogoId],
        [campo]: valor.replace(/[^0-9]/g, ""),
        confirmado: false,
      },
    }));
    setConfirmado(false);
  }

  // palpites preenchidos localmente
  const palpitesPreenchidos = jogos.filter((jogo) => {
    const p = palpites[jogo.id];
    return p && p.casa !== "" && p.fora !== "";
  });

  async function confirmarPalpites() {
    setConfirmando(true);

    for (const jogo of palpitesPreenchidos) {
      const p = palpites[jogo.id];
      const dados = {
        id_usuario: usuarioId,
        id_jogo: jogo.id,
        placar_time_casa: parseInt(p.casa),
        placar_time_fora: parseInt(p.fora),
        situacao: "PENDENTE",
      };

      if (p.id) {
        await supabase
          .from("palpites")
          .update(dados)
          .eq("id", p.id);
      } else {
        const { data } = await supabase
          .from("palpites")
          .insert([dados])
          .select()
          .single();

        if (data) {
          setPalpites((prev) => ({
            ...prev,
            [jogo.id]: { ...prev[jogo.id], id: data.id, confirmado: true },
          }));
        }
      }
    }

    // marca todos como confirmados localmente
    setPalpites((prev) => {
      const atualizado = { ...prev };
      palpitesPreenchidos.forEach((jogo) => {
        atualizado[jogo.id] = { ...atualizado[jogo.id], confirmado: true };
      });
      return atualizado;
    });

    setConfirmando(false);
    setConfirmado(true);
    setModalVisivel(false);
  }

  function renderJogo({ item: jogo }) {
    const encerrado = jogoEncerrado(jogo);
    const palpite = palpites[jogo.id] || { casa: "", fora: "" };

    return (
      <View style={[styles.card, encerrado && styles.cardEncerrado]}>
        <Text style={styles.fase}>
          {jogo.grupo ? `GRUPO ${jogo.grupo} • ` : ""}{jogo.fase}
        </Text>
        <Text style={styles.confronto}>{jogo.confronto}</Text>
        <Text style={styles.horario}>
          {jogo.data_brasilia?.substring(8, 10)}/{jogo.data_brasilia?.substring(5, 7)} às {jogo.hora_brasilia?.substring(0, 5)}
        </Text>

        {encerrado ? (
          <View>
            <Text style={styles.encerradoTexto}>Palpites encerrados</Text>
            {palpite.casa !== "" && (
              <Text style={styles.placarSalvo}>Seu palpite: {palpite.casa} x {palpite.fora}</Text>
            )}
          </View>
        ) : (
          <View>
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
              {palpite.confirmado && (
                <Text style={styles.confirmadoTag}>✓ Confirmado</Text>
              )}
            </View>
          </View>
        )}
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
      <Text style={styles.title}>PALPITES</Text>

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.botaoVoltarTexto}>← Voltar para os jogos</Text>
      </TouchableOpacity>

      {palpitesPreenchidos.length > 0 && (
        <TouchableOpacity
          style={styles.botaoConfirmar}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={styles.botaoConfirmarTexto}>
            🎯 Revisar e Confirmar ({palpitesPreenchidos.length} palpites)
          </Text>
        </TouchableOpacity>
      )}

      {confirmado && (
        <View style={styles.bannerConfirmado}>
          <Text style={styles.bannerTexto}>✓ Palpites confirmados!</Text>
        </View>
      )}

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJogo}
        contentContainerStyle={styles.lista}
      />

      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Revisar Palpites</Text>
            <Text style={styles.modalSubtitulo}>
              Confirme seus {palpitesPreenchidos.length} palpites abaixo:
            </Text>

            <ScrollView style={styles.modalLista}>
              {palpitesPreenchidos.map((jogo) => {
                const p = palpites[jogo.id];
                return (
                  <View key={jogo.id} style={styles.modalItem}>
                    <Text style={styles.modalConfrontoTexto}>{jogo.confronto}</Text>
                    <Text style={styles.modalPlacar}>{p.casa} x {p.fora}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoConfirmarModal}
                onPress={confirmarPalpites}
                disabled={confirmando}
              >
                {confirmando
                  ? <ActivityIndicator color="#040b13" size="small" />
                  : <Text style={styles.botaoConfirmarModalTexto}>Confirmar!</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  botaoConfirmar: {
    backgroundColor: "#f2cc2f",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
  },
  botaoConfirmarTexto: {
    color: "#040b13",
    fontWeight: "bold",
    fontSize: 13,
  },
  bannerConfirmado: {
    backgroundColor: "#0a1f12",
    borderWidth: 1,
    borderColor: "#009c3b",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
  },
  bannerTexto: {
    color: "#009c3b",
    fontWeight: "bold",
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
  confirmadoTag: {
    color: "#009c3b",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  placarSalvo: {
    color: "#8fa3b8",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  encerradoTexto: {
    color: "#8fa3b8",
    fontSize: 12,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#0c1b2a",
    borderRadius: 16,
    padding: 20,
    width: 320,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#1e2d3d",
  },
  modalTitulo: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalSubtitulo: {
    color: "#8fa3b8",
    fontSize: 13,
    marginBottom: 16,
  },
  modalLista: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d3d",
  },
  modalConfrontoTexto: {
    color: "white",
    fontSize: 13,
    flex: 1,
  },
  modalPlacar: {
    color: "#f2cc2f",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  modalBotoes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  botaoCancelar: {
    flex: 1,
    backgroundColor: "#1e2d3d",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  botaoCancelarTexto: {
    color: "#8fa3b8",
    fontWeight: "600",
  },
  botaoConfirmarModal: {
    flex: 1,
    backgroundColor: "#f2cc2f",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  botaoConfirmarModalTexto: {
    color: "#040b13",
    fontWeight: "bold",
  },
});