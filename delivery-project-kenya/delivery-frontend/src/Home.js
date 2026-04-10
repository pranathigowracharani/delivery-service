import { useNavigate } from "react-router-dom";
import "./Home.css";
// import deliveryBoyImg from "./public/deliveryboy.jpeg"; 
function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      {/* LEFT SIDE */}
      <div className="home-left">
        <span className="tag">START DELIVERY</span>

        <h1>
          Fast pickup.<br />
          Safer rider login.<br />
          Better earning visibility.
        </h1>

        <p>
          Join as a delivery partner, upload your profile photo,
          verify your face at login, and manage orders easily.
        </p>

        <div className="btns">
          <button className="next">Next</button>
          <button className="login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="register" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>

        <div className="features">
          <span>Face check before dashboard access</span>
          <span>Photo-based partner profile</span>
          <span>Orders & earnings in one place</span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="home-right">
        <img
          src="/deliveryboy.jpeg"
          alt="delivery"
        />
      </div>

    </div>
  );
}

export default Home;
