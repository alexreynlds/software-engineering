import React, { useState } from "react";
import "./output.css";

const ContactList = ({ contacts, updateContact, updateCallback }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const onDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this contact?");
    if (!confirmed) return; // If user cancels, exit the function

    try {
      const options = {
        method: "DELETE",
      };
      const response = await fetch(
        `http://127.0.0.1:5000/delete_contact/${id}`,
        options
      );

      if (response.status === 200) {
        updateCallback();
      } else {
        console.error("Failed to delete contact:", await response.json());
        // Optionally handle error in frontend (e.g., display message)
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      // Optionally handle error in frontend (e.g., display message)
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-4/5 h-full border-2 p-4 rounded-xl">
      <h2 className="font-bold text-2xl underline mb-4 text-center">Contacts</h2>
      <input
        type="text"
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border rounded w-full mb-4"
      />
      <div className="overflow-y-auto max-h-[500px]">
        <table className="table-auto w-full text-left">
          <thead className="border-b-2 bg-white sticky top-0">
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="border-b">
                <td>{contact.firstName}</td>
                <td>{contact.lastName}</td>
                <td>{contact.email}</td>
                <td className="flex justify-between items-center">
                  <button onClick={() => updateContact(contact)} className="neutral-button">Update</button>
                  <button onClick={() => onDelete(contact.id)} className="delete-button">&times;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;
