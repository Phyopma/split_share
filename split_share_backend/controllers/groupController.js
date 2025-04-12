const prisma = require("../prisma/dbClient");

/**
 * Create a new group
 */
async function createGroup(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    // Check if group name already exists
    const existingGroup = await prisma.group.findUnique({
      where: { name },
    });

    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: "Group name already exists",
      });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        ownerId: userId,
        users: {
          create: [
            {
              userId: userId,
            },
          ],
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create group",
    });
  }
}

/**
 * Get all groups for a user
 */
async function getUserGroups(req, res) {
  try {
    const userId = req.user.id;

    const groups = await prisma.group.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error getting user groups:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user groups",
    });
  }
}

/**
 * Get a specific group by id
 */
async function getGroupById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member of the group
    const isMember = group.users.some(
      (userGroup) => userGroup.user.id === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this group",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error getting group:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get group",
    });
  }
}

/**
 * Invite a user to a group by email
 */
async function inviteUserToGroup(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the group owner or a member
    const isMember = group.users.some(
      (userGroup) => userGroup.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to invite users to this group",
      });
    }

    // Find the user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
    }

    // Check if user is already in the group
    const isUserAlreadyInGroup = group.users.some(
      (userGroup) => userGroup.userId === userToInvite.id
    );

    if (isUserAlreadyInGroup) {
      return res.status(400).json({
        success: false,
        message: "User is already in this group",
      });
    }

    // Add user to group
    await prisma.userGroup.create({
      data: {
        userId: userToInvite.id,
        groupId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "User invited successfully",
    });
  } catch (error) {
    console.error("Error inviting user to group:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to invite user to group",
    });
  }
}

/**
 * Remove a user from a group
 */
async function removeUserFromGroup(req, res) {
  try {
    const { groupId, userId: userToRemoveId } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the owner of the group
    if (group.ownerId !== userId && userId !== userToRemoveId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove users from this group",
      });
    }

    // Cannot remove the owner
    if (userToRemoveId === group.ownerId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the owner from the group",
      });
    }

    // Remove user from group
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId: userToRemoveId,
          groupId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "User removed from group successfully",
    });
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove user from group",
    });
  }
}

/**
 * Delete a group
 */
async function deleteGroup(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the owner
    if (group.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the group owner can delete the group",
      });
    }

    // Delete group
    await prisma.group.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete group",
    });
  }
}

/**
 * Get group summary data
 */
async function getGroupSummary(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if group exists and user is a member
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const isMember = group.users.some(
      (userGroup) => userGroup.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this group's summary",
      });
    }

    // Get all users in the group
    const groupUsers = await prisma.userGroup.findMany({
      where: { groupId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get assigned_split receipts in the group
    const receipts = await prisma.receipt.findMany({
      where: {
        groupId: id,
        status: "ASSIGNED_SPLIT",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Calculate summary data
    const userSummaries = {};
    const balances = {};
    let totalGroupExpense = 0;

    // Initialize summaries for all users
    groupUsers.forEach((ug) => {
      const user = ug.user;
      userSummaries[user.id] = {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalOwed: 0,
        totalPaid: 0,
        netBalance: 0,
      };

      balances[user.id] = {};
      groupUsers.forEach((otherUg) => {
        if (user.id !== otherUg.user.id) {
          balances[user.id][otherUg.user.id] = 0;
        }
      });
    });

    // Calculate amounts for each receipt
    receipts.forEach((receipt) => {
      totalGroupExpense += receipt.total;

      receipt.splits.forEach((split) => {
        // Track how much each user owes
        userSummaries[split.userId].totalOwed += split.amount;

        // Track who owes whom (who paid vs who consumed)
        if (receipt.userId !== split.userId) {
          balances[split.userId][receipt.userId] += split.amount;
          balances[receipt.userId][split.userId] -= split.amount;
        }
      });

      // Track how much each user paid (uploaded receipts)
      userSummaries[receipt.userId].totalPaid += receipt.total;
    });

    // Calculate net balance for each user
    Object.keys(userSummaries).forEach((userId) => {
      userSummaries[userId].netBalance =
        userSummaries[userId].totalPaid - userSummaries[userId].totalOwed;
    });

    // Format simplified balances (who owes whom)
    const simplifiedBalances = [];
    Object.keys(balances).forEach((fromUserId) => {
      Object.keys(balances[fromUserId]).forEach((toUserId) => {
        const amount = balances[fromUserId][toUserId];
        if (amount > 0) {
          simplifiedBalances.push({
            fromUserId,
            fromUserName: userSummaries[fromUserId].name,
            toUserId,
            toUserName: userSummaries[toUserId].name,
            amount,
          });
        }
      });
    });

    const summaryData = {
      groupId: id,
      groupName: group.name,
      totalExpense: totalGroupExpense,
      receiptCount: receipts.length,
      userSummaries: Object.values(userSummaries),
      balances: simplifiedBalances,
    };

    res.status(200).json({
      success: true,
      data: summaryData,
    });
  } catch (error) {
    console.error("Error getting group summary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get group summary",
    });
  }
}

module.exports = {
  createGroup,
  getUserGroups,
  getGroupById,
  inviteUserToGroup,
  removeUserFromGroup,
  deleteGroup,
  getGroupSummary,
};
