import axios from 'axios';

export const getProductsApi = () => axios.get("http://localhost:5555/allInventory");

export const addProductApi = (payload) => axios.post("http://localhost:5555/inventory", payload);

export const updateProductApi = (id, payload) => axios.put("http://localhost:5555/updateItem", {
  _id: id,
  ...payload
});

export const deleteProductApi = (id) => axios.delete("http://localhost:5555/deleteItem", {
  data: {
    _id: id,
  },
});