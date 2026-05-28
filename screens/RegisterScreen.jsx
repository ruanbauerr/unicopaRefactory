import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ImageBackground, ActivityIndicator, ScrollView
} from "react-native";
import { supabase } from "../utils/supabase";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function validar() {
    if (!email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos obrigatórios.");
      return false;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      setErro("Informe um e-mail válido.");
      return false;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return false;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return false;
    }
    return true;
  }

  async function handleRegistro() {
    setErro("");
    if (!validar()) return;

    setCarregando(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
      },
    });
    setCarregando(false);

    if (error) {
      setErro("Erro ao cadastrar. Tente novamente.");
    } else {
      setSucesso(true);
    }
  }

  if (sucesso) {
    return (
      <ImageBackground
        style={styles.container}
        source={require("../assets/bg-overlay.png")}
      >
        <Image resizeMode="contain" style={styles.logo} source={require("../assets/unicopa.png")} />

        <View style={styles.caixaSucesso}>
          <Text style={styles.sucessoIcone}>✓</Text>
          <Text style={styles.sucessoTitulo}>Cadastro realizado!</Text>
          <Text style={styles.sucessoTexto}>
            Verifique seu e-mail para confirmar o cadastro antes de fazer login.
          </Text>
          <TouchableOpacity style={styles.botao} onPress={() => navigation.replace("Login")}>
            <Text style={styles.botaoTexto}>IR PARA O LOGIN</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/bg-overlay.png")}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image resizeMode="contain" style={styles.logo} source={require("../assets/unicopa.png")} />

        <Text style={styles.titulo}>CADASTRO</Text>

        <View style={styles.formulario}>
          <TextInput
            style={styles.input}
            placeholder="Nome (opcional)"
            placeholderTextColor="#8fa3b8"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail *"
            placeholderTextColor="#8fa3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha * (mín. 6 caracteres)"
            placeholderTextColor="#8fa3b8"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar senha *"
            placeholderTextColor="#8fa3b8"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={styles.botao}
            onPress={handleRegistro}
            disabled={carregando}
          >
            {carregando
              ? <ActivityIndicator color="#040b13" />
              : <Text style={styles.botaoTexto}>CADASTRAR</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.linkLogin}>Já tem conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#040b13",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    width: "100%",
    maxWidth: 320,
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
  linkLogin: {
    color: "#8fa3b8",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
  caixaSucesso: {
    margin: 40,
    backgroundColor: "#0c1b2a",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#1e2d3d",
  },
  sucessoIcone: {
    fontSize: 48,
    color: "#009c3b",
  },
  sucessoTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  sucessoTexto: {
    color: "#8fa3b8",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
  },
});