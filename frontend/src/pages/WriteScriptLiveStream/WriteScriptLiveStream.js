import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./WriteScriptLiveStream.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill"; // Thêm thư viện EventSource Polyfill
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const WriteScriptLiveStream = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("Chuyên nghiệp");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { setModalType } = useContext(ModalTypeContext);

  const handleGenerateScript = async () => {
    if (!product || !description) return;

    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
const token = localStorage.getItem("token");
    if(!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    const prompt = `
      Bạn là một chuyên gia livestream bán hàng với kinh nghiệm tạo kịch bản hấp dẫn. Dựa trên thông tin sau:
      - Sản phẩm: "${product}"
      - Mô tả: "${description}"
      - Phong cách: "${style}"
      
      Viết kịch bản livestream cho sản phẩm "${product}" với phong cách "${style}". Kịch bản cần có phần giới thiệu sản phẩm hấp dẫn, phần giải thích chi tiết về sản phẩm, và phần kêu gọi hành động để người xem mua hàng ngay. Kết quả kịch bản sẽ bao gồm phần mở đầu, phần chính, và phần kết thúc để tạo sự thu hút và tương tác từ người xem.
    `;

    try {
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
      <h1 className={cx("title")}>Kịch bản livestream đơn giản</h1>

      {/* Form */}
      <div className={cx("form")}>
        {/* Model Selection */}
        <ModelAI
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        {/* Product */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Sản phẩm</label>
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
            placeholder="Mô tả chi tiết sản phẩm"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Style */}
        <div className={cx("formGroup")}>
          <label htmlFor="style">Phong cách</label>
          <select
            id="style"
            className={cx("select")}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="Chuyên nghiệp">Chuyên nghiệp</option>
            <option value="Hài hước">Hài hước</option>
            <option value="Bí ẩn">Bí ẩn</option>
          </select>
        </div>

        {/* Button to generate script */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={loading || !product || !description}
        >
          {loading ? "Đang tạo kịch bản..." : "Sáng tạo kịch bản"}
        </button>
      </div>

     
      {/* Output for the detailed content */}
      <ResultPrompt content={result} loading={loading}/>
    </div>
  );
};

export default WriteScriptLiveStream;
