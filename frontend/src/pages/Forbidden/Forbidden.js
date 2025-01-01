import React from "react";
import classNames from "classnames/bind";
import styles from "./Forbidden.module.scss";
import { useNavigate } from "react-router-dom";
import Logo from "~/components/Logo";

const cx = classNames.bind(styles);

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className={cx("forbidden")}>
      <Logo />
      <section className={cx("container")}>
        <div className={cx("status-icon")}>
          <i className="fa-solid fa-ban"></i>
        </div>
        <h2 className={cx("title")}>403 - Không có quyền truy cập</h2>
        <p className={cx("description")}>
          Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra quyền
          hạn hoặc liên hệ với quản trị viên.
        </p>
        <button
          className={cx("home-button")}
          onClick={() => navigate("/", { replace: true })}
        >
          Quay về trang chủ
        </button>
      </section>
    </div>
  );
};

export default Forbidden;
