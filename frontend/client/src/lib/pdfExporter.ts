import { jsPDF } from 'jspdf';
// Import the plugin and attach it to jsPDF globally
import 'jspdf-autotable';

interface ExpenseItem {
  id: string | number;
  amount: string;
  category: string;
  description?: string | null;
  date: Date;
  currency: string;
  isOffline?: boolean;
  type?: string; // 'debit' or 'credit'
}

// Export all expenses
export const exportExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'expense-report.pdf') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(22);
  doc.text('Expense Report', 20, 20);

  // Add metadata
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Expenses: ${expenses.length}`, 20, 45);
  
  addExpensesTable(doc, expenses);
  
  // Save the PDF
  doc.save(fileName);
};

// Export cash expenses only
export const exportCashExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'cash-expenses-report.pdf') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(22);
  doc.text('Cash Expenses Report', 20, 20);

  // Add metadata
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Cash Expenses: ${expenses.length}`, 20, 45);
  
  addExpensesTable(doc, expenses);
  
  // Save the PDF
  doc.save(fileName);
};

// Export monthly expenses only
export const exportMonthlyExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'monthly-expenses-report.pdf') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(22);
  doc.text('Monthly Expenses Report', 20, 20);

  // Add metadata
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Monthly Expenses: ${expenses.length}`, 20, 45);
  
  addExpensesTable(doc, expenses);
  
  // Save the PDF
  doc.save(fileName);
};

// Export loan expenses only
export const exportLoanExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'loan-expenses-report.pdf') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(22);
  doc.text('Loan Expenses Report', 20, 20);

  // Add metadata
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Loan Expenses: ${expenses.length}`, 20, 45);
  
  addExpensesTable(doc, expenses);
  
  // Save the PDF
  doc.save(fileName);
};

// Helper function to add expenses table to PDF
const addExpensesTable = (doc: any, expenses: ExpenseItem[]) => {
  // Prepare table data
  const tableColumn = ["#", "Date & Time", "Amount", "Category", "Payment Type"];
  const tableRows: any[][] = [];

  expenses.forEach((expense, index) => {
    const paymentType = expense.isOffline ? 'Cash' : (expense.type === 'debit' ? 'Online' : 'Online');
    const dateStr = new Date(expense.date).toLocaleString();
    const amountStr = `${expense.currency || '$'}${expense.amount}`;
    
    const rowData = [
      index + 1,
      dateStr,
      amountStr,
      (expense.category || expense.description || 'N/A').toString(),
      paymentType
    ];
    
    tableRows.push(rowData);
  });

  // Add table - check if autoTable is available before using it
  if (typeof doc.autoTable !== 'function') {
    console.error('autoTable is not available. Make sure jspdf-autotable is properly imported.');
    return;
  }

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 60,
    styles: {
      fontSize: 10,
    },
    headStyles: {
      fillColor: [29, 78, 216], // Tailwind's blue-600
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Tailwind's gray-50
    }
  });

  // Add summary section
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Summary', 20, finalY + 10);

  // Calculate totals
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);

  const onlineExpenses = expenses.filter(e => !e.isOffline && e.type !== 'credit').length;
  const cashExpenses = expenses.filter(e => e.isOffline).length;

  doc.setFontSize(12);
  doc.text(`Total Expenses: ${totalExpenses}`, 20, finalY + 20);
  doc.text(`Total Amount: ${expenses[0]?.currency || '$'}${totalAmount.toFixed(2)}`, 20, finalY + 30);
  doc.text(`Online Expenses: ${onlineExpenses}`, 20, finalY + 40);
  doc.text(`Cash Expenses: ${cashExpenses}`, 20, finalY + 50);
};

export default exportExpensesToPDF;