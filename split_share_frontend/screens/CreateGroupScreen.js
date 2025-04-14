import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button, Icon, ListItem } from "@rneui/themed";
import { Colors, TextStyles } from "../components/CupertinoStyles";
import CupertinoTextInput from "../components/CupertinoTextInput";

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([
    { id: "temp1", email: "", name: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([
      ...members,
      { id: `temp${members.length + 1}`, email: "", name: "" },
    ]);
  };

  const handleRemoveMember = (index) => {
    if (members.length > 1) {
      const newMembers = [...members];
      newMembers.splice(index, 1);
      setMembers(newMembers);
    }
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    const validMembers = members.filter((m) => m.email.trim());
    if (validMembers.length === 0) {
      Alert.alert("Error", "Please add at least one member");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to create group
      // Mock successful creation
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const renderMember = (member, index) => (
    <ListItem key={member.id} containerStyle={styles.memberContainer}>
      <ListItem.Content>
        <CupertinoTextInput
          placeholder="Email address"
          value={member.email}
          onChangeText={(value) => updateMember(index, "email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.memberInput}
          leftIcon={
            <Icon name="email" type="material" size={24} color={Colors.gray} />
          }
        />
      </ListItem.Content>
      {members.length > 1 && (
        <TouchableOpacity
          onPress={() => handleRemoveMember(index)}
          style={styles.removeButton}>
          <Icon name="close" color={Colors.danger} />
        </TouchableOpacity>
      )}
    </ListItem>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Create New Group</Text>
          <Text style={styles.subtitle}>
            Add a name for your group and invite members
          </Text>

          <View style={styles.form}>
            <CupertinoTextInput
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              containerStyle={styles.groupNameInput}
              leftIcon={
                <Icon
                  name="group"
                  type="material"
                  size={24}
                  color={Colors.gray}
                />
              }
            />

            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>Group Members</Text>
              <Text style={styles.sectionSubtitle}>
                Add the email addresses of people you want to split expenses
                with
              </Text>

              <View style={styles.membersList}>
                {members.map((member, index) => renderMember(member, index))}
              </View>

              <Button
                title="Add Another Member"
                type="outline"
                icon={{
                  name: "add",
                  type: "material",
                  size: 20,
                  color: Colors.primary,
                }}
                buttonStyle={styles.addButton}
                titleStyle={styles.addButtonTitle}
                onPress={handleAddMember}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Group"
          loading={loading}
          onPress={handleCreate}
          buttonStyle={styles.createButton}
          containerStyle={styles.createButtonContainer}
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
  content: {
    padding: 20,
  },
  title: {
    ...TextStyles.title2,
    marginBottom: 8,
  },
  subtitle: {
    ...TextStyles.subhead,
    color: Colors.gray,
    marginBottom: 24,
  },
  form: {
    marginTop: 8,
  },
  groupNameInput: {
    marginBottom: 32,
  },
  membersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TextStyles.headline,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...TextStyles.footnote,
    color: Colors.gray,
    marginBottom: 16,
  },
  membersList: {
    marginBottom: 16,
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
  memberInput: {
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    borderRadius: 12,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingVertical: 12,
  },
  addButtonTitle: {
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  createButtonContainer: {
    width: "100%",
  },
});
