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
import { Text, Button, Icon, ButtonGroup, ListItem } from "@rneui/themed";
import { useReceipts } from "../contexts/ReceiptContext";
import { Colors, TextStyles } from "../components/CupertinoStyles";
import CupertinoTextInput from "../components/CupertinoTextInput";

const SPLIT_METHODS = ["Equal", "Percentage", "Custom"];

export default function ReceiptSplitScreen({ route, navigation }) {
  const { receipt, groupId } = route.params;
  const [splitMethod, setSplitMethod] = useState(0); // 0: Equal, 1: Percentage, 2: Custom
  const [members, setMembers] = useState([]); // Will be populated from group context
  const [splits, setSplits] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch group members
    // Mock data for now
    const mockMembers = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Mike Johnson" },
    ];
    setMembers(mockMembers);
    initializeSplits(mockMembers);
  }, []);

  const initializeSplits = (groupMembers) => {
    const initialSplits = {};
    const equalShare = (receipt.total / groupMembers.length).toFixed(2);
    const equalPercentage = (100 / groupMembers.length).toFixed(2);

    groupMembers.forEach((member) => {
      initialSplits[member.id] = {
        amount: parseFloat(equalShare),
        percentage: parseFloat(equalPercentage),
      };
    });
    setSplits(initialSplits);
  };

  const updateSplit = (memberId, field, value) => {
    const newSplits = { ...splits };
    const numValue = parseFloat(value) || 0;

    if (field === "percentage") {
      newSplits[memberId].percentage = numValue;
      newSplits[memberId].amount = (receipt.total * (numValue / 100)).toFixed(
        2
      );
    } else {
      newSplits[memberId].amount = numValue;
      newSplits[memberId].percentage = (
        (numValue / receipt.total) *
        100
      ).toFixed(2);
    }

    setSplits(newSplits);
  };

  const getTotalSplit = () => {
    return Object.values(splits).reduce((sum, split) => sum + split.amount, 0);
  };

  const getTotalPercentage = () => {
    return Object.values(splits).reduce(
      (sum, split) => sum + split.percentage,
      0
    );
  };

  const handleSave = async () => {
    const totalSplit = getTotalSplit();
    const totalPercentage = getTotalPercentage();

    if (Math.abs(totalSplit - receipt.total) > 0.01) {
      Alert.alert(
        "Invalid Split",
        "The total split amount must equal the receipt total"
      );
      return;
    }

    if (Math.abs(totalPercentage - 100) > 0.01 && splitMethod === 1) {
      Alert.alert("Invalid Split", "The total percentage must equal 100%");
      return;
    }

    setLoading(true);
    try {
      // TODO: Save split information
      navigation.navigate("GroupDetail", { groupId });
    } catch (error) {
      Alert.alert("Error", "Failed to save split");
    } finally {
      setLoading(false);
    }
  };

  const renderMemberSplit = (member) => (
    <ListItem key={member.id} containerStyle={styles.memberContainer}>
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
        <ListItem.Title style={styles.memberName}>{member.name}</ListItem.Title>
        <View style={styles.splitInputContainer}>
          {splitMethod === 1 ? (
            <CupertinoTextInput
              value={splits[member.id]?.percentage.toString()}
              onChangeText={(value) =>
                updateSplit(member.id, "percentage", value)
              }
              keyboardType="numeric"
              containerStyle={styles.splitInput}
              rightIcon={<Text style={styles.percentageSymbol}>%</Text>}
            />
          ) : (
            <CupertinoTextInput
              value={splits[member.id]?.amount.toString()}
              onChangeText={(value) => updateSplit(member.id, "amount", value)}
              keyboardType="numeric"
              containerStyle={styles.splitInput}
              leftIcon={<Text>$</Text>}
              editable={splitMethod === 2}
            />
          )}
        </View>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.receiptSummary}>
            <Text style={styles.merchantName}>{receipt.merchantName}</Text>
            <Text style={styles.receiptTotal}>
              Total: ${receipt.total.toFixed(2)}
            </Text>
          </View>

          <ButtonGroup
            buttons={SPLIT_METHODS}
            selectedIndex={splitMethod}
            onPress={setSplitMethod}
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
          />
        </View>

        <View style={styles.splitSection}>
          {members.map(renderMemberSplit)}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Split Amount:</Text>
            <Text style={styles.summaryValue}>
              ${getTotalSplit().toFixed(2)}
            </Text>
          </View>
          {splitMethod === 1 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Percentage:</Text>
              <Text style={styles.summaryValue}>
                {getTotalPercentage().toFixed(2)}%
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirm Split"
          loading={loading}
          onPress={handleSave}
          buttonStyle={styles.confirmButton}
          containerStyle={styles.confirmButtonContainer}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  receiptSummary: {
    marginBottom: 20,
  },
  merchantName: {
    ...TextStyles.headline,
    marginBottom: 4,
  },
  receiptTotal: {
    ...TextStyles.title2,
    color: Colors.primary,
  },
  buttonGroup: {
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: Colors.lightGray,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  splitSection: {
    padding: 20,
  },
  memberContainer: {
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
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitials: {
    color: Colors.white,
    ...TextStyles.headline,
  },
  memberName: {
    ...TextStyles.headline,
    marginBottom: 8,
  },
  splitInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitInput: {
    flex: 1,
  },
  percentageSymbol: {
    ...TextStyles.body,
    color: Colors.gray,
    marginLeft: 4,
  },
  summary: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    ...TextStyles.headline,
  },
  summaryValue: {
    ...TextStyles.headline,
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  confirmButtonContainer: {
    width: "100%",
  },
});
