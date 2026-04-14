
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Download, User } from 'lucide-react';
import { Button, Card } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';

export const Payslip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { payrollRecords, getEmployeeById } = useData();
  
  // Find record (mocking lookup)
  const record = payrollRecords.find(r => r.id === id);
  // Get full employee details if possible, otherwise use partial record data
  const employee = record ? getEmployeeById(record.employeeId) : null;

  if (!record) {
      return <div>Record not found</div>;
  }

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="flex items-center gap-2">
               <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg">
                   <ChevronLeft size={20} />
               </button>
               <h1 className="text-2xl font-bold dark:text-white">Payslip</h1>
           </div>
           <div className="flex gap-3">
               <Button variant="outline" className="text-primary border-primary bg-blue-50 hover:bg-blue-100">
                  <span className="mr-2">˅</span> Export
               </Button>
               <Button onClick={handlePrint} className="bg-[#4361EE] hover:bg-blue-700 flex items-center gap-2">
                  <Printer size={16} /> Print Payslip
               </Button>
           </div>
       </div>

       <Card className="p-8">
           {/* Header / Logo */}
           <div className="flex justify-between items-start mb-8">
               <div className="flex items-center gap-2 font-bold text-xl text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm">L</div>
                  <span className="dark:text-white text-gray-900">Logo</span>
               </div>
               <div className="text-right">
                   <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300">Salary Payslip</h2>
                   <p className="text-gray-500 text-sm">November 2025</p>
               </div>
           </div>

           <hr className="border-gray-200 dark:border-gray-700 mb-8" />

           {/* Employee Info */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div>
                   <p className="text-xs text-gray-400 uppercase font-semibold mb-2">From</p>
                   <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                       <p><span className="font-semibold text-gray-900 dark:text-white">Employee :</span> {record.employeeName}</p>
                       <p><span className="font-bold">ID:</span> {employee?.internalId || 'EMP005'}</p>
                       <p><span className="font-bold">Department:</span> {employee?.department || 'Sales'}</p>
                       <p><span className="font-bold">Job Title:</span> {employee?.position || 'Senior Rep'}</p>
                   </div>
               </div>
               <div>
                   <p className="text-sm font-semibold mb-2">Payment Status</p>
                   <div className="flex items-center gap-2 mb-4">
                       <span className="w-2 h-2 rounded-full bg-green-500"></span>
                       <span className="text-green-600 font-medium">Paid</span>
                   </div>
                   {/* QR Code Placeholder */}
                   <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                       <div className="text-[8px] text-center leading-tight text-gray-400">QR<br/>Code</div>
                   </div>
               </div>
           </div>

           <hr className="border-gray-200 dark:border-gray-700 mb-8" />

           {/* Earnings Table */}
           <div className="overflow-x-auto mb-8">
               <table className="w-full text-sm">
                   <thead>
                       <tr className="bg-blue-50 dark:bg-blue-900/20 text-gray-600 dark:text-gray-300">
                           <th className="p-3 text-left font-medium">Basic Salary</th>
                           <th className="p-3 text-left font-medium">Housing allowance</th>
                           <th className="p-3 text-left font-medium">Transport allowance</th>
                           <th className="p-3 text-left font-medium">Nature allowance</th>
                           <th className="p-3 text-left font-medium">Commissions</th>
                           <th className="p-3 text-left font-medium">Bonuses</th>
                           <th className="p-3 text-left font-medium">Overtime hours</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr className="border-b border-gray-100 dark:border-gray-800">
                           <td className="p-3">{record.basicSalary}</td>
                           <td className="p-3">{record.housingAllowance}</td>
                           <td className="p-3">{record.transportAllowance}</td>
                           <td className="p-3">{record.workNatureAllowance}</td>
                           <td className="p-3">{record.commissions}</td>
                           <td className="p-3">{record.bonus}</td>
                           <td className="p-3">{record.overtime}</td>
                       </tr>
                   </tbody>
               </table>
           </div>

           {/* Deductions Table */}
           <div className="overflow-x-auto mb-12">
               <table className="w-full text-sm">
                   <thead>
                       <tr className="bg-blue-50 dark:bg-blue-900/20 text-gray-600 dark:text-gray-300">
                           <th className="p-3 text-left font-medium">Gosi employee</th>
                           <th className="p-3 text-left font-medium">hrdf support</th>
                           <th className="p-3 text-left font-medium">Bonus</th>
                           <th className="p-3 text-left font-medium">loan</th>
                           <th className="p-3 text-left font-medium">Saned deduction</th>
                           <th className="p-3 text-left font-medium">penalties</th>
                           <th className="p-3 text-left font-medium">Absence</th>
                           <th className="p-3 text-left font-medium">early leave</th>
                           <th className="p-3 text-left font-medium">Total deductions</th>
                           <th className="p-3 text-left font-medium">Net salary</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr className="border-b border-gray-100 dark:border-gray-800">
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3">0</td>
                           <td className="p-3 font-bold">{record.totals}</td>
                       </tr>
                   </tbody>
               </table>
           </div>

           {/* Signatures */}
           <div className="flex justify-between mt-12 pt-8">
               <div className="text-center w-48">
                   <p className="font-bold mb-8">HR Signature:</p>
                   <div className="h-0.5 bg-gray-300 w-full"></div>
               </div>
               <div className="text-center w-48">
                   <p className="font-bold mb-8">Employee Signature:</p>
                   <div className="h-0.5 bg-gray-300 w-full"></div>
               </div>
           </div>
       </Card>
    </div>
  );
};
