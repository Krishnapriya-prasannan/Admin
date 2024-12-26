import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/founders";

const AdminPanel = () => {
  const [founders, setFounders] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    description: "",
    image: null,
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      const response = await axios.get(API_URL);
      setFounders(response.data);
    } catch (error) {
      toast.error("Failed to fetch founders");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("about", formData.about);
    form.append("description", formData.description);
    form.append("image", formData.image);

    try {
      if (editing) {
        await axios.put(`${API_URL}/${editing.id}`, form);
        toast.success("Founder updated successfully");
      } else {
        await axios.post(API_URL, form);
        toast.success("Founder added successfully");
      }
      setFormData({ name: "", about: "", description: "", image: null });
      setEditing(null);
      fetchFounders();
    } catch (error) {
      toast.error("Failed to save founder");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Founder deleted successfully");
      fetchFounders();
    } catch (error) {
      toast.error("Failed to delete founder");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <ToastContainer />
      <h1 className="text-4xl text-center font-bold text-red-600 mb-8">
        TEDx Admin Panel
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 rounded-lg shadow-lg p-8 space-y-6 mb-8"
      >
        <h2 className="text-3xl font-semibold text-red-600 mb-4">
          {editing ? "Edit Founder" : "Add New Founder"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <textarea
            placeholder="About"
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="3"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="5"
            required
          />
          <input
            type="file"
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files[0] })
            }
            className="block w-full text-gray-400 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
        >
          {editing ? "Update Founder" : "Add Founder"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {founders.map((founder) => (
          <div
            key={founder.id}
            className="bg-gray-900 rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4"
          >
            <img
              src={`http://localhost:5000${founder.image_url}`}
              alt={founder.name}
              className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-red-600"
            />
            <h2 className="text-xl font-bold text-white">{founder.name}</h2>
            <p className="text-gray-400 text-sm mt-2 text-center">
              {founder.about}
            </p>
            <p className="text-gray-500 text-sm mt-2 text-center">
              {founder.description}
            </p>
            <div className="flex mt-4 space-x-4">
              <button
                onClick={() => setEditing(founder) || setFormData(founder)}
                className="bg-red-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(founder.id)}
                className="bg-red-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
