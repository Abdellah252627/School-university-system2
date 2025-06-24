import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/chat";
const SOCKET_URL = "http://localhost:5000";
const userId = 1; // عدل حسب المستخدم الحالي
const role = 'teacher'; // عدل حسب المستخدم الحالي

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["mp4", "avi", "mov"].includes(ext)) return "🎬";
  if (["mp3", "wav"].includes(ext)) return "🎵";
  if (["txt", "csv"].includes(ext)) return "📑";
  return "📎";
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentPreview = ({ url, size, filename }) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
    return (
      <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer">
        <img
          src={`http://localhost:5000${url}`}
          alt={filename}
          style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, margin: "4px 0" }}
        />
        <div style={{ fontSize: "0.8em", color: "#888" }}>
          {getFileIcon(filename)} {filename} ({formatSize(size)})
        </div>
      </a>
    );
  }
  if (["mp4", "avi", "mov"].includes(ext)) {
    return (
      <video controls style={{ maxWidth: 180, maxHeight: 100 }}>
        <source src={`http://localhost:5000${url}`} type={`video/${ext}`} />
        {filename}
      </video>
    );
  }
  if (["mp3", "wav"].includes(ext)) {
    return (
      <audio controls>
        <source src={`http://localhost:5000${url}`} type={`audio/${ext}`} />
        {filename}
      </audio>
    );
  }
  if (["pdf"].includes(ext)) {
    return (
      <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer">
        {getFileIcon(filename)} {filename} ({formatSize(size)})
      </a>
    );
  }
  if (["txt", "csv"].includes(ext)) {
    return (
      <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer">
        {getFileIcon(filename)} {filename} ({formatSize(size)})
      </a>
    );
  }
  return (
    <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer">
      {getFileIcon(filename)} {filename} ({formatSize(size)})
    </a>
  );
};

const getDefaultAvatar = (role, gender) => {
  if (role === 'teacher') return '/teacher.png';
  if (role === 'student') return '/student.png';
  if (role === 'parent') return '/parent.png';
  return gender === 'female' ? '/female.png' : '/male.png';
};

