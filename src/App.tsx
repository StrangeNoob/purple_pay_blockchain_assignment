import { useState } from "react";
import "./App.css";
import {
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import abi from "./assets/erc20.abi.json";

function App() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [senderAddress, setSenderAddress] = useState<string>("");
  const token = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  const [senderAmount, setSenderAmount] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [maxBalance, setMaxBalance] = useState(0.0);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const walletConnect = async () => {
    if (window.ethereum) {
      console.log("detected");

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(token, abi, signer);
        const balance = await contract.balanceOf(accounts[0]);
        setMaxBalance(parseFloat(ethers.formatEther(balance.toString())));
      } catch (error) {
        const errorCasting = error as Error;
        setSnackbarMessage({
          message: errorCasting.message,
          type: "error",
        });
        setOpen(true);
      }
    } else {
      setSnackbarMessage({
        message: "Your Browser didn't support ethereum",
        type: "error",
      });
      setOpen(true);
    }
  };

  const sendWETH = async () => {
    setLoading(true);
    if (maxBalance < +senderAmount) {
      setSnackbarMessage({
        message: "Your balance is less than the amount you want to send",
        type: "error",
      });
      setOpen(true);
      setLoading(false);
      return;
    } else {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(token, abi, signer);

        const transaction = await contract.transfer(
          senderAddress,
          ethers.parseEther(senderAmount)
        );
        if (transaction) {
          await transaction.wait();
          setSnackbarMessage({
            message: "Your transaction is completed",
            type: "success",
          });
          setOpen(true);
          setLoading(false);
        }
        setLoading(false);
      } catch (err) {
        const error = err as Error;
        setSnackbarMessage({
          message: error.message,
          type: "error",
        });
        setOpen(true);
        setLoading(false);
      }
    }
  };

  return (
    <Stack spacing={3} alignItems="center" justifyContent="center">
      {walletAddress.length === 0 ? (
        <Button variant="contained" onClick={walletConnect}>
          Connect Wallet
        </Button>
      ) : (
        <Stack spacing={3} alignItems="center" justifyContent="center">
          <Typography variant="h5">Wallet Address: {walletAddress}</Typography>

          <TextField
            variant="outlined"
            label="Enter the Reciever Address"
            value={senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Amount to be send"
            value={senderAmount}
            onChange={(e) => setSenderAmount(e.target.value)}
            helperText={`Your maximum balance is ${maxBalance}`}
            fullWidth
          />
          {loading ? (
            <Button variant="outlined" size="large">
              <CircularProgress />
            </Button>
          ) : (
            <Button variant="contained" onClick={sendWETH} size="large">
              Send Tokens
            </Button>
          )}
        </Stack>
      )}

      {snackbarMessage && (
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message={snackbarMessage.message}
          color={snackbarMessage.type}
        />
      )}
    </Stack>
  );
}

export default App;
