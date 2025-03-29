import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text, Button, Card, ListItem, Icon, Divider } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useReceipts } from "../contexts/ReceiptContext";

export default function ReceiptConfirmationScreen({ route, navigation }) {
  const { receipt: initialReceipt, isEditing: initialIsEditing } = route.params;
  const [receipt, setReceipt] = useState(initialReceipt);
  const [isEditing, setIsEditing] = useState(initialIsEditing || false);
  const { saveReceipt } = useReceipts();
  const [saving, setSaving] = useState(false);

  // Ensure numeric values are properly set on component load
  useEffect(() => {
    // Make sure all numeric values are proper numbers, not strings
    const formattedReceipt = {
      ...initialReceipt,
      // Preserve the id if it exists (for updates)
      id: initialReceipt.id || null,
      subtotal: parseFloat(initialReceipt.subtotal) || 0,
      tax: parseFloat(initialReceipt.tax) || 0,
      tip: parseFloat(initialReceipt.tip) || 0,
      total: parseFloat(initialReceipt.total) || 0,
      items: initialReceipt.items.map((item) => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        total: parseFloat(item.total) || 0,
      })),
    };

    // Update the formatted receipt
    setReceipt(formattedReceipt);
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receipt.items];

    if (field === "name") {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    } else if (field === "quantity" || field === "unitPrice") {
      // Store the raw string input first
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      // Only parse it to float for calculation if it's a valid number
      const numericValue =
        value === "" || value === "." ? 0 : parseFloat(value);

      // Recalculate total based on current values
      const qty =
        field === "quantity" ? numericValue : updatedItems[index].quantity || 0;
      const price =
        field === "unitPrice"
          ? numericValue
          : updatedItems[index].unitPrice || 0;

      updatedItems[index].total = parseFloat((qty * price).toFixed(2));
    } else {
      // For other numeric fields
      const numericValue = parseFloat(value) || 0;
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };
    }

    const updatedReceipt = { ...receipt, items: updatedItems };

    // Recalculate subtotal whenever items change
    const subtotal = calculateSubtotal(updatedItems);
    updatedReceipt.subtotal = subtotal;

    // Recalculate total
    updatedReceipt.total = calculateTotal(
      subtotal,
      updatedReceipt.tax,
      updatedReceipt.tip
    );

    setReceipt(updatedReceipt);
  };

  const handleGeneralChange = (field, value) => {
    if (field === "merchantName" || field === "date") {
      setReceipt({ ...receipt, [field]: value });
    } else {
      // For numeric fields like tax, tip, etc.
      const numericValue = parseFloat(value) || 0;
      const updatedReceipt = { ...receipt, [field]: numericValue };

      // Recalculate total whenever tax or tip changes
      if (field === "tax" || field === "tip") {
        updatedReceipt.total = calculateTotal(
          updatedReceipt.subtotal,
          field === "tax" ? numericValue : updatedReceipt.tax,
          field === "tip" ? numericValue : updatedReceipt.tip
        );
      }

      setReceipt(updatedReceipt);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setReceipt({ ...receipt, date: selectedDate.toISOString() });
    }
  };

  // Pure function to calculate subtotal from items
  const calculateSubtotal = (items = receipt.items) => {
    return parseFloat(
      items
        .reduce((sum, item) => {
          const itemTotal =
            typeof item.total === "string" &&
            (item.total === "" || item.total === ".")
              ? 0
              : parseFloat(item.total) || 0;
          return sum + itemTotal;
        }, 0)
        .toFixed(2)
    );
  };

  // Pure function to calculate total
  const calculateTotal = (subtotal, tax, tip) => {
    const taxValue = parseFloat(tax) || 0;
    const tipValue = parseFloat(tip) || 0;
    return parseFloat((subtotal + taxValue + tipValue).toFixed(2));
  };

  const addItem = () => {
    const newItem = {
      name: "New Item",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };

    const updatedItems = [...receipt.items, newItem];
    const subtotal = calculateSubtotal(updatedItems);

    setReceipt({
      ...receipt,
      items: updatedItems,
      subtotal: subtotal,
      total: calculateTotal(subtotal, receipt.tax, receipt.tip),
    });
  };

  const removeItem = (index) => {
    const updatedItems = [...receipt.items];
    updatedItems.splice(index, 1);

    const subtotal = calculateSubtotal(updatedItems);

    setReceipt({
      ...receipt,
      items: updatedItems,
      subtotal: subtotal,
      total: calculateTotal(subtotal, receipt.tax, receipt.tip),
    });
  };

  const confirmReceipt = async () => {
    // Ensure all numeric values are properly parsed
    const finalItems = receipt.items.map((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return {
        // Preserve item id if it exists
        id: item.id || null,
        name: item.name,
        quantity: quantity,
        unitPrice: unitPrice,
        total: parseFloat((quantity * unitPrice).toFixed(2)),
      };
    });

    // Ensure all calculations are final and accurate
    const subtotal = calculateSubtotal(finalItems);
    const tax = parseFloat(receipt.tax) || 0;
    const tip = parseFloat(receipt.tip) || 0;
    const total = calculateTotal(subtotal, tax, tip);

    const finalReceipt = {
      // Preserve existing ID if available (update case)
      id: receipt.id || null,
      ...receipt,
      subtotal: subtotal,
      tax: tax,
      tip: tip,
      total: total,
      items: finalItems,
    };

    // Determine operation type based on receipt ID
    const operationType = finalReceipt.id ? "Update" : "Create";

    Alert.alert(
      `${operationType} Receipt`,
      `${operationType} this receipt and proceed?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setSaving(true);

              // Save receipt using the context function, which handles both create and update
              const result = await saveReceipt(finalReceipt);

              if (result.success) {
                // Navigate back to the home screen
                navigation.navigate("Home");
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to save receipt"
                );
              }
            } catch (error) {
              console.error("Error saving receipt:", error);
              Alert.alert("Error", "An unexpected error occurred");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
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
            <DateTimePicker
              value={new Date(receipt.date)}
              mode="date"
              display="default"
              onChange={handleDateChange}
              style={styles.datePicker}
              themeVariant="light"
              textColor="#000000"
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
                    value={String(item.quantity || "")}
                    onChangeText={(text) =>
                      handleItemChange(index, "quantity", text)
                    }
                    keyboardType="decimal-pad"
                    placeholder="Qty"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={String(item.unitPrice || "")}
                    onChangeText={(text) =>
                      handleItemChange(index, "unitPrice", text)
                    }
                    keyboardType="decimal-pad"
                    placeholder="Price"
                  />
                  <Text style={styles.itemCol}>
                    ${parseFloat(item.total || 0).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Icon name="close" size={20} color="red" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.itemCol, { flex: 2 }]}>{item.name}</Text>
                  <Text style={styles.itemCol}>{item.quantity || 0}</Text>
                  <Text style={styles.itemCol}>
                    ${parseFloat(item.unitPrice || 0).toFixed(2)}
                  </Text>
                  <Text style={styles.itemCol}>
                    ${parseFloat(item.total || 0).toFixed(2)}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${receipt.subtotal.toFixed(2)}</Text>
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
            <Text style={styles.totalAmount}>${receipt.total.toFixed(2)}</Text>
          </View>
        </View>

        <Button
          title="Confirm Receipt"
          containerStyle={styles.confirmButton}
          buttonStyle={styles.primaryButton}
          onPress={confirmReceipt}
          loading={saving}
          disabled={saving}
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
  datePickerContainer: {
    alignSelf: "flex-start",
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#3498db",
  },
  datePicker: {
    paddingVertical: 4,
    marginLeft: -20,
  },
});
