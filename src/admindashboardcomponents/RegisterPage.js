import React, { useState } from 'react';
import axios from 'axios';
import '../css/loginform.css';

const RegisterPage = () => {
  

  const initialFormData = {
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
    role: 'user',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [photo, setPhoto] = useState('');
  const [signature, setSignature] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleImageChange = async (e, key) => {
    const file = e.target.files[0];
    const maxSize = 50 * 1024; // 50 KB

    if (file) {
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          [key]: 'File size must be less than 50 KB',
        }));
        return;
      }

      const base64 = await toBase64(file);
      key === 'photo' ? setPhoto(base64) : setSignature(base64);
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!photo) {
      newErrors.photo = 'Photo is required';
    }

    if (!signature) {
      newErrors.signature = 'Signature is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post('http://localhost:5000/registerbyadmin', {
        ...formData,
        photo,
        signature,
        verified: 'YES',
      });

      alert(res.data.message);

      // Reset all form fields visually
      setFormData(initialFormData);
      setPhoto('');
      setSignature('');
      setErrors({});
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="containerStyle">
      <form onSubmit={handleSubmit} className="formStyle">
        <h2 className="headingStyle">Add Users</h2>

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
              pattern={pattern}
              value={formData[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="inputStyle"
              required={name !== 'generalNo' && name !== 'licenseNo'}
            />
            {errors[name] && <div className="errorText">{errors[name]}</div>}
          </div>
        ))}

        <div className="fieldStyle">
          <small>Date Of Birth (DOB)</small>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="inputStyle"
          />
          {errors.dob && <div className="errorText">{errors.dob}</div>}
        </div>

        <div className="fieldStyle">
          <select name="gender" value={formData.gender} onChange={handleChange} required className="inputStyle">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <div className="errorText">{errors.gender}</div>}
        </div>

        <div className="fieldStyle">
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="inputStyle">
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
          {errors.bloodGroup && <div className="errorText">{errors.bloodGroup}</div>}
        </div>

        <div className="fieldStyle">
          <select name="role" value={formData.role} onChange={handleChange} required className="inputStyle">
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="fuel">Fuel</option>
            <option value="mti">MTI</option>
            <option value="repair">Repair</option>
            <option value="mechanic">Mechanic</option>
          </select>
          {errors.role && <div className="errorText">{errors.role}</div>}
        </div>

        <div className="fieldStyle">
          <small>Upload Photo (Max 50 KB)</small>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'photo')}
            className="inputStyle"
          />
          {errors.photo && <div className="errorText">{errors.photo}</div>}
        </div>

        <div className="fieldStyle">
          <small>Upload Signature (Max 50 KB)</small>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'signature')}
            className="inputStyle"
          />
          {errors.signature && <div className="errorText">{errors.signature}</div>}
        </div>

        <div className="fieldStyle">
          <input
            type="password"
            name="password"
            value={formData.password}
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
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            className="inputStyle"
          />
          {errors.confirmPassword && <div className="errorText">{errors.confirmPassword}</div>}
        </div>

        <button type="submit" className="buttonStyle">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
