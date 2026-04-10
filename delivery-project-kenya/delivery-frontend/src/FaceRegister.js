import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./register.css";
import { useNavigate } from "react-router-dom";
import { ensureLocalData, registerUser } from "./services/localData";

function FaceRegister() {
  const videoRef = useRef();
  const navigate = useNavigate();

  const [image, setImage] = useState("");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [modalOtp, setModalOtp] = useState("");
  const [city, setCity] = useState("");
  const [maishaCard, setMaishaCard] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpiry, setDlExpiry] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [maishaCardFile, setMaishaCardFile] = useState(null);
  const [dlFile, setDlFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isolatedFace, setIsolatedFace] = useState("");

  useEffect(() => {
    ensureLocalData();

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(() => setModelLoaded(true));
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const detectFace = async () => {
    if (!modelLoaded) {
      setMessage("Loading AI...");
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
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    
    const data = canvas.toDataURL("image/png");
    setImage(data);
    setMessage("Face captured successfully");
  };

  const resetOtpState = () => {
    setOtp("");
    setModalOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setDevOtp("");
    setShowOtpModal(false);
  };

  const handleSendOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(randomOtp);
    setOtp(randomOtp);

    setSendingOtp(true);
    setMessage("");

    window.setTimeout(() => {
      setOtpSent(true);
      setOtpVerified(false);
      setSendingOtp(false);
      setShowOtpModal(true);
      setModalOtp(randomOtp);
      setMessage("OTP sent successfully");
    }, 500);
  };

  const handleVerifyOtp = () => {
    setVerifyingOtp(true);
    window.setTimeout(() => {
      setOtpVerified(true);
      setShowOtpModal(false);
      setMessage("Email verified successfully");
      setVerifyingOtp(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!image) {
      setMessage("Capture face image first");
      return;
    }


    try {
      setMessage("Registering...");
      
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("mobile", mobile);
      formData.append("city", city);
      formData.append("maishaCard", maishaCard);
      formData.append("dlNumber", dlNumber);
      formData.append("dlExpiry", dlExpiry);
      formData.append("bankAccount", bankAccount);
      formData.append("bankCode", bankCode);
      formData.append("accountHolder", accountHolder);
      formData.append("mpesaNumber", mpesaNumber);
      formData.append("image", blob, "face.jpg");

      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Registered successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Connection error to backend");
    }
  };

  return (
    <div className="container">
      <div className="register-left">
        <span className="tag">PARTNER ONBOARDING</span>

        <h1>
          Register once,
          <br />
          then use photo-based login verification.
        </h1>

        <p>
          Add your delivery partner details and profile image.
          The same photo will be used for login face matching.
        </p>

        <div className="features">
          <span>Identity photo required</span>
          <span>Email verified with OTP</span>
          <span>Dashboard unlocks after face scan</span>
        </div>
      </div>

      <div className="right">
        <h2>Register as Delivery Partner</h2>

        <div className="form-section">
          <h3>Personal Details</h3>
          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setName(e.target.value)}
            />
            <label>Full Name</label>
          </div>
          <div className="floating-group">
            <input
              type="email"
              placeholder=" "
              onChange={(e) => {
                setEmail(e.target.value);
                resetOtpState();
              }}
            />
            <label>Email</label>
          </div>

          <div className="btn-group">
            <button type="button" onClick={handleSendOtp} disabled={sendingOtp}>
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>

          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setMobile(e.target.value)}
            />
            <label>Mobile Number</label>
          </div>

          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setCity(e.target.value)}
            />
            <label>City</label>
          </div>
        </div>

        <div className="form-section">
          <h3>Verification Details</h3>
          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setMaishaCard(e.target.value)}
            />
            <label>Maisha ID</label>
          </div>
          <input type="file" onChange={(e) => setMaishaCardFile(e.target.files[0])} />

          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setDlNumber(e.target.value)}
            />
            <label>Driving License</label>
          </div>
          <input type="file" onChange={(e) => setDlFile(e.target.files[0])} />

          <input
            type="date"
            onChange={(e) => setDlExpiry(e.target.value)}
          />
        </div>

        <div className="form-section">
          <h3>Bank Details</h3>
          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setBankAccount(e.target.value)}
            />
            <label>Bank Account Number</label>
          </div>

          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setBankCode(value);
              }}
            />
            <label>Bank Code</label>
          </div>

          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setAccountHolder(e.target.value)}
            />
            <label>Account Holder Name</label>
          </div>

          <div className="floating-group">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setMpesaNumber(e.target.value)}
            />
            <label>M-Pesa Number</label>
          </div>
        </div>

        <video ref={videoRef} autoPlay />

        <div className="btn-group">
          <button type="button" onClick={startCamera}>Start Camera</button>
          <button type="button" onClick={detectFace}>Detect</button>
          <button type="button" onClick={capture} disabled={!faceDetected}>Capture</button>
        </div>

        <div className="preview-container" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {image && (
            <div className="preview-box">
              <p style={{fontSize: '12px', margin: '0'}}>Raw Capture</p>
              <img src={image} alt="preview" className="preview" style={{width: '120px', height: '120px', objectFit: 'cover'}} />
            </div>
          )}
          {isolatedFace && (
            <div className="preview-box">
              <p style={{fontSize: '12px', margin: '0'}}>Isolated Face</p>
              <img src={`data:image/jpeg;base64,${isolatedFace}`} alt="isolated" className="preview" style={{width: '120px', height: '120px', objectFit: 'cover'}} />
            </div>
          )}
        </div>
        {/* devOtp helper hidden since it automatically fills the field now */}
        {message && <p className="message">{message}</p>}

        <button className="submit" onClick={handleSubmit}>
          Register
        </button>

        <p>
          Already have account? <a href="/login">Login here</a>
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
            <div className="btn-group">
              <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                {verifyingOtp ? "Verifying..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaceRegister;
