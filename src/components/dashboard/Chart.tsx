import React from 'react';
import { ChartProps, ChartDataPoint, EquipmentUtilizationData } from '../../types/dashboard';

const Chart: React.FC<ChartProps> = ({ 
  data, 
  title, 
  type, 
  height = 300, 
  className = '' 
}) => {
  const renderLineChart = (data: ChartDataPoint[]) => {
    if (!data.length) return <div className="text-gray-500 text-center py-8">No data available</div>;

    const maxCount = Math.max(...data.map(d => d.count));
    const minCount = Math.min(...data.map(d => d.count));
    const range = maxCount - minCount || 1;
    const chartHeight = height - 80; // Account for padding and labels

    return (
      <div className="w-full">
        {/* Chart container with Y-axis labels */}
        <div className="relative flex" style={{ height: `${chartHeight}px` }}>
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 w-8">
            <span>{maxCount}</span>
            <span>{Math.round((maxCount + minCount) / 2)}</span>
            <span>{minCount}</span>
          </div>
          
          {/* Chart area */}
          <div className="flex-1 flex items-end space-x-1">
            {data.slice(0, 20).map((point, index) => {
              const barHeight = ((point.count - minCount) / range) * (chartHeight - 20);
              const date = new Date(point._id.year, point._id.month - 1, point._id.day);
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm w-full transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${Math.max(barHeight, 2)}px` }}
                    title={`${point.count} on ${date.toLocaleDateString()}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis labels below the chart */}
        <div className="flex space-x-1 mt-2">
          <div className="w-8"></div> {/* Spacer to align with Y-axis */}
          <div className="flex-1 flex space-x-1">
            {data.slice(0, 20).map((point, index) => {
              const date = new Date(point._id.year, point._id.month - 1, point._id.day);
              
              return (
                <div key={index} className="flex-1 flex justify-center">
                  {/* X-axis labels (every 3rd item for better spacing) */}
                  {index % 3 === 0 && (
                    <div className="text-xs text-gray-500 text-center whitespace-nowrap">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderBarChart = (data: ChartDataPoint[]) => {
    if (!data.length) return <div className="text-gray-500 text-center py-8">No data available</div>;

    const maxCount = Math.max(...data.map(d => d.count));
    const chartHeight = height - 80; // Account for labels

    return (
      <div className="space-y-3">
        {data.slice(0, 8).map((point, index) => {
          const width = (point.count / maxCount) * 100;
          const date = new Date(point._id.year, point._id.month - 1, point._id.day);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="font-bold text-gray-900">{point.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500 ease-out hover:from-green-600 hover:to-green-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = (data: ChartDataPoint[]) => {
    if (!data.length) return <div className="text-gray-500 text-center py-8">No data available</div>;

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-yellow-500'
    ];

    return (
      <div className="space-y-4">
        {data.slice(0, 6).map((point, index) => {
          const percentage = (point.count / total) * 100;
          const color = colors[index % colors.length];
          const date = new Date(point._id.year, point._id.month - 1, point._id.day);
          
          return (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-5 h-5 rounded-full ${color} shadow-sm`} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="font-bold text-gray-900">{point.count} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${color} h-2.5 rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEquipmentChart = (data: EquipmentUtilizationData[]) => {
    if (!data.length) return <div className="text-gray-500 text-center py-8">No data available</div>;

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const utilizationRate = ((item.count - item.available) / item.count) * 100;
          const colors = [
            'bg-gradient-to-r from-purple-500 to-purple-400',
            'bg-gradient-to-r from-orange-500 to-orange-400', 
            'bg-gradient-to-r from-indigo-500 to-indigo-400',
            'bg-gradient-to-r from-pink-500 to-pink-400'
          ];
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 text-lg">{item._id}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {item.available}/{item.count} available
                  </div>
                  <div className="text-xs text-gray-500">
                    {utilizationRate.toFixed(1)}% utilization
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`${color} h-4 rounded-full transition-all duration-700 ease-out hover:shadow-lg`}
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart(data as ChartDataPoint[]);
      case 'bar':
        return renderBarChart(data as ChartDataPoint[]);
      case 'pie':
        return renderPieChart(data as ChartDataPoint[]);
      case 'equipment':
        return renderEquipmentChart(data as EquipmentUtilizationData[]);
      default:
        return <div className="text-gray-500 text-center py-8">Unsupported chart type</div>;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {data.length} data points
        </div>
      </div>
      <div style={{ height: `${height}px` }} className="overflow-visible">
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;
