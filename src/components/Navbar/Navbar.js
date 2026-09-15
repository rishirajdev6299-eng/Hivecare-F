import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo 3.png";
import "./Navbar.css";
import {
  sendChatMessage as sendChatMessageAPI,
  getUserById,
  updateProfileImage
} from "../../api/api";
function Navbar() {
  const { user, logout } = useAuth();
  


  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  /* =========================
     SEARCH SUGGESTIONS
  ========================= */

  const [showSearchSuggestions, setShowSearchSuggestions] =
    useState(false);

  const [profileImage, setProfileImage] = useState("");
const [showProfileImagePreview, setShowProfileImagePreview] = useState(false);
  // =========================
  // HIVECARE CHAT SUPPORT
  // =========================
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      message:
        "Hi! 👋 Welcome to HiveCare Support. How can I help you today?",
    },
  ]);

  const chatBodyRef = useRef(null);

  // =========================
  // NOTIFICATION
  // =========================

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();

  // =========================
  // GET USER
  // =========================

  const role = user?.role?.toUpperCase();

  // =====================================================
// LOAD CURRENT USER PROFILE IMAGE FROM DATABASE
// =====================================================

useEffect(() => {

  if (!user?.id) {
    setProfileImage("");
    return;
  }

  getUserById(user.id)
    .then((res) => {

      const image = res.data?.profileImage || "";

      setProfileImage(image);

    })
    .catch((error) => {

      console.error(
        "Unable to load profile image:",
        error
      );

      setProfileImage("");
    });

}, [user?.id]);

  // =========================
  // SHOW NOTIFICATION
  // =========================

  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

 // =====================================================
// PROFILE IMAGE UPLOAD
// =====================================================

