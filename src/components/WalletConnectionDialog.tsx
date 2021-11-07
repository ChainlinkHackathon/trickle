import {
  useEthers,
} from "@usedapp/core";
import Button from "@mui/material/Button";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';


function WalletConnectionDialog() {
  const { account, activateBrowserWallet } = useEthers();
  return (
    <Dialog open={account == null}>
      <DialogTitle>Connect your wallet to use the app</DialogTitle>
      <Button variant="contained" onClick={() => activateBrowserWallet()}>
        Connect Wallet
      </Button>
    </Dialog >
  );
}

export default WalletConnectionDialog

