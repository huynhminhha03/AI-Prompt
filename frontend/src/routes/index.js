//Layout
import Dashboard from '~/pages/Dashboard';
import AllTemplates from '~/pages/AllTemplates';
import Chat from '~/pages/Chat';
import CreateSeoBlog from '~/pages/CreateSeoBlog';
import PaymentReturn from '~/pages/PaymentReturn';
import Pricing from '~/pages/Pricing';

import TextToImage from '~/pages/TextToImage';
import TextToSpeech from '~/pages/TextToSpeech';
import TranslateLanguages from '~/pages/TranslateLanguages';
import VerifyEmailSuccess from '~/pages/VerifyEmailSuccess';
import WriteContentFacebookSharing from '~/pages/WriteContentFacebookSharing';
import WriteContentLandingPage from '~/pages/WriteContentLandingPage';
import WriteSalePostFacebook from '~/pages/WriteSalePostFacebook';
import WriteScriptLiveStream from '~/pages/WriteScriptLiveStream';
import WriteShortScripts from '~/pages/WriteShortScripts';
import RewriteSampleArticle from '~/pages/RewriteSampleArticle';
import CreateProductFromGPT from '~/pages/CreateProductFromGPT';
import BusinessIntroductionArticle from '~/pages/BusinessIntroductionArticle';
import ImageProcessing from '~/pages/ImageProcessing';
import RewriteArticle from '~/pages/RewriteArticle';
import SeoMenu from '~/pages/SeoMenu';
import SeoHomepage from '~/pages/SeoHomepage';
import CreatePromptFromIdeas from '~/pages/CreatePromptFromIdeas';
import ProductImageCreation from '~/pages/ProductImageCreation';
import CreatePromptFromImage from '~/pages/CreatePromptFromImage';
import EditImageAsRequired from '~/pages/EditImageAsRequired';
import CreateIllustrationDetails from '~/pages/CreateIllustrationDetails';
import WriteYoutubeVideoDesc from '~/pages/WriteYoutubeVideoDesc';
import CreateFacebookPostFromBrief from '~/pages/CreateFacebookPostFromBrief';
import CreateDiverseFacebookPosts from '~/pages/CreateDiverseFacebookPosts';
import GiftCode from '~/pages/GiftCode';
import Users from '~/pages/Admin/Users';
import AdminLayout from '~/components/Layouts/AdminLayout';
import Home from '~/pages/Admin/Home';
import Profile from '~/pages/Profile/Profile';
import Pay from '~/pages/Pay/Pay';
import ChangePassword from '~/pages/ChangePassword/ChangePassword';
import Usersinfo from '~/pages/Userinfo/Usersinfo';
import Models from '~/pages/Admin/Models';
import GiftCodes from '~/pages/Admin/GiftCodes';
import Payments from '~/pages/Admin/Payments';
import CreatedContent from '~/pages/CreatedContent/CreatedContent';
import NotFound from '~/pages/NotFound';
import Forbidden from '~/pages/Forbidden';

import UsageHistory from '~/pages/UsageHistory/UsageHistory';

const publicRoutes = [
    { path: '/', component: Dashboard },
    { path: '/text-to-image', component: TextToImage },
    { path: '/text-to-speech', component: TextToSpeech },
    { path: '/translate-languages', component: TranslateLanguages },
    { path: '/user/verify-email', component: VerifyEmailSuccess, layout: null },
    { path: '/chat', component: Chat },
    { path: '/templates/all', component:  AllTemplates},
    { path: '/templates/custom/tao-bai-seo', component: CreateSeoBlog },
    { path: '/templates/custom/dich-moi-ngon-ngu', component: TranslateLanguages },
    { path: '/templates/custom/viet-kich-ban-video-ngan', component: WriteShortScripts },
    { path: '/templates/custom/viet-noi-dung-landing-page', component: WriteContentLandingPage },
    { path: '/templates/custom/facebook-viet-bai-dang-ban', component: WriteSalePostFacebook },
    { path: '/templates/custom/facebook-viet-bai-dang-chia-se', component: WriteContentFacebookSharing },
    { path: '/templates/custom/tao-bai-dang-facebook-tu-brief', component: CreateFacebookPostFromBrief },
    { path: '/templates/custom/kich-ban-livestream-don-gian', component: WriteScriptLiveStream },
    { path: '/templates/custom/viet-lai-theo-bai-mau', component: RewriteSampleArticle },
    { path: '/templates/custom/tao-bai-san-pham-gpt-4o', component: CreateProductFromGPT },
    { path: '/templates/custom/bai-gioi-thieu-tren-website', component: BusinessIntroductionArticle },
    { path: '/templates/custom/xu-ly-anh', component: ImageProcessing },
    { path: '/templates/custom/viet-lai', component: RewriteArticle},
    { path: '/templates/custom/seo-menu', component: SeoMenu},
    { path: '/templates/custom/seo-homepage', component: SeoHomepage},
    { path: '/templates/custom/tao-prompt-ve-tu-y-tuong', component: CreatePromptFromIdeas},
    { path: '/templates/custom/sang-tao-hinh-san-pham', component: ProductImageCreation},
    { path: '/templates/custom/tao-prompt-ve-tu-anh-mau', component: CreatePromptFromImage},
    { path: '/templates/custom/sua-anh-theo-yeu-cau', component: EditImageAsRequired},
    { path: '/templates/custom/sang-tao-hinh-minh-hoa-bai-viet', component: CreateIllustrationDetails},
    { path: '/templates/custom/facebook-viet-bai-dang-da-dang', component: CreateDiverseFacebookPosts},
    { path: '/templates/custom/viet-mo-ta-video-youtube-chuan-seo', component: WriteYoutubeVideoDesc},
    { path: '/giftcode', component: GiftCode},
    { path: '/admin', component: Home, layout: AdminLayout},
    { path: '/admin/users', component: Users, layout: AdminLayout},
    { path: '/admin/models', component: Models, layout: AdminLayout},
    { path: '/admin/giftcodes', component: GiftCodes, layout: AdminLayout},
    { path: '/admin/payments', component: Payments, layout: AdminLayout},
    { path: '/user', component: Usersinfo },
    { path: '/user/profile', component: Profile },
    { path: '/user/pay', component: Pay },
    { path: '/user/change-password', component: ChangePassword },
    { path: '/pricing', component: Pricing },
    { path: '/payment/return', component: PaymentReturn, layout: null },
    { path: '/created-content', component: CreatedContent },
    { path: '/404', component: NotFound, layout: null },
    { path: '/403', component: Forbidden, layout: null },
    { path: '/user/usage-history', component: UsageHistory },

];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
