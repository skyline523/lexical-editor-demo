import { useRef, useEffect } from 'react'

export const FONT_FAMILY_OPTIONS = [
  ['默认', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'],
  ['宋体', '"SimSun", "Times New Roman", serif'],
  ['新宋体', '"NSimSun", "Times New Roman", serif'],
  ['黑体', '"SimHei", Arial, sans-serif'],
  ['微软雅黑', '"Microsoft YaHei", "Segoe UI", "Helvetica Neue", Arial, sans-serif'],
  ['Arial', 'Arial, "Helvetica Neue", Helvetica, sans-serif'],
  ['Courier New', '"Courier New", Courier, monospace'],
  ['Georgia', 'Georgia, "Times New Roman", Times, serif'],
  ['Times New Roman', '"Times New Roman", Times, serif'],
  ['Trebuchet MS', '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Arial, sans-serif'],
  ['Verdana', 'Verdana, Geneva, Tahoma, sans-serif']
]

export function getFontFamily(value) {
  const FONT_FAMILY_MAP = new Map(FONT_FAMILY_OPTIONS.map(([label, value]) => [value, label]))

  return FONT_FAMILY_MAP.get(value)
}

function FontFamilyDropdownList({
  value,
  referenceRef,
  setVisible,
  onChange
}) {
  const dropdownRef = useRef(null)
  
  useEffect(() => {
    const button = referenceRef.current
    const dropdown = dropdownRef.current

    if (toolbar !== null && dropdown !== null) {
      const { top, left } = button.getBoundingClientRect()
      dropdown.style.top = `${top + 40}px`
      dropdown.style.left = `${left - 8}px`
    }
  }, [dropdownRef, referenceRef])

  useEffect(() => {
    const toolbar = referenceRef.current
    const dropdown = dropdownRef.current

    if (toolbar !== null && dropdown !== null) {
      const handle = (e) => {
        const target = e.target

        if (!dropdown.contains(target) && !toolbar.contains(target)) {
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
    <div ref={dropdownRef} className='dropdown'>
      {FONT_FAMILY_OPTIONS.map(([text, option]) => (
        <button
          key={text}
          className={`item${option === value ? " active" : ""}`}
          onClick={() => {
            onChange(option)
            setVisible(false)
          }}
        >
          <span className="text" style={{ fontFamily: option }}>{text}</span>
        </button>
      ))}
    </div>
  )
}

export default FontFamilyDropdownList
