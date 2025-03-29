import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { Button, Text, Card, FAB, Icon } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { useReceipts } from "../contexts/ReceiptContext";
import apiClient from "../utils/apiClient";

export default function HomeScreen({ navigation }) {
  const { user, token, logout } = useAuth();
  const {
    receipts,
    saveReceipt: saveReceiptToContext,
    deleteReceipt: deleteReceiptFromContext,
  } = useReceipts();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Set up the header with logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" type="material" color="#fff" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const result = await logout();
            if (!result.success) {
              Alert.alert("Error", result.message || "Failed to logout");
            }
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "An unexpected error occurred during logout");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, fetch receipts from API here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const pickImage = async () => {
    try {
      // Request media library permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload receipts"
        );
        return;
      }

      // Use the correct enum value from ImagePicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use the proper enum value
        allowsEditing: true,
        quality: 0.8,
        aspect: [3, 4],
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        await processReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", `Failed to select the image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Camera permission is required to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [3, 4],
      });

      console.log("Camera result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        await processReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to capture the image");
    } finally {
      setLoading(false);
    }
  };

  const processReceiptImage = async (imageUri) => {
    try {
      if (!imageUri) {
        throw new Error("No image URI provided");
      }

      console.log("Processing image URI:", imageUri);

      // Create form data for the image upload
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "receipt.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

      // Add image to form data
      formData.append("image", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        name: filename,
        type,
      });

      console.log("Uploading receipt image with filename:", filename);

      // Use apiClient for the request
      const response = await apiClient.post("/api/receipts/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Ensure token is included
        },
        timeout: 60000, // Increase timeout for image upload
      });

      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || "Server processing failed");
      }

      if (!responseData.data) {
        throw new Error("No data returned from server");
      }

      // Safely parse date string to ISO format
      let parsedDate;
      try {
        // Try to parse the date using a safer approach
        if (responseData.data.date) {
          // Check if date is in YYYY-MM-DD format
          if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(responseData.data.date)) {
            parsedDate = new Date(responseData.data.date).toISOString();
          } else {
            // If date is in another format, try to parse or use current date
            const parsedDateObj = new Date(responseData.data.date);
            if (!isNaN(parsedDateObj.getTime())) {
              parsedDate = parsedDateObj.toISOString();
            } else {
              parsedDate = new Date().toISOString();
              console.warn("Couldn't parse date, using current date instead");
            }
          }
        } else {
          // If no date provided, use current date
          parsedDate = new Date().toISOString();
          console.warn("No date in response, using current date");
        }
      } catch (dateError) {
        console.error("Error parsing date:", dateError);
        parsedDate = new Date().toISOString();
      }

      const newReceipt = {
        merchantName: responseData.data.merchantName || "Unknown Merchant",
        date: parsedDate,
        items: (responseData.data.items || []).map((item) => ({
          name: item.name || item.description || "Unknown Item",
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0.0,
          total: parseFloat(item.total) || 0.0,
        })),
        subtotal: parseFloat(responseData.data.subtotal) || 0.0,
        tax: parseFloat(responseData.data.tax) || 0.0,
        tip: responseData.data.tip ? parseFloat(responseData.data.tip) : 0.0,
        total: parseFloat(responseData.data.total) || 0.0,
      };

      // Navigate to confirmation screen WITHOUT saving to DB
      navigation.navigate("ReceiptConfirmation", {
        receipt: newReceipt,
        isEditing: true, // Set editing mode to true for a new receipt
      });
    } catch (error) {
      console.error("Error processing receipt:", error);

      let errorMessage = "Failed to upload and process the receipt";
      if (error.response) {
        console.error("Response error data:", error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderReceiptCard = (receipt, index) => (
    <Card key={index} containerStyle={styles.receiptCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate("ReceiptDetail", { receipt })}>
        <Card.Title style={styles.cardTitle}>{receipt.merchantName}</Card.Title>
        <View style={styles.cardContent}>
          <View style={styles.cardDetails}>
            <Text style={styles.dateText}>
              {new Date(receipt.date).toLocaleDateString()}
            </Text>
            <Text style={styles.totalText}>${receipt.total.toFixed(2)}</Text>
          </View>
          <Icon name="chevron-right" type="material-community" color="#999" />
        </View>
      </TouchableOpacity>
      <Card.Divider />
      <View style={styles.cardActions}>
        <Button
          title="View"
          type="clear"
          icon={
            <Icon
              name="receipt"
              size={16}
              color="#2089dc"
              style={styles.buttonIcon}
            />
          }
          onPress={() => navigation.navigate("ReceiptDetail", { receipt })}
        />
        <Button
          title="Delete"
          type="clear"
          icon={
            <Icon
              name="delete"
              size={16}
              color="#ff6b6b"
              style={styles.buttonIcon}
            />
          }
          titleStyle={{ color: "#ff6b6b" }}
          onPress={() => {
            Alert.alert(
              "Delete Receipt",
              "Are you sure you want to delete this receipt?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteReceiptFromContext(receipt.id),
                },
              ]
            );
          }}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2089dc" />
          <Text style={styles.loadingText}>Processing Receipt...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {receipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="receipt"
              size={80}
              color="#d1d1d1"
              style={styles.emptyIcon}
            />
            <Text h4 style={styles.emptyStateText}>
              No receipts yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Upload your first receipt to get started
            </Text>
            <Button
              title="Upload Receipt"
              icon={
                <Icon name="upload" color="white" style={styles.buttonIcon} />
              }
              containerStyle={styles.uploadButton}
              onPress={pickImage}
            />
          </View>
        ) : (
          <View style={styles.receiptList}>
            <Text style={styles.sectionTitle}>Your Receipts</Text>
            {receipts.map(renderReceiptCard)}
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB
          placement="right"
          icon={{ name: "camera", color: "white" }}
          color="#2089dc"
          size="large"
          style={styles.camerFab}
          onPress={takePhoto}
        />
        <FAB
          placement="right"
          icon={{ name: "add", color: "white" }}
          color="#2089dc"
          size="large"
          style={styles.addFab}
          onPress={pickImage}
        />
      </View>
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
    paddingHorizontal: 30,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyStateText: {
    textAlign: "center",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  uploadButton: {
    width: "80%",
    borderRadius: 8,
    overflow: "hidden",
  },
  buttonIcon: {
    marginRight: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  receiptList: {
    marginBottom: 20,
  },
  receiptCard: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    textAlign: "left",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  cardDetails: {
    flex: 1,
  },
  dateText: {
    color: "#666",
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2089dc",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  camerFab: {
    marginBottom: 70,
  },
  addFab: {
    marginBottom: 10,
  },
  logoutButton: {
    marginRight: 10,
    padding: 8,
  },
});
