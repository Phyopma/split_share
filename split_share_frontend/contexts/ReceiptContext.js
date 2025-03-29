import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import apiClient from "../utils/apiClient";
import { useAuth } from "./AuthContext";

const ReceiptContext = createContext();

export const useReceipts = () => useContext(ReceiptContext);

export const ReceiptProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load receipts from API when authenticated
  // Use a ref to track if we've already fetched receipts
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  useEffect(() => {
    if (isAuthenticated() && !initialFetchDone) {
      fetchReceipts();
      setInitialFetchDone(true);
    }
  }, [isAuthenticated, initialFetchDone]);

  // Use useCallback for functions that are used in dependency arrays
  const fetchReceipts = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/api/receipts");

      if (response.data.success) {
        // Ensure our receipts have the correct data types
        const formattedReceipts = response.data.data.map((receipt) => ({
          ...receipt,
          subtotal: parseFloat(receipt.subtotal),
          tax: parseFloat(receipt.tax),
          tip: receipt.tip != null ? parseFloat(receipt.tip) : null,
          total: parseFloat(receipt.total),
          items: receipt.items.map((item) => ({
            ...item,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.total),
          })),
        }));

        setReceipts(formattedReceipts);
      } else {
        throw new Error(response.data.message || "Failed to fetch receipts");
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setError(error.message || "An error occurred while fetching receipts");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const saveReceipt = async (receiptData) => {
    if (!isAuthenticated())
      return { success: false, message: "Not authenticated" };

    setLoading(true);
    setError(null);

    try {
      // Ensure all fields are properly formatted before sending
      const formattedReceiptData = {
        ...receiptData,
        date: receiptData.date,
        subtotal: parseFloat(receiptData.subtotal),
        tax: parseFloat(receiptData.tax),
        tip: receiptData.tip != null ? parseFloat(receiptData.tip) : null,
        total: parseFloat(receiptData.total),
        items: receiptData.items.map((item) => ({
          ...item,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total),
        })),
      };

      // Check if it's an update (has ID) or create (no ID)
      const isUpdate = !!receiptData.id;
      let response;

      if (isUpdate) {
        // Update existing receipt
        response = await apiClient.put(
          `/api/receipts/${receiptData.id}`,
          formattedReceiptData
        );
      } else {
        // Create new receipt
        response = await apiClient.post("/api/receipts", formattedReceiptData);
      }

      if (response.data.success) {
        // Format the response data with proper data types
        const newReceipt = {
          ...response.data.data,
          subtotal: parseFloat(response.data.data.subtotal),
          tax: parseFloat(response.data.data.tax),
          tip:
            response.data.data.tip != null
              ? parseFloat(response.data.data.tip)
              : null,
          total: parseFloat(response.data.data.total),
          items: response.data.data.items.map((item) => ({
            ...item,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.total),
          })),
        };

        // Update state based on whether it's a new or updated receipt
        if (isUpdate) {
          setReceipts((prevReceipts) =>
            prevReceipts.map((r) => (r.id === newReceipt.id ? newReceipt : r))
          );
        } else {
          setReceipts((prevReceipts) => [...prevReceipts, newReceipt]);
        }

        return { success: true, data: newReceipt };
      } else {
        throw new Error(
          response.data.message ||
            `Failed to ${isUpdate ? "update" : "save"} receipt`
        );
      }
    } catch (error) {
      console.error(
        `Error ${receiptData.id ? "updating" : "saving"} receipt:`,
        error
      );
      setError(
        error.message ||
          `An error occurred while ${
            receiptData.id ? "updating" : "saving"
          } the receipt`
      );
      return {
        success: false,
        message:
          error.message ||
          `Failed to ${receiptData.id ? "update" : "save"} receipt`,
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteReceipt = async (receiptId) => {
    if (!isAuthenticated())
      return { success: false, message: "Not authenticated" };

    setLoading(true);
    setError(null);

    try {
      // Remove from local state first for UI responsiveness
      setReceipts((prevReceipts) =>
        prevReceipts.filter((r) => r.id !== receiptId)
      );

      // Then delete from server
      const response = await apiClient.delete(`/api/receipts/${receiptId}`);

      if (!response.data.success) {
        // If server delete fails, fetch all receipts to resync
        fetchReceipts();
        throw new Error(response.data.message || "Failed to delete receipt");
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting receipt:", error);
      setError(error.message || "An error occurred while deleting the receipt");
      return {
        success: false,
        message: error.message || "Failed to delete receipt",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    receipts,
    loading,
    error,
    fetchReceipts,
    saveReceipt,
    deleteReceipt,
  };

  return (
    <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>
  );
};
