import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreateFacebookPostFromBrief.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const CreateFacebookPostFromBrief = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [product, setProduct] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("Chuyên nghiệp");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(product.trim() && description.trim());
  };

  // Kiểm tra tính hợp lệ mỗi khi trường dữ liệu thay đổi
  useEffect(() => {
    validateForm();
  }, [product, description]);

  // Hàm tạo bài đăng từ brief
  const handleGenerateScript = async () => {
    setLoading(true);
    setResult(""); // Reset kết quả cũ
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      // Prompt tối ưu hóa
      const prompt = `
Hãy viết một bài đăng Facebook hấp dẫn về sản phẩm "${product}" với phong cách "${style}".
- **Mô tả sản phẩm**: ${description}.
- **Mục tiêu bài đăng**: Thu hút sự chú ý, khuyến khích khách hàng hành động (like, share, hoặc mua sản phẩm).
- **Ngôn ngữ**: Gần gũi, thân thiện, phù hợp với khách hàng trên mạng xã hội.
- **Kích thước bài viết**: Tối đa 100 từ, ngắn gọn và tập trung vào giá trị cốt lõi.
      `;

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
        setResult((prev) => prev + data); // Cập nhật kết quả từng phần
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
      console.error("Error generating script:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Tạo bài đăng Facebook từ brief</h1>

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
          <label htmlFor="product">Tên sản phẩm</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên sản phẩm"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Style */}
        <div className={cx("formGroup")}>
          <label htmlFor="style">Phong cách bài đăng</label>
          <select
            id="style"
            className={cx("select")}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="Chuyên nghiệp">Chuyên nghiệp</option>
            <option value="Vui vẻ">Vui vẻ</option>
            <option value="Hiện đại">Hiện đại</option>
            <option value="Sáng tạo">Sáng tạo</option>
          </select>
        </div>

        {/* Description */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Ý tưởng ban đầu / Brief</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Nhập mô tả chi tiết về sản phẩm hoặc ý tưởng chính"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo bài đăng..." : "Tạo bài đăng"}
        </button>
      </div>

      {/* Hiển thị kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default CreateFacebookPostFromBrief;
