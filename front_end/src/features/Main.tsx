/* eslint-disable spaced-comment */
/// <reference types="react-scripts" />
import React, { useEffect, useState } from 'react';
import eth from '../eth.png';
import dai from '../dai.png';
import { Allowances } from './allowances';
import { useEthers } from '@usedapp/core';
import { constants } from 'ethers';
import { Snackbar, Typography, makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import networkMapping from '../chain-info/map.json';

export type Token = {
  image: string;
  address: string;
  name: string;
};

// Why not in a css folder?
// For material UI
// https://material-ui.com/styles/basics/
const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.common.white,
    textAlign: 'center',
    padding: theme.spacing(4)
  }
}));

export const Main = () => {
  const { chainId, error } = useEthers();

  const classes = useStyles();
  const contractMapping = networkMapping[String(chainId)];
  // We need to pull the DAPP token address from the .json file written to by Brownie
  const daiAddress = contractMapping?.Dai ?? constants.AddressZero;
  const wethAddress = contractMapping?.Weth ?? constants.AddressZero;
  // console.log(dappTokenAddress)
  /**
   * Our single central location to store info on support tokens.
   * This is the only place you'll need to add a new token to get it to display in the UI!
   *
   * Modularize the addresses like with `dappTokenAddress`
   * To make it chain agnostic
   */
  const supportedTokens: Array<Token> = [
    {
      image: dai,
      address: daiAddress,
      name: 'DAI'
    },
    {
      image: eth,
      address: wethAddress,
      name: 'WETH'
    }
  ];

  const [showNetworkError, setShowNetworkError] = useState(false);

  const handleCloseNetworkError = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    showNetworkError && setShowNetworkError(false);
  };

  /**
   * useEthers will return a populated 'error' field when something has gone wrong.
   * We can inspect the name of this error and conditionally show a notification
   * that the user is connected to the wrong network.
   */
  useEffect(() => {
    if (error && error.name === 'UnsupportedChainIdError') {
      !showNetworkError && setShowNetworkError(true);
    } else {
      showNetworkError && setShowNetworkError(false);
    }
  }, [error, showNetworkError]);

  return (
    <>
      <Typography
        variant="h2"
        component="h1"
        classes={{
          root: classes.title
        }}
      >
        Trickle
      </Typography>
      <Allowances supportedTokens={supportedTokens} />
      <Snackbar
        open={showNetworkError}
        autoHideDuration={5000}
        onClose={handleCloseNetworkError}
      >
        <Alert onClose={handleCloseNetworkError} severity="warning">
          You gotta connect to the Kovan network!
        </Alert>
      </Snackbar>
    </>
  );
};
