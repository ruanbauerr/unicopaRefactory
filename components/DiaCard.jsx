import { View, Text, StyleSheet } from "react-native";
import GameCard from "./GameCard";

export default function DiaCard({ data, jogos, dataISO }) {
  const hoje = new Date();
  const dataJogo = new Date(dataISO);

  const ehHoje =
    hoje.getDate() === dataJogo.getDate() &&
    hoje.getMonth() === dataJogo.getMonth() &&
    hoje.getFullYear() === dataJogo.getFullYear();

  return (
    <View style={[styles.card, ehHoje && styles.cardHoje]}>
      <View style={styles.headerData}>
        <Text style={[styles.data, ehHoje && styles.dataHoje]}>{data}</Text>
        {ehHoje && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HOJE</Text>
          </View>
        )}
      </View>
      {jogos.map((jogo) => (
        <GameCard key={jogo.id} game={jogo} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: "#0c1b2a",
    width: 320,
    borderRadius: 12,
    padding: 15,
  },
  cardHoje: {
    borderWidth: 2,
    borderColor: "#f2cc2f",
    backgroundColor: "#0f2235",
  },
  headerData: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  data: {
    color: "#f2cc2f",
    fontSize: 22,
    fontWeight: "bold",
  },
  dataHoje: {
    color: "#f2cc2f",
    fontSize: 24,
  },
  badge: {
    backgroundColor: "#f2cc2f",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#040b13",
    fontWeight: "bold",
    fontSize: 11,
  },
});