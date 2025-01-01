import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./SeoHomepage.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const SeoHomepage = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [mainIdeas, setMainIdeas] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(topic.trim() && mainIdeas.trim() && keywords.trim());
  };

  // Gọi kiểm tra mỗi khi một trường thay đổi
  useEffect(() => {
    validateForm();
  }, [topic, mainIdeas, keywords, mainIdeas]);

  // Hàm tạo nội dung
  const handleGenerateContent = async () => {
    setLoading(true);
    setResult("");
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `Bạn là chuyên gia viết nội dung website. Viết nội dung mô tả cho trang chủ của website với chủ đề "${topic}". Nội dung cần viết theo phong cách quảng cáo, trực diện vào thông tin chính và lợi ích. Sử dụng từ khóa "${keywords}". Ý chính cần thể hiện: "${mainIdeas}". Tránh các từ ngữ khuôn mẫu như "chào mừng", "menu", "trang chủ", "website", "khám phá".`;

      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResult((prev) => prev + data);
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>SEO Homepage</h1>
      <p className={cx("subtitle")}>
        Bạn là chuyên gia viết nội dung website. Bạn hỗ trợ viết nội dung mô tả
        cho trang chủ website. Lưu ý viết theo phong cách quảng cáo, trực diện
        vào chủ đề và thông tin chính và lợi ích, không sử dụng các từ ngữ khuôn
        mẫu như "chào mừng", "menu", "trang chủ", "website", "khám phá".
      </p>

      {/* Form */}
      <div className={cx("form")}>
        {/* Model Selection */}
        <div>
          {/* AI Model */}
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>

        {/* Topic */}
        <div className={cx("formGroup")}>
          <label htmlFor="topic">Chủ đề website</label>
          <input
            id="topic"
            type="text"
            className={cx("input")}
            placeholder="Vd: Công ty ABC cung cấp các sản phẩm XYZ"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <small className={cx("smallstyle")}>
            Vd: công ty abc cung cấp các sản phẩm xyz
          </small>
        </div>

        {/* Keywords */}
        <div className={cx("formGroup")}>
          <label htmlFor="keywords">Từ khóa chính</label>
          <input
            id="keywords"
            type="text"
            className={cx("input")}
            placeholder="Nhập từ khóa chính liên quan"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* Main Ideas */}
        <div className={cx("formGroup")}>
          <label htmlFor="mainIdeas">Vài ý chính muốn thể hiện</label>
          <textarea
            id="mainIdeas"
            className={cx("textarea")}
            placeholder="Các thông tin quan trọng, lợi ích, giá trị muốn làm nổi bật"
            rows="4"
            value={mainIdeas}
            onChange={(e) => setMainIdeas(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateContent}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo nội dung..." : "Tạo nội dung"}
        </button>
      </div>

      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default SeoHomepage;
