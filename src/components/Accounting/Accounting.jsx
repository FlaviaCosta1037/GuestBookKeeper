import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Accounting = () => {
    const [entries, setEntries] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [newExpense, setNewExpense] = useState({ descricao: '', valor: 0 });
    const navigate = useNavigate();

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
        <div className="container mt-5">
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
            <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={() => navigate('/guests')}>Voltar</button>
        </div>
    );
};

export default Accounting;
