import { useState, useEffect } from 'react'
import { $getSelection } from 'lexical'
import { $patchStyleText } from '@lexical/selection'

const DEFAULT_FONT_SIZE = 15
const MAX_ALLOWED_FONT_SIZE = 72
const MIN_ALLOWED_FONT_SIZE = 8

const UpdateFontSizeType = {
  increment: 'increment',
  decrement: 'decrement',
}

/**
 * Calculates the new font size based on the update type.
 * @param currentFontSize - The current font size
 * @param updateType - The type of change, either increment or decrement
 * @returns the next font size
 */
export const calculateNextFontSize = (
  currentFontSize,
  updateType,
) => {
  if (!updateType) {
    return currentFontSize
  }

  let updatedFontSize = currentFontSize
  switch (updateType) {
    case UpdateFontSizeType.decrement:
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE
          break
        case currentFontSize >= 48:
          updatedFontSize -= 12
          break
        case currentFontSize >= 24:
          updatedFontSize -= 4
          break
        case currentFontSize >= 14:
          updatedFontSize -= 2
          break
        case currentFontSize >= 9:
          updatedFontSize -= 1
          break
        default:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE
          break
      }
      break

    case UpdateFontSizeType.increment:
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE
          break
        case currentFontSize < 12:
          updatedFontSize += 1
          break
        case currentFontSize < 20:
          updatedFontSize += 2
          break
        case currentFontSize < 36:
          updatedFontSize += 4
          break
        case currentFontSize <= 60:
          updatedFontSize += 12
          break
        default:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE
          break
      }
      break

    default:
      break
  }
  return updatedFontSize
}

/**
 * Patches the selection with the updated font size.
 */
export const updateFontSizeInSelection = (
  editor,
  newFontSize,
  updateType,
) => {
  const getNextFontSize = (prevFontSize) => {
    if (!prevFontSize) {
      prevFontSize = `${DEFAULT_FONT_SIZE}px`
    }
    prevFontSize = prevFontSize.slice(0, -2)
    const nextFontSize = calculateNextFontSize(
      Number(prevFontSize),
      updateType,
    )
    return `${nextFontSize}px`
  }

  editor.update(() => {
    if (editor.isEditable()) {
      const selection = $getSelection()
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-size': newFontSize || getNextFontSize,
        })
      }
    }
  })
}

export const updateFontSize = (
  editor,
  updateType,
  inputValue,
) => {
  if (inputValue !== '') {
    const nextFontSize = calculateNextFontSize(Number(inputValue), updateType)
    updateFontSizeInSelection(editor, String(nextFontSize) + 'px', null)
  } else {
    updateFontSizeInSelection(editor, null, updateType)
  }
}

export function parseAllowedFontSize(input) {
  const match = input.match(/^(\d+(?:\.\d+)?)px$/)
  if (match) {
    const n = Number(match[1])
    if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
      return input
    }
  }
  return ''
}

function FontSizeStepper({
  selectionFontSize,
  disabled = false,
  editor,
}) {
  const [inputValue, setInputValue] = useState(selectionFontSize)
  const [inputChangeFlag, setInputChangeFlag] = useState(false)

  const handleKeyPress = (e) => {
    const inputValueNumber = Number(inputValue)

    if (e.key === 'Tab') {
      return
    }
    if (['e', 'E', '+', '-'].includes(e.key) || isNaN(inputValueNumber)) {
      e.preventDefault()
      setInputValue('')
      return
    }
    setInputChangeFlag(true)
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()

      updateFontSizeByInputValue(inputValueNumber)
    }
  }

  const handleInputBlur = () => {
    if (inputValue !== '' && inputChangeFlag) {
      const inputValueNumber = Number(inputValue)
      updateFontSizeByInputValue(inputValueNumber)
    }
  }

  const updateFontSizeByInputValue = (inputValueNumber) => {
    let updatedFontSize = inputValueNumber
    if (inputValueNumber > MAX_ALLOWED_FONT_SIZE) {
      updatedFontSize = MAX_ALLOWED_FONT_SIZE
    } else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE) {
      updatedFontSize = MIN_ALLOWED_FONT_SIZE
    }

    setInputValue(String(updatedFontSize))
    updateFontSizeInSelection(editor, String(updatedFontSize) + 'px', null)
    setInputChangeFlag(false)
  }

  useEffect(() => {
    setInputValue(selectionFontSize)
  }, [selectionFontSize])

  return (
    <>
      <button
        type="button"
        disabled={
          disabled ||
          (selectionFontSize !== '' &&
            Number(inputValue) <= MIN_ALLOWED_FONT_SIZE)
        }
        onClick={() =>
          updateFontSize(editor, UpdateFontSizeType.decrement, inputValue)
        }
        className="toolbar-item font-decrement"
      >
        <i className="format minus-icon" />
      </button>

      <input
        type="number"
        title="Font size"
        value={inputValue}
        disabled={disabled}
        className="toolbar-item font-size-input"
        min={MIN_ALLOWED_FONT_SIZE}
        max={MAX_ALLOWED_FONT_SIZE}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleInputBlur}
      />

      <button
        type="button"
        disabled={
          disabled ||
          (selectionFontSize !== '' &&
            Number(inputValue) >= MAX_ALLOWED_FONT_SIZE)
        }
        onClick={() =>
          updateFontSize(editor, UpdateFontSizeType.increment, inputValue)
        }
        className="toolbar-item font-increment"
      >
        <i className="format add-icon" />
      </button>
    </>
  )
}

export default FontSizeStepper
