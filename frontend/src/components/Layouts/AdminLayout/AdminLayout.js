import classNames from "classnames/bind";

import styles from "./AdminLayout.module.scss";
import Header from "~/components/Layouts/components/Header";
import Footer from "~/components/Layouts/components/Footer";
import SidebarAdmin from "../components/SidebarAdmin";
import { Navigate } from "react-router-dom";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.role !== "admin") {
    // Điều hướng đến trang 403 nếu không có quyền truy cập
    return <Navigate to="/403" replace />;
  }

  return (
    <div className={cx("wrapper")}>
      <Header />
      <div className={cx("container")}>
        <SidebarAdmin />

        <div className={cx("content")}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminLayout;
