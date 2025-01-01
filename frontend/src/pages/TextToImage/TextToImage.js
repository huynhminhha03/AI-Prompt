import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./TextToImage.module.scss"; // Import ReactMarkdown
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import { authAPI } from "~/utils/api";

const cx = classNames.bind(styles);

const TextToImage = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [textPrompt, setTextPrompt] = useState(
    ""
  ); // Văn bản input từ người dùng
  const [imageResult, setImageResult] = useState(""
    // "https://oaidalleapiprodscus.blob.core.windows.net/private/org-Lr1oJjt0tDnkUXTfV9ZIFWpH/user-o8tT5ywgY5Am694Od58hEwK3/img-2qmobrD93t6Uv5jbzxIBRaly.png?st=2024-12-11T08%3A48%3A44Z&se=2024-12-11T10%3A48%3A44Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-12-10T21%3A17%3A17Z&ske=2024-12-11T21%3A17%3A17Z&sks=b&skv=2024-08-04&sig=jRVqaMGNX5jHSAHCWPbiv6OPiYPq4uNJyv7sqcG05DI%3D"
  ); // URL kết quả trả về
  const [loading, setLoading] = useState(false); // Trạng thái loading

  const handleGenerateImage = async () => {
    if (!textPrompt.trim()) {
      alert("Vui lòng nhập mô tả hình ảnh.");
      return;
    }
    setImageResult("");
    setLoading(true); // Bắt đầu loading
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const response = await authAPI().get(`/openai/text-to-image?prompt=${encodeURIComponent(textPrompt)}`);
      setImageResult(response.data.image);
      setLoading(false);
    } catch (error) {
      console.error("Error generating script:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("textToImageContainer")}>
      <h1 className={cx("header")}>Chuyển văn bản thành hình ảnh</h1>
      <p className={cx("description")}>Nhập mô tả và tạo hình ảnh</p>

      {/* Input và nút gửi */}
      <div className={cx("form")}>
        <div className={cx("inputGroup")}>
          <label htmlFor="textPrompt">Mô tả hình ảnh(*)</label>
          <textarea
            type="text"
            id="textPrompt"
            placeholder="Nhập mô tả hình ảnh"
            value={textPrompt}
            rows="6"
            onChange={(e) => setTextPrompt(e.target.value)}
          />
        </div>

        <button
          className={cx("button")}
          onClick={handleGenerateImage}
          disabled={loading || !textPrompt.trim()}
        >
          {loading ? "Đang tạo ảnh..." : "Tạo Hình Ảnh"}
        </button>
      </div>
      <ResultPrompt content={imageResult} loading={loading} />
    </div>
  );
};

export default TextToImage;
