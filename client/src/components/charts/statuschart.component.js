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

const labels = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
const backgroundColor = ['gold', 'cornflowerblue', 'lightseagreen', 'darkslategray'];

const options = {
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Reports by Status' }
  },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    y: { beginAtZero: true }
  }
};

export default class StatusChart extends Component {
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
      let submitted = 0, assigned = 0, progress = 0, resolved = 0;

      res.data.forEach(report => {
        switch (report.status) {
          case 'Submitted': submitted++; break;
          case 'Assigned': assigned++; break;
          case 'In Progress': progress++; break;
          case 'Resolved': resolved++; break;
          default: break;
        }
      });

      this.setState({
        data: {
          labels,
          datasets: [{
            data: [submitted, assigned, progress, resolved],
            backgroundColor
          }]
        }
      });
    })
    .catch(error => console.error('Error loading status chart:', error));
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
