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
  padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

// Merged value + unit toggle: each segment shows the temperature in its unit
// (active = the value being typed, inactive = the live conversion). Same look as
// the old unit toggle, scaled up to the digit size. Full width, equal halves.
const ValueToggle = styled.div`
  display: flex;
  background: #f0f0f0;
  border-radius: 0.75rem;
  padding: 4px;
  gap: 4px;
  max-width: 100%;
`

const ToggleOption = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 0.9rem;
  font-size: 2.5rem;
  font-weight: 200;
  flex: 1;
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? 'white' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 3px rgba(0,0,0,0.15)' : 'none')};
  color: ${({ $active }) => ($active ? '#000' : '#999')};
  cursor: pointer;
`

const ErrorMsg = styled.div`
  font-size: 0.75rem;
  color: #c00;
  text-align: center;
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

const ActionButton = styled.button`
  appearance: none;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.9375rem;
  cursor: pointer;
  line-height: 1;
  &:disabled {
    cursor: default;
  }
`

const ClearButton = styled(ActionButton)`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  background: #f0f0f0;
  color: #000;
  &:disabled {
    opacity: 0.3;
  }
`

const GoButton = styled(ActionButton)`
  grid-column: span 2;
  background: #000;
  color: white;
  &:disabled {
    background: #ccc;
  }
`

type Unit = 'C' | 'F'

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '±', '0', '.']

const toF = (c: number) => c * (9 / 5) + 32
const toC = (f: number) => (f - 32) * (5 / 9)
// Round to 1 decimal, but drop a trailing .0 (whole values show no decimal)
const fmt = (n: number) => {
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

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
    hasValue && !isNaN(numVal) ? (unit === 'F' ? toC(numVal) : numVal) : null
  const isOutOfRange =
    celsiusVal !== null && (celsiusVal < -40 || celsiusVal > 300)
  const canSubmit = hasValue && celsiusVal !== null && !isOutOfRange

  // Value shown in a given segment: the raw input for the active unit, the live
  // conversion for the other, and a dash for both when there's no value yet.
  const display = (segUnit: Unit) => {
    if (!hasValue || isNaN(numVal)) return segUnit === unit && hasValue ? digits : '—'
    if (segUnit === unit) return digits
    return fmt(segUnit === 'F' ? toF(numVal) : toC(numVal))
  }

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

  const handleClear = () => setDigits('')

  const handleUnitToggle = (newUnit: Unit) => {
    if (newUnit === unit) return
    window.localStorage.setItem(lastUnitKey, newUnit)
    setDigits('') // start fresh in the newly selected unit
    setUnit(newUnit)
  }

  const handleSubmit = () => {
    if (!canSubmit || celsiusVal === null) return
    onSubmit(celsiusVal)
    onClose()
  }

  const renderSegment = (segUnit: Unit) => (
    <ToggleOption
      type="button"
      data-testid={`toggle-${segUnit}`}
      $active={unit === segUnit}
      onClick={() => handleUnitToggle(segUnit)}
    >
      <span data-testid={`value-${segUnit}`}>{display(segUnit)}</span>°{segUnit}
    </ToggleOption>
  )

  return (
    <>
      <Backdrop onClick={onClose} />
      <Panel>
        <ValueToggle>
          {renderSegment('C')}
          {renderSegment('F')}
        </ValueToggle>
        {isOutOfRange && (
          <ErrorMsg>
            Supported range -40 to 300°C (-40 to 572°F)
          </ErrorMsg>
        )}
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
          <ClearButton
            type="button"
            onClick={handleClear}
            disabled={digits === ''}
            aria-label="Clear"
          >
            Clear
          </ClearButton>
          <GoButton
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Go to temperature"
          >
            Go
          </GoButton>
        </KeyGrid>
      </Panel>
    </>
  )
}

export default TempKeypad
