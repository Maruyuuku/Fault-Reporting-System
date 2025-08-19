import React, { Component } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com'
  : 'http://localhost:5000';


function withParamsAndNavigate(Component) {
  return props => {
    const params = useParams();
    const navigate = useNavigate();
    return <Component {...props} params={params} navigate={navigate} />;
  };
}

const categoryOptions = ['Electrical', 'Plumbing', 'HVAC', 'Structural', 'Other'];
const severityOptions = ['Low', 'Medium', 'High', 'Critical'];

class EditReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      category: '',
      severity: '',
      location: '',
      successMsg: '',
      errorMsg: ''
    };
  }

  componentDidMount() {
    axios
      .get(`${API_URL}/api/reports/${this.props.params.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        const { title, description, category, severity, location } = res.data;
        this.setState({ title, description, category, severity, location });
      })
      .catch(err => {
        console.error(err);
        this.setState({ errorMsg: 'Failed to load report.' });
      });
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { title, description, category, severity, location } = this.state;

    axios
      .patch(
        `${API_URL}/api/reports/${this.props.params.id}/update`,
        { title, description, category, severity, location },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(() => {
        this.setState({ successMsg: 'Report updated successfully.', errorMsg: '' });
        setTimeout(() => this.props.navigate('/myreports'), 2000);
      })
      .catch(() => {
        this.setState({ errorMsg: 'Failed to update report.', successMsg: '' });
      });
  };

  render() {
    const { title, description, category, severity, location, successMsg, errorMsg } = this.state;

    return (
      <div className="container mt-3">
        <h3>
          Edit Report{title && ` (${title})`}{location && ` - ${location}`}
        </h3>

        {successMsg && (
          <div className="alert alert-success text-center mt-3">{successMsg}</div>
        )}
        {errorMsg && (
          <div className="alert alert-danger text-center mt-3">{errorMsg}</div>
        )}

        <form onSubmit={this.handleSubmit}>
          <div className="form-group mb-3">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={this.handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Description:</label>
            <textarea
              name="description"
              value={description}
              onChange={this.handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Category:</label>
            <select
              name="category"
              value={category}
              onChange={this.handleChange}
              className="form-control"
              required
            >
              <option value="">Select Category</option>
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label>Severity:</label>
            <select
              name="severity"
              value={severity}
              onChange={this.handleChange}
              className="form-control"
              required
            >
              <option value="">Select Severity</option>
              {severityOptions.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={this.handleChange}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Update report
          </button>
        </form>
      </div>
    );
  }
}

export default withParamsAndNavigate(EditReport);
