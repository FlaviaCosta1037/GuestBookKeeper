import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase'; // Certifique-se de que o Firebase está configurado corretamente
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const GuestList = () => {
    const navigate = useNavigate();
    const [guests, setGuests] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const guestsCollection = collection(db, 'guests');
                const guestSnapshot = await getDocs(guestsCollection);
                const guestList = guestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGuests(guestList);
            } catch (err) {
                console.error("Erro ao buscar hóspedes:", err);
                setError("Erro ao buscar hóspedes. Tente novamente mais tarde.");
            }
        };

        fetchGuests();
    }, []);

    const handleAddGuest = () => {
        console.log("Navegando para adicionar hóspede..."); // Verificação
        navigate('/guests/form'); // Navega para a página de adicionar hóspede
    };

    const handleDeleteGuest = async (id) => {
        try {
            await deleteDoc(doc(db, 'guests', id)); // Deleta o hóspede do Firestore
            setGuests(guests.filter(guest => guest.id !== id)); // Atualiza a lista de hóspedes localmente
        } catch (err) {
            console.error("Erro ao deletar hóspede:", err);
            setError("Erro ao deletar hóspede. Tente novamente mais tarde.");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Lista de Hóspedes</h2>
            <div className="mb-3">
                <button onClick={() => navigate('/accounting')} className="btn btn-secondary me-2">Ir para Contabilidade</button>
                <button onClick={handleAddGuest} className="btn btn-primary">Adicionar Hóspede</button>
            </div>
            {error && <p className="text-danger">{error}</p>}
            {guests.length === 0 ? (
                <p>Não há hóspedes cadastrados.</p>
            ) : (
                <ul className="list-group">
                    {guests.map((guest) => (
                        <li key={guest.id} className="list-group-item d-flex justify-content-between align-items-center">
                            {guest.nome} - {guest.cpf}
                            <div>
                                <button onClick={() => navigate(`/guests/${guest.id}`)} className="btn btn-outline-info btn-sm me-2">Editar</button>
                                <button onClick={() => handleDeleteGuest(guest.id)} className="btn btn-outline-danger btn-sm">Deletar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GuestList;
