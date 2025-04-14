import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, Card, Icon, Button, ListItem, Divider } from "@rneui/themed";
import { Colors, TextStyles } from "../components/CupertinoStyles";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import apiClient from "../utils/apiClient";

const BalanceCard = ({ balance, style }) => (
  <Card containerStyle={[styles.balanceCard, style]}>
    <View style={styles.balanceHeader}>
      <Text style={styles.balanceTitle}>Your Balance</Text>
      <Icon
        name={balance >= 0 ? "arrow-upward" : "arrow-downward"}
        color={balance >= 0 ? Colors.success : Colors.danger}
        size={20}
      />
    </View>
    <Text
      style={[
        styles.balanceAmount,
        { color: balance >= 0 ? Colors.success : Colors.danger },
      ]}>
      ${Math.abs(balance).toFixed(2)}
    </Text>
    <Text style={styles.balanceSubtext}>
      {balance >= 0 ? "to receive" : "to pay"}
    </Text>
  </Card>
);

const ExpenseBreakdown = ({ expenses }) => (
  <Card containerStyle={styles.breakdownCard}>
    <Card.Title style={styles.breakdownTitle}>Expense Breakdown</Card.Title>
    <View style={styles.expenseList}>
      {expenses.map((expense, index) => (
        <View key={index} style={styles.expenseItem}>
          <View style={styles.expenseIconContainer}>
            <Icon name={expense.icon} size={24} color={Colors.primary} />
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseName}>{expense.name}</Text>
            <Text style={styles.expenseDate}>
              {new Date(expense.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.expenseAmount}>
            <Text style={styles.expenseValue}>
              ${expense.amount.toFixed(2)}
            </Text>
            <Text style={styles.expenseStatus}>{expense.status}</Text>
          </View>
        </View>
      ))}
    </View>
  </Card>
);

