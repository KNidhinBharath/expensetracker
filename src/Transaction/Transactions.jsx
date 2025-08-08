import React, { useEffect, useState } from 'react';
import './Transactions.css';
import ReactModal from 'react-modal';
import { MdEdit, MdDelete } from 'react-icons/md';
import { FaUtensils, FaFilm, FaPlane, FaQuestion } from 'react-icons/fa';

export default function Transactions({expenses,onUpdate}) {
  const [transactions, setTransactions] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    price: '',
    category: '',
    date: '',
  });
  const [editIndex, setEditIndex] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

useEffect(() => {
  setTransactions(expenses);
}, [expenses]);


  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  const deleteTransaction = (indexToDelete) => {
    const updated = [...transactions];
    updated.splice(indexToDelete, 1);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setTransactions(updated);
    onUpdate && onUpdate(updated)
  };

  const openEditModal = (tx, index) => {
    setEditData(tx);
    setEditIndex(index);
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    const updatedTransactions = [...transactions];
    updatedTransactions[editIndex] = editData;
    setTransactions(updatedTransactions);
    localStorage.setItem("expenses", JSON.stringify(updatedTransactions));
    setEditModal(false);
    onUpdate && onUpdate(updatedTransactions);
  };

  const getCategoryIcon = (category) => {
    const iconStyle = {
      backgroundColor: '#333',
      color: '#fff',
      borderRadius: '50%',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      marginRight: '10px',
    };

    const iconSize = 18;

    switch (category) {
      case 'Food':
        return <div style={iconStyle}><FaUtensils size={iconSize} /></div>;
      case 'Entertainment':
        return <div style={iconStyle}><FaFilm size={iconSize} /></div>;
      case 'Travel':
        return <div style={iconStyle}><FaPlane size={iconSize} /></div>;
      default:
        return <div style={iconStyle}><FaQuestion size={iconSize} /></div>;
    }
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = transactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="transaction-container">
      {expenses.length === 0 ? (
        <p className="no-transactions">No transactions added.</p>
      ) : (
        <ul className="transaction-list">
          {currentItems.map((tx, index) => {
            const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <React.Fragment key={startIndex + index}>
                <li className="transaction-item">
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getCategoryIcon(tx.category)}
                      <div>
                        <h4 style={{ margin: 0 }}>{tx.title}</h4>
                        <p className="date">{formattedDate}</p>
                      </div>
                    </div>

                    <p style={{ textAlign: 'right', minWidth: '80px' }}>₹{tx.price}</p>
                  </div>

                  <div className="transaction-actions">
                    <button className="edit-btn" onClick={() => openEditModal(tx, startIndex + index)}>
                      <MdEdit size={20} />
                    </button>
                    <button className="delete-btn" onClick={() => deleteTransaction(startIndex + index)}>
                      <MdDelete size={20} />
                    </button>
                  </div>
                </li>
                <hr />
              </React.Fragment>
            );
          })}
        </ul>
      )}

      {/* Pagination Controls */}
      {transactions.length > itemsPerPage && (
        <div className="pagination">
            <button
           
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="arrow-btn"
            >
            &larr;
            </button>
            <span className="page-number">{currentPage}</span>
            <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="arrow-btn"
            >
            &rarr;
            </button>
        </div>
)}


      <ReactModal
        isOpen={editModal}
        onRequestClose={() => setEditModal(false)}
        contentLabel="Edit Transaction"
        className="dialogContainer"
        overlayClassName="dialogOverlay"
      >
        <h2>Edit Transaction</h2>
        <form className="edit-form">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            required
          />

          <label>Price</label>
          <input
            type="number"
            name="price"
            value={editData.price}
            onChange={handleEditChange}
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={editData.category}
            onChange={handleEditChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Travel">Travel</option>
          </select>

          <label>Date</label>
          <input
            type="date"
            name="date"
            value={editData.date}
            onChange={handleEditChange}
            required
          />
        </form>
        <div className="dialogbtns">
          <button onClick={handleEditSave}>Save</button>
          <button onClick={() => setEditModal(false)}>Cancel</button>
        </div>
      </ReactModal>
    </div>
  );
}