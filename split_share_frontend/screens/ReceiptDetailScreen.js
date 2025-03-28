import React from "react";
import { View, StyleSheet, ScrollView, Share, Alert } from "react-native";
import { Text, Card, ListItem, Button, Icon, Divider } from "@rneui/themed";

export default function ReceiptDetailScreen({ route, navigation }) {
  const { receipt } = route.params;

  const shareReceipt = async () => {
    try {
      // Format receipt data for sharing
      const items = receipt.items
        .map(
          (item) =>
            `- ${item.name}: $${item.unitPrice} x ${item.quantity} = $${item.total}`
        )
        .join("\n");

      const shareMessage =
        `Receipt from ${receipt.merchantName}\n` +
        `Date: ${receipt.date}\n\n` +
        `Items:\n${items}\n\n` +
        `Subtotal: $${receipt.subtotal}\n` +
        `Tax: $${receipt.tax}\n` +
        (receipt.tip ? `Tip: $${receipt.tip}\n` : "") +
        `Total: $${receipt.total}`;

      await Share.share({
        message: shareMessage,
        title: `Receipt from ${receipt.merchantName}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share receipt");
      console.error("Share error:", error);
    }
  };

  const editReceipt = () => {
    navigation.navigate("ReceiptConfirmation", { receipt });
  };

  const splitBill = () => {
    // This will be implemented in future updates
    Alert.alert(
      "Coming Soon",
      "Bill splitting functionality will be available in the next update!",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.title}>{receipt.merchantName}</Card.Title>
        <Text style={styles.date}>{receipt.date}</Text>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {receipt.items.map((item, index) => (
            <ListItem
              key={index}
              bottomDivider
              containerStyle={styles.listItem}>
              <ListItem.Content>
                <ListItem.Title style={styles.itemName}>
                  {item.name}
                </ListItem.Title>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemInfo}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemInfo}>${item.unitPrice}</Text>
                  <Text style={styles.itemTotal}>${item.total}</Text>
                </View>
              </ListItem.Content>
            </ListItem>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>${receipt.subtotal}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax</Text>
            <Text>${receipt.tax}</Text>
          </View>
          {receipt.tip && (
            <View style={styles.totalRow}>
              <Text>Tip</Text>
              <Text>${receipt.tip}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>${receipt.total}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Edit"
            icon={
              <Icon
                name="edit"
                color="white"
                size={16}
                style={styles.buttonIcon}
              />
            }
            buttonStyle={[styles.actionButton, styles.editButton]}
            onPress={editReceipt}
          />
          <Button
            title="Share"
            icon={
              <Icon
                name="share"
                color="white"
                size={16}
                style={styles.buttonIcon}
              />
            }
            buttonStyle={[styles.actionButton, styles.shareButton]}
            onPress={shareReceipt}
          />
          <Button
            title="Split Bill"
            icon={
              <Icon
                name="group"
                color="white"
                size={16}
                style={styles.buttonIcon}
              />
            }
            buttonStyle={[styles.actionButton, styles.splitButton]}
            onPress={splitBill}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
  },
  date: {
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: "#e0e0e0",
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  itemName: {
    fontWeight: "500",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  itemInfo: {
    color: "#666",
  },
  itemTotal: {
    fontWeight: "bold",
  },
  totals: {
    marginTop: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2089dc",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  shareButton: {
    backgroundColor: "#2ecc71",
  },
  splitButton: {
    backgroundColor: "#9b59b6",
  },
});
