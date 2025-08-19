import React, { Component } from 'react';
import axios from 'axios';

const categories = ['Electrical', 'Plumbing', 'HVAC', 'Structural', 'Other'];
const severities = ['Low', 'Medium', 'High', 'Critical'];
const blocks = ['A', 'B', 'C', 'D', 'E', 'F', 'R', 'Other'];

export default class CreateReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      description: '',
      category: categories[0],
      severity: severities[1],
      block: '',
      number: '',
      useCustomLocation: false,
      customLocation: '',
      image: null, 
      error: '',
      success: ''
    };

    this.onChange = this.onChange.bind(this);
    this.onCategorySelect = this.onCategorySelect.bind(this);
    this.onSeveritySelect = this.onSeveritySelect.bind(this);
    this.onImageChange = this.onImageChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onCategorySelect(category) {
    this.setState({ category });
  }

  onSeveritySelect(severity) {
    this.setState({ severity });
  }

  onImageChange(e) {
    this.setState({ image: e.target.files[0] || null });
  }

  onSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      this.setState({ error: 'You must be logged in to submit a report.' });
      return;
    }

    const location = this.state.useCustomLocation
      ? this.state.customLocation
      : `${this.state.block}${this.state.number}`;

    const formData = new FormData();
    formData.append('title', this.state.title);
    formData.append('description', this.state.description);
    formData.append('category', this.state.category);
    formData.append('severity', this.state.severity);
    formData.append('location', location);

    if (this.state.image) {
      formData.append('image', this.state.image); // single image key
    }

    axios.post('http://localhost:5000/api/reports', formData, {
      headers: {
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      alert('Report created successfully!');
      this.setState({
        title: '',
        description: '',
        category: categories[0],
        severity: severities[1],
        block: '',
        number: '',
        useCustomLocation: false,
        customLocation: '',
        image: null,
        success: 'Report created successfully!',
        error: ''
      });
      setTimeout(() => this.setState({ success: '' }), 3000);
    })
    .catch(() => {
      this.setState({ error: 'Error creating report.', success: '' });
      setTimeout(() => this.setState({ error: '' }), 3000);
    });
  }

  render() {
    const {
      title, description, category, severity,
      block, number, customLocation, useCustomLocation,
      error, success, image
    } = this.state;

    return (
      <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '45px' }}>Report</h2>
        <p style={{ textAlign: 'center', color: '#555', marginTop: '-10px', marginBottom: '20px' }}>
          Tell us what's wrong
        </p>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '10px' }}>{success}</div>}

        <form onSubmit={this.onSubmit} encType="multipart/form-data">
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Title:</label>
            <input
              type="text"
              required
              className="form-control"
              name="title"
              value={title}
              onChange={this.onChange}
              placeholder="Enter title"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Description:</label>
            <textarea
              style={{ resize: 'none' }}
              maxLength="250"
              rows="3"
              required
              className="form-control"
              name="description"
              value={description}
              onChange={this.onChange}
              placeholder="Describe the issue"
            ></textarea>
          </div>

          {/* Category */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Category:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => this.onCategorySelect(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: category === cat ? '2px solid #141414' : '1px solid #ccc',
                    backgroundColor: category === cat ? '#141414' : '#fff',
                    color: category === cat ? '#fff' : '#000',
                    cursor: 'pointer',
                    fontWeight: category === cat ? '600' : '400',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Severity:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              {severities.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => this.onSeveritySelect(s)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: severity === s ? '2px solid #141414' : '1px solid #ccc',
                    backgroundColor: severity === s ? '#141414' : '#fff',
                    color: severity === s ? '#fff' : '#000',
                    cursor: 'pointer',
                    fontWeight: severity === s ? '600' : '400',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Location:</label>
            {!useCustomLocation ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <b>Block:</b>
                <select
                  className="form-control"
                  name="block"
                  value={block}
                  onChange={this.onChange}
                  required
                >
                  <option value="">Block</option>
                  {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <b>Number:</b>
                <select
                  className="form-control"
                  name="number"
                  value={number}
                  onChange={this.onChange}
                  required={block !== 'Other'}
                  disabled={block === 'Other'}
                >
                  <option value="">Number</option>
                  {[...Array(100)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                {block === 'Other' && (
                  <button
                    type="button"
                    onClick={() => this.setState({ useCustomLocation: true })}
                    style={{ marginLeft: '5px', padding: '6px 10px' }}
                  >
                    Type Manually
                  </button>
                )}
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
                name="customLocation"
                value={customLocation}
                onChange={this.onChange}
                placeholder="Custom location"
                required
              />
            )}
          </div>

          {/* Single Image Upload */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Upload Image:</label>
            <i style={{color: 'grey'}}>Only PNG and JPG</i>
            <input
              type="file"
              accept="image/*"
              onChange={this.onImageChange}
              className="form-control"
            />
            {image && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="form-group" style={{ textAlign: 'center' }}>
            <input
              type="submit"
              value="Send Report"
              className="btn btn-primary"
              style={{ padding: '10px 30px', fontSize: '16px' }}
            />
          </div>
        </form>
      </div>
    );
  }
}
