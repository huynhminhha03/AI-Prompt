import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreateSeoBlog.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const CreateSeoBlog = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [mainKeyword, setMainKeyword] = useState("");
  const [relatedKeywords, setRelatedKeywords] = useState("");
  const [ideas, setIdeas] = useState("");
  const [role, setRole] = useState("");
  const [seoContent, setSeoContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // Trạng thái hợp lệ của form
  const [model, setModel] = useState("");
  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(
      mainKeyword.trim() &&
        relatedKeywords.trim() &&
        ideas.trim() &&
        role.trim()
    );
  };

  // Gọi kiểm tra mỗi khi một trường thay đổi
  useEffect(() => {
    validateForm();
  }, [mainKeyword, relatedKeywords, ideas, role]);

  const handleCreateSeoBlog = async () => {
    setLoading(true);
    setSeoContent(""); // Reset lại nội dung cũ trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `Bạn là ${role}, hãy viết một bài viết chuẩn SEO với từ khoá chính là "${mainKeyword}", từ khoá liên quan là "${relatedKeywords}", và những ý cần có trong bài viết là "${ideas}". Bài viết đảm bảo tự nhiên, hữu ích, và thân thiện với công cụ tìm kiếm.`;
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setSeoContent((prev) => prev + data); // Dồn dữ liệu trả về vào seoContent
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        console.log("SSE connection closed.");
        setLoading(false);
      };
    } catch (error) {
      console.error("Error creating SEO blog:", error);
      setSeoContent("Đã xảy ra lỗi khi tạo bài viết SEO.");
      setLoading(false);
    }
  };

  return (
    <div className={cx("seoContainer")}>
      <h1 className={cx("header")}>Tạo bài SEO</h1>
      <p className={cx("description")}>Tạo bài SEO đơn giản và tự nhiên</p>

      <div className={cx("form")}>
        <ModelAI selectedModel={model} setSelectedModel={setModel} />
        {/* Input group for main keyword */}
        <div className={cx("inputGroup")}>
          <label htmlFor="mainKeyword">Từ khoá chính(*)</label>
          <input
            type="text"
            id="mainKeyword"
            placeholder="Nhập 1 từ khoá chính"
            value={mainKeyword}
            onChange={(e) => setMainKeyword(e.target.value)}
          />
        </div>

        {/* Input group for related keywords */}
        <div className={cx("inputGroup")}>
          <label htmlFor="relatedKeywords">Từ khoá liên quan(*)</label>
          <input
            type="text"
            id="relatedKeywords"
            placeholder="Nhập 1 hoặc nhiều từ khoá liên quan"
            value={relatedKeywords}
            onChange={(e) => setRelatedKeywords(e.target.value)}
          />
        </div>

        {/* Input group for ideas */}
        <div className={cx("inputGroup")}>
          <label htmlFor="ideas">
            Liệt kê những ý bạn muốn có trong bài viết(*)
          </label>
          <textarea
            id="ideas"
            rows="4"
            placeholder="Nhập các ý bạn muốn có trong bài viết"
            value={ideas}
            onChange={(e) => setIdeas(e.target.value)}
          ></textarea>
        </div>

        {/* Input group for role */}
        <div className={cx("inputGroup")}>
          <label htmlFor="role">Vai trò của bạn(*)</label>
          <input
            type="text"
            id="role"
            placeholder="Nhập vai trò của bạn (VD: Chuyên gia SEO)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <button
          className={cx("button")}
          onClick={handleCreateSeoBlog}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo bài..." : "Tạo Bài SEO"}
        </button>
      </div>

      <ResultPrompt content={seoContent} loading={loading} />
    </div>
  );
};

export default CreateSeoBlog;
