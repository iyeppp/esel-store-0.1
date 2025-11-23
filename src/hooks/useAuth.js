import React, { createContext, useContext, useEffect, useState } from "react";

const ADMIN_EMAIL_WHITELIST = [
  "admin_staff@example.com",
  "owner@example.com",
  "administrator@example.com",
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("gt_current_customer");
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const login = (cust) => {
    setCustomer(cust);
    localStorage.setItem("gt_current_customer", JSON.stringify(cust));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("gt_current_customer");
  };

  const isAdmin =
    !!customer &&
    !!customer.email &&
    ADMIN_EMAIL_WHITELIST.includes(String(customer.email).toLowerCase());

  return React.createElement(
    AuthContext.Provider,
    { value: { customer, login, logout, isAdmin } },
    children
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
