import { useEffect, useState } from 'react'
import { Token } from '../Main'
import {
  useEthers,
  useNotifications,
  useContractFunction,
  useTokenAllowance,
} from '@usedapp/core'
import {
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Select,
  MenuItem,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import { useTrickle } from '../../hooks'
import { constants, utils, Contract } from 'ethers'
import Alert from '@material-ui/lab/Alert'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import ERC20 from '../../chain-info/ERC20.json'

// This is the typescript way of saying this compent needs this type
export interface DcaFormProps {
  supportedTokens: Array<Token>
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    width: '100%',
    padding: '0 0 28px 0',
  },
  boxWrapper: {
    display: 'flex',
    // flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: theme.spacing(2),
    width: '100%',
  },
  tokenWrapper: {
    margin: '10px 0px 0px 0px',
  },
  box: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: '25px',
    width: '50%',
    display: 'flex',
    padding: '20px',
    // justifyContent: 'center',
    // alignContent: 'center'
  },
  slider: {
    width: '100%',
    maxWidth: '400px',
    padding: '10px 26px',
  },
}))

// token is getting passed in as a prop
// in the ping brackets is an object/variable
// That object is of the shape DcaFormProps
export const DcaForm = ({ supportedTokens }: DcaFormProps) => {
  const { account } = useEthers()
  const { notifications } = useNotifications()

  const classes = useStyles()

  const { setDcaSend, setDcaState, trickleContractAddress } = useTrickle()

  const handleDcaSubmit = () => {
    const amountAsWei = utils.parseEther(amount.toString())
    return setDcaSend(sellToken, buyToken, amountAsWei, interval.toString())
  }

  const [sellToken, setSellToken] = useState<string>(
    '0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789'
  )
  const handleSellTokenChange = (event: any) => {
    setSellToken(event.target.value)
  }

  const tokenContract = new Contract(sellToken, ERC20.abi)

  const tokenAllowance = useTokenAllowance(
    sellToken,
    account,
    trickleContractAddress
  )

  const { state: approveState, send: approveSend } = useContractFunction(
    tokenContract,
    'approve',
    {
      transactionName: 'Approve',
    }
  )
  const isMaxApproved = tokenAllowance
    ? tokenAllowance.eq(constants.MaxUint256)
    : false

  const isApprovalMining = approveState.status === 'Mining'

  async function approveMax() {
    await approveSend(trickleContractAddress, constants.MaxUint256)
  }

  const [buyToken, setBuyToken] = useState<string>(
    '0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789'
  )
  const handleBuyTokenChange = (event: any) => {
    setBuyToken(event.target.value)
  }

  const [amount, setAmount] = useState<number>(0)
  const handleAmountChange = (event: any) => {
    setAmount(event.target.value)
  }

  const [interval, setInterval] = useState<
    number | string | Array<number | string>
  >(0)
  const handleIntervalChange = (event: any) => {
    setInterval(event.target.value)
  }

  const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] =
    useState(false)
  const [showDcaTokensSuccess, setshowDcaTokensSuccess] = useState(false)

  const handleCloseSnack = () => {
    showErc20ApprovalSuccess && setShowErc20ApprovalSuccess(false)
    showDcaTokensSuccess && setshowDcaTokensSuccess(false)
  }

  useEffect(() => {
    if (
      notifications.filter(
        (notification) =>
          notification.type === 'transactionSucceed' &&
          notification.transactionName === 'Approve ERC20 transfer'
      ).length > 0
    ) {
      !showErc20ApprovalSuccess && setShowErc20ApprovalSuccess(true)
      showDcaTokensSuccess && setshowDcaTokensSuccess(false)
    }

    if (
      notifications.filter(
        (notification) =>
          notification.type === 'transactionSucceed' &&
          notification.transactionName === 'DCA tokens'
      ).length > 0
    ) {
      showErc20ApprovalSuccess && setShowErc20ApprovalSuccess(false)
      !showDcaTokensSuccess && setshowDcaTokensSuccess(true)
    }
  }, [notifications, showErc20ApprovalSuccess, showDcaTokensSuccess])

  const isMining = setDcaState.status === 'Mining'

  const hasZeroAmountSelected = parseFloat(amount.toString()) === 0

  return (
    <>
      <div className={classes.boxWrapper}>
        <div className='row'>
          <FormControl
            sx={{ m: 2, minWidth: 120 }}
          >
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={sellToken}
              label='Sell Token'
              onChange={handleSellTokenChange}
            >
              {supportedTokens.map((token) => {
                return <MenuItem value={token.address}>{token.name}</MenuItem>
              })}
            </Select>
            <FormHelperText>Token to spend</FormHelperText>
          </FormControl>
          {!isMaxApproved ? (
            <Button
              className={classes.tokenWrapper}
              color='primary'
              variant='contained'
              onClick={() => approveMax()}
            >
              {isApprovalMining ? <CircularProgress size={26} /> : 'Approve'}
            </Button>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className={classes.boxWrapper}>
        <TextField
          id={`buyToken-input`}
          className={classes.slider}
          value={buyToken}
          margin='dense'
          onChange={handleBuyTokenChange}
          helperText='Address of Token to Buy'
          inputProps={{
            type: 'string',
          }}
        />
      </div>
      <div className={classes.boxWrapper}>
        <TextField
          id={`interval-input`}
          className={classes.slider}
          value={amount}
          onChange={handleAmountChange}
          disabled={isMining}
          inputProps={{
            step: 0.1,
            min: 0,
            type: 'number',
          }}
          helperText={`Amount of sell token to spend`}
        />
      </div>
      <div className={classes.boxWrapper}>
        <TextField
          id={`interval-input`}
          className={classes.slider}
          value={interval}
          onChange={handleIntervalChange}
          disabled={isMining}
          inputProps={{
            step: 1,
            min: 0,
            type: 'number',
          }}
          helperText='Execution Interval in seconds'
        />
      </div>
      <div className={classes.container}>
        <Button
          color='primary'
          variant='contained'
          size='large'
          onClick={handleDcaSubmit}
          disabled={isMining || hasZeroAmountSelected}
        >
          {isMining ? <CircularProgress size={26} /> : 'Set Recurring Purchase'}
        </Button>
      </div>
      <Snackbar
        open={showErc20ApprovalSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity='success'>
          ERC-20 token transfer approved successfully! Now approve the 2nd tx to
          initiate the staking transfer.
        </Alert>
      </Snackbar>
      <Snackbar
        open={showDcaTokensSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity='success'>
          Recurring buy set successfully!
        </Alert>
      </Snackbar>
    </>
  )
}
