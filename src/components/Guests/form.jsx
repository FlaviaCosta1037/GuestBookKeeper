import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap'; // Importando Modal e Button do React Bootstrap
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GuestAdd = () => {
    const [guest, setGuest] = useState({
        nome: '',
        cpf: '',
        dataNascimento: null,
        endereco: '',
        numero: '',
        cep: '',
        bairro: '',
        cidade: '',
        estado: '',
        quantidadeDiaria: 0,
        valorDiaria: 0,
    });
    
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const navigate = useNavigate();

    const validateCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        let soma = 0;
        let resto;
        
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) {
            resto = 0;
        }
        if (resto !== parseInt(cpf.charAt(9))) {
            return false;
        }

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) {
            resto = 0;
        }
        if (resto !== parseInt(cpf.charAt(10))) {
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        try {
            if (
                guest.nome.trim() === '' || 
                guest.cpf.trim() === '' || 
                guest.quantidadeDiaria <= 0 || 
                guest.valorDiaria <= 0 ||
                guest.dataNascimento === null
            ) {
                setModalMessage("Campos obrigatórios devem ser preenchidos!");
                setShowModal(true);
                return;
            }

            if (!validateCPF(guest.cpf)) {
                setModalMessage("CPF inválido! Por favor, digite novamente.");
                setShowModal(true);
                return;
            }

            const today = new Date();
            const birthDate = new Date(guest.dataNascimento);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            const isUnderage = age < 18 || (age === 18 && monthDifference < 0) || (age === 18 && monthDifference === 0 && today.getDate() < birthDate.getDate());

            if (isUnderage) {
                setModalMessage("Você precisa ter pelo menos 18 anos para se cadastrar.");
                setShowModal(true);
                return;
            }

            const receita = guest.quantidadeDiaria * guest.valorDiaria;
            await addDoc(collection(db, 'guests'), { ...guest, receita });
            console.log("Hóspede adicionado:", { ...guest, receita });
            navigate('/guests');
        } catch (error) {
            console.error("Erro ao salvar o hóspede:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Adicionar Hóspede</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="form-group">
                <label className="form-label">Nome</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.nome}
                    onChange={(e) => setGuest({ ...guest, nome: e.target.value })}
                    placeholder="Nome Completo"
                    required
                />
                
                <label className="form-label">CPF</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.cpf}
                    onChange={(e) => setGuest({ ...guest, cpf: e.target.value })}
                    placeholder=""
                    required
                />
                
                <label className="form-label">Data de Nascimento</label>
                <br />
                <DatePicker
                    className="form-control"
                    selected={guest.dataNascimento}
                    onChange={(date) => setGuest({ ...guest, dataNascimento: date })}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selecione uma data"
                />
                <br />
                <label className="form-label">Rua</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.endereco}
                    onChange={(e) => setGuest({ ...guest, endereco: e.target.value })}
                    placeholder=""
                />
                
                <label className="form-label">Número</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.numero}
                    onChange={(e) => setGuest({ ...guest, numero: e.target.value })}
                    placeholder=""
                />
                
                <label className="form-label">CEP</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.cep}
                    onChange={(e) => setGuest({ ...guest, cep: e.target.value })}
                    placeholder=""
                />
                
                <label className="form-label">Bairro</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.bairro}
                    onChange={(e) => setGuest({ ...guest, bairro: e.target.value })}
                    placeholder=""
                />
                
                <label className="form-label">Cidade</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.cidade}
                    onChange={(e) => setGuest({ ...guest, cidade: e.target.value })}
                    placeholder=""
                />
                
                <label className="form-label">UF</label>
                <input
                    type="text"
                    className="form-control"
                    value={guest.estado}
                    onChange={(e) => setGuest({ ...guest, estado: e.target.value })}
                    placeholder=""
                />
                
                <label className="form-label">Quantidade de diárias</label>
                <input
                    type="number"
                    className="form-control"
                    value={guest.quantidadeDiaria}
                    onChange={(e) => setGuest({ ...guest, quantidadeDiaria: Number(e.target.value) || 0 })}
                    placeholder=""
                    required
                />
                
                <label className="form-label">Valor da diária</label>
                <input
                    type="number"
                    className="form-control"
                    value={guest.valorDiaria}
                    onChange={(e) => setGuest({ ...guest, valorDiaria: Number(e.target.value) || 0 })}
                    placeholder=""
                    required
                />
                
                <button type="submit" className="btn btn-primary mt-3">Salvar</button>
                <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={() => navigate('/guests')}>Voltar</button>
            </form>

            {/* Modal para exibir mensagens de erro */}
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
        </div>
    );
};

export default GuestAdd;
