import { createContext } from "react";

export const CartContext = createContext({
  cartAmount: 0,
  setCartAmount: () => {},
  findCartAmount: () => {}
});