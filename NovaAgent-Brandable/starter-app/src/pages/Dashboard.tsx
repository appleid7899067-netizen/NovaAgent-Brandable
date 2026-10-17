import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">Card 1</div>
        <div className="bg-white rounded-lg shadow p-4">Card 2</div>
        <div className="bg-white rounded-lg shadow p-4">Card 3</div>
      </div>
    </div>
  );
};

export default Dashboard;
