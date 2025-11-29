import React, { createContext, useContext, useEffect, useState } from "react";

const ROLE_EMAIL_MAP = {
  "owner@example.com": "owner",
  "administrator@example.com": "admin",
  "admin_staff@example.com": "ordersAdmin",
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("gt_current_customer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomer(parsed);
        if (parsed && parsed.email) {
          const emailKey = String(parsed.email).toLowerCase();
          setRole(ROLE_EMAIL_MAP[emailKey] ?? null);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const login = (cust) => {
    setCustomer(cust);
    if (cust && cust.email) {
      const emailKey = String(cust.email).toLowerCase();
      setRole(ROLE_EMAIL_MAP[emailKey] ?? null);
    } else {
      setRole(null);
    }
    localStorage.setItem("gt_current_customer", JSON.stringify(cust));
  };

  const logout = () => {
    setCustomer(null);
    setRole(null);
    localStorage.removeItem("gt_current_customer");
  };

  const isOwner = role === "owner";
  const isFullAdmin = role === "admin" || isOwner;
  const isOrdersAdmin = role === "ordersAdmin" || isFullAdmin;
  const isAnyAdmin = !!role;

  return React.createElement(
    AuthContext.Provider,
    { value: { customer, login, logout, role, isOwner, isFullAdmin, isOrdersAdmin, isAnyAdmin } },
    children
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
