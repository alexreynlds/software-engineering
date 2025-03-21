import { useState } from "react";
import "./output.css";

const ContactForm = ({ existingContact = {}, updateCallback }) => {
  const [firstName, setFirstName] = useState(existingContact.firstName || "");
  const [lastName, setLastName] = useState(existingContact.lastName || "");
  const [email, setEmail] = useState(existingContact.email || "");

  const updating = Object.entries(existingContact).length !== 0;

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      firstName,
      lastName,
      email,
    };
    const url =
      "http://127.0.0.1:5000/" +
      (updating ? `update_contact/${existingContact.id}` : "create_contact");
    const options = {
      method: updating ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, options);
    if (response.status !== 201 && response.status !== 200) {
      const message = await response.json();
      alert(message.message);
    } else {
      updateCallback();
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 ">
      <div className="flex gap-2">
        <div className="flex flex-col w-full">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border-2 border-gray-500 rounded-md  p-1"
            autoFocus
          />
        </div>

        <div className="flex flex-col w-full">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border-2 border-gray-500 rounded-md p-1"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 border-gray-500 rounded-md p-1"
        />
      </div>

      <button className="confirm-button mt-5 w-full" type="submit">{updating ? "Update Contact" : "Add New Contact"}</button>
    </form>
  );
};

export default ContactForm;
