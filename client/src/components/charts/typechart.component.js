import React, { Component } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com'
  : 'http://localhost:5000';

const labels = ['Electrical', 'Plumbing', 'HVAC', 'Structural', 'Other'];
const backgroundColor = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#9e9e9e'];

const options = {
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Reports by Category' }
  },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    y: { beginAtZero: true }
  }
};

export default class TypeChart extends Component {
  state = {
    data: {
      labels,
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor
      }]
    }
  };

  componentDidMount() {
    const token = localStorage.getItem('token');

    axios.get('${API_URL}:5000/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      let electrical = 0, plumbing = 0, hvac = 0, structural = 0, other = 0;

      res.data.forEach(report => {
        if (report.status !== 'Resolved') {
          switch(report.category) {
            case 'Electrical': electrical++; break;
            case 'Plumbing': plumbing++; break;
            case 'HVAC': hvac++; break;
            case 'Structural': structural++; break;
            case 'Other': other++; break;
            default: other++; break;
          }
        }
      });

      this.setState({
        data: {
          labels,
          datasets: [{
            data: [electrical, plumbing, hvac, structural, other],
            backgroundColor
          }]
        }
      });
    })
    .catch(error => console.error('Error loading type chart:', error));
  }

  render() {
    return (
      <div className="chart-container">
        <Bar 
          data={this.state.data}
          options={options}
        />
      </div>
    );
  }
}
