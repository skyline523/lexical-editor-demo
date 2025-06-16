import { useEffect, useRef } from 'react'
import {
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'

import Divider from './Divider'

export const supportedAlignTypes = new Set([
  "left-align",
  "center-align",
  "right-align",
  "justify-align",
  "indent",
  "outdent"
])

export const alignTypeToAlignName = {
  "left-align": "左对齐",
  "center-align": "居中对齐",
  "right-align": "右对齐",
  "justify-align": "两端对齐",
  outdent: "减少缩进",
  indent: "增加缩进"
}

function AlignmentDropdownList({
  editor,
  referenceRef,
  setValue,
  setVisible
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

  const alignment = (direction, type) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, direction)
    setValue(type)
    setVisible(false)
  }

  return (
    <div ref={dropdownRef} className='dropdown'>
      <button
        className="item"
        onClick={() => alignment("left", "left-align")}
      >
        <span className="icon left-align" />
        <span className="text">左对齐</span>
      </button>
      <button
        className="item"
        onClick={() => alignment("center", "center-align")}
      >
        <span className="icon center-align" />
        <span className="text">居中对齐</span>
      </button>
      <button
        className="item"
        onClick={() => alignment("right", "right-align")}
      >
        <span className="icon right-align" />
        <span className="text">右对齐</span>
      </button>
      <button
        className="item"
        onClick={() => alignment("justify", "justify-align")}
      >
        <span className="icon justify-align" />
        <span className="text">两端对齐</span>
      </button>
      <Divider direction='horizontal' />
      <button
        className="item"
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND)
          setVisible(false)
        }}
      >
        <span className="icon outdent" />
        <span className="text">减少缩进</span>
      </button>
      <button
        className="item"
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND)
          setVisible(false)
        }}
      >
        <span className="icon indent" />
        <span className="text">增加缩进</span>
      </button>
    </div>
  )
}

export default AlignmentDropdownList
