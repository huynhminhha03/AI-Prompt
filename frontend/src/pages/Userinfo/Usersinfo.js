  import React from "react";
  import classNames from "classnames/bind";
  import styles from "./Userinfo.module.scss";
  import { Link } from "react-router-dom";

  const cx = classNames.bind(styles);

  function Userinfo() {
    return (
      <div className={cx("users-container")}>
        {/* Tiêu đề */}
        <div className={cx("title")}>Tài khoản</div>

        {/* Danh sách các mục */}
        <div className={cx("menu-list")}>
          {/* Hồ sơ */}
          <Link to="/user/profile">
            <div className={cx("menu-item")}>
              <span  className={cx("menu-icon")}>
                <i className="fa-solid fa-calendar-day"></i>
              </span>
              <div className={cx("menu-content")}>
                <p className={cx("menu-title")}>Hồ sơ</p>
                <p className={cx("menu-description")}>
                  Cập nhật thông tin của bạn
                </p>
              </div>
              <div>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </Link>

          {/* Bảo mật */}
          <Link to="/user/change-password">
            <div className={cx("menu-item")}>
              <span className={cx("menu-icon")}>
                <i className="fa-solid fa-lock"></i>
              </span>
              <div className={cx("menu-content")}>
                <p className={cx("menu-title")}>Bảo mật</p>
                <p className={cx("menu-description")}>
                  Thay đổi thông tin cá nhân của bạn
                </p>
              </div>
              
              <div>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </Link>

          {/* Thanh toán */}
          <Link to="/user/pay">
            <div className={cx("menu-item")}>
              <span className={cx("menu-icon")}>
                <i className="fa-solid fa-credit-card"></i>
              </span>
              <div className={cx("menu-content")}>
                <p className={cx("menu-title")}>Thanh toán</p>
                <p className={cx("menu-description")}>
                  Xem thanh toán và hóa đơn của bạn
                </p>
              </div>
              <div>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </Link>
          {/* Usage History */}
          <Link to="/user/usage-history">
            <div className={cx("menu-item")}>
              <span className={cx("menu-icon")}>
                <i className="fa-solid fa-history"></i>
              </span>
              <div className={cx("menu-content")}>
                <p className={cx("menu-title")}>Lịch sử sử dụng</p>
                <p className={cx("menu-description")}>
                  Xem lịch sử sử dụng của bạn
                </p>
              </div>
              <div>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  export default Userinfo;