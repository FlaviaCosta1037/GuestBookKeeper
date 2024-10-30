import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Navbar, Nav, Container } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../Accouting.css';
import { Timestamp } from 'firebase/firestore';




const Accounting = () => {
    const [entries, setEntries] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [newExpense, setNewExpense] = useState({ descricao: '', valor: 0, date: new Date() });
    const [finalBalance, setFinalBalance] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const openModal = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage("");
    };

    useEffect(() => {
        const fetchAccountingData = async () => {
            const guestsCollection = await getDocs(collection(db, 'guests'));
            let revenue = 0;
            const entriesData = [];

            guestsCollection.forEach((doc) => {
                const guest = doc.data();
                if (guest.receita) {
                    revenue += guest.receita;

                    let guestDate;

                    // Verifique se guest.date é um Timestamp do Firestore
                    if (guest.date && guest.date instanceof Timestamp) {
                        guestDate = guest.date.toDate(); // Converte o timestamp para Date
                    } else if (guest.date) {
                        // Tente converter uma string em uma data
                        guestDate = new Date(guest.date);
                    } else {
                        guestDate = new Date(); // Se não houver data, use a data atual
                    }

                    const isValidDate = !isNaN(guestDate.getTime()); // Verifica se a data é válida

                    entriesData.push({
                        tipo: 'Receita',
                        descricao: `Locatário: ${guest.nome}`,
                        valor: guest.receita,
                        date: isValidDate ? guestDate : new Date(), // Usa guest.date se for válida, caso contrário, usa a data atual
                    });
                }
            });

            const expensesCollection = await getDocs(collection(db, 'expenses'));
            const expensesData = [];
            expensesCollection.forEach((doc) => {
                const expense = doc.data();
                expensesData.push({ id: doc.id, ...expense });
            });

            setEntries(entriesData);
            setExpenses(expensesData);
            setFilteredExpenses(expensesData);
            setTotalRevenue(revenue);
        };

        fetchAccountingData();
    }, []);

    useEffect(() => {
        const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.valor, 0);
        setFinalBalance(totalRevenue - totalExpenses);
    }, [totalRevenue, filteredExpenses]);

    const handleAddExpense = async () => {
        if (newExpense.descricao && newExpense.valor > 0) {
            try {
                const expenseWithDate = {
                    ...newExpense,
                    date: newExpense.date ? newExpense.date : new Date() // Adiciona a data se não estiver definida
                };
                const docRef = await addDoc(collection(db, 'expenses'), expenseWithDate);

                setExpenses([...expenses, { id: docRef.id, ...expenseWithDate }]);
                setTotalRevenue((prevRevenue) => prevRevenue - newExpense.valor);
                setNewExpense({ descricao: '', valor: 0, date: new Date() });
                setFilteredExpenses((prev) => [...prev, { id: docRef.id, ...expenseWithDate }]);
            } catch (error) {
                console.error("Erro ao adicionar despesa:", error);
            }
        } else {
            openModal("Por favor, preencha todos os campos de despesa.");
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteDoc(doc(db, 'expenses', id));
            setExpenses(expenses.filter(expense => expense.id !== id));
            setFilteredExpenses(filteredExpenses.filter(expense => expense.id !== id));
        } catch (error) {
            console.error("Erro ao deletar despesa:", error);
        }
    };
    const resetFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setFilteredExpenses(expenses);
        setFilteredEntries(entries);
    };

    const handleFilterExpenses = () => {
        if (startDate && endDate) {
            const filteredExpenses = expenses.filter(expense => {
                const expenseDate = expense.date?.seconds ? new Date(expense.date.seconds * 1000) : null;
                return expenseDate && expenseDate >= startDate && expenseDate <= endDate;
            });

            const filteredEntries = entries.filter(entry => {
                const entryDate = entry.date?.seconds ? new Date(entry.date.seconds * 1000) : null;
                return entryDate && entryDate >= startDate && entryDate <= endDate;
            });

            setFilteredExpenses(filteredExpenses);
            setFilteredEntries(filteredEntries);

            if (filteredExpenses.length === 0 && filteredEntries.length === 0) {
                openModal("Nenhuma despesa ou receita encontrada no período selecionado.");
            }
        } else {
            openModal("Por favor, selecione um intervalo de datas.");
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">Sistema de Registro de Hóspedes</Navbar.Brand>
                    <Nav className="ml-auto">
                        <Nav.Link href="/guests">Lista de Hóspedes</Nav.Link>
                        <Nav.Link href="/guests/form">Adicionar Hóspede</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container className="mt-5">
                <h2 className="text-center mb-4">Resumo Contábil</h2>

                <p><strong>Total de Receitas:</strong> R$ {totalRevenue.toFixed(2)}</p>
                <div className="mb-3">
                    <label>Filtrar despesas por período:</label>
                    <div className="d-flex">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            placeholderText="Data inicial"
                            className="form-control me-2"
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            placeholderText="Data final"
                            className="form-control me-2"
                        />
                        <button onClick={handleFilterExpenses} className="btn btn-primary">Confirmar</button>
                        <button onClick={resetFilters} className="btn btn-secondary ms-2">Resetar Busca</button>
                    </div>
                </div>
                <p><strong>Total de Despesas:</strong> R$ {filteredExpenses.reduce((total, expense) => total + expense.valor, 0).toFixed(2)}</p>
                <p><strong>Balanço Final:</strong> R$ {finalBalance.toFixed(2)}</p>

                <h3>Adicionar Despesa</h3>
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Data - registro</label>
                            <br />
                            <DatePicker
                                className="form-control"
                                value={newExpense.date}
                                onChange={(date) => setNewExpense({ ...newExpense, date })}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Selecione uma data"
                            />
                            <br /><br />
                            <label className="form-label">Descrição</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newExpense.descricao}
                                onChange={(e) => setNewExpense({ ...newExpense, descricao: e.target.value })}
                                placeholder="Descrição da despesa"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Valor</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newExpense.valor}
                                onChange={(e) => setNewExpense({ ...newExpense, valor: Number(e.target.value) })}
                                placeholder="Valor da despesa"
                            />
                        </div>
                        <button onClick={handleAddExpense} className="btn btn-primary">Salvar Despesa</button>
                    </div>
                </div>

                <h3>Detalhes de Entradas e Saídas</h3>
                <ul className="list-group">
                    {filteredEntries.map((entry, index) => (
                        <li key={index} className="list-group-item">
                            <strong>{entry.tipo}</strong>: {entry.descricao} - R$ {entry.valor.toFixed(2)}
                            <br />
                            <small>Data: {entry.date ? new Date(entry.date.seconds * 1000).toLocaleDateString() : 'Data não disponível'}</small>
                        </li>
                    ))}
                    {filteredExpenses.map((expense) => (
                        <li key={expense.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <strong>Despesa</strong>: {expense.descricao} - R$ {expense.valor.toFixed(2)}
                                <br />
                                <small>Data: {expense.date ? new Date(expense.date.seconds * 1000).toLocaleDateString() : 'Data não disponível'}</small>
                            </span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExpense(expense.id)}>Deletar</button>
                        </li>
                    ))}
                </ul>


            </Container>
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Atenção</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Accounting;
