import api, {  usageApis } from '~/utils/api'; // Import hàm API với xác thực token

const useAgeServices = {
  // Lấy danh sách ngôn ngữ
  getLanguages: async () => {
    try {
      const response = await api.get(usageApis.getLanguages);
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  },

  // Lấy danh sách giọng đọc
  getAllVoices: async () => {
    try {
      const response = await api.get(usageApis.getAllVoices);
      return response.data; // Trả về danh sách giọng đọc
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  },

  // Lấy tất cả mô hình NLP
  getAllModelsNLP: async () => {
    try {
      const response = await api.get(usageApis.getAllModelsNLP);
      return response.data; // Trả về danh sách mô hình NLP
    } catch (error) {
      console.error('Error fetching NLP models:', error);
      throw error;
    }
  },

  // Lấy tất cả mô hình Voice
  getAllModelsVoice: async () => {
    try {
      const response = await api.get(usageApis.getAllModelsVoice);
      return response.data; // Trả về danh sách mô hình Voice
    } catch (error) {
      console.error('Error fetching voice models:', error);
      throw error;
    }
  },

  // Lấy tất cả danh mục
  getAllCategories: async () => {
    try {
      const response = await api.get(usageApis.getAllCategories);
      return response.data; // Trả về danh sách danh mục
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy dữ liệu theo danh mục
  getByCategory: async (category) => {
    try {
      const response = await api.get(usageApis.getByCategory(category));
      return response.data; // Trả về dữ liệu theo danh mục
    } catch (error) {
      console.error(`Error fetching category ${category}:`, error);
      throw error;
    }
  },

  // Tìm kiếm danh mục
  searchCategory: async (query) => {
    try {
      const response = await api.post(usageApis.searchCategory, { query });
      return response.data; // Trả về kết quả tìm kiếm
    } catch (error) {
      console.error('Error searching category:', error);
      throw error;
    }
  },
};

export default useAgeServices;
