import React, { useState } from 'react'
import styled from 'styled-components'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
`

const Panel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 1.25rem 1.25rem 0 0;
  z-index: 11;
  padding: 1.25rem 1rem calc(env(safe-area-inset-bottom) + 1rem);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const DisplayRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.5rem;
`

const UnitToggle = styled.div`
  display: flex;
  background: #f0f0f0;
  border-radius: 0.5rem;
  padding: 2px;
  gap: 2px;
  flex-shrink: 0;
`

const ToggleOption = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  border-radius: 0.375rem;
  padding: 0.4rem 0.7rem;
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  background: ${({ $active }) => ($active ? 'white' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 3px rgba(0,0,0,0.15)' : 'none')};
  color: ${({ $active }) => ($active ? '#000' : '#666')};
  cursor: pointer;
`

const DisplayValue = styled.div`
  flex: 1;
  font-size: 2.5rem;
  font-weight: 200;
  text-align: right;
  letter-spacing: -0.02em;
  color: #000;
  line-height: 1;
`

const DisplayPlaceholder = styled(DisplayValue)`
  color: #ccc;
`

const BackspaceBtn = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  padding: 0.25rem 0.25rem 0.25rem 0.5rem;
  cursor: pointer;
  color: #888;
  flex-shrink: 0;
  line-height: 1;
`

const ErrorMsg = styled.div`
  font-size: 0.75rem;
  color: #c00;
  text-align: center;
  min-height: 1rem;
`

const KeyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`

const Key = styled.button`
  appearance: none;
  border: none;
  background: #f0f0f0;
  border-radius: 0.75rem;
  font-size: 1.5rem;
  font-weight: 400;
  padding: 0.875rem;
  cursor: pointer;
  line-height: 1;
  &:active {
    background: #d8d8d8;
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`

const GoButton = styled.button`
  appearance: none;
  border: none;
  background: #000;
  color: white;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.9375rem;
  cursor: pointer;
  line-height: 1;
  &:disabled {
    background: #ccc;
    cursor: default;
  }
`

type Unit = 'C' | 'F'

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '±', '0', '.']

interface Props {
  onClose: () => void
  onSubmit: (celsius: number) => void
}

const lastUnitKey = 'lastUnit'

const TempKeypad: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [digits, setDigits] = useState('')
  const [unit, setUnit] = useState<Unit>(() => {
    const stored = window.localStorage.getItem(lastUnitKey)
    return stored === 'F' ? 'F' : 'C'
  })

  const numVal = parseFloat(digits)
  const hasValue = digits !== '' && digits !== '-'
  const celsiusVal =
    hasValue && !isNaN(numVal)
      ? unit === 'F'
        ? (numVal - 32) * (5 / 9)
        : numVal
      : null
  const isOutOfRange =
    celsiusVal !== null && (celsiusVal < -40 || celsiusVal > 300)
  const canSubmit = hasValue && celsiusVal !== null && !isOutOfRange

  const handleKey = (key: string) => {
    if (key === '±') {
      if (digits === '') return
      setDigits(d => (d.startsWith('-') ? d.slice(1) : '-' + d))
      return
    }
    if (key === '.') {
      if (digits.includes('.')) return
      setDigits(d => (d === '' || d === '-' ? d + '0.' : d + '.'))
      return
    }
    // digit — enforce 1 decimal place and a reasonable integer length
    const [, dec] = digits.split('.')
    if (dec !== undefined && dec.length >= 1) return
    const intPart = digits.replace('-', '').split('.')[0]
    if (intPart.length >= 4) return
    setDigits(d => d + key)
  }

  const handleBackspace = () => setDigits(d => d.slice(0, -1))

  const handleUnitToggle = (newUnit: Unit) => {
    if (newUnit === unit) return
    window.localStorage.setItem(lastUnitKey, newUnit)
    if (hasValue && !isNaN(numVal)) {
      const converted =
        newUnit === 'F'
          ? Math.round((numVal * (9 / 5) + 32) * 10) / 10
          : Math.round(((numVal - 32) * (5 / 9)) * 10) / 10
      setDigits(String(converted))
    }
    setUnit(newUnit)
  }

  const handleSubmit = () => {
    if (!canSubmit || celsiusVal === null) return
    onSubmit(celsiusVal)
    onClose()
  }

  return (
    <>
      <Backdrop onClick={onClose} />
      <Panel>
        <DisplayRow>
          <UnitToggle>
            <ToggleOption
              type="button"
              $active={unit === 'C'}
              onClick={() => handleUnitToggle('C')}
            >
              °C
            </ToggleOption>
            <ToggleOption
              type="button"
              $active={unit === 'F'}
              onClick={() => handleUnitToggle('F')}
            >
              °F
            </ToggleOption>
          </UnitToggle>
          {digits ? (
            <DisplayValue data-testid="keypad-display">{digits}</DisplayValue>
          ) : (
            <DisplayPlaceholder data-testid="keypad-display">—</DisplayPlaceholder>
          )}
          <BackspaceBtn
            type="button"
            onClick={handleBackspace}
            aria-label="backspace"
            disabled={digits === ''}
          >
            ⌫
          </BackspaceBtn>
        </DisplayRow>
        <ErrorMsg>
          {isOutOfRange && 'Supported range −40 to 300°C (−40 to 572°F)'}
        </ErrorMsg>
        <KeyGrid>
          {KEYS.map(key => (
            <Key
              key={key}
              type="button"
              onClick={() => handleKey(key)}
              disabled={key === '.' && digits.includes('.')}
              aria-label={
                key === '±'
                  ? 'plus or minus'
                  : key === '.'
                  ? 'decimal point'
                  : key
              }
            >
              {key}
            </Key>
          ))}
        </KeyGrid>
        <GoButton
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Go to temperature"
        >
          Go
        </GoButton>
      </Panel>
    </>
  )
}

export default TempKeypad
