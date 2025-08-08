import './Content.css'
import { PieChart, Pie, Cell, Tooltip, Legend} from 'recharts'
import { ResponsiveContainer } from 'recharts';
import ReactModal from 'react-modal';
import { useState ,useEffect } from 'react';
import { useSnackbar } from 'notistack'
import Transactions from '../Transaction/Transactions';
import CategoryBarChart from '../Barchart/CategoryBarChart';

const Colors = ['#FF9304','#A000FF','#FDE006']

ReactModal.setAppElement('#root');

export default function Content() {

    const [isBalanceModal ,setBalanceModal] = useState(false)
    const [isExpenseModal , setExpenseModal] = useState(false)
    const [inputAmount,setInput] = useState("")
    const [expenseList,setExpenseList] = useState([])
    const [totExpenses,setTotExpenses] = useState(0)
    const [indExpense,setIndExpenses] = useState([])
    const {enqueueSnackbar} = useSnackbar()
    const [balance,setBalance] = useState(() => {
      const WalletBalance = localStorage.getItem("WalletBalance")
      return WalletBalance ? JSON.parse(WalletBalance) : 5000;
    })
    const [formData , setFormdata] = useState( 
      {
        title : "",
        price : "",
        category : "",
        date : ""
      }
    )

    

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14}>
            {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const handleChange = (e) => {
          const { name, value } = e.target;
          setFormdata((prev) => ({
            ...prev,
            [name]: value
          }));
    };

    const addBalance = (inputAmount) => {
      const amount = parseFloat(inputAmount)
      if(!isNaN(amount)){
        setBalance(amount + balance)
        setInput("")
         enqueueSnackbar("Wallet Updated",{variant:'success',autoHideDuration: 2000})
        return true
      }
      else {
        enqueueSnackbar("Enter a Value",{variant:'error',autoHideDuration: 2000})
        return false
      }
    }

 const addExpense = (title, price, category, date) => {
      if (!title || !price || !category || !date) {
        enqueueSnackbar("Fill all details", { variant: 'error' });
        return false;
      }

      const newExpenseAmount = parseFloat(price);
      const currentBalance = parseFloat(balance);

      if (newExpenseAmount > currentBalance) {
        enqueueSnackbar("Expense exceeds wallet balance", { variant: 'error' });
        return false;
      }

      const newExpense = {
        title: title.trim(),
        price: newExpenseAmount,
        category,
        date
      };

      const existingExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
      existingExpenses.push(newExpense);
      localStorage.setItem("expenses", JSON.stringify(existingExpenses));

      const newBalance = currentBalance - newExpenseAmount;
      setBalance(newBalance);
      localStorage.setItem("WalletBalance", JSON.stringify(newBalance));

      setFormdata({
        title: "",
        price: "",
        category: "",
        date: ""
      });

      updateExpensesAndBalance();
      return true;
};


    const updateExpensesAndBalance = () => {
        const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
        setIndExpenses(savedExpenses);

        const total = savedExpenses.reduce((acc, item) => acc + parseFloat(item.price), 0);
        setTotExpenses(total);

        const initialBalance = 5000;
        const updatedBalance = initialBalance - total;
        setBalance(updatedBalance);
        localStorage.setItem("WalletBalance", JSON.stringify(updatedBalance));

        const groupedExpenses = savedExpenses.reduce((acc, curr) => {
          const existing = acc.find(item => item.category === curr.category);
          const amount = parseFloat(curr.price);
          if (existing) {
            existing.price += amount;
          } else {
            acc.push({ category: curr.category, price: amount });
          }
          return acc;
        }, []);
        setExpenseList(groupedExpenses);
      };

    useEffect(() => {
      const storedBalance = JSON.parse(localStorage.getItem("WalletBalance"));
      if (storedBalance === null || isNaN(storedBalance)) {
        localStorage.setItem("WalletBalance", JSON.stringify(5000));
        setBalance(5000);
      } else {
        setBalance(storedBalance);
      }
    }, []);


   useEffect(() => {
      updateExpensesAndBalance()
    }, []);





     return (
        <div className="main-body">
           <h1>Expense Tracker</h1> 
           <div className='statbox'>
                                    
                                    {/* {Add Balance} */}
                <div className='statCard'>
                    <h2>Wallet Balance: <span style={{color:'#9DFF5B'}}>₹{balance}</span></h2>
                    <button
                        className='btn'
                        style={{
                        background : 'linear-gradient(to right,#B5DC52,#89E148'}}
                        onClick={() => setBalanceModal(true)}
                    >+ Add Income</button>
                </div>
                
                                    {/* {Add Expense} */}
                <div className='statCard'>
                    <h2>Expense: <span style={{color:'#F4BB4A'}}>₹{totExpenses}</span></h2>
                    <button 
                        className='btn' 
                        style={{
                        background : 'linear-gradient(to right,#FF9595,#FF4747,#FF3838'}}
                        onClick={() => setExpenseModal(true)}
                        >+ Add Expense</button>
                </div>

                <div className='chart-wrapper' >
                    <ResponsiveContainer  width="100%" height="100%">
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={expenseList}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="price"
                                    nameKey="category"
                                    label = {renderCustomLabel}
                                    labelLine = {false}>
                                    {expenseList.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                                    ))}

                                </Pie>
                            <Tooltip/>
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
           </div>
                 
                 

          <div className='bottom-card'>

                <div className='recent'>
                  <h2>Recent Transactions </h2>
                    <Transactions
                      expenses={indExpense}
                      onUpdate={() => updateExpensesAndBalance()}
                    />

                </div>

                <div className='top-expenses'  >
                  <h2>Top Expenses</h2>     
                     <CategoryBarChart
                      expenses = {indExpense}/>
             
                </div>

          </div>
          

          

                               {/* {Balance Modal} */}

           <ReactModal 
              className='dialogContainer' 
              isOpen = {isBalanceModal} 
              onRequestClose={() => setBalanceModal(false)}
              contentLabel = "Add Balance"
              overlayClassName="dialogOverlay"
            >
              
              <div className='dialogueContent'>
                <h2 style={{ font: 'black' }}
                  >Add Balance</h2>
                  <input
                    autoFocus
                    value={inputAmount}
                    placeholder = "Income Amount"
                    type = "number"
                    onChange={(e) => setInput(e.target.value)}
                    fullWidth
                    required
                    style={{
                          width: "100%",
                          padding: "0.5rem",
                          marginTop: "1rem",
                          marginBottom: "1rem",
                          fontSize: "1rem",
                          }}
                  />                           
                
              </div>
              <div className='dialogbtns'>
                <button
                  type="submit"
                  onClick={() => {
                  const success = addBalance(inputAmount);
                  setBalanceModal(!success);
                  }}>+ Add Balance</button>
                <button onClick={() => setBalanceModal(false)}>Cancel</button>
              </div>
           </ReactModal>



                                         {/* {Expense Modal} */}
          <ReactModal
            className="dialogContainer"
            overlayClassName="dialogOverlay"
            isOpen={isExpenseModal}
            onRequestClose={() => setExpenseModal(false)}
            contentLabel="Add Expense"
          > 
            <form
              name="Transactions"
              onSubmit={(e) => {
                e.preventDefault(); 
                const success = addExpense(
                  formData.title,
                  formData.price,
                  formData.category,
                  formData.date 
                );
                if (success) {
                  setExpenseModal(false);
                }
              }}
            >
              <div className="dialogTitle">
                <h2>Add Expense</h2>
              </div>

              <div className="dialogueContent">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  placeholder="Title"
                  onChange={handleChange}
                  required
                />

                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  placeholder="Price"
                  onChange={handleChange}
                  required
                />

                <label htmlFor="category">Select Category</label>
                <select
                  id="category"
                  value={formData.category}
                  name="category"
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                </select>

                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="dialogbtns">
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#F4BB4A",
                    color: "white"
                  }}
                >
                  + Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseModal(false)}
                  style={{
                    color: "black",
                    backgroundColor: "white"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </ReactModal>

    </div>
  )}