import images from "~/assets/images";
import { Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Logo.module.scss";

const cx = classNames.bind(styles);

function Logo({ noName }) {
    return ( 
        <div className={cx("logo-container")}>
        <Link to="/" >
          <img src={images.logo} alt="RTC AI" className={cx("logo")} />
        </Link>
        {!noName && <span className={cx("company-name")}>RTC AI</span>}
      </div>
     );
}

export default Logo;