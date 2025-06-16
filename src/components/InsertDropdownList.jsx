import { useRef, useEffect } from 'react'
import { InsertTableDialog } from '../plugins/TablePlugin'
import { InsertImageDialog } from '../plugins/ImagePlugin'
import { InsertVideoDialog } from '../plugins/VideoPlugin'
import { InsertAudioDialog } from '../plugins/AudioPlugin'

export const insertTypes = new Set([
  // "horizontal-rule",
  // "page-break",
  "image",
  "table",
  // "audio",
  "video",
])

export const insertTypeToInsertName = {
  "horizontal-rule": "分隔线",
  "page-break": "分页符",
  "image": "图片",
  "table": "表格",
  "audio": "音频",
  "video": "视频"
}

function InsertDropdownList({
  editor,
  referenceRef,
  setVisible,
  showModal
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
    <>
      <div ref={dropdownRef} className='dropdown'>
        <button
          className="item"
          onClick={() => {
            setVisible(false)
            showModal("插入图片", (onClose) => (
              <InsertImageDialog
                editor={editor}
                onClose={onClose}
              />
            ))
          }}
        >
          <span className="icon image" />
          <span className="text">图片</span>
        </button>
        <button
          className="item"
          onClick={() => {
            setVisible(false)
            showModal("插入表格", (onClose) => (
              <InsertTableDialog
                editor={editor}
                onClose={onClose}
              />
            ))
          }}
        >
          <span className="icon table" />
          <span className="text">表格</span>
        </button>
        <button
          className="item"
          onClick={() => {
            setVisible(false)
            showModal("插入视频", (onClose) => (
              <InsertVideoDialog
                editor={editor}
                onClose={onClose}
              />
            ))
          }}
        >
          <span className="icon video" />
          <span className="text">视频</span>
        </button>
        <button
          className="item"
          onClick={() => {
            setVisible(false)
            showModal("插入音频", (onClose) => (
              <InsertAudioDialog
                editor={editor}
                onClose={onClose}
              />
            ))
          }}
        >
          <span className="icon volume" />
          <span className="text">音频</span>
        </button>
      </div>
    </>
  )
}

export default InsertDropdownList
