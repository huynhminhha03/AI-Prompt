import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./SeoMenu.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const SeoMenu = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [category, setCategory] = useState(""); // Thể loại menu
  const [keywords, setKeywords] = useState(""); // Từ khóa chính
  const [description, setDescription] = useState(""); // Nội dung chính
  const [uniquePoints, setUniquePoints] = useState(""); // Điểm đặc biệt
  const [result, setResult] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = () => {
    setIsFormValid(
      category.trim() &&
      keywords.trim() &&
      description.trim() 
    );
  };

  useEffect(() => {
    validateForm();
  }, [category, keywords, description, uniquePoints]);

  const handleGenerateMenu = async () => {
    setLoading(true);
    setResult("");
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `Viết nội dung SEO cho một menu với thể loại "${category}". 
      Từ khóa chính: "${keywords}". 
      Nội dung chính: "${description}". 
      Điểm đặc biệt: "${uniquePoints}". 
      Nội dung cần ngắn gọn, hấp dẫn, tập trung vào điểm nổi bật.`;

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

      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        console.log("SSE connection closed.");
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating menu:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>SEO Menu</h1>
      <p className={cx("subtitle")}>
        Tạo nội dung SEO cho menu sản phẩm hoặc dịch vụ một cách nhanh chóng
      </p>

      <div className={cx("form")}>
        {/* Model Selection */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>
        {/* Category */}
        <div className={cx("formGroup")}>
          <label htmlFor="category">Thể loại menu</label>
          <input
            id="category"
            type="text"
            className={cx("input")}
            placeholder="Thể loại danh sách sản phẩm/dịch vụ"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* Keywords */}
        <div className={cx("formGroup")}>
          <label htmlFor="keywords">Từ khóa chính</label>
          <input
            id="keywords"
            type="text"
            className={cx("input")}
            placeholder="Nhập các từ khóa chính"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Nội dung chính</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Nhập nội dung chính cho menu"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateMenu}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo nội dung..." : "Tạo nội dung"}
        </button>
      </div>

      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default SeoMenu;
