import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './Dashboard.css';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const chartRef = useRef(null);
  // Extracting id from URL parameters
  const { id } = useParams(); 
  // for handling username received from response
  const [userName, setUserName] = useState('');
  // for handling location received from response
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
  // handling save button enable/disable
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  // handling charging_customer value received from respomnse
  const [isChargingCustomers, setIsChargingCustomers] = useState(false);
  // handling amount of category_6, category_7, category_8, category_9 and category_10,
  const [customAmount, setCustomAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetching data of the logged in user with dynamic id updation in routing
        const response = await fetch(`https://stg.dhunjam.in/account/admin/${id}`);
        const result = await response.json();
        // console.log("result", result);
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
// fetching the data of the user again if id is changed 
  }, [id]);

  useEffect(() => {
    const categories = Object.keys(data);
    setIsSaveButtonEnabled(
      customAmount >= 99 &&
      regularAmounts.High >= 79 &&
      regularAmounts['Medium-High'] >= 59 &&
      regularAmounts['Medium-Low'] >= 39 &&
      regularAmounts.Low >= 19
    );

    if (chartRef.current && isChargingCustomers) {
      if (!chartRef.current.chart) {
        // create a new chart if it doesn't exist.
        chartRef.current.chart = new Chart(chartRef.current.getContext('2d'), {
          type: 'bar',
          data: {
            labels: categories,
            datasets: [
              {
                label: 'Song Request Amounts',
                backgroundColor: '#837fac',
                // borderColor: 'rgba(103, 65, 217, 0.5)',
                borderWidth: 1,
                // hoverBackgroundColor: 'rgba(103, 65, 217, 0.5)',
                hoverBorderColor: '#fff',
                data: categories.map((category) => data[category]),
              },
            ],
          },
          options: {
            scales: {
              x: {
                grid: {
                  drawOnChartArea: false,
                },
              },
              y: {
                beginAtZero: true,
              },
            },
            plugins: {
              legend: {
                display: true,
              },
            },
            indexAxis: 'x', // Use 'x' axis for bar percentages
            barPercentage: 0.5, // Set the bar width to 50%
          },
        });
      } else {
        // updating the chart (if it exist)
        chartRef.current.chart.data.datasets[0].data = categories.map((category) => data[category]);
        chartRef.current.chart.update();
      }
    } else if (!isChargingCustomers && chartRef.current && chartRef.current.chart) {
      // removing chart, if customer not charged
      chartRef.current.chart.destroy();
      chartRef.current.chart = null;
    }
    // setting the dependencies
  }, [data, isChargingCustomers, regularAmounts, customAmount]);

  const handleSave = async () => {
    try {
      if (customAmount < 99) {
        // disabling save button, if custom amount < 99
        setIsSaveButtonEnabled(false);
        return;
      }
  // updating the amount if these were changed
      const response = await fetch(`https://stg.dhunjam.in/account/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: {
            category_6: customAmount,
            category_7: regularAmounts.High,
            category_8: regularAmounts['Medium-High'],
            category_9: regularAmounts['Medium-Low'],
            category_10: regularAmounts.Low,
          },
        }),
      });
  
      const result = await response.json();
      console.log('Price Update', result);
  
      // Fetching updated data after the PUT request
      fetchData();
    } catch (error) {
      console.error('Error in updating', error);
    }
  };
  

  const fetchData = async () => {
    try {
      // fetching the data after update
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
{/* based on charged or non charged UI is shown  */}
      {isChargingCustomers ? (
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
{/* graph below */}
          <div className="dashboard-section graph-section">
            <h3>Graph</h3>
            <canvas ref={chartRef} />
          </div>
{/* save button for handling update */}
          <button
            onClick={handleSave}
            disabled={!isSaveButtonEnabled || !isChargingCustomers}
            className={`save-button ${!isSaveButtonEnabled || !isChargingCustomers ? 'disabled' : ''}`}
          >
            Save
          </button>
        </>
      ):<>
      <h3 className='non-charged'>You are not being charged. So, nothing to show. </h3>
      </>}
    </div>
  );
};

export default Dashboard;
