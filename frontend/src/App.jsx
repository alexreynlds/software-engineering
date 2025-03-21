import { useState, useEffect } from "react";
import ContactList from "./ContactList";
import "./App.css";
import ContactForm from "./ContactForm";
import "./output.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentContact, setCurrentContact] = useState({})

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const response = await fetch("http://127.0.0.1:5000/contacts");
    const data = await response.json();
    setContacts(data.contacts);
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentContact({})
  }

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true)
  }

  const openEditModal = (contact) => {
    if (isModalOpen) return
    setCurrentContact(contact)
    setIsModalOpen(true)
  }

  const onUpdate = () => {
    closeModal()
    fetchContacts()
  }

  return (
    <div className="bg-[url(../public/background.jpg)] bg-cover h-screen content-center justify-center flex items-center">
      <div className="w-[60%] h-4/5 p-4 rounded-xl border-2 border-white/25 items-center justify-center gap-3 backdrop-blur-md bg-white/25 flex flex-col shadow-xl">
        <ContactList contacts={contacts} updateContact={openEditModal} updateCallback={onUpdate} />
        <button onClick={openCreateModal}>Create New Contact</button>
        {isModalOpen && <div className="modal">
          <div className="modal-content rounded-xl relative">
            <button onClick={closeModal} className="delete-button float-right absolute right-0 top-0">&times;</button>
            <ContactForm existingContact={currentContact} updateCallback={onUpdate} />
          </div>
        </div>
        }
      </div>
    </div>
  );
}

export default App;
