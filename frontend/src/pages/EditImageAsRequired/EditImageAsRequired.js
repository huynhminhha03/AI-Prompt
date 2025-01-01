import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./EditImageAsRequired.module.css";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const RewritePrompt = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("GPT-4o Mini");
  const [promptSample, setPromptSample] = useState(""); // Prompt mẫu dùng để học
  const [promptToRewrite, setPromptToRewrite] = useState(""); // Prompt cần viết lại
  const [result, setResult] = useState(""); // Kết quả
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // Trạng thái hợp lệ của form
  const [selectedModel, setSelectedModel] = useState(""); // Danh sách ngôn ngữ
  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(promptSample.trim() && promptToRewrite.trim());
  };

  // Gọi kiểm tra mỗi khi một trường thay đổi
  useEffect(() => {
    validateForm();
  }, [promptSample, promptToRewrite]);

  // Hàm xử lý viết lại prompt
  const handleRewritePrompt = async () => {
    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }

    try {
      // Tạo prompt từ mẫu và prompt cần viết lại
      const prompt = `Viết lại prompt vẽ ảnh sau khi học từ prompt mẫu. Prompt mẫu: "${promptSample}". Prompt cần viết lại: "${promptToRewrite}".`;

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
      console.error("Error rewriting prompt:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Viết lại prompt vẽ ảnh</h1>
      <p className={cx("subtitle")}>
        Bạn nhập prompt mẫu để AI học vào, sau đó nhập prompt vẽ cần viết lại
      </p>

      {/* Form */}
      <div className={cx("form")}>
        {/* AI Model Selection */}
        <div >
        <ModelAI
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        </div>

        {/* Prompt Mẫu */}
        <div className={cx("formGroup")}>
          <label htmlFor="promptSample">Prompt mẫu dùng để học</label>
          <textarea
            id="promptSample"
            className={cx("textarea")}
            placeholder="Nhập prompt mẫu mà AI sẽ học"
            rows="4"
            value={promptSample}
            onChange={(e) => setPromptSample(e.target.value)}
          />
        </div>

        {/* Prompt cần viết lại */}
        <div className={cx("formGroup")}>
          <label htmlFor="promptToRewrite">Prompt cần viết lại</label>
          <textarea
            id="promptToRewrite"
            className={cx("textarea")}
            placeholder="Nhập prompt cần viết lại"
            rows="4"
            value={promptToRewrite}
            onChange={(e) => setPromptToRewrite(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleRewritePrompt}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang viết lại..." : "Viết lại prompt"}
        </button>
      </div>

      {/* Kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default RewritePrompt;
