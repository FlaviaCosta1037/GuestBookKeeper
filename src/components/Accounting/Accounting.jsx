import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Navbar, Nav, Container } from 'react-bootstrap';

const Accounting = () => {
    const [entries, setEntries] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [newExpense, setNewExpense] = useState({ descricao: '', valor: 0 });
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchAccountingData = async () => {
            const guestsCollection = await getDocs(collection(db, 'guests'));
            let totalRevenue = 0;
            const entriesData = [];

            guestsCollection.forEach((doc) => {
                const guest = doc.data();
                if (guest.receita) {
                    totalRevenue += guest.receita;
                    entriesData.push({
                        tipo: 'Receita',
                        descricao: `Locatário: ${guest.nome}`,
                        valor: guest.receita,
                    });
                }
            });

            const expensesCollection = await getDocs(collection(db, 'expenses'));
            const expensesData = [];
            expensesCollection.forEach((doc) => {
                const expense = doc.data();
                expensesData.push({ id: doc.id, ...expense }); // Adiciona o ID da despesa
            });

            setEntries(entriesData);
            setExpenses(expensesData);
            setTotalRevenue(totalRevenue);
        };

        fetchAccountingData();
    }, []);

    const handleAddExpense = async () => {
        if (newExpense.descricao && newExpense.valor > 0) {
            try {
                // Adiciona despesa ao Firestore
                const docRef = await addDoc(collection(db, 'expenses'), newExpense);

                // Atualiza a lista de despesas localmente
                setExpenses([...expenses, { id: docRef.id, ...newExpense }]);
                setTotalRevenue((prevRevenue) => prevRevenue - newExpense.valor);
                setNewExpense({ descricao: '', valor: 0 }); // Limpa o formulário
            } catch (error) {
                console.error("Erro ao adicionar despesa:", error);
            }
        } else {
            alert("Por favor, preencha todos os campos de despesa.");
        }
    };

    const handleDeleteExpense = async (id, valor) => {
        try {
            // Deleta despesa do Firestore
            await deleteDoc(doc(db, 'expenses', id));

            // Atualiza a lista de despesas localmente
            setExpenses(expenses.filter(expense => expense.id !== id));
            setTotalRevenue((prevRevenue) => prevRevenue + valor); // Atualiza o total de receitas
        } catch (error) {
            console.error("Erro ao deletar despesa:", error);
        }
    };

    // Cálculo do balanço final
    const totalExpenses = expenses.reduce((total, expense) => total + expense.valor, 0);
    const finalBalance = totalRevenue - totalExpenses;

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
                <p><strong>Total de Despesas:</strong> R$ {totalExpenses.toFixed(2)}</p>
                <p><strong>Balanço Final:</strong> R$ {finalBalance.toFixed(2)}</p>

                <h3>Adicionar Despesa</h3>
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="mb-3">
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
                    {entries.map((entry, index) => (
                        <li key={index} className="list-group-item">
                            <strong>{entry.tipo}</strong>: {entry.descricao} - R$ {entry.valor.toFixed(2)}
                        </li>
                    ))}
                    {expenses.map((expense) => (
                        <li key={expense.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <strong>Despesa</strong>: {expense.descricao} - R$ {expense.valor.toFixed(2)}
                            </span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExpense(expense.id, expense.valor)}>Deletar</button>
                        </li>
                    ))}
                </ul>

            </Container>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Atenção</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
            <br />
            <footer className="mt-auto bg-dark text-light py-3 text-center">
                <p className="mb-0">&copy; 2023 Sistema de Registro de Hóspedes</p>
            </footer>
        </div>
    );
};

export default Accounting;
