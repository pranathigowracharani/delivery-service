import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import "./Login.css";
import { ensureLocalData, loginUser } from "./services/localData";

function FaceLogin() {
  const videoRef = useRef();
  const [image, setImage] = useState("");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [isolatedFace, setIsolatedFace] = useState("");
  const navigate = useNavigate();

  // OTP States
  const [devOtp, setDevOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [modalOtp, setModalOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    ensureLocalData();

    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      setModelLoaded(true);
    };

    loadModels();
  }, []);

  const handleSendOtp = () => {
    if (!identifier.trim()) {
      setMessage("Enter your email or mobile first");
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(randomOtp);
    setSendingOtp(true);
    setMessage("");

    window.setTimeout(() => {
      setOtpVerified(false);
      setSendingOtp(false);
      setShowOtpModal(true);
      setModalOtp(randomOtp);
      setMessage("OTP sent successfully");
    }, 500);
  };

  const handleVerifyOtp = () => {
    if (!modalOtp.trim()) {
      setMessage("Enter the OTP");
      return;
    }

    if (modalOtp !== devOtp) {
      setMessage("Invalid OTP");
      return;
    }

    setVerifyingOtp(true);
    window.setTimeout(() => {
      setOtpVerified(true);
      setShowOtpModal(false);
      setMessage("Mobile/Email verified successfully");
      setVerifyingOtp(false);
    }, 300);
  };

  const startCamera = async () => {
    if (!otpVerified) {
      setMessage("Please verify OTP first before starting camera");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setMessage("Camera access denied");
    }
  };

  const detectFace = async () => {
    if (!modelLoaded) {
      setMessage("Loading AI model...");
      return;
    }

    const result = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );

    setFaceDetected(!!result);
  };


  const capture = () => {
    if (!faceDetected) {
      setMessage("Detect face first");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const data = canvas.toDataURL("image/png");
    setImage(data);
    setMessage("Face captured. Ready to login");
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      if (!identifier.trim()) {
        setMessage("Enter your email or mobile");
        setIsLoading(false);
        return;
      }


      if (!image) {
        setMessage("Please capture image first");
        setIsLoading(false);
        return;
      }

      setMessage("Authenticating with AI...");

      const response = await fetch(image);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("identifier", identifier);
      formData.append("image", blob, "login.jpg");

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        if (data.isolated_face) {
          setIsolatedFace(data.isolated_face);
        }
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        alert("Login Successful!");
        navigate("/dashboard");
      } else {
        setMessage(data.message || "Face verification failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Connection error to backend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="login-container">
        <h2>Face Login</h2>
        <p>Secure biometric authentication</p>
        <input
          type="text"
          placeholder="Email or Mobile"
          onChange={(e) => {
            setIdentifier(e.target.value);
            setOtpVerified(false);
          }}
          disabled={otpVerified}
        />

        {!otpVerified ? (
          <div className="btn-group-login">
            <button className="btn-login" onClick={handleSendOtp} disabled={sendingOtp}>
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <p style={{ color: "#4CAF50", fontWeight: "bold", marginBottom: "15px" }}>
            OTP Verified
          </p>
        )}

        {otpVerified && (
          <>
            <video ref={videoRef} autoPlay muted className="video" />

            {!modelLoaded && <p>Initializing AI... Please wait</p>}

            <div
              className={`face-status ${
                faceDetected ? "status-detected" : "status-searching"
              }`}
            >
              {faceDetected ? "Face Detected" : "Looking for face..."}
            </div>

            <div className="btn-group-login">
              <button className="btn-login" onClick={startCamera}>
                Start Camera
              </button>
              <button className="btn-login" onClick={detectFace}>
                Detect Face
              </button>
              <button
                className="btn-login"
                onClick={capture}
                disabled={!faceDetected}
              >
                Capture
              </button>
            </div>

            <div className="preview-container-login" style={{ display: 'flex', gap: '10px' }}>
              {image && (
                <div className="preview-box">
                  <p>Raw Capture</p>
                  <img src={image} className="preview-login" alt="captured" />
                </div>
              )}
              {isolatedFace && (
                <div className="preview-box">
                  <p>AI Isolated Face</p>
                  <img src={`data:image/jpeg;base64,${isolatedFace}`} className="preview-login" alt="isolated" />
                </div>
              )}
            </div>
          </>
        )}

        {message && (
          <p
            className={`message ${
              message.includes("Successful") || message.includes("successfully")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </p>
        )}

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={!image || isLoading || !otpVerified}
        >
          {isLoading ? "Authenticating..." : "Login with Face"}
        </button>

        <p>
          New user?{" "}
          <span
            style={{
              color: "var(--primary)",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>

      {showOtpModal && (
        <div className="otp-popup-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="otp-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Enter OTP</h3>
            <p>Verify your details to proceed.</p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={modalOtp}
              onChange={(e) => setModalOtp(e.target.value)}
            />
            <div className="btn-group-login">
              <button className="btn-login" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                {verifyingOtp ? "Verifying..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaceLogin;