const MessageBubble = ({ m, isOwn, onReply, onDelete, replyContent, avatarUrl }) => (
  <div
    style={{
      display: "flex",
      flexDirection: isOwn ? "row-reverse" : "row",
      alignItems: "flex-end",
      marginBottom: 10,
    }}
  >
    <img
      src={avatarUrl}
      alt="avatar"
      style={{ width: 36, height: 36, borderRadius: '50%', margin: '0 8px' }}
      title={m.sender_name}
    />
    <div
      style={{
        background: isOwn ? "#d1f7c4" : "#f1f1f1",
        borderRadius: 12,
        padding: 10,
        maxWidth: "70%",
        position: "relative",
        boxShadow: "0 1px 3px #0001",
      }}
    >
      <div style={{ fontSize: 12, color: "#888" }}>
        {m.sender_name} • {new Date(m.created_at).toLocaleTimeString()}
      </div>
      {m.is_deleted ? (
        <i style={{ color: "#b00" }}>تم حذف الرسالة</i>
      ) : (
        <>
          {m.reply_to_message_id && (
            <div
              style={{
                fontSize: "0.9em",
                color: "#888",
                borderRight: "2px solid #ccc",
                marginBottom: 3,
                paddingRight: 5,
                background: "#f9f9f9",
                borderRadius: 6,
              }}
            >
              رد على: {replyContent || "رسالة محذوفة"}
            </div>
          )}
          <div style={{ margin: "4px 0" }}>{m.content}</div>
          {m.attachment_url && (
            <AttachmentPreview
              url={m.attachment_url}
              size={m.attachment_size}
              filename={m.attachment_url.split('/').pop()}
            />
          )}
          <div style={{ marginTop: 5 }}>
            <button onClick={() => onReply(m)}>رد</button>
            {isOwn && (
              <button onClick={() => onDelete(m.id)} style={{ color: "red", marginRight: 5 }}>
                حذف
              </button>
            )}
          </div>
        </>
      )}
    </div>
  </div>
);

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const socketRef = useRef();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/conversations/${userId}`).then(res => {
      setConversations(res.data);
    });
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    if (selectedConv) {
      socketRef.current.emit("joinConversation", selectedConv.id);
      socketRef.current.on("newMessage", (data) => {
        if (data.conversationId === selectedConv.id) {
          setMessages((prev) => [...prev, data]);
          toast.info("وصلتك رسالة جديدة!");
        } else {
          toast.info("رسالة جديدة في محادثة أخرى!");
        }
      });
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [selectedConv]);

  useEffect(() => {
    axios.get(`${API_URL}/users`).then(res => {
      setAllUsers(res.data);
    });
  }, []);

  const loadMessages = (conv) => {
    setSelectedConv(conv);
    axios.get(`${API_URL}/messages/${conv.id}?userId=${userId}`).then(res => {
      setMessages(res.data);
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("conversationId", selectedConv.id);
    formData.append("senderId", userId);
    formData.append("content", msg);
    if (file) formData.append("attachment", file);
    if (replyTo) formData.append("replyToMessageId", replyTo.id);
    const res = await axios.post(`${API_URL}/message`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMsg("");
    setFile(null);
    setFileInfo(null);
    setReplyTo(null);
    socketRef.current.emit("sendMessage", {
      ...res.data,
      conversationId: selectedConv.id,
    });
    setMessages((prev) => [...prev, res.data]);
  };

  const handleSearch = async () => {
    if (!search) return;
    const res = await axios.get(`${API_URL}/search/${selectedConv.id}?q=${search}`);
    setSearchResults(res.data);
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("هل أنت متأكد من حذف الرسالة؟")) return;
    await axios.delete(`${API_URL}/message/${msgId}`);
    setMessages(messages => messages.map(m => m.id === msgId ? { ...m, is_deleted: true } : m));
    toast.success("تم حذف الرسالة");
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || !groupMembers) return;
    const userIds = groupMembers.split(',').map(id => parseInt(id.trim())).filter(Boolean);
    const res = await axios.post(`${API_URL}/conversation`, {
      userIds: [userId, ...userIds],
      isGroup: true,
      groupName,
      createdBy: userId
    });
    setShowCreateGroup(false);
    setGroupName("");
    setGroupMembers("");
    const convRes = await axios.get(`${API_URL}/conversations/${userId}`);
    setConversations(convRes.data);
    toast.success("تم إنشاء المجموعة بنجاح!");
  };

  const filteredConvs = conversations.filter(conv => {
    if (filter === "all") return true;
    if (filter === "group") return conv.is_group;
    if (filter === "private") return !conv.is_group;
    if (filter === "unread") return conv.unread_count > 0;
    return true;
  });

  useEffect(() => {
    if (file) {
      setFileInfo({ name: file.name, size: file.size });
    } else {
      setFileInfo(null);
    }
  }, [file]);

  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ccc" }}>
      <ToastContainer />
      {/* قائمة المحادثات */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h3>المحادثات</h3>
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setFilter("all")}>الكل</button>
          <button onClick={() => setFilter("group")}>جماعية</button>
          <button onClick={() => setFilter("private")}>فردية</button>
          <button onClick={() => setFilter("unread")}>غير مقروءة</button>
        </div>
        {(role === 'teacher' || role === 'admin') && (
          <div style={{ margin: '10px 0' }}>
            <button onClick={() => setShowCreateGroup(v => !v)}>
              {showCreateGroup ? 'إغلاق' : 'إنشاء مجموعة جديدة'}
            </button>
            {showCreateGroup && (
              <form onSubmit={handleCreateGroup} style={{ background: '#f9f9f9', padding: 10, borderRadius: 8, marginTop: 8 }}>
                <div>
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="اسم المجموعة"
                    style={{ marginBottom: 6, width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={groupMembers}
                    onChange={e => setGroupMembers(e.target.value)}
                    placeholder="معرفات الأعضاء (مثال: 2,3,4)"
                    style={{ marginBottom: 6, width: '100%' }}
                    required
                  />
                </div>
                <button type="submit">إنشاء</button>
              </form>
            )}
          </div>
        )}
        {filteredConvs.map((conv) => {
          let otherUser = null;
          if (!conv.is_group && conv.members) {
            otherUser = allUsers?.find(u => u.id !== userId && conv.members.includes(u.id));
          }
          const avatarUrl = conv.is_group
            ? '/teacher.png'
            : otherUser
              ? getDefaultAvatar(otherUser.role, otherUser.gender)
              : '/male.png';
          return (
            <div
              key={conv.id}
              style={{
                display: 'flex', alignItems: 'center',
                padding: 10,
                background: selectedConv?.id === conv.id ? "#eee" : "#fff",
                cursor: "pointer",
                fontWeight: conv.unread_count > 0 ? "bold" : "normal",
                borderBottom: "1px solid #eee"
              }}
              onClick={() => loadMessages(conv)}
            >
              <img src={avatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginLeft: 8 }} />
              <div>
                {conv.is_group ? `👥 ${conv.group_name}` : `💬 محادثة رقم ${conv.id}`}
                {conv.unread_count > 0 && (
                  <span style={{ color: "red", marginRight: 5 }}>
                    ({conv.unread_count} جديد)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* نافذة الدردشة */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* البحث */}
        <div style={{ padding: 5 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث في الرسائل..."
            style={{ margin: 5 }}
          />
          <button onClick={handleSearch}>بحث</button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ background: "#f9f9f9", padding: 5 }}>
            <h4>نتائج البحث:</h4>
            {searchResults.map(m => (
              <div key={m.id}>{m.sender_name}: {m.content}</div>
            ))}
          </div>
        )}
        {/* الرسائل */}
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              isOwn={m.sender_id === userId}
              onReply={setReplyTo}
              onDelete={handleDelete}
              replyContent={m.reply_to_message_id ? messages.find(msg => msg.id === m.reply_to_message_id)?.content : ""}
              avatarUrl={getDefaultAvatar(m.role, m.gender)}
            />
          ))}
        </div>
        {/* الرد على رسالة */}
        {replyTo && (
          <div style={{ background: "#eee", padding: 5 }}>
            ترد على: {replyTo.content}
            <button onClick={() => setReplyTo(null)}>إلغاء</button>
          </div>
        )}
        {/* إرسال رسالة */}
        {selectedConv && (
          <form onSubmit={sendMessage} style={{ display: "flex", padding: 10, borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="اكتب رسالة..."
              style={{ flex: 1, marginRight: 5 }}
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginRight: 5 }}
            />
            {fileInfo && (
              <span style={{ fontSize: "0.8em", color: "#888", marginRight: 5 }}>
                {getFileIcon(fileInfo.name)} {fileInfo.name} ({formatSize(fileInfo.size)})
              </span>
            )}
            <button type="submit">إرسال</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat; 