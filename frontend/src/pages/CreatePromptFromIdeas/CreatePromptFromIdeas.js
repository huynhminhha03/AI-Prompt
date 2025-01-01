import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreatePromptFromIdeas.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";

const cx = classNames.bind(styles);

const CreatePromptFromIdeas = () => {
  const { setModalType } = useContext(ModalTypeContext);

  const model = "gpt-3.5-turbo"; // Model AI sử dụng
  const [idea, setIdea] = useState(""); // Ý tưởng hình ảnh ban đầu
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  // loại bài đăng
  const [post, setPost] = useState("");

  const handleGeneratePrompt = async () => {
    setLoading(true);
    setResult(""); // Reset kết quả cũ
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      // Tạo prompt từ loại bài đăng và ý tưởng hình ảnh ban đầu
      const prompt = `Viết bài ${post}: ${idea}`;

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
      console.error("Error generating prompt:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Facebook - Viết bài đăng đa dạng</h1>
      <p className={cx("subtitle")}>
        Viết bài chia sẻ link sản phẩm, link bài viết trên website. Viết status
        đăng facebook cá nhân hoặc fanpage. Mẹo: Nên viết lại 2-3 lần sẽ thấy
        lần sau viết tốt hơn lần trước (bấm nút "Tạo" nữa sẽ viết lại)
      </p>

      <div className="row mx-n2">
        <div className="col-12 col-lg-5 px-2">
          {/* Loại bài đăng */}
          <div className={cx("formGroup")}>
            <label htmlFor="modelSelect">Loại bài đăng</label>
            <select
              id="modelSelect"
              className={cx("select")}
              value={post}
              onChange={(e) => setPost(e.target.value) }
            >
              <option value="share_product">Chia sẻ bài sản phẩm</option>
              <option value="share_post">Chia sẻ bài viết</option>
              <option value="funny_short_status">Status ngắn hài hước</option>
              <option value="curious_short_status">Status ngắn tò mò</option>
              <option value="discuss_short_status">
                Status ngắn tạo thảo luận
              </option>
              <option value="professional_long_status">
                Status dài chuyên nghiệp
              </option>
              <option value="interesting_long_status">Status dài thú vị</option>
              <option value="story_status">Status câu chuyện</option>
            </select>
          </div>

          {/* Ý tưởng hình ảnh ban đầu */}
          <div className={cx("formGroup")}>
            <label htmlFor="idea">Ý tưởng hình ảnh ban đầu</label>
            <textarea
              id="idea"
              className={cx("textarea")}
              placeholder="Nhập ý tưởng hình ảnh của bạn"
              rows="4"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button
            className={cx("button")}
            onClick={handleGeneratePrompt}
            disabled={!idea.trim() || loading}
          >
            {loading ? "Đang tạo prompt..." : "Tạo"}
          </button>
        </div>

        <div className="col-12 col-lg-7 px-2">
          <ResultPrompt content={result} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default CreatePromptFromIdeas;
