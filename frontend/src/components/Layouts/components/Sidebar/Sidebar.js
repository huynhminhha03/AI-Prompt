import React, { useContext, useEffect } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { AIFormIcon, DashboardIcon, EarPhoneIcon } from "~/components/Icons";
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
    title: "Bảng điều khiển",
    to: "/",
  },
  // {
  //   icon: <ChatIcon />,
  //   title: "Chat",
  //   to: "/chat",
  // },
  {
    icon: <i className="fa-regular fa-file-lines"></i>,
    title: "AI Form",
    to: "/templates/all",
  },
  {
    icon: <EarPhoneIcon />,
    title: "Text to Speech",
    to: "/text-to-speech",
  },
  {
    icon: <AIFormIcon />,
    title: "Text to Image",
    to: "/text-to-image",
  },
  {
    icon: <i className="fa-regular fa-credit-card"></i>,
    title: "Nạp BTG",
    to: "/pricing",
  },
  {
    icon: <i className="fa-solid fa-gift"></i>,
    title: "Mã quà tặng",
    to: "/giftcode",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { modalType, setModalType } = useContext(ModalTypeContext);
  const { isOpenSidebar, setIsOpenSidebar } = useContext(SidebarContext);
  // const [conversations, setConversations] = useState([]);
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const userSidebarIcons =
    user?.role === "admin"
      ? [
          ...sidebarIcons,
          {
            icon: <i className="fa-solid fa-user-shield"></i>,
            title: "Admin",
            to: "/admin",
          },
        ]
      : sidebarIcons;

  const token = localStorage.getItem("token");
  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
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
    <div
      className={cx("wrapper", { collapsed: !isOpenSidebar })}
      initial={{ x: -300 }}
      animate={{ x: -0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cx("header")}>
        <Link to="/">
          <Avatar src={images.logo} fontsize={"5px"} alt={"Logo"} />
        </Link>
        <i className="fa-solid fa-xmark" onClick={handleToggleSidebar}></i>
      </div>
      <ul className={cx("list")}>
        {userSidebarIcons.map((item, index) => (
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

            {/* Hiển thị danh sách hội thoại ngay dưới mục "Chat" */}
            {/* {item.to === "/chat" && isChatOpen && (
              <div>
                <button className={cx("newChatButton")}>Đoạn chat mới</button>
                <ul className={cx("conversationItems")}>
                  {conversations.map((conv) => (
                    <li key={conv.id} className={cx("conversationItem")}>
                      <Link
                        to={`/chat/${conv.id}`}
                        className={cx("conversationLink")}
                      >
                        {conv.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
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

export default Sidebar;
