import { authAPI, userApis } from "~/utils/api";

const userServices = {
  getCountConversations: async () => {
    try {
      const response = await authAPI().get(userApis.countConversations);
      return response.data;
    } catch (error) {
      console.error("Error counting users:", error);
      throw error;
    }
  },

  getBalance: async () => {
    try {
      const response = await authAPI().get(userApis.getBalance);
      return response.data;
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  },

  // getAllTransactions: async () => {
  //   try {
  //     const response = await authAPI().get(userApis.getAllTransactions);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error getting transactions:", error);
  //     throw error;
  //   }
  // },
  getAllConversations: async (page, itemsPerPage) => {
    try {
      const response = await authAPI().get(userApis.getAllConversations, {
        params: {
          page,
          itemsPerPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting recent conversations:", error);
      throw error;
    }
  },

  getRecentConversations: async (page, itemsPerPage) => {
    try {
      const response = await authAPI().get(userApis.getReCentConversations, {
        params: {
          page,
          itemsPerPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting recent conversations:", error);
      throw error;
    }
  },
  updatePassword: async (data) => {
    try {
      const response = await authAPI().patch(userApis.updatePassword, data);
      return response.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  updateCurrentUser: async (data) => {
    try {
      const response = await authAPI().patch(userApis.updateCurrentUser, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await authAPI().get(userApis.getCurrentUser);

      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },
};

export default userServices;
