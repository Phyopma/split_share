import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, ListItem, Button } from "@rneui/themed";

export default function ReceiptDetailScreen({ route, navigation }) {
  const { receipt } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title>{receipt.merchantName}</Card.Title>
        <Text style={styles.date}>{receipt.date}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {receipt.items.map((item, index) => (
            <ListItem key={index} bottomDivider>
              <ListItem.Content>
                <ListItem.Title>{item.description}</ListItem.Title>
                <View style={styles.itemDetails}>
                  <Text>Qty: {item.quantity}</Text>
                  <Text>${item.unitPrice}</Text>
                  <Text style={styles.itemTotal}>${item.total}</Text>
                </View>
              </ListItem.Content>
            </ListItem>
          ))}
        </View>

        <View style={styles.totals}>
          <Text>Subtotal: ${receipt.subtotal}</Text>
          <Text>Tax: ${receipt.tax}</Text>
          <Text style={styles.total}>Total: ${receipt.total}</Text>
        </View>

        <Button
          title="Share Receipt"
          onPress={() => {
            // TODO: Implement share functionality
            console.log("Share receipt:", receipt);
          }}
          containerStyle={styles.shareButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  date: {
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  itemTotal: {
    fontWeight: "bold",
  },
  totals: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  shareButton: {
    marginTop: 20,
  },
});
