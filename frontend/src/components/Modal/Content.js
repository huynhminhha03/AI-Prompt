import { useState, useContext, useMemo, useCallback } from 'react';
import ModalTypeContext from '~/context/ModalTypeContext';
import classNames from 'classnames/bind';
import styles from './Modal.module.scss';
import routes from '~/config/routes';
import images from '~/assets/images';
import {  PrevArrowIcon, TickIcon, UserIcon } from '~/components/Icons';
// import { FacebookIcon, GithubIcon, GoogleIcon, PrevArrowIcon, TickIcon, UserIcon } from '~/components/Icons';
// import { auth,  signInWithPopup } from '~/firebaseConfig';
// import { auth, googleProvider, facebookProvider, githubProvider, signInWithPopup } from '~/firebaseConfig';
import config from '~/config';
import { toCamelCase } from '~/utils/toCamelCase';
import ForgotPassword from './ForgotPassword';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';
import { Link } from 'react-router-dom';
// import api from '~/utils/api';

const cx = classNames.bind(styles);

function Content() {
    const { modalType, setModalType } = useContext(ModalTypeContext);
    const [previousModalType, setPreviousModalType] = useState(null);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
    const handleClick = useCallback(
        (to) => {
            const camelCaseScreen = toCamelCase(to);
            setPreviousModalType(modalType);
            setModalType(camelCaseScreen);
        },
        [modalType, setModalType],
    );

    const handleBackClick = useCallback(() => {
        if (previousModalType) {
            setModalType(previousModalType);
            setPreviousModalType(null);
        }
    }, [previousModalType, setModalType]);

    const renderAuthButtons = () => {
        const isRegister = modalType === 'register';
        const buttonLabel = isRegister ? 'Đăng ký' : 'Đăng nhập';

        const providers = [
            {
                icon: <UserIcon />,
                label: `${buttonLabel} bằng tài khoản`,
                action: () => handleClick(isRegister ? config.routes.registerEmail : config.routes.loginEmail),
            },
            // { icon: <GoogleIcon />, label: `${buttonLabel} với Google`, action: () => handleLogin(googleProvider) },

            // {
            //     icon: <FacebookIcon />,
            //     label: `${buttonLabel} với Facebook`,
            //     action: () => handleLogin(facebookProvider),
            // },
            // { icon: <GithubIcon />, label: `${buttonLabel} với GitHub`, action: () => handleLogin(githubProvider) },
        ];

        return providers.map(({ icon, label, action }, index) => (
            <span key={index} className={cx('wrapper-btn')} onClick={action}>
                <span className={cx('icon')}>{icon}</span>
                <span className={cx('title')}>{label}</span>
            </span>
        ));
    };

    const modalTitle = useMemo(() => {
        if (modalType.includes('register')) return 'Đăng ký tài khoản RTC Group';
        if (modalType.includes('login')) return 'Đăng nhập tài khoản RTC Group';
        return modalType === 'forgotPassword' ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu';
    }, [modalType]);

    const modalDescription = useMemo(() => {
        if (modalType === 'forgotPassword')
            return 'Nhập email của bạn và chúng tôi sẽ gửi cho bạn mã khôi phục mật khẩu.';
        if (modalType === 'changePassword') 
            return 'Đặt mật khẩu mới cho tài khoản của bạn để có thể tiếp tục truy cập các khóa học.';
    }, [modalType]);

    return ( 
        <div className={cx('container')}>
            <header className={cx('header')}>
                <Link to={routes.home}>
                    <img className={cx('logo')} src={images.logo} alt="RTC Group_logo" />
                </Link>
                <h1 className={cx('heading')}>{modalTitle}</h1>
                <p
                    className={cx(
                        modalType !== 'forgotPassword' && modalType !== 'resetPassword' ? 'warn' : 'description',
                    )}
                >
                    {modalDescription}
                </p>
                {resetPasswordSuccess && modalType === 'loginEmail' && (
                    <p className={cx('message')}>
                        <TickIcon /> Mật khẩu đã được đặt lại. Vui lòng đăng nhập.
                    </p>
                )}
                {previousModalType && (
                    <button className={cx('back-btn')} onClick={handleBackClick}>
                        <PrevArrowIcon /> Quay lại
                    </button>
                )}
            </header>

            <main className={cx('main')}>
                <div className={cx('main-content')}>
                    {(modalType === 'register' || modalType === 'login') && renderAuthButtons()}

                    {modalType === 'loginEmail' && <Login />}
                    {modalType === 'registerEmail' && <Register />}
                    {modalType === 'forgotPassword' && <ForgotPassword setModalType={setModalType} />}
                    {modalType === 'resetPassword' && (
                        <ResetPassword setModalType={setModalType} setResetPasswordSuccess={setResetPasswordSuccess} />
                    )}

                    {modalType !== 'forgotPassword' && modalType !== 'resetPassword' && (
                        <p className={cx('register-or-login')}>
                            {modalType === 'register' || modalType === 'registerEmail'? 'Bạn đã có tài khoản? ' : 'Bạn chưa có tài khoản? '}
                            <span onClick={() => setModalType(modalType === 'register' || modalType === 'registerEmail'? 'loginEmail' : 'registerEmail')}>
                                {modalType === 'register'|| modalType === 'registerEmail' ? 'Đăng nhập' : 'Đăng ký'}
                            </span>
                        </p>
                    )}

                    {modalType !== 'forgotPassword' && modalType !== 'resetPassword' && (
                        <span className={cx('forgot-password')} onClick={() => setModalType('forgotPassword')}>
                            Quên mật khẩu?
                        </span>
                    )}

                    <p className={cx('policy')}>
                        Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với
                        <span>điều khoản sử dụng</span> của chúng tôi.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default Content;
