import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Icon, Card, ListItem, Divider } from "@rneui/themed";
import {
  Colors,
  TextStyles,
  LayoutStyles,
} from "../components/CupertinoStyles";

export default function ReceiptDetailScreen({ route, navigation }) {
  const { receipt } = route.params;

  const renderHeader = () => (
    <Card containerStyle={styles.headerCard}>
      <View style={styles.merchantInfo}>
        <Icon
          name="storefront"
          type="material"
          size={24}
          color={Colors.primary}
          containerStyle={styles.merchantIcon}
        />
        <View style={styles.merchantDetails}>
          <Text style={styles.merchantName}>{receipt.merchantName}</Text>
          <Text style={styles.receiptDate}>
            {new Date(receipt.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.groupInfo}>
        <Icon
          name="group"
          type="material"
          size={24}
          color={Colors.gray}
          containerStyle={styles.groupIcon}
        />
        <Text style={styles.groupName}>
          {receipt.groupName || "Group Name"}
        </Text>
      </View>
    </Card>
  );

  const renderItems = () => (
    <Card containerStyle={styles.itemsCard}>
      <Card.Title style={styles.sectionTitle}>Items</Card.Title>
      {receipt.items.map((item, index) => (
        <View key={index}>
          {index > 0 && <Divider style={styles.itemDivider} />}
          <ListItem containerStyle={styles.itemContainer}>
            <ListItem.Content>
              <ListItem.Title style={styles.itemName}>
                {item.name}
              </ListItem.Title>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>
                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                </Text>
                <Text style={styles.itemTotal}>
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            </ListItem.Content>
          </ListItem>
        </View>
      ))}
    </Card>
  );

  const renderTotals = () => (
    <Card containerStyle={styles.totalsCard}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>${receipt.subtotal.toFixed(2)}</Text>
      </View>
      {receipt.tax > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={styles.totalValue}>${receipt.tax.toFixed(2)}</Text>
        </View>
      )}
      {receipt.tip > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tip</Text>
          <Text style={styles.totalValue}>${receipt.tip.toFixed(2)}</Text>
        </View>
      )}
      <Divider style={styles.totalsDivider} />
      <View style={styles.totalRow}>
        <Text style={styles.finalTotalLabel}>Total</Text>
        <Text style={styles.finalTotalValue}>${receipt.total.toFixed(2)}</Text>
      </View>
    </Card>
  );

  const renderSplits = () => (
    <Card containerStyle={styles.splitsCard}>
      <Card.Title style={styles.sectionTitle}>Split Details</Card.Title>
      {receipt.splits?.map((split, index) => (
        <ListItem key={index} containerStyle={styles.splitContainer}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberInitials}>
              {split.memberName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>
          <ListItem.Content>
            <ListItem.Title style={styles.memberName}>
              {split.memberName}
            </ListItem.Title>
            <ListItem.Subtitle style={styles.splitAmount}>
              ${split.amount.toFixed(2)} ({split.percentage.toFixed(1)}%)
            </ListItem.Subtitle>
          </ListItem.Content>
          <View style={styles.splitStatus}>
            <Icon
              name={split.settled ? "check-circle" : "schedule"}
              type="material"
              size={20}
              color={split.settled ? Colors.success : Colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: split.settled ? Colors.success : Colors.warning },
              ]}>
              {split.settled ? "Settled" : "Pending"}
            </Text>
          </View>
        </ListItem>
      ))}
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}
      {renderItems()}
      {renderTotals()}
      {renderSplits()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  headerCard: {
    ...LayoutStyles.card,
    marginHorizontal: 16,
    marginTop: 16,
  },
  merchantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  merchantIcon: {
    backgroundColor: Colors.primary + "10",
    padding: 8,
    borderRadius: 8,
  },
  merchantDetails: {
    marginLeft: 12,
    flex: 1,
  },
  merchantName: {
    ...TextStyles.headline,
    marginBottom: 4,
  },
  receiptDate: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    backgroundColor: Colors.lightGray,
    padding: 8,
    borderRadius: 8,
  },
  groupName: {
    ...TextStyles.subhead,
    marginLeft: 12,
    color: Colors.gray,
  },
  itemsCard: {
    ...LayoutStyles.card,
    marginHorizontal: 16,
  },
  sectionTitle: {
    ...TextStyles.headline,
    textAlign: "left",
    marginBottom: 8,
  },
  itemContainer: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  itemDivider: {
    backgroundColor: Colors.lightGray,
  },
  itemName: {
    ...TextStyles.body,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemQuantity: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  itemTotal: {
    ...TextStyles.subhead,
    color: Colors.black,
  },
  totalsCard: {
    ...LayoutStyles.card,
    marginHorizontal: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalLabel: {
    ...TextStyles.body,
    color: Colors.gray,
  },
  totalValue: {
    ...TextStyles.body,
  },
  totalsDivider: {
    marginVertical: 8,
    backgroundColor: Colors.lightGray,
  },
  finalTotalLabel: {
    ...TextStyles.headline,
  },
  finalTotalValue: {
    ...TextStyles.headline,
    color: Colors.primary,
  },
  splitsCard: {
    ...LayoutStyles.card,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  splitContainer: {
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
    ...TextStyles.body,
    marginBottom: 4,
  },
  splitAmount: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  splitStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    ...TextStyles.caption2,
    marginLeft: 4,
  },
});
