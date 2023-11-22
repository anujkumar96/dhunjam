import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './Dashboard.css';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const chartRef = useRef(null);
  const { id } = useParams(); // Extract id from URL parameters
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [data, setData] = useState({
    Custom: 0,
    High: 0,
    'Medium-High': 0,
    'Medium-Low': 0,
    Low: 0,
  });
  const [regularAmounts, setRegularAmounts] = useState({
    High: 0,
    'Medium-High': 0,
    'Medium-Low': 0,
    Low: 0,
  });
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [isChargingCustomers, setIsChargingCustomers] = useState(false);
  const [customAmount, setCustomAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://stg.dhunjam.in/account/admin/${id}`);
        const result = await response.json();
        console.log("result", result);
        setUserName(result?.data?.name);
        setUserLocation(result?.data?.location);
        setIsChargingCustomers(result.data.charge_customers || false);
        setData(result.data.amount || {});
        setCustomAmount(result.data.amount?.category_6 || 0);
        setRegularAmounts({
          High: result.data.amount?.category_7 || 0,
          'Medium-High': result.data.amount?.category_8 || 0,
          'Medium-Low': result.data.amount?.category_9 || 0,
          Low: result.data.amount?.category_10 || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const categories = Object.keys(data);
    setIsSaveButtonEnabled(
      regularAmounts.High >= 79 &&
      regularAmounts['Medium-High'] >= 59 &&
      regularAmounts['Medium-Low'] >= 39 &&
      regularAmounts.Low >= 19
    );
  
    if (chartRef.current && isChargingCustomers) {
      if (!chartRef.current.chart) {
        // If the chart doesn't exist, create a new one
        chartRef.current.chart = new Chart(chartRef.current.getContext('2d'), {
          type: 'bar',
          data: {
            labels: categories,
            datasets: [
              {
                label: 'Song Request Amounts',
                backgroundColor: 'rgba(103, 65, 217, 0.5)',
                borderColor: 'rgba(100, 200, 200, .9)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(100, 200, 200, .9)',
                hoverBorderColor: '#fff',
                data: categories.map((category) => data[category]),
              },
            ],
          },
        });
      } else {
        // If the chart already exists, update it
        chartRef.current.chart.data.datasets[0].data = categories.map((category) => data[category]);
        chartRef.current.chart.update();
      }
    } else if (!isChargingCustomers && chartRef.current && chartRef.current.chart) {
      // If not charging customers, remove the chart
      chartRef.current.chart.destroy();
      chartRef.current.chart = null;
    }
  }, [data, isChargingCustomers, regularAmounts]);
  

  const handleSave = async () => {
    try {
      const response = await fetch(`https://stg.dhunjam.in/account/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: {
            category_6: customAmount,
          },
        }),
      });

      const result = await response.json();
      console.log('Price Update Response:', result);

      // Fetch updated data after the PUT request
      fetchData();
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`https://stg.dhunjam.in/account/admin/${id}`);
      const result = await response.json();
      console.log("result", result);
      setUserName(result?.data?.name);
      setUserLocation(result?.data?.location);
      setIsChargingCustomers(result.data.charge_customers || false);
      setData(result.data.amount || {});
      setCustomAmount(result.data.amount?.category_6 || 0);
      setRegularAmounts({
        High: result.data.amount?.category_7 || 0,
        'Medium-High': result.data.amount?.category_8 || 0,
        'Medium-Low': result.data.amount?.category_9 || 0,
        Low: result.data.amount?.category_10 || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>{userName}, {userLocation} on DhunJam</h2>
      <div className="dashboard-section">
        <p>Do you want to charge your customers for requesting songs?</p>
        <div className="radio-buttons">
          <label htmlFor="chargeOptionYes">
            <input
              type="radio"
              id="chargeOptionYes"
              name="chargeOption"
              value="yes"
              checked={isChargingCustomers}
              onChange={() => setIsChargingCustomers(true)}
            />
            Yes
          </label>
          <label htmlFor="chargeOptionNo">
            <input
              type="radio"
              id="chargeOptionNo"
              name="chargeOption"
              value="no"
              checked={!isChargingCustomers}
              onChange={() => setIsChargingCustomers(false)}
            />
            No
          </label>
        </div>
      </div>

      {isChargingCustomers && (
        <>
          <div className="dashboard-section">
            <p>Custom song request amount</p>
            <input
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min={99}
            />
          </div>

          <div className="dashboard-section inputs" style={{ opacity: isChargingCustomers ? 1 : 0.5 }}>
            <p>Regular song request amounts, from high to low</p>
            {Object.keys(regularAmounts).map((category, index) => (
              <input
                key={category}
                type="number"
                placeholder={category}
                value={regularAmounts[category]}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value, 10) || 0;
                  setRegularAmounts((prev) => ({ ...prev, [category]: newValue }));
                  setIsSaveButtonEnabled(
                    regularAmounts.High >= 79 &&
                    regularAmounts['Medium-High'] >= 59 &&
                    regularAmounts['Medium-Low'] >= 39 &&
                    regularAmounts.Low >= 19
                  );
                }}
                min={index === 0 ? 79 : index === 1 ? 59 : index === 2 ? 39 : 19}
                disabled={!isChargingCustomers}
              />
            ))}
          </div>

          <div className="dashboard-section graph-section">
            <h3>Graph</h3>
            <canvas ref={chartRef} />
          </div>

          <button
            onClick={handleSave}
            disabled={!isSaveButtonEnabled || !isChargingCustomers}
            className='save-button'
          >
            Save
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
