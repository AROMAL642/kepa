import React from "react";
import "./404.css";

export default function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-heading">404</h1>

        <h2 className="notfound-title">Page Not Found</h2>

        <p className="notfound-paragraph">
          The page you're looking for doesn't exist or has been moved.
        </p>
      
        <button
          onClick={handleGoHome}
          className="notfound-btn notfound-btn-home"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
