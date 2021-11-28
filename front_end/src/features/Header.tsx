import { Button, makeStyles } from '@material-ui/core';
import { useEthers } from '@usedapp/core';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1)
  },
  image: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  buttons: {
    // display: 'flex',
    justifyContent: 'flex-end'
  }
}));

export const Header = () => {
  const classes = useStyles();

  const { account, activateBrowserWallet, deactivate } = useEthers();

  const isConnected = account !== undefined;

  const button = {
    color: '#ffffff',
    backgroundColor: '#0da5a3'
  };

  return (
    <div className={classes.container}>
      {/* <div className={classes.image}> */}
      {/* <img src={logo} width="20" height="18" /> */}
      {/* </div> */}
      {/* <div className={classes.buttons}> */}
      {isConnected ? (
        <>
          <Button style={button} variant="contained">
            {`${account?.slice(0, 4)}...${account?.slice(-3)}`}
          </Button>
          <Button variant="contained" onClick={deactivate}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          color="primary"
          variant="contained"
          onClick={() => activateBrowserWallet()}
        >
          Connect
        </Button>
      )}
      {/* </div> */}
    </div>
  );
};
