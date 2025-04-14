import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Button, Icon, ListItem, FAB } from "@rneui/themed";
import { Colors, TextStyles } from "../components/CupertinoStyles";

export default function GroupsScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    // TODO: Implement API call to fetch groups
    // Mock data for now
    setGroups([
      {
        id: 1,
        name: "Weekend Trip",
        members: 4,
        totalExpenses: 245.5,
        lastActivity: "2025-04-12T10:00:00Z",
        balance: -45.5,
      },
      {
        id: 2,
        name: "Dinner Group",
        members: 3,
        totalExpenses: 89.99,
        lastActivity: "2025-04-11T18:30:00Z",
        balance: 25.75,
      },
      {
        id: 3,
        name: "Apartment",
        members: 2,
        totalExpenses: 1250.0,
        lastActivity: "2025-04-10T09:15:00Z",
        balance: 625.0,
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const getGroupIcon = (groupName) => {
    const icons = {
      "Weekend Trip": "card-travel",
      "Dinner Group": "restaurant",
      Apartment: "home",
    };
    return icons[groupName] || "group";
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const activity = new Date(date);
    const diffTime = Math.abs(now - activity);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return activity.toLocaleDateString();
    }
  };

  const renderGroup = (group) => (
    <TouchableOpacity
      key={group.id}
      onPress={() => navigation.navigate("GroupDetail", { groupId: group.id })}>
      <ListItem containerStyle={styles.groupCard}>
        <View style={styles.groupIconContainer}>
          <Icon
            name={getGroupIcon(group.name)}
            type="material"
            size={24}
            color={Colors.primary}
          />
        </View>
        <ListItem.Content>
          <ListItem.Title style={styles.groupName}>{group.name}</ListItem.Title>
          <View style={styles.groupMetaContainer}>
            <Text style={styles.groupMeta}>
              {group.members} members · ${group.totalExpenses.toFixed(2)} total
            </Text>
            <Text style={styles.lastActivity}>
              {formatLastActivity(group.lastActivity)}
            </Text>
          </View>
          <View style={styles.balanceContainer}>
            <Icon
              name={group.balance >= 0 ? "arrow-upward" : "arrow-downward"}
              size={16}
              color={group.balance >= 0 ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.balance,
                {
                  color: group.balance >= 0 ? Colors.success : Colors.danger,
                },
              ]}>
              ${Math.abs(group.balance).toFixed(2)}{" "}
              <Text style={styles.balanceLabel}>
                {group.balance >= 0 ? "to receive" : "to pay"}
              </Text>
            </Text>
          </View>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </TouchableOpacity>
  );

  const handleCreateGroup = () => {
    navigation.navigate("CreateGroup");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="group-add"
              type="material"
              size={48}
              color={Colors.gray}
            />
            <Text style={styles.emptyStateText}>
              You haven't created any groups yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Create a group to start splitting expenses with friends
            </Text>
            <Button
              title="Create Group"
              onPress={handleCreateGroup}
              buttonStyle={styles.createButton}
              containerStyle={styles.createButtonContainer}
            />
          </View>
        ) : (
          <View style={styles.groupList}>{groups.map(renderGroup)}</View>
        )}
      </ScrollView>

      {groups.length > 0 && (
        <FAB
          icon={{ name: "add", color: Colors.white }}
          color={Colors.primary}
          placement="right"
          onPress={handleCreateGroup}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollView: {
    flex: 1,
  },
  groupList: {
    padding: 16,
  },
  groupCard: {
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
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupName: {
    ...TextStyles.headline,
    marginBottom: 4,
  },
  groupMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  groupMeta: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  lastActivity: {
    ...TextStyles.caption2,
    color: Colors.gray,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balance: {
    ...TextStyles.subhead,
    marginLeft: 4,
  },
  balanceLabel: {
    ...TextStyles.footnote,
    color: Colors.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: "50%",
  },
  emptyStateText: {
    ...TextStyles.headline,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    ...TextStyles.subhead,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  createButtonContainer: {
    width: "auto",
  },
});
