import React, { Component } from 'react';
import axios from 'axios';

const roles = [
  { value: 'general', label: 'General User' },
  { value: 'technician', label: 'Technician' },
  { value: 'admin', label: 'Administrator' }
];

export default class ManageTechnicians extends Component {
  constructor(props) {
    super(props);
    this.state = {
      technicians: [],
      reports: [],
      loading: true,
      error: '',
      assigningReportId: null,
      assignSuccess: '',
      assignError: '',
      editingUser: null,
      successMsg: '',
      errorMsg: ''
    };
  }

  componentDidMount() {
    this.fetchTechniciansAndReports();
  }

  fetchTechniciansAndReports = async () => {
    const token = localStorage.getItem('token');
    try {
      const [techRes, reportsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users?role=technician', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/reports', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const technicianMap = {};
      techRes.data.forEach(tech => {
        technicianMap[tech._id] = tech;
      });

      this.setState({
        technicians: techRes.data,
        reports: reportsRes.data.map(report => ({
          ...report,
          assignedToUser: technicianMap[report.assignedTo?._id || report.assignedTo] || null
        })),
        loading: false,
        error: ''
      });
    } catch (err) {
      this.setState({ error: 'Failed to load technicians or reports.', loading: false });
    }
  };

  handleAssignChange = (reportId, technicianId) => {
    this.setState(prev => ({
      reports: prev.reports.map(r =>
        r._id === reportId ? { ...r, assignedTo: technicianId } : r
      ),
      assigningReportId: reportId,
      assignSuccess: '',
      assignError: ''
    }));

    const token = localStorage.getItem('token');

    axios
      .patch(
        `http://localhost:5000/api/reports/${reportId}/assign`,
        { technicianId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        const updatedReport = res.data;
        this.setState(prev => ({
          reports: prev.reports.map(r =>
            r._id === reportId ? {
              ...updatedReport,
              assignedToUser: prev.technicians.find(t => t._id === updatedReport.assignedTo?._id || updatedReport.assignedTo) || null
            } : r
          ),
          assigningReportId: null,
          assignSuccess: `Technician assigned successfully for report ${reportId}`,
          assignError: ''
        }));
        setTimeout(() => this.setState({ assignSuccess: '' }), 3000);
      })
      .catch(() => {
        this.setState(prev => ({
          reports: prev.reports.map(r =>
            r._id === reportId ? { ...r, assignedTo: null, assignedToUser: null } : r
          ),
          assigningReportId: null,
          assignError: 'Failed to assign technician',
          assignSuccess: ''
        }));
        setTimeout(() => this.setState({ assignError: '' }), 3000);
      });
  };

  deleteReport = (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    const token = localStorage.getItem('token');
    axios
      .delete(`http://localhost:5000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        this.setState(prev => ({
          reports: prev.reports.filter(r => r._id !== id)
        }));
      })
      .catch(() => alert('Failed to delete report'));
  };

  render() {
    const {
      technicians,
      reports,
      loading,
      error,
      assigningReportId,
      assignSuccess,
      assignError
    } = this.state;

    if (loading) return <p>Loading technicians and reports...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
      <div className="container mt-3">
        <h2>Manage Reports</h2>

        {assignSuccess && (
          <div className="alert alert-success text-center fixed-top mt-2 mx-auto" style={{ width: '350px', zIndex: 9999 }}>{assignSuccess}</div>
        )}
        {assignError && (
          <div className="alert alert-danger text-center fixed-top mt-2 mx-auto" style={{ width: '350px', zIndex: 9999 }}>{assignError}</div>
        )}

        {reports.length === 0 && <p>No reports found.</p>}
        {reports.length > 0 && (
          <table className="table table-striped">
            <thead>
              <tr className='table-header'>
                <th>Report ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Assigned Technician</th>
                <th>Change Technician</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report._id}>
                  <td>{report._id}</td>
                  <td>{report.title || report.description || 'No title'}</td>
                  <td>{report.status}</td>
                  <td>
                    {report.assignedToUser
                      ? `${report.assignedToUser.name}`
                      : <span className="text-muted">Not yet assigned</span>}
                  </td>
                  <td>
                    <select
                      disabled={assigningReportId === report._id}
                      value={report.assignedTo?._id || report.assignedTo || ''}
                      onChange={e => this.handleAssignChange(report._id, e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Unassigned --</option>
                      {technicians.map(tech => (
                        <option key={tech._id} value={tech._id}>
                          {tech.name} ({tech.email})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => this.deleteReport(report._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}
