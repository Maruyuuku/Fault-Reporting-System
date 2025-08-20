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

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://fault-reporting-system.onrender.com'
  : 'http://localhost:5000';


Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const labels = ['Low', 'Medium', 'High', 'Critical'];
const backgroundColor = ['#8bc34a', '#ffeb3b', '#ff9800', '#f44336'];

const options = {
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Reports by Priority' }
  },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    y: { beginAtZero: true }
  }
};

export default class PriorityChart extends Component {
  state = {
    data: {
      labels,
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor
      }]
    }
  };

  componentDidMount() {
    const token = localStorage.getItem('token');

    axios.get(`${API_URL}/api/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      let low = 0, medium = 0, high = 0, critical = 0;

      res.data.forEach(report => {
        if (report.status !== 'Resolved') {
          switch(report.severity) {
            case 'Low': low++; break;
            case 'Medium': medium++; break;
            case 'High': high++; break;
            case 'Critical': critical++; break;
            default: break;
          }
        }
      });

      this.setState({
        data: {
          labels,
          datasets: [{
            data: [low, medium, high, critical],
            backgroundColor
          }]
        }
      });
    })
    .catch(error => console.error('Error loading priority chart:', error));
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
