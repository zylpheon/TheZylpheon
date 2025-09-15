let currentUser = null;
let products = [];
let categories = [];
let cart = [];
const API_BASE = 'http://localhost:3000/api';
const AppState = {
    currentUser,
    products,
    categories,
    cart,
    API_BASE
};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, API_BASE };
}