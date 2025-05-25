import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/form.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pen: '',
    generalNo: '',
    name: '',
    email: '',
    phone: '',
    licenseNo: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    password: '',
    confirmPassword: '',
  });

  const [photo, setPhoto] = useState('');
  const [signature, setSignature] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = async (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      key === 'photo' ? setPhoto(base64) : setSignature(base64);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // includes MIME
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/register', {
        ...formData,
        photo,
        signature,
      });

      alert(res.data.message);
      navigate('/');
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="containerStyle">
      <form onSubmit={handleSubmit} className="formStyle">
        <h2 className="headingStyle">Register</h2>

        {[
          { name: 'pen', placeholder: 'PEN Number' },
          { name: 'generalNo', placeholder: 'General Number (optional)' },
          { name: 'name', placeholder: 'Name' },
          { name: 'email', placeholder: 'Email', type: 'email' },
          { name: 'phone', placeholder: 'Mobile Number', type: 'tel', pattern: '[0-9]{10}' },
          { name: 'licenseNo', placeholder: 'Licence Number (optional)' },
        ].map(({ name, placeholder, type = 'text', pattern }) => (
          <div className="fieldStyle" key={name}>
            <input
              name={name}
              type={type}
              onChange={handleChange}
              placeholder={placeholder}
              pattern={pattern}
              className="inputStyle"
            />
          </div>
        ))}

        <div className="fieldStyle">
          <input type="date" name="dob" onChange={handleChange} required className="inputStyle" />
          <small>Date Of Birth(DOB)</small>
        </div>

        <div className="fieldStyle">
          <select name="gender" onChange={handleChange} required className="inputStyle">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="fieldStyle">
          <select name="bloodGroup" onChange={handleChange} required className="inputStyle">
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="fieldStyle">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'photo')}
            required
            className="inputStyle"
          />
          <small>Upload Photo</small>
        </div>

        <div className="fieldStyle">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'signature')}
            required
            className="inputStyle"
          />
          <small>Upload Signature</small>
        </div>

        <div className="fieldStyle">
          <input
            type="password"
            name="password"
            onChange={handleChange}
            placeholder="Enter Password"
            required
            className="inputStyle"
          />
        </div>

        <div className="fieldStyle">
          <input
            type="password"
            name="confirmPassword"
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            className="inputStyle"
          />
        </div>

        <button type="submit" className="buttonStyle">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
