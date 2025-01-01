import React, { useContext, useEffect } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation } from "react-router-dom";

import styles from "./SidebarAdmin.module.scss";
import { DashboardIcon } from "~/components/Icons";
import Avatar from "~/components/Avatar";
import images from "~/assets/images";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ModalTypeContext from "~/context/ModalTypeContext";
import SidebarContext from "~/context/SidebarContext";
import UserContext from "~/context/UserContext";
import { authAPI, userApis } from "~/utils/api";
import Modal from "~/components/Modal";

const cx = classNames.bind(styles);

const sidebarIcons = [
  {
    icon: <DashboardIcon />,
    title: "Dashboard",
    to: "/admin",
  },
  {
    icon: <i className="fa-solid fa-user"></i>,
    title: "Users",
    to: "/admin/users",
  },
  {
    icon: <i className="fa-solid fa-hexagon-nodes-bolt"></i>,
    title: "Models",
    to: "/admin/models",
  },
  {
    icon: <i className="fa-solid fa-gift"></i>,
    title: "GiftCodes",
    to: "/admin/giftcodes",
  },
  {
    icon: <i className="fa-solid fa-credit-card"></i>,
    title: "Payments",
    to: "/admin/payments",
  },
];

const SidebarAdmin = () => {
  const location = useLocation();
  const { modalType, setModalType } = useContext(ModalTypeContext);
  const { isOpenSidebar, setIsOpenSidebar } = useContext(SidebarContext);
  const { user, setUser } = useContext(UserContext);

  const token = localStorage.getItem("token");

  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
        console.log("user-data ", response.data);
      } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        // Xử lý lỗi ở đây
        console.log(error);
      }
    };
    if (token) {
      fetchUserData();
    }
  }, [token, setUser]);

  const handleLogout = () => {
    // Xóa token khỏi localStorage hoặc cookie
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleToggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar); // Toggle trạng thái sidebar
  };

  return (
    <div className={cx("wrapper", { collapsed: !isOpenSidebar })}>
      <div className={cx("header")}>
        <Link to="/">
          <Avatar src={images.logo} fontsize={"5px"} alt={"Logo"} />
        </Link>
        <i className="fa-solid fa-xmark" onClick={handleToggleSidebar}></i>
      </div>
      <ul className={cx("list")}>
        {sidebarIcons.map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className={cx("item-btn", {
                actived: item.to === location.pathname,
              })}
              // onClick={() => handleItemClick(item.to)}
            >
              {item.icon}
              <span className={cx("item-title")}>{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={cx("info-user")}>
        {token ? (
          <>
            <Link to="/user" className={cx("avatar")}>
              <Avatar src={images.avatar} fontsize={"5px"} alt={"Avatar"} />
            </Link>
            <div>
              <Link to="/user" className={cx("username")}>
                {user?.name}
              </Link>
              <br />
              <span className={cx("account")}>Tài khoản</span>
            </div>
            <Tippy content="Đăng xuất">
              <i
                className="fa-solid fa-arrow-right-to-bracket"
                onClick={handleLogout}
              ></i>
            </Tippy>
          </>
        ) : (
          <div className={cx("actions")}>
            <button
              className={cx("register-btn")}
              onClick={() => setModalType("registerEmail")}
            >
              Đăng ký
            </button>
            <button
              className={cx("login-btn")}
              onClick={() => setModalType("loginEmail")}
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
      {modalType && <Modal onClose={closeModal} />}
      <Outlet />
    </div>
  );
};

export default SidebarAdmin;
