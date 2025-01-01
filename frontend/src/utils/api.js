import axios from 'axios';

const HOST = process.env.REACT_APP_API_URL;

export const adminApis = {
    sendNotification: '/send-notification',
    getStatistics: (year) => `courses/statistics/yearly/${year}`,

    getAllUsers: '/admin/user/all',
    getAllModels: '/admin/model/all',
    updateModel: (id) => `/admin/model/edit/${id}`,
    getAllPayments: '/admin/transaction/all',
    getAllGiftCodes: '/admin/gift-code/all',
    createGiftCode: '/admin/gift-code/create',
    updateGiftCode: (id) => `/admin/gift-code/edit/${id}`,
    deleteGiftCode: (id) => `/admin/gift-code/delete/${id}`,
    getCountUsers: '/admin/user/count-all',
    getCountModels: '/admin/model/count-all', 
    getCountPayments: '/admin/transaction/count-all',
    getCountGiftCodes: '/admin/gift-code/count-all',  
    getAllWallets: '/admin/wallet/all', 
    
};

export const userApis = {
    getCurrentUser: '/user/current-user',
    getReturnUrl: '/api/vnpay_return',
    updatePassword: '/user/update-password',
    updateCurrentUser: '/user/current-user',
    login: '/user/login',
    logout: '/user/logout',
    checkEmail: '/check-email/',
    register: '/user/register/',
    verifyEmail: '/verify-email/',
    forgotPassword: '/user/forget-password/',
    aiCompletion: '/ai/completion/',
    textToImage: '/ai/text-to-image/',
    textToSpeech: '/openai/text-to-speech/',

    createPaymentUrl: '/vnpay/create_payment_url',

    countConversations : '/openai/count-conversations',
    getBalance: '/openai/get-balance',

    checkGiftCode: '/giftcode/check-giftcode',
    resetPassword: '/user/reset-password/',
    changePassword: '/user/change-password/',
    refreshToken: '/api/refresh-token/',
    getAllTransactions: '/user/transaction/all',
    getAllConversations: '/user/conversation/all',
    getReCentConversations: '/user/conversation/most-recent',
    getConversationDetail: (id) => `/user/conversation-detail/${id}`,
    getUsageHistory: '/user/usage-history',
};

export const usageApis = {
    getLanguages: '/usage/languages',
    getAllVoices: '/usage/all-voices',
    getAllModelsNLP: '/usage/all-models-nlp',
    getAllModelsVoice: '/usage/all-models-voice',
    getAllCategories: '/usage/all-categories',
    getByCategory: (category) => `/usage/by-category/${category}`, // Dynamic route
    searchCategory: '/usage/search-category',
  };

const api = axios.create({
    baseURL: HOST,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const authAPI = () => {
    const token = localStorage.getItem('token');
    const instance = axios.create({
        baseURL: HOST,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });


    return instance;
};

export default api;
