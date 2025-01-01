import React, { useState } from 'react'
import styles from './BTGCoin.module.scss'
import userServices from '~/services/userServices'

const BTGCoin = ({ balance, updateBalance }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleUseCoin = async () => {
    // Giả định là có API sử dụng coin
    try {
      await userServices.useCoin();
      updateBalance();  // Cập nhật số dư ngay khi hoàn thành
    } catch (error) {
      console.error("Failed to use coin:", error);
    }
  };

  return (
    <div
      className={styles.btgCoin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleUseCoin}  // Gọi hàm khi click vào coin
    >
      <div className={styles.coinContent}>
        <i className={`${styles.coinIcon} fas fa-coins`}></i>
        <span className={`${styles.balance} ${isHovered ? styles.visible : ''}`}>
          {balance.toLocaleString()} BTG
        </span>
      </div>
    </div>
  );
};

export default BTGCoin
