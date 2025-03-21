import { useState, useEffect } from 'react';
import ContactList from './ContactList';
import './App.css';
import ContactForm from './ContactForm';
import './output.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const response = await fetch('http://127.0.0.1:5000/contacts');
    const data = await response.json();
    setContacts(data.contacts);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContact({});
  };

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    if (isModalOpen) return;
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const onUpdate = () => {
    closeModal();
    fetchContacts();
  };

  return (
    <div className="flex h-screen content-center items-center justify-center bg-[url(../public/background.jpg)] bg-cover">
      <div className="flex h-4/5 w-[60%] flex-col items-center justify-center gap-3 rounded-xl border-2 border-white/25 bg-white/25 p-4 shadow-xl backdrop-blur-md">
        <ContactList
          contacts={contacts}
          updateContact={openEditModal}
          updateCallback={onUpdate}
        />
        <button
          onClick={openCreateModal}
          className="cursor-pointer text-black hover:text-gray-500"
        >
          Create New Contact
        </button>
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content relative rounded-xl">
              <button
                onClick={closeModal}
                className="delete-button absolute right-0 top-0 float-right"
              >
                &times;
              </button>
              <ContactForm
                existingContact={currentContact}
                updateCallback={onUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
