import React, { useEffect, useState } from "react";
import styles from "./CreatedContent.module.scss";
import userServices from "~/services/userServices.js";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import ResultPrompt from "~/components/ResultPrompt/ResultPrompt.js";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { motion, AnimatePresence } from "framer-motion";

const cx = classNames.bind(styles);

export default function CreatedContent() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recentConversations, setRecentConversations] = useState([]);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await userServices.getAllConversations(
          currentPage,
          itemsPerPage
        );
        setRecentConversations(response.conversations);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error getting recent conversations:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <motion.div
      className={cx("created-content")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={cx("activity-container")}>
        <motion.section
          className={cx("activity-section")}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={cx("section-header")}>
            <h2 className={cx("heading")}>
              <Link to="/" className={cx("back")}>
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              Bài viết đã tạo
            </h2>
            <p className={cx("description")}>
              Xem tất cả bài viết đã tạo trong thời gian gần đây
            </p>
          </div>

          <AnimatePresence>
            {loading ? (
              <motion.p
                key="loading"
                className={cx("loading")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Đang tải dữ liệu...
              </motion.p>
            ) : recentConversations.length > 0 ? (
              <motion.div
                className={cx("activity-cards")}
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {recentConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    className={cx("card-wrapper")}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <ResultPrompt
                      content={conversation.content}
                      date={conversation.date}
                      quickView
                      contentId={conversation.id} // Đảm bảo dùng contentId
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.p
                key="no-data"
                className={cx("no-data")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Không có bài viết nào!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Phần phân trang */}
      <motion.div
        className={cx("page-wrapper")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className={cx("page-container")}>
          <div
            className={cx("page", { disabled: currentPage === 1 })}
            onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
          >
            <PrevPageIcon />
          </div>
          {[...Array(totalPages)].map((_, pageNumber) => (
            <div
              key={pageNumber + 1}
              className={cx("page", { active: currentPage === pageNumber + 1 })}
              onClick={() => handlePageClick(pageNumber + 1)}
            >
              {pageNumber + 1}
            </div>
          ))}
          <div
            className={cx("page", { disabled: currentPage === totalPages })}
            onClick={() =>
              currentPage < totalPages && handlePageClick(currentPage + 1)
            }
          >
            <NextPageIcon />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
