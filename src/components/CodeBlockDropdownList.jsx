import { useEffect, useRef } from "react"
import { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from '@lexical/code'

function getCodeLanguageOptions() {
  const options = []

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName])
  }

  return options
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions()

function CodeBlockDropdownList({
  referenceRef,
  value,
  setVisible,
  onChange
}) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    const button = referenceRef.current
    const dropdown = dropdownRef.current

    if (button !== null && dropdown !== null) {
      const { top, left } = button.getBoundingClientRect()
      dropdown.style.top = `${top + 40}px`
      dropdown.style.left = `${left - 8}px`
    }
  }, [dropdownRef, referenceRef])

  useEffect(() => {
    const button = referenceRef.current
    const dropdown = dropdownRef.current

    if (button !== null && dropdown !== null) {
      const handle = (e) => {
        const target = e.target

        if (!dropdown.contains(target) && !button.contains(target)) {
          setVisible(false)
        }
      }

      document.addEventListener('click', handle)

      return () => {
        document.removeEventListener('click', handle)
      }
    }
  }, [dropdownRef, referenceRef, setVisible])

  return (
    <div ref={dropdownRef} className="dropdown code-language">
      {CODE_LANGUAGE_OPTIONS.map(([option, text]) => (
        <button
          key={option}
          className={`item${option === value ? " active" : ""}`}
          onClick={() => {
            onChange(option)
            setVisible(false)
          }}
        >
          <span className='text'>{text}</span>
        </button>
      ))}
    </div>
  )
}

export default CodeBlockDropdownList
