import React, { useState, useEffect, useRef, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./Chat.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ReactMarkdown from "react-markdown";
import ModalTypeContext from "~/context/ModalTypeContext";

const cx = classNames.bind(styles);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentMessage, setCurrentMessage] = useState(""); // Tích lũy tin nhắn từ server
  const [conversationId, setConversationId] = useState(null); // Quản lý conversation ID
  const messagesEndRef = useRef(null); // Tham chiếu đến điểm cuối danh sách tin nhắn
  const { setModalType } = useContext(ModalTypeContext);

  // Cuộn tự động đến tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;
const token = localStorage.getItem("token");
    if(!token) {
      setModalType("loginEmail");
      return;
    }
    const userMessage = { text: input, type: "sent" };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");

    try {
      const url = `${process.env.REACT_APP_API_URL}/openai/chat-completion?prompt=${encodeURIComponent(
        input
      )}&conversation_id=${conversationId || "7441497656087756818"}`;
      const eventSource = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Lưu conversation_id nếu được trả về
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        // Tích lũy tin nhắn nhận được
        setCurrentMessage((prev) => prev + data.text);
      };

      eventSource.onerror = () => {
        setMessages((prev) => [
          ...prev,
          { text: currentMessage, type: "received" },
        ]);
        eventSource.close();
        setInput("");
      };

      eventSource.onclose = () => {
        setMessages((prev) => [
          ...prev,
          { text: currentMessage, type: "received" },
        ]);
        eventSource.close();
        setInput("");
      };
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={cx("chatWindow")}>
      {/* Header */}
      <div className={cx("header")}>
        <h2>ChatGPT</h2>
      </div>

      {/* Messages */}
      <div className={cx("messages")}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={cx(
              "message",
              message.type === "sent" ? "sent" : "received"
            )}
          >
            {message.type === "received" ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              <p>{message.text}</p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Area */}
      <div className={cx("inputArea")}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button className={cx("sendBtn")} onClick={handleSendMessage}>
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default Chat;