const MembersList = ({ members, onMemberPress }) => (
  <Card containerStyle={styles.membersCard}>
    <Card.Title style={styles.membersTitle}>
      Members ({members.length})
    </Card.Title>
    {members.map((member, index) => (
      <ListItem
        key={index}
        containerStyle={styles.memberItem}
        onPress={() => onMemberPress(member)}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitials}>
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Text>
        </View>
        <ListItem.Content>
          <ListItem.Title style={styles.memberName}>
            {member.name}
          </ListItem.Title>
          <ListItem.Subtitle style={styles.memberBalance}>
            {member.balance >= 0
              ? `Owes $${member.balance.toFixed(2)}`
              : `Gets back $${Math.abs(member.balance).toFixed(2)}`}
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ))}
  </Card>
);

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    // TODO: Implement API call to fetch group details
    // For now using mock data
    setGroup({
      id: groupId,
      name: "Weekend Trip",
      balance: 125.5,
      expenses: [
        {
          id: 1,
          name: "Dinner at Restaurant",
          amount: 89.99,
          date: "2025-04-12",
          status: "settled",
          icon: "restaurant",
        },
        {
          id: 2,
          name: "Groceries",
          amount: 45.5,
          date: "2025-04-13",
          status: "pending",
          icon: "shopping-cart",
        },
      ],
      members: [
        { id: 1, name: "John Doe", balance: 45.5 },
        { id: 2, name: "Jane Smith", balance: -89.99 },
        { id: 3, name: "Mike Johnson", balance: 44.49 },
      ],
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGroupDetails().finally(() => setRefreshing(false));
  }, []);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload receipts"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await processReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const processReceiptImage = async (imageUri) => {
    if (!imageUri) return;

    setImageUploadLoading(true);
    try {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";
      const formData = new FormData();

      formData.append("image", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        name: filename,
        type,
      });

      const response = await apiClient.post("/api/receipts/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Server processing failed");
      }

      if (!response.data.data) {
        throw new Error("No data returned from server");
      }

      // Process the extracted receipt data
      let parsedDate;
      try {
        parsedDate = response.data.data.date
          ? new Date(response.data.data.date).toISOString()
          : new Date().toISOString();
      } catch (dateError) {
        console.error("Error parsing date:", dateError);
        parsedDate = new Date().toISOString();
      }

      const newReceipt = {
        merchantName: response.data.data.merchantName || "Unknown Merchant",
        date: parsedDate,
        items: (response.data.data.items || []).map((item) => ({
          name: item.name || item.description || "Unknown Item",
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0.0,
          total: parseFloat(item.total) || 0.0,
        })),
        subtotal: parseFloat(response.data.data.subtotal) || 0.0,
        tax: parseFloat(response.data.data.tax) || 0.0,
        tip: response.data.data.tip ? parseFloat(response.data.data.tip) : 0.0,
        total: parseFloat(response.data.data.total) || 0.0,
        groupId: groupId,
      };

      navigation.navigate("ReceiptConfirmation", {
        receipt: newReceipt,
        isEditing: true,
        groupId: groupId,
      });
    } catch (error) {
      console.error("Error processing receipt:", error);
      Alert.alert("Error", error.message || "Failed to process receipt");
    } finally {
      setImageUploadLoading(false);
    }
  };

  if (!group) return null;

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" && (
        <Animated.View
          style={[styles.headerBlur, { opacity: headerOpacity }]}
          pointerEvents="none">
          <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      {imageUploadLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Processing Receipt...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }>
        <BalanceCard balance={group.balance} />
        <ExpenseBreakdown expenses={group.expenses} />
        <MembersList
          members={group.members}
          onMemberPress={(member) =>
            navigation.navigate("MemberDetail", { memberId: member.id })
          }
        />

        <View style={styles.actionButtons}>
          <Button
            title="Add Receipt"
            icon={{
              name: "receipt",
              type: "material",
              color: Colors.white,
              size: 20,
            }}
            buttonStyle={[styles.actionButton, styles.primaryButton]}
            onPress={pickImage}
          />
          <Button
            title="Settle Up"
            icon={{
              name: "account-balance-wallet",
              type: "material",
              color: Colors.primary,
              size: 20,
            }}
            type="outline"
            buttonStyle={[styles.actionButton, styles.secondaryButton]}
            titleStyle={{ color: Colors.primary }}
            onPress={() => navigation.navigate("SettleUp", { groupId })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  headerBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 60,
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 16,
    margin: 0,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceTitle: {
    ...TextStyles.headline,
    marginRight: 8,
  },
  balanceAmount: {
    ...TextStyles.largeTitle,
    marginBottom: 4,
  },
  balanceSubtext: {
    ...TextStyles.subhead,
    color: Colors.gray,
  },
  breakdownCard: {
    borderRadius: 16,
    padding: 16,
    margin: 0,
    marginBottom: 16,
    borderWidth: 0,
  },
  breakdownTitle: {
    ...TextStyles.headline,
    textAlign: "left",
    marginBottom: 16,
  },
  expenseList: {
    marginTop: 8,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    ...TextStyles.headline,
    marginBottom: 4,
  },
  expenseDate: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  expenseAmount: {
    alignItems: "flex-end",
  },
  expenseValue: {
    ...TextStyles.headline,
    marginBottom: 4,
  },
  expenseStatus: {
    ...TextStyles.caption2,
    color: Colors.gray,
    textTransform: "capitalize",
  },
  membersCard: {
    borderRadius: 16,
    padding: 16,
    margin: 0,
    marginBottom: 16,
    borderWidth: 0,
  },
  membersTitle: {
    ...TextStyles.headline,
    textAlign: "left",
    marginBottom: 16,
  },
  memberItem: {
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitials: {
    ...TextStyles.headline,
    color: Colors.white,
  },
  memberName: {
    ...TextStyles.headline,
  },
  memberBalance: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: "48%",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    borderColor: Colors.primary,
    borderWidth: 2,
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
});
