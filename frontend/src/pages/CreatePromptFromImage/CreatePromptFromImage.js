import React, { useState, useContext, useEffect , useCallback} from "react";
import classNames from "classnames/bind";
import styles from "./CreatePromptFromImage.module.scss";
import { useDropzone } from "react-dropzone";

import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import { EventSourcePolyfill } from "event-source-polyfill";
import { authAPI } from "~/utils/api";
import ModelAI from "~/components/ModelAI";
const cx = classNames.bind(styles);

const CreatePromptFromImage = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]); // State lưu trữ các file ảnh đã chọn
  const [currentFile, setCurrentFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [command, setCommand] = useState("");

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
  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Hàm tạo prompt từ ảnh
  const handleGeneratePrompt = async () => {
    if (files.length === 0) {
      alert("Vui lòng tải lên ít nhất một hình ảnh.");
      return;
    }
    setLoading(true);
    setResult("");
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    const image_url = currentFile.secure_url;
    try {
      const prompt = `"Up hình mẫu lên, AI sẽ gợi ý các prompt để vẽ ảnh. Prompt 1 sẽ là giống hình gốc nhất, các Prompt sau sẽ sáng tạo dựa trên hình gốc[tiếng việt].

      "`;
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream-image?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}&image_url=${encodeURIComponent(image_url)}`,
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
  useEffect(() => {
    return () => {
      setFiles([]);
      setCurrentFile(null);
    };
  }, []);
  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Tạo prompt vẽ từ ảnh mẫu</h1>
      <p className={cx("subtitle")}>
        Up hình mẫu lên, AI sẽ gợi ý các prompt để vẽ ảnh. Prompt 1 sẽ là giống
        hình gốc nhất, các Prompt sau sẽ sáng tạo dựa trên hình gốc.
      </p>

      <div className={cx("form")}>
        {/* Upload Image */}
        <ModelAI
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
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
                <p>
                  Kéo thả hoặc nhấp để chọn hình ảnh (png, jpg, jpeg, webp).
                </p>
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

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGeneratePrompt}
          disabled={loading || uploading || (!files.length && !command.trim())} // Disable button khi đang tải ảnh hoặc khi không có ảnh và câu lệnh
        >
          {uploading ? "Đang tải ảnh..." : loading ? "Đang xử lý..." : "Xử lý"}
        </button>
      </div>

      {/* Kết quả */}
      <div className={cx("formGroup")}>
        <ResultPrompt content={result} loading={loading} />
      </div>
    </div>
  );
};

export default CreatePromptFromImage;
