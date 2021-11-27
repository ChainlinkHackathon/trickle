import React from 'react';
import { Slider, Input, Typography, makeStyles } from '@material-ui/core';

interface SliderInputProps {
  label?: string;
  id?: string;
  maxValue: number;
  value: number | string | (string | number)[];
  onChange: (newValue: number | string | Array<number | string>) => void;
  disabled?: boolean;
  [x: string]: any;
}

const useStyles = makeStyles((theme) => ({
  inputsWrapper: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  inputsContainer: {
    padding: '0 20px',
    display: 'grid',
    gap: theme.spacing(3),
    gridTemplateRows: 'auto',
    gridTemplateColumns: '1fr auto'
  },
  tokenImg: {
    width: '15px',
    padding: '0 5px'
  },
  slider: {}
}));

export const NormalInput = ({
  label = '',
  id = 'input-slider',
  tokenImgSrc,
  maxValue,
  value,
  onChange,
  disabled = false,
  ...rest
}: SliderInputProps) => {
  const handleSliderChange = (event: any, newValue: number | number[]) => {
    onChange(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      onChange(0);
    } else if (value > maxValue) {
      onChange(maxValue);
    }
  };

  const inputStep = maxValue / 50;

  const classes = useStyles();

  // ... is a "Spread" operator
  // standard javascript thing
  // works on iterables
  // expands a list
  return (
    <div {...rest} className={classes.inputsWrapper}>
      {label && (
        <div>
          <Typography id={id} gutterBottom>
            <img
              className={classes.tokenImg}
              src={tokenImgSrc}
              alt="token logo"
            />
            {label}
          </Typography>
        </div>
      )}
      <div className={classes.inputsContainer}>
        <Input
          value={value}
          margin="dense"
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          inputProps={{
            step: inputStep,
            min: 0,
            max: maxValue,
            type: 'number',
            'aria-labelledby': id
          }}
        />
      </div>
    </div>
  );
};
