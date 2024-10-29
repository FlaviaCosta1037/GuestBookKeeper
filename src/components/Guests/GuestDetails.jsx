import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; // Certifique-se de que o Firebase está configurado corretamente
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const GuestDetails = () => {
  const [guest, setGuest] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    endereco: '',
    numero: '',
    cep: '',
    bairro: '',
    cidade: '',
    estado: '',
    qtdDiarias: 0,
    valorDiaria: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { id } = useParams(); // Obtem o ID do hóspede a ser editado
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuest = async () => {
      const guestDoc = await getDoc(doc(db, 'guests', id)); // Busca o hóspede pelo ID
      if (guestDoc.exists()) {
        setGuest({ id: guestDoc.id, ...guestDoc.data() }); // Atualiza o estado com os dados do hóspede
      } else {
        alert("Hóspede não encontrado!");
        navigate('/guests'); // Redireciona se o hóspede não for encontrado
      }
    };

    fetchGuest();
  }, [id, navigate]);

  const handleSave = async () => {
    try {
      // Validação dos campos
      if (guest.nome === '' || guest.cpf === '') {
        alert("Nome e CPF são obrigatórios!");
        return;
      }

      // Atualiza o hóspede no Firestore
      await updateDoc(doc(db, 'guests', id), guest);
      navigate('/guests'); // Redireciona para a lista de hóspedes após a atualização
    } catch (error) {
      console.error("Erro ao atualizar o hóspede:", error);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Sistema de Registro de Hóspedes</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/guests">Lista de Hóspedes</Nav.Link>
            <Nav.Link href="/accounting">Contabilidade</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container className="mt-5">
        <h2 className="mb-4">Atualizar dados</h2>
        <form>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              value={guest.nome}
              onChange={(e) => setGuest({ ...guest, nome: e.target.value })}
              placeholder="Nome Completo"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">CPF</label>
            <input
              type="text"
              className="form-control"
              value={guest.cpf}
              onChange={(e) => setGuest({ ...guest, cpf: e.target.value })}
              placeholder="CPF"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Data de Nascimento</label>
            <input
              type="text"
              className="form-control"
              value={guest.dataNascimento}
              onChange={(e) => setGuest({ ...guest, dataNascimento: e.target.value })}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Telefone</label>
            <input
              type="text"
              className="form-control"
              value={guest.telefone}
              onChange={(e) => setGuest({ ...guest, telefone: e.target.value })}
              placeholder=""
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rua</label>
            <input
              type="text"
              className="form-control"
              value={guest.endereco}
              onChange={(e) => setGuest({ ...guest, endereco: e.target.value })}
              placeholder="Rua"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Número</label>
            <input
              type="text"
              className="form-control"
              value={guest.numero}
              onChange={(e) => setGuest({ ...guest, numero: e.target.value })}
              placeholder="123"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">CEP</label>
            <input
              type="text"
              className="form-control"
              value={guest.cep}
              onChange={(e) => setGuest({ ...guest, cep: e.target.value })}
              placeholder="11.111-111"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Bairro</label>
            <input
              type="text"
              className="form-control"
              value={guest.bairro}
              onChange={(e) => setGuest({ ...guest, bairro: e.target.value })}
              placeholder="Bairro"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Cidade</label>
            <input
              type="text"
              className="form-control"
              value={guest.cidade}
              onChange={(e) => setGuest({ ...guest, cidade: e.target.value })}
              placeholder="Cidade"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">UF</label>
            <input
              type="text"
              className="form-control"
              value={guest.estado}
              onChange={(e) => setGuest({ ...guest, estado: e.target.value })}
              placeholder="Estado"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quantidade de diárias</label>
            <input
              type="number"
              className="form-control"
              value={guest.qtdDiarias}
              onChange={(e) => setGuest({ ...guest, qtdDiarias: Number(e.target.value) })}
              placeholder="Quantidade de diárias"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Valor da diária</label>
            <input
              type="number"
              className="form-control"
              value={guest.valorDiaria}
              onChange={(e) => setGuest({ ...guest, valorDiaria: Number(e.target.value) })}
              placeholder="Valor da diária"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSave}>Salvar</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/guests')}>Voltar</button>
        </form>
        <br />
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
      <footer className="mt-auto bg-dark text-light py-3 text-center">
        <p className="mb-0">&copy; 2023 Sistema de Registro de Hóspedes</p>
      </footer>
    </div>
  );
};

export default GuestDetails;
