import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button, Icon, Input, ListItem } from "@rneui/themed";
import { useReceipts } from "../contexts/ReceiptContext";
import { Colors, TextStyles } from "../components/CupertinoStyles";
import CupertinoTextInput from "../components/CupertinoTextInput";

export default function ReceiptConfirmationScreen({ route, navigation }) {
  const { receipt: initialReceipt, groupId } = route.params;
  const [receipt, setReceipt] = useState(initialReceipt);
  const [loading, setLoading] = useState(false);
  const { saveReceipt } = useReceipts();
  const [totalCalculated, setTotalCalculated] = useState(0);

  useEffect(() => {
    calculateTotal();
  }, [receipt.items, receipt.tax, receipt.tip]);

  const calculateTotal = () => {
    const subtotal = receipt.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const total = subtotal + (receipt.tax || 0) + (receipt.tip || 0);
    setTotalCalculated(total);
    setReceipt((prev) => ({ ...prev, subtotal, total }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const savedReceipt = await saveReceipt({ ...receipt, groupId });
      navigation.navigate("ReceiptSplit", {
        receipt: savedReceipt,
        groupId,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to save receipt");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...receipt.items];
    newItems[index] = { ...newItems[index], [field]: parseFloat(value) || 0 };
    if (field === "unitPrice" || field === "quantity") {
      newItems[index].total =
        newItems[index].unitPrice * newItems[index].quantity;
    }
    setReceipt({ ...receipt, items: newItems });
  };

  const addItem = () => {
    setReceipt({
      ...receipt,
      items: [
        ...receipt.items,
        { name: "", quantity: 1, unitPrice: 0, total: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = receipt.items.filter((_, i) => i !== index);
    setReceipt({ ...receipt, items: newItems });
  };

  const renderItem = (item, index) => (
    <ListItem key={index} containerStyle={styles.itemContainer}>
      <ListItem.Content>
        <CupertinoTextInput
          placeholder="Item name"
          value={item.name}
          onChangeText={(value) => updateItem(index, "name", value)}
          containerStyle={styles.itemNameInput}
        />
        <View style={styles.itemDetails}>
          <CupertinoTextInput
            placeholder="Qty"
            value={item.quantity.toString()}
            onChangeText={(value) => updateItem(index, "quantity", value)}
            keyboardType="numeric"
            containerStyle={styles.quantityInput}
          />
          <CupertinoTextInput
            placeholder="Price"
            value={item.unitPrice.toFixed(2)}
            onChangeText={(value) => updateItem(index, "unitPrice", value)}
            keyboardType="numeric"
            containerStyle={styles.priceInput}
            leftIcon={<Text>$</Text>}
          />
          <Text style={styles.itemTotal}>
            ${(item.quantity * item.unitPrice).toFixed(2)}
          </Text>
        </View>
      </ListItem.Content>
      <TouchableOpacity
        onPress={() => removeItem(index)}
        style={styles.removeButton}>
        <Icon name="close" color={Colors.danger} />
      </TouchableOpacity>
    </ListItem>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text h4 style={styles.title}>
            Review Receipt
          </Text>
          <Text style={styles.subtitle}>
            Please verify the details extracted from your receipt
          </Text>
        </View>

        <View style={styles.merchantSection}>
          <CupertinoTextInput
            label="Merchant"
            placeholder="Merchant name"
            value={receipt.merchantName}
            onChangeText={(value) =>
              setReceipt({ ...receipt, merchantName: value })
            }
            leftIcon={
              <Icon
                name="storefront"
                type="material"
                size={24}
                color={Colors.gray}
              />
            }
          />
          <CupertinoTextInput
            label="Date"
            placeholder="Receipt date"
            value={new Date(receipt.date).toLocaleDateString()}
            onChangeText={(value) =>
              setReceipt({ ...receipt, date: new Date(value).toISOString() })
            }
            leftIcon={
              <Icon
                name="calendar"
                type="material"
                size={24}
                color={Colors.gray}
              />
            }
          />
        </View>

        <View style={styles.itemsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <Button
              type="clear"
              icon={{
                name: "add",
                color: Colors.primary,
              }}
              onPress={addItem}
              titleStyle={styles.addButtonTitle}
            />
          </View>
          {receipt.items.map((item, index) => renderItem(item, index))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ${receipt.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <CupertinoTextInput
              value={receipt.tax?.toString() || "0"}
              onChangeText={(value) =>
                setReceipt({ ...receipt, tax: parseFloat(value) || 0 })
              }
              keyboardType="numeric"
              containerStyle={styles.taxInput}
              leftIcon={<Text>$</Text>}
            />
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tip</Text>
            <CupertinoTextInput
              value={receipt.tip?.toString() || "0"}
              onChangeText={(value) =>
                setReceipt({ ...receipt, tip: parseFloat(value) || 0 })
              }
              keyboardType="numeric"
              containerStyle={styles.tipInput}
              leftIcon={<Text>$</Text>}
            />
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.finalTotal]}>Total</Text>
            <Text style={[styles.totalValue, styles.finalTotal]}>
              ${receipt.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue to Split"
          loading={loading}
          onPress={handleSave}
          buttonStyle={styles.continueButton}
          containerStyle={styles.continueButtonContainer}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    ...TextStyles.title2,
    marginBottom: 8,
  },
  subtitle: {
    ...TextStyles.subhead,
    color: Colors.gray,
  },
  merchantSection: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  itemsSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...TextStyles.headline,
  },
  itemContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemNameInput: {
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityInput: {
    width: "25%",
  },
  priceInput: {
    width: "35%",
  },
  itemTotal: {
    ...TextStyles.headline,
    width: "30%",
    textAlign: "right",
  },
  removeButton: {
    padding: 8,
  },
  totalsSection: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    ...TextStyles.headline,
  },
  totalValue: {
    ...TextStyles.headline,
  },
  taxInput: {
    width: "40%",
  },
  tipInput: {
    width: "40%",
  },
  finalTotal: {
    ...TextStyles.title3,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  continueButtonContainer: {
    width: "100%",
  },
});
