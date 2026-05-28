import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../utils/supabase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validar() {
    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return false;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      setErro("Informe um e-mail válido.");
      return false;
    }
    return true;
  }

  async function handleLogin() {
    setErro("");
    if (!validar()) return;

    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
    } else {
      navigation.replace("Home");
    }
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

      <Text style={styles.titulo}>LOGIN</Text>

      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#8fa3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#8fa3b8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={styles.botao}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#040b13" />
          ) : (
            <Text style={styles.botaoTexto}>ENTRAR</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace("Register")}>
          <Text style={styles.linkCadastro}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%", // ← adiciona isso
    backgroundColor: "#040b13",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 30,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 30,
  },
  formulario: {
    width: 320,
    gap: 12,
  },
  input: {
    backgroundColor: "#0c1b2a",
    borderWidth: 1,
    borderColor: "#1e2d3d",
    borderRadius: 10,
    padding: 14,
    color: "white",
    fontSize: 14,
  },
  erro: {
    color: "#e74c3c",
    fontSize: 13,
    textAlign: "center",
  },
  botao: {
    backgroundColor: "#f2cc2f",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  botaoTexto: {
    color: "#040b13",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkCadastro: {
    color: "#8fa3b8",
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
  },
});
