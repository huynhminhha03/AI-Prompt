import React, { useEffect, useState, useContext } from "react";
import classNames from "classnames/bind";
import Card from "./Card.js";
import styles from "./Dashboard.module.scss";
import userServices from "~/services/userServices.js";
import Button from "~/components/Button";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "~/context/UserContext";
import images from "~/assets/images/index.js";
import ResultPrompt from "~/components/ResultPrompt/ResultPrompt.js";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons"; // Import PrevPageIcon và NextPageIcon

const cx = classNames.bind(styles);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("month");
  const [countConversations, setCountConversations] = useState(0);
  const [recentConversations, setRecentConversations] = useState([]);
  const [balance, setBalance] = useState();
  const { user } = useContext(UserContext); // Lấy thông tin user từ Context

  const token = localStorage.getItem("token");
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data khi token thay đổi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversationsResponse, balanceResponse, recentConversation] =
          await Promise.all([
            userServices.getCountConversations(),
            userServices.getBalance(),
            userServices.getRecentConversations(currentPage), // Gọi API theo trang
          ]);
        setCountConversations(conversationsResponse.count);
        setBalance(balanceResponse);

        setRecentConversations(recentConversation.conversations);
        setTotalPages(recentConversation.totalPages); // Cập nhật tổng số trang từ response
      } catch (error) {
        console.error("Error fetching data:", error);
      } 
    };

    if (token) {
      fetchData();
    }
  }, [token, currentPage]); // Chạy lại khi token hoặc currentPage thay đổi

  // Xử lý khi thay đổi bộ lọc
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Chức năng cho chuyển trang
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <div className="container mt-5 mb-4">
      <div className={cx("dashboard")}>
        {token && (
          <div className={cx("dashboard-container")}>
            {/* Profile Section */}
            <div className={cx("profile-section", "mt-4", "p-5")}>
              <div className="d-flex align-items-center flex-wrap justify-content-center">
                <div
                  className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center "
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <Link to="/user">
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      src={user?.avatar || images.defaultAvatar}
                      alt={user?.name}
                    />
                  </Link>
                </div>

                {/* User Info */}
                <div className="profile-info ml-3">
                  <Link to="/user" style={{ color: "black" }}>
                    <p
                      style={{
                        fontSize: "1.9rem",
                        fontWeight: "bold",
                        marginBottom: "0.5rem 0",
                      }}
                    >
                      {user?.name}
                    </p>
                  </Link>
                  <div className={cx("formitem")}>
                    <i className="fa-solid fa-envelope"></i>
                    <p className="email">{user?.email}</p>
                  </div>
                  <div className={cx("formitem")}>
                    <i className="fa-solid fa-credit-card"></i>
                    {balance && balance?.balance.toLocaleString("vi-VN")}
                    <p>BTG</p>
                  </div>
                  <div className={cx("formitem")}>
                    <i className="fa-solid fa-calendar-day"></i>
                    <p
                      className={cx("expiry-date", {
                        isExpired:
                          balance && new Date(balance?.expired_at) > new Date(),
                      })}
                    >
                      Ngày hết hạn:{" "}
                      <strong>
                        {balance &&
                          new Date(balance?.expired_at).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              <button
                onClick={() => navigate("/templates/all")}
                style={{
                  backgroundColor: "#195a97",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  textDecoration: "none !important",
                }}
              >
                Dùng Ngay
              </button>
            </div>
          </div>
        )}
        {/* Overview Section */}
        {token && (
          <section className={cx("overview")}>
            <h2 className="mb-3">Tổng quan</h2>
            <div className={cx("overviewCards", "container")}>
              <div className="row">
                <div
                  className={cx("col-lg-4", "col-md-6", "col-sm-12", "mb-4")}
                >
                  <div className={cx("card")}>
                    <i className="fa-solid fa-thumbtack"></i>{" "}
                    {/* Icon for BTG */}
                    <p>BTG</p>
                    <h3>
                      {balance && balance?.balance.toLocaleString("vi-VN")}
                    </h3>
                  </div>
                </div>

                <div
                  className={cx("col-lg-4", "col-md-6", "col-sm-12", "mb-4")}
                >
                  <div className={cx("card")}>
                    <i className="fa-solid fa-comments"></i>{" "}
                    {/* Icon for chat */}
                    <p>Đoạn chat</p>
                    <h3>0</h3>
                  </div>
                </div>

                <div
                  className={cx("col-lg-4", "col-md-6", "col-sm-12", "mb-4")}
                >
                  <div className={cx("card")}>
                    <i className="fa-solid fa-file-alt"></i>{" "}
                    {/* Icon for articles */}
                    <p>Số bài viết được tạo</p>
                    <h3>{countConversations}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className={cx("filter")}>
              {/* Nút Tháng này */}

              <button
                className={cx("filterBtn", {
                  active: activeFilter === "month",
                })}
                onClick={() => handleFilterChange("month")} // Kích hoạt trạng thái
              >
                <i className="fa-solid fa-calendar-day"></i> Tháng này
              </button>

              {/* Nút Tất cả */}
              <button
                className={cx("filterBtn", { active: activeFilter === "all" })}
                onClick={() => handleFilterChange("all")} // Kích hoạt trạng thái
              >
                <i className="fa-solid fa-calendar"></i> Tất cả
              </button>
            </div>
          </section>
        )}

        {/* AI Form Section */}
        <section className={cx("aiForm")}>
          <div>
            <h2 className={cx("heading")}>
              <i className="fa-solid fa-robot"></i> {/* Icon for AI */}
              Tạo nội dung dễ dàng với AI Form
            </h2>
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-12 p-4 mt-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className={cx("custom-badge", "badge p-2 mt-3")}>
                    Thường sử dụng nhất
                  </div>
                  <div className={cx("btnaction")}>
                    <Button
                      className="mt-3"
                      to="/templates/all"
                      outline
                      rightIcon={<i className="fa-solid fa-angle-right"></i>}
                    >
                      Xem tất cả
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="green"
                  title="Tạo bài SEO"
                  to={"/templates/custom/tao-bai-seo"}
                  icon={<i className="fa-solid fa-chart-line"></i>} // SEO icon
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="green"
                  title="Dịch mọi ngôn ngữ"
                  to={"/templates/custom/dich-moi-ngon-ngu"}
                  icon={<i className="fa-solid fa-language"></i>} // Translation icon
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="green"
                  to={"/templates/custom/viet-lai-theo-bai-mau"}
                  title="Viết lại theo bài mẫu"
                  icon={<i className="fa-solid fa-copy"></i>}
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="dark"
                  to={"/templates/custom/tao-bai-san-pham-gpt-4o"}
                  title="Tạo bài sản phẩm/dịch vụ với GPT 4o"
                  icon={<i className="fa-solid fa-robot"></i>}
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="dark"
                  to={"/templates/custom/bai-gioi-thieu-tren-website"}
                  title="Bài giới thiệu trên website"
                  icon={<i className="fa-regular fa-file-lines"></i>}
                />
              </div>

              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="blue"
                  to={"/templates/custom/xu-ly-anh"}
                  title="Xử lý ảnh"
                  icon={<i className="fa-solid fa-images"></i>}
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="blue"
                  to={"/templates/custom/viet-noi-dung-landing-page"}
                  title="Viết nội dung landing page"
                  icon={<i className="fa-solid fa-laptop-code"></i>} // Landing page icon
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="primary"
                  to={"/templates/custom/facebook-viet-bai-dang-chia-se"}
                  title="Facebook - Viết bài đăng chia sẻ"
                  icon={<i className="fa-solid fa-feather"></i>} // In-depth content icon
                />
              </div>

              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="primary"
                  to={"/templates/custom/facebook-viet-bai-dang-ban"}
                  title="Facebook - Viết bài đăng bán"
                  icon={<i className="fa-solid fa-feather-pointed"></i>} // In-depth content icon
                />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="blue"
                  to={"/templates/custom/kich-ban-livestream-don-gian"}
                  title="Kịch bản livestream đơn giản"
                  icon={<i className="fa-solid fa-broadcast-tower"></i>} // Livestream icon
                />
              </div>

              <div className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type="red"
                  to={"/templates/custom/viet-kich-ban-video-ngan"}
                  title="Viết kịch bản video ngắn"
                  icon={<i className="fa-solid fa-video"></i>} // Video script icon
                />
              </div>
            </div>
          </div>
        </section>

        <div className={cx("activity-container")}>
          <section className={cx("activity-section")}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className={cx("heading")}>
                <i className="fa-solid fa-clock mr-2"></i>
                Hoạt động
              </h2>
              <Link to="/created-content" className={cx("view-all-btn")}>
                <div className={cx("btnaction-recents")}>
                  <Button
                    className="mt-3"
                    outline
                    rightIcon={<i className="fa-solid fa-angle-right"></i>}
                  >
                    Xem lại
                  </Button>
                </div>
              </Link>
            </div>
            <p>Bài viết gần đây</p>
            <div className={cx("activityCards", "container-post")}>
              <div className="row">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conversation, index) => (
                    <div
                      key={index}
                      className={cx(
                        "col-lg-4",
                        "col-md-6",
                        "col-sm-12",
                        "mb-4"
                      )}
                    >
                      <ResultPrompt
                        content={conversation.content}
                        date={conversation.date}
                        quickView
                        contentId={conversation.id} // Đảm bảo dùng contentId
                      />
                    </div>
                  ))
                ) : (
                  <span className={cx("no-results")}>
                    Chưa có hoạt động gần đây
                  </span>
                )}
              </div>
            </div>

            {recentConversations.length > 0 && (
              <div className={cx("page-wrapper")}>
                <div className={cx("page-container")}>
                  <div
                    className={cx("page", { disabled: currentPage === 1 })}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <PrevPageIcon />
                  </div>
                  <span>
                    <div
                      className={cx("page", { active: currentPage === 1 })}
                      onClick={() => setCurrentPage(1)}
                    >
                      {currentPage} / {totalPages}
                    </div>
                  </span>
                  <button
                    className={cx("page", {
                      disabled: currentPage === totalPages,
                    })}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <NextPageIcon />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
