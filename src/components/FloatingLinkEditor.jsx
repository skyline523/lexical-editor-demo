import { useCallback, useEffect, useRef, useState } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'

import { mergeRegister } from '@lexical/utils'
import { getSelectedNode } from '../utils'

function positionEditorElement(editor, rect) {
  if (rect === null) {
    editor.style.opacity = "0"
    editor.style.top = "-1000px"
    editor.style.left = "-1000px"
  } else {
    editor.style.opacity = "1"
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 16}px`
    editor.style.left = `${
      rect.left + window.pageXOffset - 8
    }px`
  }
}

function FloatingLinkEditor({ editor }) {
  const editorRef = useRef(null)
  const inputRef = useRef(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [isEditMode, setEditMode] = useState(false)
  const [lastSelection, setLastSelection] = useState(null)

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL())
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL())
      } else {
        setLinkUrl("")
      }
    }

    const editorEl = editorRef.current
    const nativeSelection = window.getSelection()
    const activeElement = document.activeElement

    if (editorEl === null) return

    const rootElement = editor.getRootElement()
    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect = nativeSelection.focusNode?.parentElement?.getBoundingClientRect()
      if (domRect) {
        positionEditorElement(editorEl, domRect)
      }
      setLastSelection(selection)
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(editorEl, null)
      setLastSelection(null)
      setEditMode(false)
      setLinkUrl("")
    }

    return true
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor()
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updateLinkEditor])

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor()
    })
  }, [editor, updateLinkEditor])

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditMode])

  return (
    <div ref={editorRef} className="link-editor">
      {isEditMode ? (
        <>
          <input
            ref={inputRef}
            className="link-input"
            value={linkUrl}
            onChange={(event) => {
              setLinkUrl(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                if (lastSelection !== null) {
                  if (linkUrl !== "") {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
                  }
                  setEditMode(false)
                }
              } else if (event.key === "Escape") {
                event.preventDefault()
                setEditMode(false)
              }
            }}
          />
          <div className='link-action'>
            <i
              className='icon circle-check'
              onClick={() => {
                if (lastSelection !== null) {
                  if (linkUrl !== "") {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
                  }
                  setEditMode(false)
                }
              }}
            />
          </div>
        </>
      ) : (
        <>
          <div className="link-view">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>
          </div>
          <div className='link-action'>
            <i
              className='icon pencil-line'
              onClick={() => setEditMode(true)}
            />
            <i
              className='icon trash'
              onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default FloatingLinkEditor
