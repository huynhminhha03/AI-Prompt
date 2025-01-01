import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreateDiverseFacebookPosts.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const CreateDiverseFacebookPosts = () => {
  const [product, setProduct] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("Chuyên nghiệp");
  
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // Trạng thái hợp lệ của form
  const [selectedModel, setSelectedModel] = useState("");

  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(product.trim() && description.trim());
  };

  // Gọi kiểm tra mỗi khi một trường thay đổi
  useEffect(() => {
    validateForm();
  }, [product, description]);

  // Hàm tạo kịch bản
  const handleGenerateScript = () => {
    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `Viết kịch bản video ngắn cho sản phẩm "${product}" với phong cách "${style}". Mô tả chi tiết: "${description}". Kịch bản cần ngắn gọn, hấp dẫn, và phù hợp với quảng cáo ngắn.`;

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
        setResult((prev) => prev + data); // Dồn dữ liệu trả về vào result
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
      console.error("Error generating script:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Viết kịch bản video ngắn</h1>
      <p className={cx("subtitle")}>
        Giúp bạn tạo các kịch bản video ngắn nhanh chóng và dễ dàng
      </p>

      {/* Form */}
      <div className={cx("form")}>
        {/* Model Selection */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Product */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Sản phẩm quảng cáo</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên sản phẩm"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Chi tiết sản phẩm hoặc ý tưởng chính video"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Style */}
        <div className={cx("formGroup")}>
          <label htmlFor="styleSelect">Phong cách video</label>
          <select
            id="styleSelect"
            className={cx("select")}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="Chuyên nghiệp">Chuyên nghiệp</option>
            <option value="Hài hước">Hài hước</option>
            <option value="Cảm hứng">Cảm hứng</option>
          </select>
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo kịch bản..." : "Tạo kịch bản"}
        </button>
      </div>

      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default CreateDiverseFacebookPosts;