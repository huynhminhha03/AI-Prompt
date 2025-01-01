import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./RewriteArticle.module.scss";
import ModelAI from "~/components/ModelAI";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import { EventSourcePolyfill } from "event-source-polyfill";

const cx = classNames.bind(styles);

const RewriteArticle = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [postType, setPostType] = useState("Viết lại hay hơn");
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");
    const token = localStorage.getItem("token");

    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }

    try {
      // Xử lý prompt tùy thuộc vào loại bài đăng
      let actionDescription = "";
      switch (postType) {
        case "Viết lại hay hơn":
          actionDescription =
            "Cải thiện nội dung với ngôn từ hay hơn, câu cú mạch lạc hơn.";
          break;
        case "Viết bài viết từ outline":
          actionDescription = "Viết bài hoàn chỉnh từ outline cung cấp.";
          break;
        case "Viết 1 đoạn trong outline":
          actionDescription = "Tạo 1 đoạn văn ngắn dựa trên 1 ý trong outline.";
          break;
        case "Viết lại với phong cách tò mò":
          actionDescription =
            "Viết lại nội dung theo cách kích thích tò mò, hấp dẫn.";
          break;
        case "Viết lại với phong cách thú vị":
          actionDescription =
            "Viết lại nội dung với giọng điệu hài hước hoặc lôi cuốn.";
          break;
        case "Viết lại và khác bản gốc":
          actionDescription =
            "Viết lại nội dung hoàn toàn mới nhưng giữ ý chính.";
          break;
        default:
          actionDescription = "Viết lại nội dung theo cách phù hợp.";
      }

      // Prompt
      const prompt = `
Hãy ${actionDescription}
- **Nội dung ban đầu**: ${idea}.
- **Yêu cầu cụ thể**:
  - Đối với "${postType}": ${actionDescription}.
  - Giữ tính logic, dễ đọc và phù hợp với mục đích sử dụng.
- **Giọng điệu**: Tự nhiên, sáng tạo.
      `;

      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Nhận dữ liệu từ server
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResult((prev) => prev + data);
      };

      // Xử lý lỗi
      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

      // Kết thúc kết nối
      eventSource.onclose = () => {
        console.log("SSE connection closed.");
        setLoading(false);
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>
        Viết lại - viết đoạn văn, bài viết, outline
      </h1>
      <p className={cx("subtitle")}>
        Gửi vào bài viết hoặc outline, HoiAI sẽ giúp bạn viết lại tốt hơn. GPT-4
        sẽ chuẩn hơn, dành cho gói nâng cao (trừ nhiều lần chat hơn).
      </p>
      <div className={cx("form-container")}>
        <div className={cx("form-left")}>
          <div>
            {/* AI Model */}
            <ModelAI
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
          {/* Post Type */}
          <div className={cx("formGroup")}>
            <label htmlFor="postTypeSelect">Loại bài đăng</label>
            <select
              id="postTypeSelect"
              className={cx("select")}
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              <option value="Viết lại hay hơn">Viết lại hay hơn</option>
              <option value="Viết bài viết từ outline">
                Viết bài viết từ outline
              </option>
              <option value="Viết 1 đoạn trong outline">
                Viết 1 đoạn trong outline
              </option>
              <option value="Viết lại với phong cách tò mò">
                Viết lại với phong cách tò mò
              </option>
              <option value="Viết lại với phong cách thú vị">
                Viết lại với phong cách thú vị
              </option>
              <option value="Viết lại và khác bản gốc">
                Viết lại và khác bản gốc
              </option>
            </select>
          </div>

          {/* Idea */}
          <div className={cx("formGroup")}>
            <label htmlFor="idea">Ý tưởng ban đầu</label>
            <textarea
              id="idea"
              className={cx("textarea")}
              placeholder="Nhập bài viết, outline hoặc ý tưởng bạn muốn viết lại..."
              rows="5"
              maxLength="9000"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <small className={cx("charCount")}>{idea.length}/9,000 ký tự</small>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={cx("button")}
        onClick={handleSubmit}
        disabled={!idea.trim() || loading}
      >
        {loading ? "Đang xử lý..." : "Viết"}
      </button>
      {/* Hiển thị kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default RewriteArticle;
