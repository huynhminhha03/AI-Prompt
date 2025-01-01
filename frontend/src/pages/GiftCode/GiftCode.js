import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames/bind";
import styles from "./GiftCode.module.scss";
import { authAPI, userApis } from "~/utils/api";
import GiftIcon from "./GiftIcon";
import Confetti from "./Confetti";

const cx = classNames.bind(styles);

const GiftCode = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [btg, setBTG] = useState(0);
  const [showBTG, setShowBTG] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setResponse({
        success: false,
        message: "Vui lòng nhập mã quà tặng.",
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    try {
      const res = await authAPI().post(userApis.checkGiftCode, {
        code,
      });
      const data = res.data;
      setResponse({ success: true, message: data.message });
      setBTG(data.amount);
      setIsOpen(true);
      setShowBTG(true);
      setTimeout(() => setShowBTG(false), 2000); // Hiển thị BTGn trong 2 giây
    } catch (error) {
      console.error("Error redeeming gift code:", error);
      setResponse({
        success: false,
        message: error.response.data.message || "Mã không tồn tại.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response) {
      const timeout = setTimeout(() => {
        setResponse(null);
        setIsOpen(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [response]);

  return (
    <div className={cx("container")}>
      <AnimatePresence>
        {showBTG && (
          <motion.div
            className={cx("btg-popup")}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {console.log(btg)}
            +{btg} BTG
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={cx("card")}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={cx("icon-container")}
          animate={{
            rotate: isOpen ? [0, -5, 5, -5, 5, 0] : 0,
            y: isOpen ? [0, -10, 0] : 0,
          }}
          transition={{ duration: 1, repeat: isOpen ? 1 : 0 }}
        >
          <GiftIcon isOpen={isOpen} />
          {isOpen && <Confetti />}
        </motion.div>
        <h2 className={cx("title")}>Nhập Mã Quà Tặng</h2>
        <form onSubmit={handleRedeem} className={cx("form")}>
          <input
            type="text"
            className={cx("input")}
            placeholder="Nhập mã quà tặng của bạn"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className={cx("button")}
            type="submit"
            disabled={!code.trim() || loading}
          >
            {loading ? "Đang kiểm tra..." : "Nhận quà"}
          </button>
        </form>
        <AnimatePresence>
          {response && (
            <motion.div
              className={cx("response", response.success ? "success" : "error")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p>{response.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GiftCode;
