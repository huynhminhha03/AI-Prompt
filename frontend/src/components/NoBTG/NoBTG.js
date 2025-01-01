import classNames from 'classnames/bind';
import styles from './NoBTG.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function NoBTG() {
    return ( 
        <div className={cx("alert-box")}>
        Bạn đã sử dụng hết BTG hoặc hết hạn chat. Vui lòng mua thêm gói để tiếp
        tục.{" "}
        <Link to="/pricing" className={cx("purchase-link")}>
          Mua ngay
        </Link>
      </div>
     );
}

export default NoBTG;