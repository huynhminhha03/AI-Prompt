import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import { EventSourcePolyfill } from "event-source-polyfill";

import styles from "./WriteContentFacebookSharing.module.scss";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const WriteContentFacebookSharing = () => {
  const { setModalType } = useContext(ModalTypeContext);

  const [selectedModel, setSelectedModel] = useState("");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [writingStyle, setWritingStyle] = useState("Chuyên nghiệp");
  const [customWritingStyle, setCustomWritingStyle] = useState(""); // Để lưu phong cách viết "Khác"
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý tạo bài đăng
  const handleGenerateContent = async () => {
    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
const token = localStorage.getItem("token");
    if(!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      
      const prompt = `Viết bài đăng Facebook cho sản phẩm "${product}" với phong cách "${writingStyle}". Mô tả chi tiết: "${description}". Bài viết cần hấp dẫn, ngắn gọn, và phù hợp với đối tượng người dùng trên Facebook. Đảm bảo bài đăng không quá 200 từ.`;

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
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Facebook - Viết bài chia sẻ</h1>
      <p className={cx("subtitle")}>
        Viết các bài chia sẻ thông tin thú vị, hữu ích, kiến thức (không bán
        hàng) trên Facebook và các mạng xã hội tương đồng.
      </p>

      <div className={cx("form")}>
        {/* AI Model */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>

        {/* Chủ đề chính */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Chủ đề chính</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Vd: Thói quen sống khỏe, Cách tiết kiệm tiền, ..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <small className={cx("note")}>
            Mô tả chủ đề chính của bài đăng, bạn muốn chia sẻ điều gì?
          </small>
        </div>

        {/* Mô tả ý chính */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Mô tả ý chính</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Nhập nội dung mô tả chi tiết..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Phong cách viết */}
        <div className={cx("formGroup")}>
          <label htmlFor="writingStyle">Phong cách viết</label>
          <select
            id="writingStyle"
            className={cx("select")}
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
          >
            <option value="Chuyên nghiệp">Chuyên nghiệp</option>
            <option value="Hài hước">Hài hước</option>
            <option value="Bí ẩn">Bí ẩn</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Hiển thị ô nhập nếu chọn "Khác" */}
        {writingStyle === "Khác" && (
          <div className={cx("formGroup")}>
            <label htmlFor="customWritingStyle">Phong cách viết khác</label>
            <input
              id="customWritingStyle"
              type="text"
              className={cx("input")}
              placeholder="Nhập phong cách viết của bạn"
              value={customWritingStyle}
              onChange={(e) => setCustomWritingStyle(e.target.value)}
            />
            <small className={cx("note")}>
              Nếu bạn chọn "Khác", vui lòng nhập phong cách viết tại đây.
            </small>
          </div>
        )}

        {/* Nút tạo bài đăng */}
        <button
          className={cx("button")}
          onClick={handleGenerateContent}
          disabled={loading || !product || !description}
        >
          {loading ? "Đang tạo nội dung..." : "Tạo bài đăng"}
        </button>
      </div>

      {/* Kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default WriteContentFacebookSharing;
