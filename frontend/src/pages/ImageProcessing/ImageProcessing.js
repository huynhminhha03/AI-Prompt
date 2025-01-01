import React, { useState, useContext, useCallback } from "react";
import classNames from "classnames/bind";
import { useDropzone } from "react-dropzone";

import styles from "./ImageProcessing.module.scss";
import ModalTypeContext from "~/context/ModalTypeContext";
import ResultPrompt from "~/components/ResultPrompt";
import { authAPI } from "~/utils/api";
import { EventSourcePolyfill } from "event-source-polyfill";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);
const ImageProcessing = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [files, setFiles] = useState([]);
  const [command, setCommand] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setModalType("loginEmail");
      return;
    }
    setUploading(true);
    setFiles(acceptedFiles);
    if (acceptedFiles.length === 0) {
      alert("Vui lòng tải lên ít nhất một hình ảnh.");
      return;
    }
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await authAPI().post("/openai/upload-file", formData);
      setCurrentFile(response.data.image_url);
      setUploading(false);
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [], // Chỉ chấp nhận tệp hình ảnh
    },
    onDrop,
  });

  // Hàm xóa ảnh từ state
  const handleRemoveImage = () => {
    setFiles([]);
  };

  // Hàm xử lý tạo prompt
  const handleGeneratePrompt = async () => {
    if (files.length === 0) {
      alert("Vui lòng tải lên ít nhất một hình ảnh.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    const image_url = currentFile.secure_url;
    try {
      const prompt = `
      "Phân tích chi tiết nội dung của hình ảnh được đính kèm. Bao gồm:
      1. Mô tả các yếu tố chính trong hình ảnh (đối tượng, màu sắc, bối cảnh).
      2. Trích xuất thông tin cụ thể nếu có văn bản hoặc chi tiết nổi bật.
      3. Đề xuất prompt phù hợp cho việc vẽ lại hình ảnh hoặc tạo nội dung sáng tạo dựa trên hình."
      ${command}
    `;
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream-image?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}&image_url=${encodeURIComponent(image_url)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResult((prev) => prev + data); // Dồn dữ liệu trả về vào seoContent
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
      console.error("Error creating SEO blog:", error);
      setResult("Đã xảy ra lỗi khi tạo bài viết SEO.");
      setLoading(false);
    }
  };
  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Xử lý Ảnh</h1>
      <p className={cx("subtitle")}>
        Đọc các hình đính kèm và xử lý chúng theo yêu cầu của bạn. Ví dụ, bạn có
        thể yêu cầu viết prompt vẽ từ hình ảnh hoặc trích xuất văn bản từ hình
        ra.
      </p>

      {/* // handle upload file */}
      {/* File Upload */}
      <ModelAI selectedModel={model} setSelectedModel={setModel} />
      
      <div className={cx("formGroup")}>
        <label htmlFor="fileUpload">File Upload</label>

        {!loading && files.length === 0 && (
          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #cccccc",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Kéo thả hình ảnh vào đây...</p>
            ) : (
              <p>Kéo thả hoặc nhấp để chọn hình ảnh (png, jpg, jpeg, webp).</p>
            )}
          </div>
        )}

        <div
          className="d-flex flex-wrap gap-2 justify-content-center
          align-items-center"
        >
          {files.map((file, index) => (
            <div key={index} className={cx("previewImageContainer")}>
              {/* Ảnh */}
              <img
                className={cx("previewImage")}
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
              />
              {uploading && <div className={cx("loadingSpinner")}></div>}

              {/* Nút X */}
              <button
                className={cx("removeButton")}
                onClick={() => handleRemoveImage(index)}
              >
                x
              </button>
            </div>
          ))}
        </div>

        <small className={cx("smallstyle")}>
          Chỉ chấp nhận png, jpg, jpeg, webp.
        </small>
      </div>

      {/* Command */}
      <div className={cx("formGroup")}>
        <label htmlFor="command">Viết câu lệnh của bạn:</label>
        <textarea
          id="command"
          className={cx("textarea")}
          placeholder=""
          rows="4"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <small className={cx("smallstyle")}>Viết prompt gửi A.I</small>
      </div>

      {/* Button */}
      <button
        className={cx("button")}
        onClick={handleGeneratePrompt}
        disabled={loading || uploading || !files.length || !command.trim()} // Disable button khi đang tải ảnh hoặc khi không có ảnh và câu lệnh
      >
        {uploading
          ? "Đang tải ảnh..."
          : loading
            ? "Đang xử lý..."
            : "Xử lý Ảnh"}
      </button>

      {/* Result */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default ImageProcessing;
