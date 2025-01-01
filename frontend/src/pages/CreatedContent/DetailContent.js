"use client";

import { useState, useEffect, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./DetailContent.module.scss";
import Spinner from "~/components/Spinner";
import { motion } from "framer-motion";
import { userApis, authAPI } from "~/utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
const cx = classNames.bind(styles);

function DetailContent({ id }) {
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await authAPI().get(
          userApis.getConversationDetail(id)
        );
        setContent(response.data.conversation);
      } catch (error) {
        console.error("Error getting content detail:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(content.content).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  }, [content.content]);

  const renderContent = () => {
    if (
      content.content.startsWith("http") &&
      /\.(jpg|jpeg|png|gif)$/i.test(content.content)
    ) {
      return <img src={content.content} alt="Result content" />;
    } else if (
      content.content.startsWith("http") &&
      /\.(mp3|wav)$/i.test(content.content)
    ) {
      return (
        <audio controls>
          <source src={content.content} type="audio/mpeg" />
          Trình duyệt của bạn không hỗ trợ phát âm thanh.
        </audio>
      );
    } else {
      return (
        <ReactMarkdown
          className={cx("main-results")}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content.content.startsWith("http")
            ? `![Alt text](${content.content})`
            : content.content}
        </ReactMarkdown>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cx("detail-content")}
    >
      {isLoading ? (
        <div className={cx("loading-container")}>
          <Spinner />
        </div>
      ) : (
        <>
          <div className=" heading d-flex justify-content-between align-items-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Chi tiết bài viết
            </motion.h1>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={copyToClipboard}
              className={cx("copy-button")}
            >
              <i
                className={`fa-solid ${isCopied ? "fa-check" : "fa-copy"}`}
              ></i>
            </motion.button>
          </div>
          <div className={cx("meta-info")}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={cx("meta-item")}
            >
              <span>ID: {content.id}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={cx("meta-item")}
            >
              <span>
                Ngày tạo:{" "}
                {content.created_at ? formatDate(content.created_at) : "N/A"}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={cx("meta-item")}
            >
              <span>
                Time:{" "}
                {content.created_at ? formatTime(content.created_at) : "N/A"}
              </span>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={cx("content")}
          >
            {renderContent()}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default DetailContent;
