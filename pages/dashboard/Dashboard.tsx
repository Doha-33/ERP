
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { ArrowUp, ArrowDown, Filter, MoreHorizontal } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Order } from '../../types';
import { useData } from '../../context/DataContext';

// Empty data for visuals
const monthlySalesData: any[] = [];
const statsData: any[] = [];
const targetData = [
  { name: 'Achieved', value: 0 },
  { name: 'Remaining', value: 100 },
];

const COLORS = ['#4361EE', '#334155'];

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { employees, payrollRecords, isDataLoading } = useData();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Optimized Columns for Orders Table
  const columns: Column<Order>[] = useMemo(() => [
    { 
      header: 'Products', 
      render: (order) => (
         <div className="flex items-center gap-3">
            <img src={order.image} alt={order.product} className="w-10 h-10 rounded-lg object-cover" />
            <div>
               <p className="font-bold dark:text-white text-gray-900">{order.product}</p>
               <p className="text-xs text-gray-500">{order.variants}</p>
            </div>
         </div>
      )
    },
    { header: t('category'), accessorKey: 'category', className: 'text-gray-500' },
    { 
      header: t('price'), 
      render: (order) => <span className="font-medium dark:text-gray-200">${order.price.toFixed(2)}</span>
    },
    { 
      header: t('status'), 
      render: (order) => <Badge status={order.status} />
    }
  ], [t]);

  // Derived real stats
  const totalEmployeesCount = useMemo(() => employees.length, [employees]);

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${isDataLoading ? 'opacity-50' : 'opacity-100'}`}>
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Customers Card (Reusing for Employees) */}
        <Card className="flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
               <span className="text-xl">👥</span>
             </div>
           </div>
           <div>
             <p className="text-muted text-sm mb-1">{t('total_employees')}</p>
             <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold dark:text-white">{totalEmployeesCount}</h3>
                <span className="text-xs font-medium bg-success-bg text-success-text dark:bg-success-bg/10 px-2 py-1 rounded flex items-center">
                  <ArrowUp size={12} className="mr-1" /> Active
                </span>
             </div>
           </div>
        </Card>

        {/* Orders Card (Reusing for Payrolls) */}
        <Card className="flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
               <span className="text-xl">💰</span>
             </div>
           </div>
           <div>
             <p className="text-muted text-sm mb-1">{t('payroll')}</p>
             <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold dark:text-white">{payrollRecords.length}</h3>
                <span className="text-xs font-medium bg-info-bg text-info-text dark:bg-info-bg/10 px-2 py-1 rounded flex items-center">
                   Records
                </span>
             </div>
           </div>
        </Card>

        {/* Target Radial Chart */}
        <Card className="row-span-2 flex flex-col items-center justify-center relative">
          <div className="w-full flex justify-between items-start mb-4">
             <div>
               <h3 className="font-bold dark:text-white">{t('monthly_target')}</h3>
               <p className="text-xs text-gray-500">Target you've set for each month</p>
             </div>
             <MoreHorizontal size={20} className="text-gray-400 cursor-pointer" />
          </div>
          
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetData}
                  cx="50%"
                  cy="70%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  cornerRadius={10}
                >
                  {targetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white">0%</h2>
               <span className="text-xs bg-gray-100 dark:bg-dark-border text-gray-400 px-2 py-0.5 rounded-full">0%</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-[-40px]">
            System data is being synchronized. <br/> No active targets found.
          </p>
        </Card>

        {/* Monthly Sales Chart */}
        <Card className="col-span-1 md:col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold dark:text-white">Activity Overview</h3>
              <MoreHorizontal size={20} className="text-gray-400 cursor-pointer" />
           </div>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={monthlySalesData} barSize={12}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                 <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    dy={10}
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                 />
                 <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      color: isDarkMode ? '#F1F5F9' : '#1E293B'
                    }}
                 />
                 <Bar dataKey="value" fill="#4361EE" radius={[4, 4, 4, 4]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>
      </div>

      {/* Statistics Line Chart */}
      <Card>
        <div className="flex flex-wrap justify-between items-center mb-6">
           <div>
              <h3 className="font-bold dark:text-white">{t('statistics')}</h3>
              <p className="text-xs text-gray-500">Data usage and response times</p>
           </div>
           <div className="flex gap-2">
              {['Monthly', 'Quarterly', 'Annually'].map((p) => (
                 <button key={p} className={`px-3 py-1 text-xs rounded-md transition-colors ${p === 'Monthly' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {p}
                 </button>
              ))}
           </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={statsData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361EE" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4361EE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <RechartsTooltip 
                contentStyle={{
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  color: isDarkMode ? '#F1F5F9' : '#1E293B'
                }}
              />
              <Area type="monotone" dataKey="uv" stroke="#4361EE" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
