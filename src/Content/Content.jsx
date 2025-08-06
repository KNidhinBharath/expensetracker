import './Content.css'
import { PieChart, Pie, Cell, Tooltip, Legend} from 'recharts'
import { ResponsiveContainer } from 'recharts';
import ReactModal from 'react-modal';
import dayjs from 'dayjs';
import { useState ,useEffect } from 'react';
import { useSnackbar } from 'notistack'

const Colors = ['#FF9304','#A000FF','#FDE006']

ReactModal.setAppElement('#root');

export default function Content() {

    const [isBalanceModal ,setBalanceModal] = useState(false)
    const [isExpenseModal , setExpenseModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(dayjs())
    const [selectedCategory, setSelectedCategory] = useState("")
    const [inputAmount,setInput] = useState("")
    const [title,setTitle] = useState("")
    const [price,setPrice] = useState("")
    const [expenseList,setExpenseList] = useState([])

    const [balance,setBalance] = useState(() => {
      const WalletBalance = localStorage.getItem("WalletBalance")
      return WalletBalance ? JSON.parse(WalletBalance) : "0";
    })

    const [expense,setExpense] = useState(0)
    const {enqueueSnackbar} = useSnackbar()

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

    const addExpense = (title,price,category,date) => {
      const existingExpenses = JSON.parse(localStorage.getItem("expenses")) || []
      const newExpenses = {
        title : `${title}`,
        price : `${price}`,
        category : `${category}`,
        date : `${date}`
      }
      existingExpenses.push(newExpenses)

      if(title && price && category && date){
        localStorage.setItem("expenses",JSON.stringify(existingExpenses))

        const totalExpenses = existingExpenses.reduce((acc,item) => acc + parseFloat(item.price) , 0)
        setExpense(totalExpenses)
        console.log(totalExpenses)
        setTitle("")
        setPrice("")
        setSelectedCategory("")
        
        return true
      }
      else {
        enqueueSnackbar("Fill all details",{variant: 'error'})
        return false
      }
    }

    useEffect(() => {
      localStorage.setItem("WalletBalance",JSON.stringify(balance))
    },[balance])

    useEffect(() => {
      const savedExpenses = JSON.parse(localStorage.getItem("expenses"))
      const finalExpenses = savedExpenses.reduce((acc,item) => acc + parseFloat(item.price),0)
      setExpense(finalExpenses)

      const groupedExpenses = savedExpenses.reduce((acc,curr) => {
        const existing = acc.find(item => item.category === curr.category)
        const amount = parseFloat(curr.price) 

        if(existing) {
          existing.price += amount
        }else{
          acc.push({ category: curr.category, price: amount });
        }
        return acc;
        }, []);
        setExpenseList(groupedExpenses);
       },[expense])



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
                    <h2>Expense: <span style={{color:'#F4BB4A'}}>₹{expense}</span></h2>
                    <button 
                        className='btn' 
                        style={{
                        background : 'linear-gradient(to right,#FF9595,#FF4747,#FF3838'}}
                        onClick={() => setExpenseModal(true)}
                        >+ Add Expense</button>
                </div>

                <div className='chart-wrapper' >
                    <ResponsiveContainer width="100%" height={250}>
                            <PieChart width={239} height={677}>
                                <Pie
                                    data={expenseList}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
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




                               {/* {Balance Modal} */}

           <ReactModal 
              className='dialogContainer' 
              isOpen = {isBalanceModal} 
              onRequestClose={() => setBalanceModal(false)}
              contentLabel = "Add Balance"
              overlayClassName="dialogOverlay"
            >
              <h2>Add Balance</h2>
              <div className='dialogueContent'>
                
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
                <button onClick={() => {
                  const success = addBalance(inputAmount);
                  setBalanceModal(!success);
                  }}>Add Balance</button>
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
            <div className="dialogTitle">
              <h2>Add Expense</h2>
            </div>

            <div className="dialogueContent">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                placeholder='Title'
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                value={price}
                placeholder='Price'
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <label htmlFor="category">Select Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="dialogbtns">
              <button
                onClick={() => {
                  const success = addExpense(
                    title,
                    price,
                    selectedCategory,
                    selectedDate
                  );
                  setExpenseModal(!success);
                }}
              >
                Add Expense
              </button>
              <button onClick={() => setExpenseModal(false)}>Cancel</button>
            </div>
          </ReactModal>
    </div>
  )}