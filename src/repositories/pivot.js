import { Carts, Products, Tickets, Users } from "../dao/factory.js";


import CartRepository from "./carts.repository.js";
import ProductRepository from "./products.repository.js";
import UserRepository from "./users.repository.js";
import TicketRepository from "./tickets.repository.js";

export const cartService = new CartRepository(new Carts())
export const productService = new ProductRepository(new Products())
export const userService = new UserRepository(new Users())
export const ticketService = new TicketRepository(new Tickets())
