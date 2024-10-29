import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container, Nav } from 'react-bootstrap';

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
        navigate('/guests/form');
    };

    const handleDeleteGuest = async (id) => {
        try {
            await deleteDoc(doc(db, 'guests', id));
            setGuests(guests.filter(guest => guest.id !== id));
        } catch (err) {
            console.error("Erro ao deletar hóspede:", err);
            setError("Erro ao deletar hóspede. Tente novamente mais tarde.");
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-body">
                <Container>
                    <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        Flat Manager
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link onClick={() => navigate('/guests/form')}>Adicionar Hóspede</Nav.Link>
                            <Nav.Link onClick={() => navigate('/accounting')}>Contabilidade</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Conteúdo principal */}
            <Container className="flex-grow-1 mt-5">
                <h2 className="text-center mb-4">Lista de locação</h2>
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
            </Container>

            {/* Footer */}
            <footer className="bg-dark text-white text-center py-3 mt-auto">
                <Container>
                    <p className="mb-0">&copy; 2024 Flat Manager. Todos os direitos reservados.</p>
                </Container>
            </footer>
        </div>
    );
};

export default GuestList;
