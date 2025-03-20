import React from "react";
import "./output.css";

const ContactList = ({ contacts, updateContact, updateCallback }) => {
  const onDelete = async (id) => {
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

  return (
    <div>
      <h2 className="font-bold text-2xl">Contacts</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.firstName}</td>
              <td>{contact.lastName}</td>
              <td>{contact.email}</td>
              <td>
                <button onClick={() => updateContact(contact)}>Update</button>
                <button onClick={() => onDelete(contact.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactList;
