import React, { useEffect, useState } from "react";
import { HiOutlineStar } from "react-icons/hi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "../styles/Profile.css";
import {
  fileToDataUrl,
  getUserOrders,
  getUserProfile,
  updateUserProfile,
  updateUserProfileImage,
} from "../services/localData";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({ totalDeliveries: 0, rating: 4.8 });
  const [loggedUser, setLoggedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user || !user.id) {
      window.location.href = "/login";
      return;
    }

    setLoggedUser(user);
    fetchProfileData(user.id, user);
  }, []);

  const fetchProfileData = async (userId, fallbackUser) => {
    try {
      const profileData = getUserProfile(userId);
      const ordersData = getUserOrders(userId);

      if (profileData.success) {
        setProfile(profileData.user);
      }

      if (ordersData.success) {
        const deliveredCount = ordersData.orders.filter(
          (order) => order.status === "delivered"
        ).length;
        setStats({ totalDeliveries: deliveredCount, rating: 4.8 });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile data");
      setProfile({
        id: fallbackUser?.id,
        name: fallbackUser?.name,
        email: fallbackUser?.email,
        mobile: fallbackUser?.mobile,
        city: fallbackUser?.city,
        profile_image: fallbackUser?.profile_image,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const data = updateUserProfile(loggedUser.id, {
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
        city: profile.city,
      });

      if (!data.success) {
        alert("Failed to update profile");
        return;
      }

      const updatedUser = { ...loggedUser, ...data.user };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setLoggedUser(updatedUser);
      setProfile(data.user);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to save profile changes");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageDataUrl = await fileToDataUrl(file);
      const data = updateUserProfileImage(loggedUser.id, imageDataUrl);

      if (!data.success) {
        alert("Failed to upload image");
        return;
      }

      setProfile((prev) => ({ ...prev, profile_image: data.user.profile_image }));
      const updatedUser = { ...loggedUser, profile_image: data.user.profile_image };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setLoggedUser(updatedUser);
      alert("Profile image updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Profile</h1>
          <p>Loading your account...</p>
        </div>
        <LoadingSkeleton type="grid" count={2} />
      </div>
    );
  }

  const initials =
    profile.name
      ?.split(" ")
      .map((name) => name[0])
      .join("") || "RS";

  const joinedYear = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : 2024;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Account details for {profile.name}</p>
        {error && <p style={{ color: "orange" }}>{error}</p>}
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          <div
            className="profile-avatar-large"
            style={{
              background: profile.profile_image
                ? `url(${profile.profile_image}) center/cover`
                : `linear-gradient(135deg, ${
                    loggedUser?.descriptor ? "#00d4ff" : "#6c5ce7"
                  }, #a55eea)`,
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => document.getElementById("profileImageInput").click()}
            title="Click to upload new profile image"
          >
            {!profile.profile_image && initials}
            <div className="avatar-overlay">
              <span>Change</span>
            </div>
          </div>
          <input
            type="file"
            id="profileImageInput"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          <h2>{profile.name || loggedUser?.name}</h2>
          <p className="profile-id">ID: {profile.id || loggedUser?.id}</p>

          <div className="profile-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <HiOutlineStar
                  key={star}
                  style={{
                    fill: star <= Math.floor(stats.rating) ? "#FDCB6E" : "none",
                    color: "#FDCB6E",
                  }}
                />
              ))}
            </div>
            <span>{stats.rating.toFixed(1)}</span>
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <h4>{stats.totalDeliveries.toLocaleString()}</h4>
              <p>Delivered Orders</p>
            </div>
            <div className="profile-stat">
              <h4>Since {joinedYear}</h4>
              <p>Member Since</p>
            </div>
          </div>
        </div>

        <div className="profile-form-section">
          <div className="profile-form-header">
            <h3>Personal Information</h3>
            <button
              className="edit-toggle-btn"
              onClick={() => setEditing((prev) => !prev)}
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name || ""}
                  disabled={!editing}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  disabled={!editing}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="tel"
                  value={profile.mobile || ""}
                  disabled={!editing}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Descriptor</label>
                <input
                  type="text"
                  value={profile.descriptor ? "Face Verified" : "Pending"}
                  disabled
                />
              </div>
              <div className="form-group full-width">
                <label>City</label>
                <input
                  type="text"
                  value={profile.city || ""}
                  disabled={!editing}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="profile-form-actions">
              <button className="btn btn-outline" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
