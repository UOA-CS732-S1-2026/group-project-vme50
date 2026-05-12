import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../api/userApi";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    course: "",
    interests: "",
    avatarColor: "#10b981",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        const user = response.data;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          course: user.course || "",
          interests: user.interests?.join(", ") || "",
          avatarColor: user.avatarColor || "#10b981",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await updateMyProfile({
        name: profile.name,
        bio: profile.bio,
        course: profile.course,
        interests: profile.interests
          .split(",")
          .map((interest) => interest.trim())
          .filter(Boolean),
        avatarColor: profile.avatarColor,
      });

      localStorage.setItem("user", JSON.stringify(response.data));

      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading profile...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          height: "70px",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ color: "#009688", margin: 0 }}>Platemates</h2>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            border: "none",
            background: "#009688",
            color: "white",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Back to Dashboard
        </button>
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>My Profile</h1>
        <p style={{ color: "#64748b", marginBottom: "28px" }}>
          Personalise your profile so other students can know more about you.
        </p>

        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: profile.avatarColor,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "24px",
          }}
        >
          {profile.name.charAt(0).toUpperCase() || "U"}
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <label>
            <strong>Name</strong>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label>
            <strong>Email</strong>
            <input value={profile.email} disabled style={inputStyle} />
          </label>

          <label>
            <strong>Course</strong>
            <input
              placeholder="e.g. Master of Computer Science"
              value={profile.course}
              onChange={(e) => setProfile({ ...profile, course: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label>
            <strong>About Me</strong>
            <textarea
              placeholder="Tell others about yourself..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={5}
              maxLength={300}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <p style={{ textAlign: "right", color: "#64748b", margin: 0 }}>
              {profile.bio.length}/300
            </p>
          </label>

          <label>
            <strong>Interests</strong>
            <input
              placeholder="e.g. Korean food, hiking, anime, basketball"
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
              style={inputStyle}
            />
            <p style={{ color: "#64748b", marginTop: "6px" }}>Separate interests with commas.</p>
          </label>

          <label>
            <strong>Avatar Colour</strong>
            <input
              type="color"
              value={profile.avatarColor}
              onChange={(e) => setProfile({ ...profile, avatarColor: e.target.value })}
              style={{
                width: "80px",
                height: "44px",
                marginTop: "8px",
                cursor: "pointer",
              }}
            />
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: "12px",
              background: "#00b894",
              color: "white",
              border: "none",
              padding: "14px 20px",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
};

export default Profile;
