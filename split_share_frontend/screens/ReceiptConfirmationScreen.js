import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Card, ListItem, Icon, Divider } from "@rneui/themed";

export default function ReceiptConfirmationScreen({ route, navigation }) {
  const { receipt: initialReceipt } = route.params;
  const [receipt, setReceipt] = useState(initialReceipt);
  const [isEditing, setIsEditing] = useState(false);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receipt.items];

    if (field === "name") {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    } else {
      // Convert to number for quantity, unitPrice and total
      const numericValue = parseFloat(value) || 0;
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };
    }

    // Recalculate total if quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      const qty = updatedItems[index].quantity || 0;
      const price = updatedItems[index].unitPrice || 0;
      updatedItems[index].total = qty * price;
    }

    setReceipt({ ...receipt, items: updatedItems });
  };

  const handleGeneralChange = (field, value) => {
    if (field === "merchantName" || field === "date") {
      setReceipt({ ...receipt, [field]: value });
    } else {
      // For numeric fields like tax, tip, etc.
      setReceipt({ ...receipt, [field]: parseFloat(value) || 0 });
    }
  };

  const handleDateChange = (text) => {
    try {
      // Try to parse the date input
      const newDate = new Date(text);
      if (!isNaN(newDate.getTime())) {
        setReceipt({ ...receipt, date: newDate.toISOString() });
      }
    } catch (error) {
      console.error("Invalid date format:", error);
      // Keep the existing date if parsing fails
    }
  };

  const calculateSubtotal = () => {
    const subtotal = receipt.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    return subtotal;
  };

  const recalculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = receipt.tax || 0;
    const tip = receipt.tip || 0;
    return subtotal + tax + tip;
  };

  const updateTotals = () => {
    const subtotal = calculateSubtotal();
    const total = recalculateTotal();
    setReceipt({
      ...receipt,
      subtotal,
      total,
    });
  };

  const confirmReceipt = () => {
    // Final update of all calculated fields
    updateTotals();

    Alert.alert("Confirm Receipt", "Save this receipt and proceed?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          navigation.navigate("ReceiptDetail", { receipt: receipt });
        },
      },
    ]);
  };

  const addItem = () => {
    const newItem = {
      name: "New Item",
      quantity: "1",
      unitPrice: "0.00",
      total: "0.00",
    };
    setReceipt({
      ...receipt,
      items: [...receipt.items, newItem],
    });
  };

  const removeItem = (index) => {
    const updatedItems = [...receipt.items];
    updatedItems.splice(index, 1);
    setReceipt({
      ...receipt,
      items: updatedItems,
    });
    setTimeout(updateTotals, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.headerRow}>
          <Card.Title style={styles.title}>Confirm Receipt</Card.Title>
          <Button
            type="clear"
            icon={<Icon name={isEditing ? "check" : "edit"} size={24} />}
            onPress={() => setIsEditing(!isEditing)}
          />
        </View>

        <View style={styles.merchantSection}>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={receipt.merchantName}
              onChangeText={(text) => handleGeneralChange("merchantName", text)}
              placeholder="Merchant Name"
            />
          ) : (
            <Text style={styles.merchantName}>{receipt.merchantName}</Text>
          )}

          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={new Date(receipt.date).toLocaleDateString()}
              onChangeText={handleDateChange}
              placeholder="Date (MM/DD/YYYY)"
            />
          ) : (
            <Text style={styles.date}>
              {new Date(receipt.date).toLocaleDateString()}
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            {isEditing && (
              <Button
                type="clear"
                icon={<Icon name="add" size={24} />}
                onPress={addItem}
              />
            )}
          </View>

          <View style={styles.itemHeader}>
            <Text style={[styles.itemCol, { flex: 2 }]}>Item</Text>
            <Text style={styles.itemCol}>Qty</Text>
            <Text style={styles.itemCol}>Price</Text>
            <Text style={styles.itemCol}>Total</Text>
            {isEditing && <Text style={{ width: 40 }}></Text>}
          </View>

          {receipt.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {isEditing ? (
                <>
                  <TextInput
                    style={[styles.editInput, { flex: 2 }]}
                    value={item.name}
                    onChangeText={(text) =>
                      handleItemChange(index, "name", text)
                    }
                    placeholder="Item name"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={String(item.quantity)}
                    onChangeText={(text) =>
                      handleItemChange(index, "quantity", text)
                    }
                    keyboardType="numeric"
                    placeholder="Qty"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={String(item.unitPrice)}
                    onChangeText={(text) =>
                      handleItemChange(index, "unitPrice", text)
                    }
                    keyboardType="numeric"
                    placeholder="Price"
                  />
                  <Text style={styles.itemCol}>${item.total.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Icon name="close" size={20} color="red" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.itemCol, { flex: 2 }]}>{item.name}</Text>
                  <Text style={styles.itemCol}>{item.quantity}</Text>
                  <Text style={styles.itemCol}>
                    ${item.unitPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.itemCol}>${item.total.toFixed(2)}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${calculateSubtotal().toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Tax:</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={String(receipt.tax)}
                onChangeText={(text) => handleGeneralChange("tax", text)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            ) : (
              <Text>${receipt.tax.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.totalRow}>
            <Text>Tip:</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={String(receipt.tip || 0)}
                onChangeText={(text) => handleGeneralChange("tip", text)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            ) : (
              <Text>${(receipt.tip || 0).toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              ${recalculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        <Button
          title="Confirm Receipt"
          containerStyle={styles.confirmButton}
          buttonStyle={styles.primaryButton}
          onPress={confirmReceipt}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    textAlign: "left",
    marginBottom: 0,
  },
  merchantSection: {
    marginBottom: 15,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  date: {
    color: "#666",
    fontSize: 14,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: "#e0e0e0",
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  editInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#3498db",
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    fontSize: 14,
  },
  totalsSection: {
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2089dc",
  },
  confirmButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 12,
    backgroundColor: "#2089dc",
  },
});
