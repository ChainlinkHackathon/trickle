import Button from "@mui/material/Button";
import {
  useEtherBalance,
  useEthers,
} from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

function LoginButton() {
  const { activateBrowserWallet, deactivate, account } = useEthers();
  const etherBalance = useEtherBalance(account);

  if (account)
    return (
      <div>
        <Button color="inherit" variant="outlined" disabled>
            {account} Balance: {etherBalance && formatEther(etherBalance)}
        </Button>
        <Button color="inherit" onClick={() => deactivate()}>
          Logout
        </Button>
      </div>
    );
  else
    return (
      <Button onClick={() => activateBrowserWallet()} color="inherit">
        Login
      </Button>
    );
}

export default LoginButton;
