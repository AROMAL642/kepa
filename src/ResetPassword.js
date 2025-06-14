import React, { useState } from 'react';
import axios from 'axios';
import './css/loginform.css';

const ResetPassword = () => {
  const [pen, setPen] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/resetpassword', { pen });
      setMessage(res.data.message || 'OTP sent successfully');
      setOtpSent(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending OTP');
      setOtpSent(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/verifyotp', { pen, otp });

      if (res.data.success) {
        setMessage('OTP verified successfully');
        setOtpVerified(true);
      } else {
        setError('Invalid OTP');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/updatepassword', {
        pen,
        newPassword
      });

      setMessage(res.data.message || 'Password updated successfully');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving new password');
    }
  };

  return (
    <div className="containerStyle">
      <form onSubmit={handleSendOTP} className="formStyle">
        <h2 className="headingStyle">Reset Password</h2>

        <div className="fieldStyle">
          <label htmlFor="pen">PEN Number</label>
          <input
            type="text"
            id="pen"
            value={pen}
            onChange={(e) => setPen(e.target.value)}
            placeholder="Enter your PEN number"
            required
            className="inputStyle"
          />
        </div>

        <button type="submit" className="buttonStyle">Send OTP</button>
      </form>

      {otpSent && !otpVerified && (
        <form onSubmit={handleVerifyOTP} className="formStyle">
          <div className="fieldStyle">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the OTP you received"
              required
              className="inputStyle"
            />
          </div>
          <button type="submit" className="buttonStyle">Verify OTP</button>
        </form>
      )}

      {otpVerified && (
        <form onSubmit={handleSavePassword} className="formStyle">
          <div className="fieldStyle">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="inputStyle"
              placeholder="Enter new password"
            />
          </div>

          <div className="fieldStyle">
            <label>Re-enter New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="inputStyle"
              placeholder="Re-enter new password"
            />
          </div>

          <button type="submit" className="buttonStyle">Save Password</button>
        </form>
      )}

      {message && <p style={{ color: 'green', textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
