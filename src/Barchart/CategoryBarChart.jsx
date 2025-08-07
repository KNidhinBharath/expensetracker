import React, { useEffect, useState } from 'react';
import './CategoryBarChart.css'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

const CategoryBarChart = () => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

    // Count transactions per category
    const countMap = savedExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    // Convert to array for recharts
    const formatted = Object.entries(countMap).map(([category, count]) => ({
      category,
      count,
    }));

    setCategoryData(formatted);
  }, []);

 return (
  <div className="bar-chart-container" >
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={categoryData}
        barGap={20}
        margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
        width='100%'
      >
        <XAxis dataKey="count" type="number" hide />
        <YAxis dataKey="category" type="category" />
        <Tooltip />
        <Bar barSize={40} dataKey="count" fill="#8884d8">
          {categoryData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

};

export default CategoryBarChart;
