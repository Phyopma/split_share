import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Card, Icon } from "@rneui/themed";
import { useAuth } from "../contexts/AuthContext";
import { useReceipts } from "../contexts/ReceiptContext";

export default function HomeScreen({ navigation }) {
  const { receipts, loading, error, fetchReceipts } = useReceipts();
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchReceipts();
    }
  }, [isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReceipts();
    setRefreshing(false);
  }, [fetchReceipts]);

  const renderSummaryCard = () => {
    const totalOwed = 125.5; // TODO: Calculate from actual data
    const totalReceiving = 89.99; // TODO: Calculate from actual data

    return (
      <Card containerStyle={styles.summaryCard}>
        <Text h4 style={styles.greeting}>
          Hello, {user?.name || "there"}!
        </Text>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>You owe</Text>
            <Text style={[styles.balanceAmount, { color: "#ff6b6b" }]}>
              ${totalOwed.toFixed(2)}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>You're owed</Text>
            <Text style={[styles.balanceAmount, { color: "#2ecc71" }]}>
              ${totalReceiving.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderRecentGroups = () => {
    // TODO: Replace with actual groups data
    const recentGroups = [
      { id: 1, name: "Weekend Trip", memberCount: 4, total: 245.5 },
      { id: 2, name: "Dinner Group", memberCount: 3, total: 89.99 },
    ];

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Groups</Text>
          <TouchableOpacity onPress={() => navigation.navigate("GroupsTab")}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              onPress={() =>
                navigation.navigate("GroupsTab", {
                  screen: "GroupDetail",
                  params: { groupId: group.id },
                })
              }>
              <Card containerStyle={styles.groupCard}>
                <View style={styles.groupIconContainer}>
                  <Icon name="people" size={24} color="#2089dc" />
                </View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMeta}>
                  {group.memberCount} members · ${group.total.toFixed(2)}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecentReceipts = () => {
    const recentReceipts = receipts.slice(0, 3);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Receipts</Text>
        </View>
        {recentReceipts.map((receipt) => (
          <TouchableOpacity
            key={receipt.id}
            onPress={() => navigation.navigate("ReceiptDetail", { receipt })}>
            <Card containerStyle={styles.receiptCard}>
              <View style={styles.receiptContent}>
                <View style={styles.receiptDetails}>
                  <Text style={styles.merchantName}>
                    {receipt.merchantName || "Unknown Merchant"}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(receipt.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.receiptAmount}>
                  <Text style={styles.totalText}>
                    ${(receipt.total || 0).toFixed(2)}
                  </Text>
                  <Icon
                    name="chevron-right"
                    type="material-community"
                    color="#999"
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2089dc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderSummaryCard()}
      {renderRecentGroups()}
      {renderRecentReceipts()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  summaryCard: {
    borderRadius: 15,
    margin: 15,
    marginTop: 20,
    padding: 15,
  },
  greeting: {
    marginBottom: 15,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
  },
  balanceDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#e1e1e1",
    marginHorizontal: 15,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllButton: {
    color: "#2089dc",
    fontSize: 14,
  },
  groupCard: {
    width: 160,
    borderRadius: 12,
    margin: 8,
    padding: 12,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 12,
    color: "#666",
  },
  receiptCard: {
    borderRadius: 12,
    margin: 8,
    marginHorizontal: 15,
    padding: 12,
  },
  receiptContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptDetails: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  receiptAmount: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2089dc",
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
});
