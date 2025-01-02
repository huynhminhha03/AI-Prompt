import classNames from "classnames/bind";
import styles from "./Footer.module.scss";
const cx = classNames.bind(styles);

function Footer() {
  return (
    <footer className={cx("footer")}>
      <p>© 2024 RTCGroupAI - Bạn Hỏi, AI trả lời. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
