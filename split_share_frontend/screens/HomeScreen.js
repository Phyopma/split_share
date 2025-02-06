import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Text, Card, FAB } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";

export default function HomeScreen({ navigation }) {
  const [receipts, setReceipts] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // TODO: Upload image to backend and process receipt
      console.log("Selected image:", result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {receipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text h4 style={styles.emptyStateText}>
              No receipts yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add a receipt
            </Text>
          </View>
        ) : (
          receipts.map((receipt, index) => (
            <Card key={index}>
              <Card.Title>{receipt.merchantName}</Card.Title>
              <Text>Total: ${receipt.total}</Text>
              <Button
                title="View Details"
                onPress={() =>
                  navigation.navigate("ReceiptDetail", { receipt })
                }
              />
            </Card>
          ))
        )}
      </ScrollView>
      <FAB
        placement="right"
        icon={{ name: "add", color: "white" }}
        color="#2089dc"
        onPress={pickImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyStateText: {
    textAlign: "center",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    textAlign: "center",
    color: "#666",
  },
});
