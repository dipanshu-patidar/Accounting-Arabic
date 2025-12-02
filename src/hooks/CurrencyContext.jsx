import React, { createContext, useEffect, useState } from "react";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "USD");
  const [rates, setRates] = useState({});
  const [symbol, setSymbol] = useState("$");

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.error("Currency API Error:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
    const symbols = { USD: "$", INR: "₹", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$" };
    setSymbol(symbols[currency] || currency);
  }, [currency]);

const convertPrice = (priceInUSD) => {
  const price = parseFloat(priceInUSD) || 0;
  if (!rates[currency]) return price.toFixed(2);
  return (price * rates[currency]).toFixed(2);
};


  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
