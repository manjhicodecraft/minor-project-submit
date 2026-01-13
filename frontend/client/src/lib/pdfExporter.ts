import jsPDF from 'jspdf';
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

  // Calculate totals
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  
  // Add main title
  doc.setFontSize(24);
  doc.setTextColor(29, 78, 216); // Blue color
  doc.text('EXPENSE REPORT', 20, 20);
  
  // Add subtitle
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // Gray-700
  doc.text('General Expenses', 20, 35);
  
  // Add summary section
  addSummarySection(doc, totalAmount, totalExpenses, averageAmount, expenses);
  
  // Add detailed expense list section
  addDetailedExpenseList(doc, expenses, 110); // Start after summary section
  
  // Save the PDF
  doc.save(fileName);
};

// Export cash expenses only
export const exportCashExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'cash-expenses-report.pdf') => {
  const doc = new jsPDF();

  // Calculate totals
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  
  // Add main title
  doc.setFontSize(24);
  doc.setTextColor(29, 78, 216); // Blue color
  doc.text('CASH EXPENSES REPORT', 20, 20);
  
  // Add subtitle
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // Gray-700
  doc.text('Detailed Cash Expense Analysis', 20, 35);
  
  // Add summary section
  addSummarySection(doc, totalAmount, totalExpenses, averageAmount, expenses);
  
  // Add detailed expense list section
  addDetailedExpenseList(doc, expenses, 110); // Start after summary section
  
  // Save the PDF
  doc.save(fileName);
};

// Export monthly expenses only
export const exportMonthlyExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'monthly-expenses-report.pdf') => {
  const doc = new jsPDF();

  // Calculate totals
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  
  // Add main title
  doc.setFontSize(24);
  doc.setTextColor(29, 78, 216); // Blue color
  doc.text('MONTHLY EXPENSES REPORT', 20, 20);
  
  // Add subtitle
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // Gray-700
  doc.text('Monthly Spending Summary', 20, 35);
  
  // Add summary section
  addSummarySection(doc, totalAmount, totalExpenses, averageAmount, expenses);
  
  // Add detailed expense list section
  addDetailedExpenseList(doc, expenses, 110); // Start after summary section
  
  // Save the PDF
  doc.save(fileName);
};

// Export loan expenses only
export const exportLoanExpensesToPDF = (expenses: ExpenseItem[], fileName: string = 'loan-expenses-report.pdf') => {
  const doc = new jsPDF();

  // Calculate totals
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount);
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  
  // Add main title
  doc.setFontSize(24);
  doc.setTextColor(29, 78, 216); // Blue color
  doc.text('LOAN EXPENSES REPORT', 20, 20);
  
  // Add subtitle
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // Gray-700
  doc.text('Loan Payment Summary', 20, 35);
  
  // Add summary section
  addSummarySection(doc, totalAmount, totalExpenses, averageAmount, expenses);
  
  // Add detailed expense list section
  addDetailedExpenseList(doc, expenses, 110); // Start after summary section
  
  // Save the PDF
  doc.save(fileName);
};

// Helper function to add summary section to PDF
const addSummarySection = (doc: any, totalAmount: number, totalExpenses: number, averageAmount: number, expenses: ExpenseItem[]) => {
  // Add section title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Black
  doc.text('SUMMARY', 20, 55);
  
  // Draw a line separator
  doc.setDrawColor(200);
  doc.line(20, 60, 200, 60);
  
  // Determine currency from the first expense or default to $
  const currency = expenses.length > 0 ? expenses[0].currency || '$' : '$';
  
  // Add summary table - check if autoTable is available before using it
  if (typeof doc.autoTable !== 'function') {
    console.error('autoTable is not available. Make sure jspdf-autotable is properly imported.');
    // Add summary without table as fallback
    doc.setFontSize(12);
    doc.text(`Total Expense Amount: ${currency}${totalAmount.toFixed(2)}`, 20, 70);
    doc.text(`Total Number of Expenses: ${totalExpenses}`, 20, 80);
    doc.text(`Average Expense Amount: ${currency}${averageAmount.toFixed(2)}`, 20, 90);
    return;
  }
  
  // Add summary table
  const summaryData = [
    ['Total Expense Amount', `${currency}${totalAmount.toFixed(2)}`],
    ['Total Number of Expenses', totalExpenses.toString()],
    ['Average Expense Amount', `${currency}${averageAmount.toFixed(2)}`]
  ];
  
  // Use autoTable for the summary
  doc.autoTable({
    startY: 65,
    head: [['Metric', 'Value']],
    body: summaryData,
    styles: {
      fontSize: 11,
    },
    headStyles: {
      fillColor: [29, 78, 216], // Tailwind's blue-600
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Tailwind's gray-50
    },
    tableWidth: 'wrap',
    margin: { left: 20, right: 20 },
    theme: 'striped'
  });
};

// Helper function to add detailed expense list to PDF
const addDetailedExpenseList = (doc: any, expenses: ExpenseItem[], startY: number) => {
  // Add section title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Black
  doc.text('ALL EXPENSES', 20, startY - 15);
  
  // Draw a line separator
  doc.setDrawColor(200);
  doc.line(20, startY - 10, 200, startY - 10);
  
  // Prepare table data
  const tableColumn = ["Title/Description", "Date & Time", "Category", "Amount"];
  const tableRows: any[][] = [];

  expenses.forEach((expense) => {
    const description = (expense.description || expense.category || 'N/A').toString();
    const dateTime = new Date(expense.date).toLocaleString();
    const category = expense.category || 'Uncategorized';
    const amount = `${expense.currency || '$'}${expense.amount}`;
    
    const rowData = [
      description,
      dateTime,
      category,
      amount
    ];
    
    tableRows.push(rowData);
  });

  // Add table - check if autoTable is available before using it
  if (typeof doc.autoTable !== 'function') {
    console.error('autoTable is not available. Make sure jspdf-autotable is properly imported.');
    // Fallback to manual text rendering if autoTable is not available
    doc.setFontSize(10);
    let yPosition = startY;
    
    // Render header row with bold text
    doc.setFont('helvetica', 'bold');
    tableColumn.forEach((header, index) => {
      doc.text(header, 20 + (index * 45), yPosition);
    });
    yPosition += 10;
    
    // Render data rows with normal text
    doc.setFont('helvetica', 'normal');
    tableRows.forEach(row => {
      row.forEach((cell, cellIndex) => {
        doc.text(cell.toString(), 20 + (cellIndex * 45), yPosition);
      });
      yPosition += 8;
    });
    return;
  }

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    styles: {
      fontSize: 10,
    },
    headStyles: {
      fillColor: [29, 78, 216], // Tailwind's blue-600
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Tailwind's gray-50
    },
    margin: { left: 20, right: 20 },
    theme: 'striped'
  });
};

export default exportExpensesToPDF;