const handleProfileImageUpload = (e) => {

  const file = e.target.files?.[0];

  if (!file) return;

  // ===================================================
  // CHECK USER
  // ===================================================

  if (!user?.id) {

    showNotification(
      "Please login before uploading a profile picture.",
      "error"
    );

    e.target.value = "";
    return;
  }

  // ===================================================
  // ONLY IMAGE FILES
  // ===================================================

  if (!file.type.startsWith("image/")) {

    showNotification(
      "Please select a valid image file.",
      "error"
    );

    e.target.value = "";
    return;
  }

  // ===================================================
  // MAX 5 MB
  // ===================================================

  if (file.size > 5 * 1024 * 1024) {

    showNotification(
      "Image size must be less than 5 MB.",
      "error"
    );

    e.target.value = "";
    return;
  }

  // ===================================================
  // READ IMAGE
  // ===================================================

  const reader = new FileReader();

  reader.onload = async () => {

    const imageData = reader.result;

    try {

      // =================================================
      // SAVE IMAGE TO DATABASE
      // =================================================

      await updateProfileImage(
        user.id,
        imageData
      );

      // =================================================
      // UPDATE NAVBAR IMMEDIATELY
      // =================================================

      setProfileImage(imageData);

      showNotification(
        "Profile image updated successfully!",
        "success"
      );

    } catch (error) {

      console.error(
        "Profile image upload failed:",
        error
      );

      showNotification(
        error.response?.data ||
        "Unable to upload profile image.",
        "error"
      );

    }

  };

  reader.onerror = () => {

    showNotification(
      "Unable to read image.",
      "error"
    );

  };

  reader.readAsDataURL(file);

  // ===================================================
  // ALLOW SAME IMAGE TO BE SELECTED AGAIN
  // ===================================================

  e.target.value = "";
};
  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setShowProfile(false);
    setMenuOpen(false);
    setShowChat(false);

    logout();

    setNotification({
      show: true,
      type: "success",
      message: "Logged out successfully!",
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: "",
      });

      navigate("/login", {
        replace: true,
        state: null,
      });
    }, 1800);
  };
  /* =========================================================
    HIVECARE SERVICE LIST
    Main Services + Subservices
 ========================================================= */


  const serviceSuggestions = [
    {
      name: "Plumber",
      icon: "bi-wrench-adjustable",
      category: "Plumbing Services",
    },
    {
      name: "Electrician",
      icon: "bi-lightning-charge-fill",
      category: "Electrical Services",
    },
    {
      name: "Carpenter",
      icon: "bi-hammer",
      category: "Home Services",
    },
    {
      name: "Maid",
      icon: "bi-person-workspace",
      category: "Domestic Services",
    },
    {
      name: "Babysitter",
      icon: "bi-balloon-heart-fill",
      category: "Child Care",
    },
    {
      name: "Pet Sitter",
      icon: "bi-heart-fill",
      category: "Pet Care",
    },
    {
      name: "Gym Trainer",
      icon: "bi-person-fill-up",
      category: "Fitness",
    },
    {
      name: "Beautician",
      icon: "bi-scissors",
      category: "Beauty Services",
    },
    {
      name: "Yoga Instructor",
      icon: "bi-person-arms-up",
      category: "Fitness & Wellness",
    },
    {
      name: "Tutor",
      icon: "bi-mortarboard-fill",
      category: "Education",
    },
    {
      name: "House Cleaning",
      icon: "bi-house-heart-fill",
      category: "Cleaning Services",
    },
    {
      name: "Appliance Repair",
      icon: "bi-tools",
      category: "Repair Services",
    },
  ];


  /* =========================================================
     FILTER SEARCH SUGGESTIONS
  ========================================================= */
  /* =========================================================
     FILTER SEARCH SUGGESTIONS
  ========================================================= */

  const filteredSuggestions = searchTerm.trim()
    ? serviceSuggestions
      .filter((service) =>
        service.name
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      )
      .slice(0, 6)
    : [];
  // =========================
  // SEARCH
  // =========================

  /* =========================================================
   SEARCH
========================================================= */

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (!searchTerm.trim()) return;

      navigate(
        `/services?search=${encodeURIComponent(searchTerm.trim())}`
      );

      setSearchTerm("");
      setShowSearchSuggestions(false);
      setMenuOpen(false);
    }
  };

  /* =========================================================
     SELECT SEARCH SUGGESTION
  ========================================================= */

  const handleSuggestionClick = (serviceName) => {
    navigate(
      `/services?search=${encodeURIComponent(serviceName)}`
    );

    setSearchTerm("");
    setShowSearchSuggestions(false);
    setMenuOpen(false);
  };

  // =========================
  // CHAT SUPPORT
  // =========================

  const openChat = () => {
    setShowChat(true);
    setShowProfile(false);
    setMenuOpen(false);
  };

  const closeChat = () => {
    if (chatLoading) return;
    setShowChat(false);
  };



  const sendChatMessage = async (messageOverride = null) => {
    const message = (
      messageOverride !== null
        ? messageOverride
        : chatMessage
    ).trim();

    if (!message || chatLoading) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message,
      },
    ]);

    setChatMessage("");
    setChatLoading(true);

    try {

      console.log(
        "Sending message to HiveCare backend:",
        message
      );

      // =====================================================
      // GET CURRENT USER FROM LOCAL STORAGE
      // =====================================================

      const currentUser =
        JSON.parse(
          localStorage.getItem("user")
        ) || {};

      // Your login response may store the ID as either
      // id or userId, so support both.
      const currentUserId =
        currentUser?.id ??
        currentUser?.userId ??
        null;

      const currentUserRole =
        currentUser?.role
          ? String(currentUser.role).toUpperCase()
          : "USER";

      // =====================================================
      // SEND CHAT MESSAGE + USER ID
      // =====================================================

      const result =
        await sendChatMessageAPI({

          message: message,

          userId: currentUserId,

          userName:
            currentUser?.name ||
            user?.name ||
            "Guest",

          userEmail:
            currentUser?.email ||
            user?.email ||
            "",

          userRole:
            currentUserRole,

          workerService:
            currentUser?.workerService ||
            user?.workerService ||
            "",
        });

      console.log(
        "HiveCare chatbot response:",
        result.data
      );

      const data =
        result.data;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message:
            data?.reply ||
            "Sorry, I couldn't process your request right now.",
        },
      ]);

    } catch (error) {

      console.error(
        "================================"
      );

      console.error(
        "HIVECARE CHAT ERROR"
      );

      console.error(
        "================================"
      );

      console.error(
        "Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      console.error(
        "================================"
      );

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message:
            error.response?.data?.reply ||
            "Sorry 😔 I'm having trouble connecting to HiveCare Support right now. Please try again in a moment.",
        },
      ]);

    } finally {

      setChatLoading(false);
    }
  };





  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendChatMessage();
  };

  const handleQuickQuestion = (question) => {
    sendChatMessage(question);
  };

  // Auto scroll chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  // =========================
  // SCROLL EFFECT
  // =========================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================
  // CLOSE MENU
  // =========================

  const closeMenu = () => {
    setMenuOpen(false);
    setShowProfile(false);
  };

  return (
    <>
      {/* =========================
          LOGOUT NOTIFICATION
      ========================== */}

      {notification.show && (
        <div
          className={`hc-notification hc-notification-${notification.type}`}
        >
          <div className="hc-notification-icon">
            {notification.type === "success" ? "✓" : "⚠"}
          </div>

          <div className="hc-notification-content">
            <strong>
              {notification.type === "success"
                ? "Success"
                : "Error"}
            </strong>

            <span>{notification.message}</span>
          </div>

          <button
            type="button"
            className="hc-notification-close"
            onClick={() =>
              setNotification({
                show: false,
                type: "",
                message: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =========================
          NAVBAR
      ========================== */}

      <nav
        className={`hc-navbar ${scrolled ? "hc-navbar-scrolled" : ""
          }`}
      >
        <div className="hc-navbar-container">

          {/* LOGO */}

          <div className="hc-brand">
            <Link
              to="/"
              className="hc-brand-link"
              onClick={closeMenu}
            >
              <div className="hc-logo-wrapper">
                <img
                  src={logo}
                  alt="HiveCare Logo"
                  className="hc-logo"
                />
              </div>

              <div className="hc-brand-name">
                <span className="hc-hive">Hive</span>
                <span className="hc-care">Care</span>
              </div>
            </Link>
          </div>

          {/* SEARCH */}


          {/* =========================================================
    SEARCH
========================================================= */}

          {role !== "ADMIN" &&
            role !== "WORKER" && (

              <div
                className="hc-search-container"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowSearchSuggestions(false);
                  }
                }}
              >

                <div className="hc-search">

                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => {
                      if (searchTerm.trim()) {
                        setShowSearchSuggestions(true);
                      }
                    }}
                    onKeyDown={handleSearch}
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      className="hc-search-clear"
                      onClick={() => {
                        setSearchTerm("");
                        setShowSearchSuggestions(false);
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}

                </div>


                {/* =====================================================
          SERVICE SUGGESTIONS
      ===================================================== */}

                {showSearchSuggestions &&
                  searchTerm.trim() &&
                  filteredSuggestions.length > 0 && (

                    <div className="hc-search-suggestions">

                      {filteredSuggestions.map((service) => (

                        <button
                          type="button"
                          key={service.name}
                          className="hc-search-suggestion"
                          onMouseDown={(e) => {
                            e.preventDefault();

                            handleSuggestionClick(
                              service.name
                            );
                          }}
                        >

                          <div className="hc-suggestion-icon">
                            <i
                              className={`bi ${service.icon}`}
                            ></i>
                          </div>

                          <div className="hc-suggestion-content">

                            <strong>
                              {service.name}
                            </strong>

                            <span>
                              {service.category}
                            </span>

                          </div>

                          <i className="bi bi-arrow-up-right"></i>

                        </button>

                      ))}

                    </div>

                  )}


                {/* =====================================================
          NO RESULT
      ===================================================== */}

                {showSearchSuggestions &&
                  searchTerm.trim() &&
                  filteredSuggestions.length === 0 && (

                    <div className="hc-search-no-result">

                      <i className="bi bi-search"></i>

                      <div>

                        <strong>
                          No service found
                        </strong>

                        <span>
                          Press Enter to search for "{searchTerm}"
                        </span>

                      </div>

                    </div>

                  )}

              </div>

            )}



          {/* MOBILE TOGGLE */}

          <button
            type="button"
            className={`hc-menu-toggle ${menuOpen ? "open" : ""
              }`}
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={loggingOut}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* NAVIGATION */}

          <div
            className={`hc-nav-links ${menuOpen ? "hc-nav-active" : ""
              }`}
          >

            {/* ADMIN */}

            {role === "ADMIN" && (
              <Link
                to="/admin"
                className="hc-nav-link hc-special-link"
                onClick={closeMenu}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* WORKER */}

            {role === "WORKER" && (
              <Link
                to="/worker"
                className="hc-nav-link hc-special-link"
                onClick={closeMenu}
              >
                <i className="bi bi-person-workspace"></i>
                <span>Worker Dashboard</span>
              </Link>
            )}

            {/* NORMAL USER */}

            {(!role ||
              (role !== "ADMIN" &&
                role !== "WORKER")) && (
                <>
                  <Link
                    to="/"
                    className="hc-nav-link"
                    onClick={closeMenu}
                  >
                    <i className="bi bi-house-door"></i>
                    <span>Home</span>
                  </Link>

                  <Link
                    to="/services"
                    className="hc-nav-link"
                    onClick={closeMenu}
                  >
                    <i className="bi bi-grid"></i>
                    <span>Services</span>
                  </Link>

                  {user && (
                    <Link
                      to="/history"
                      className="hc-nav-link"
                      onClick={closeMenu}
                    >
                      <i className="bi bi-calendar-check"></i>
                      <span>My Bookings</span>
                    </Link>
                  )}

                  {/* HIVECARE SUPPORT */}

                  <button
                    type="button"
                    className={`hc-nav-link hc-support-nav-btn ${showChat ? "hc-support-active" : ""
                      }`}
                    onClick={openChat}
                  >
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>Support</span>
                  </button>
                </>
              )}

            {/* PROFILE */}

            {user ? (
              <div className="hc-profile-wrapper">

                <button
                  type="button"
                  className={`hc-profile-btn ${showProfile
                    ? "hc-profile-active"
                    : ""
                    }`}
                  onClick={() => {
                    if (loggingOut) return;

                    setShowProfile(!showProfile);
                    setMenuOpen(false);
                    setShowChat(false);
                  }}
                >
                  <div
                    className={`hc-user-avatar ${profileImage ? "hc-clickable-avatar" : ""
                      }`}
                    onClick={(e) => {
                      if (profileImage) {
                        e.stopPropagation();
                        setShowProfileImagePreview(true);
                      }
                    }}
                    title={profileImage ? "View profile picture" : ""}
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                      />
                    ) : (
                      user.name
                        ? user.name.charAt(0).toUpperCase()
                        : "U"
                    )}
                  </div>

                  <span className="hc-user-name">
                    {user.name}
                  </span>

                  <i
                    className={`bi ${showProfile
                      ? "bi-chevron-up"
                      : "bi-chevron-down"
                      }`}
                  ></i>
                </button>

              </div>
            ) : (
              <div className="hc-auth-buttons">

                <Link
                  to="/login"
                  className="hc-login-btn"
                  onClick={closeMenu}
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  Login
                </Link>

                <Link
                  to="/register"
                  className="hc-register-btn"
                  onClick={closeMenu}
                >
                  <i className="bi bi-person-plus"></i>
                  Register
                </Link>

              </div>
            )}

          </div>
        </div>
      </nav>

      {/* =========================
          PROFILE DROPDOWN
      ========================== */}

      {user && showProfile && !loggingOut && (
        <div className="hc-profile-dropdown">

          {/* PROFILE HEADER */}

          <div className="hc-profile-top">

            {/* =====================================================
    PROFILE IMAGE
===================================================== */}

            <div className="hc-profile-avatar-container">

              <div className="hc-profile-avatar-large">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                  />
                ) : (
                  user.name
                    ? user.name.charAt(0).toUpperCase()
                    : "U"
                )}

              </div>

              {/* UPLOAD BUTTON */}

              <label
                htmlFor="navbar-profile-image"
                className="hc-profile-image-upload"
                title="Change profile picture"
              >
                <i className="bi bi-camera-fill"></i>
              </label>

              <input
                id="navbar-profile-image"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                style={{ display: "none" }}
              />

            </div>

            <div className="hc-profile-name-section">

              <h5>{user.name}</h5>

              <span className="hc-role-badge">
                <i className="bi bi-shield-check"></i>
                {role || "USER"}
              </span>

            </div>

          </div>

          <div className="hc-profile-divider"></div>

          {/* EMAIL */}

          <div className="hc-profile-detail">

            <div className="hc-detail-icon email">
              <i className="bi bi-envelope-fill"></i>
            </div>

            <div>
              <small>Email</small>
              <p>{user.email}</p>
            </div>

          </div>

          {/* PHONE */}

          <div className="hc-profile-detail">

            <div className="hc-detail-icon phone">
              <i className="bi bi-telephone-fill"></i>
            </div>

            <div>
              <small>Phone</small>

              <p>
                {user.phone || "Not available"}
              </p>
            </div>

          </div>

          {/* ADDRESS */}

          <div className="hc-profile-detail">

            <div className="hc-detail-icon address">
              <i className="bi bi-geo-alt-fill"></i>
            </div>

            <div>
              <small>Address</small>

              <p>
                {user.address || "Not available"}
              </p>
            </div>

          </div>

          {/* WORKER SERVICE */}

          {role === "WORKER" &&
            user.workerService && (
              <div className="hc-profile-detail">

                <div className="hc-detail-icon service">
                  <i className="bi bi-tools"></i>
                </div>

                <div>
                  <small>Service</small>
                  <p>{user.workerService}</p>
                </div>

              </div>
            )}

          <div className="hc-profile-divider"></div>

          {/* EDIT PROFILE */}

          <Link
            to="/profile"
            className="hc-profile-action"
            onClick={() => setShowProfile(false)}
          >
            <i className="bi bi-pencil-square"></i>
            <span>Edit Profile</span>
            <i className="bi bi-chevron-right"></i>
          </Link>

          {/* LOGOUT */}

          <button
            type="button"
            className="hc-profile-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <i className="bi bi-box-arrow-right"></i>

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>

          {/* CLOSE */}

          <button
            type="button"
            className="hc-profile-close"
            onClick={() => setShowProfile(false)}
          >
            Close
          </button>

        </div>
      )}

      {showProfileImagePreview && profileImage && (
  <div
    className="hc-profile-image-modal"
    onClick={() => setShowProfileImagePreview(false)}
  >
    <div
      className="hc-profile-image-preview"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="hc-profile-image-close"
        onClick={() => setShowProfileImagePreview(false)}
      >
        <i className="bi bi-x-lg"></i>
      </button>

      <img
        src={profileImage}
        alt="Profile Preview"
      />
    </div>
  </div>
)}
      {/* =========================
          HIVECARE CHAT WINDOW
      ========================== */}

      {showChat && (
        <div className="hc-chat-overlay">

          <div className="hc-chat-window">

            {/* CHAT HEADER */}

            <div className="hc-chat-header">

              <div className="hc-chat-brand">

                <div className="hc-chat-avatar">
                  <i className="bi bi-hexagon-fill"></i>
                </div>

                <div>
                  <strong>HiveCare Support</strong>

                  <span>
                    <span className="hc-online-dot"></span>
                    AI Assistant
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="hc-chat-close"
                onClick={closeChat}
                disabled={chatLoading}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            {/* CHAT BODY */}

            <div
              className="hc-chat-body"
              ref={chatBodyRef}
            >

              {chatMessages.map((chat, index) => (
                <div
                  key={index}
                  className={`hc-chat-message-row ${chat.sender === "user"
                    ? "hc-chat-user-row"
                    : "hc-chat-bot-row"
                    }`}
                >

                  {chat.sender === "bot" && (
                    <div className="hc-message-avatar">
                      <i className="bi bi-hexagon-fill"></i>
                    </div>
                  )}

                  <div
                    className={`hc-chat-message ${chat.sender === "user"
                      ? "hc-chat-user-message"
                      : "hc-chat-bot-message"
                      }`}
                  >
                    {chat.message}
                  </div>

                </div>
              ))}

              {chatLoading && (
                <div className="hc-chat-message-row hc-chat-bot-row">

                  <div className="hc-message-avatar">
                    <i className="bi bi-hexagon-fill"></i>
                  </div>

                  <div className="hc-chat-message hc-chat-bot-message hc-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                </div>
              )}

            </div>

            {/* QUICK QUESTIONS */}

            {!chatLoading && chatMessages.length <= 2 && (
              <div className="hc-quick-questions">

                <button
                  type="button"
                  onClick={() =>
                    handleQuickQuestion(
                      "How can I book a service?"
                    )
                  }
                >
                  <i className="bi bi-calendar-check"></i>
                  Book a service
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickQuestion(
                      "How can I check my bookings?"
                    )
                  }
                >
                  <i className="bi bi-clock-history"></i>
                  My bookings
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickQuestion(
                      "How does payment work?"
                    )
                  }
                >
                  <i className="bi bi-credit-card"></i>
                  Payment help
                </button>

              </div>
            )}

            {/* CHAT INPUT */}

            <form
              className="hc-chat-input-area"
              onSubmit={handleChatSubmit}
            >

              <input
                type="text"
                placeholder="Ask HiveCare anything..."
                value={chatMessage}
                onChange={(e) =>
                  setChatMessage(e.target.value)
                }
                disabled={chatLoading}
              />

              <button
                type="submit"
                disabled={
                  chatLoading ||
                  !chatMessage.trim()
                }
              >
                <i className="bi bi-send-fill"></i>
              </button>

            </form>

            <div className="hc-chat-footer">
              HiveCare AI Support
            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default Navbar;