import React, { useState, useContext, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./TextToSpeech.module.scss";
import { authAPI, userApis } from "~/utils/api";
import ModalTypeContext from "~/context/ModalTypeContext";
import useAgeServices from "~/services/useAgeServices";

const cx = classNames.bind(styles);

const TextToSpeech = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [voices, setVoices] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeVoice, setActiveVoice] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("tts-1");
  const [playingVoice, setPlayingVoice] = useState(null); // Lưu voice đang phát
  const [audio, setAudio] = useState(null); // Lưu đối tượng Audio

  useEffect(() => {
    const fetchAllVoices = async () => {
      try {
        const response = await useAgeServices.getAllVoices();
        setVoices(response.voices);
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    const fetchAllModelVoices = async () => {
      try {
        const response = await useAgeServices.getAllModelsVoice();
        setModels(response.models);
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    fetchAllVoices();
    fetchAllModelVoices();
  }, []);

  const handleGenerateAudio = async () => {
    if (!textInput.trim()) {
      alert("Vui lòng nhập văn bản.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setAudioUrl("");
    try {
      const response = await authAPI().post(userApis.textToSpeech, {
        prompt: textInput.trim(),
        model: selectedModel,
        voice: activeVoice.name
      });

      if (response.data && response.data.speech && response.data.speech.url) {
        setAudioUrl(response.data.speech.url);
      } else {
        setErrorMessage("Không thể tạo âm thanh. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      setErrorMessage("Đã xảy ra lỗi khi tạo âm thanh. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý play âm thanh và thay đổi icon
  const handleAudioPlay = (voice) => {
    // Dừng âm thanh cũ nếu có
    if (audio) {
      audio.pause();
      setPlayingVoice(null); // Dừng âm thanh của voice trước
    }

    if (playingVoice === voice) {
      // Nếu voice đang phát, dừng lại
      setAudio(null); // Reset đối tượng Audio
    } else {
      // Nếu chưa phát, bắt đầu phát và lưu voice đang phát
      const newAudio = new Audio(voice.url);
      setAudio(newAudio); // Lưu đối tượng Audio vào state
      newAudio.play(); // Phát âm thanh
      setPlayingVoice(voice); // Lưu voice đang phát

      newAudio.onended = () => {
        // Khi âm thanh kết thúc, set playingVoice về null
        setPlayingVoice(null);
        setAudio(null); // Reset audio khi kết thúc
      };
    }
  };

  return (
    <div className={cx("container") + " container"}>
      <h1 className={cx("header")}>Chuyển Văn Bản Thành Âm Thanh</h1>
      <p className={cx("description")}>
        Nhập văn bản để chuyển thành tệp âm thanh
      </p>
      <div className={cx("form")}>
        <div className={cx("formGroup")}>
          <label htmlFor="promptSelect">Chọn mô hình AI</label>
          <select
            id="promptSelect"
            className={cx("select")}
            value={selectedModel || models[0]}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((model, id) => (
              <option key={id} value={model}>
                {model === "tts-1" ? "TTS-1" : "TTS-1 HD"}
              </option>
            ))}
          </select>
        </div>

        <div className={cx("inputGroup")}>
          <label htmlFor="textPrompt">Nhập văn bản(*)</label>
          <textarea
            type="text"
            id="textPrompt"
            placeholder="Nhập văn bản"
            value={textInput}
            rows="6"
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        <div className={cx("voiceListContainer")}>
          <label className={cx("voiceListHeader")}>Chọn giọng nói</label>
          <ul className={cx("voiceList")}>
            {voices.length > 0 ? (
              voices.map((voice) => (
                <li
                  key={voice.name}
                  className={cx("voiceItem", {
                    active: voice.name === activeVoice.name,
                  })}
                >
                  <label className={cx("radioLabel")}>
                    <input
                      type="radio"
                      name="voice"
                      value={voice.name}
                      checked={voice.name === activeVoice.name}
                      onChange={() => setActiveVoice(voice)}
                      className={cx("radioInput")}
                    />
                    <div className={cx("voiceInfo")}>
                      <span
                        className={cx("voiceName")}
                        onClick={() => setActiveVoice(voice.name)}
                      >
                        {voice.name.charAt(0).toUpperCase() + voice.name.slice(1)} (OpenAI
                        - Nói đa ngôn ngữ và cảm xúc)
                      </span>
                      <button
                        className={cx("playButton")}
                        onClick={() => handleAudioPlay(voice)} // Chạy hàm handleAudioPlay
                      >
                        <span>
                          {playingVoice === voice ? (
                            <i className="fa-solid fa-stop"></i> // Hiển thị icon stop khi đang phát
                          ) : (
                            <i className="fa-solid fa-play"></i> // Hiển thị icon play khi chưa phát
                          )}
                        </span>
                      </button>
                    </div>
                  </label>
                </li>
              ))
            ) : (
              <li className={cx("loadingVoice")}>Đang tải...</li>
            )}
          </ul>
        </div>

        <button
          onClick={handleGenerateAudio}
          className={cx("button")}
          disabled={loading || !textInput.trim() || !activeVoice}
        >
          {loading ? "Đang chuyển đổi..." : "Chuyển Âm Thanh"}
        </button>
      </div>

      {errorMessage && <p className={cx("error")}>{errorMessage}</p>}

      {audioUrl && (
        <div className={cx("resultContainer")}>
          <h2 className={cx("resultHeader")}>Âm Thanh Đã Tạo</h2>
          <div className="d-flex justify-content-center align-items-center">
            <audio controls className={cx("audioPlayer")}>
              <source src={audioUrl} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ phát âm thanh.
            </audio>
            <a
              href={audioUrl}
              download="generated-audio.mp3"
              className={cx("downloadLink")}
            >
              Tải Về Âm Thanh
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
