import {
  $isCodeNode,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $isListNode, ListNode } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import { $isHeadingNode } from '@lexical/rich-text'
import { $getSelectionStyleValueForProperty, $isParentElementRTL, $patchStyleText } from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  HISTORIC_TAG,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import AlignmentDropdownList from '../components/AlignmentDropdownList'
import { alignTypeToAlignName, supportedAlignTypes } from '../components/AlignmentDropdownList'
import BlockOptionDropdownList from '../components/BlockOptionDropdownList'
import { blockTypeToBlockName, supportedBlockTypes } from '../components/BlockOptionDropdownList'
import CodeBlockDropdownList from '../components/CodeBlockDropdownList'
import ColorPicker from '../components/ColorPicker'
import Divider from '../components/Divider'
import FloatingLinkEditor from '../components/FloatingLinkEditor'
import FontFamilyDropdownList from '../components/FontFamilyDropdownList'

import { getFontFamily } from '../components/FontFamilyDropdownList'
import FontSizeStepper from '../components/FontSizeStepper'
import InsertDropdownList from '../components/InsertDropdownList'
import useModal from '../hooks/useModal'
import { getSelectedNode } from '../utils'

export default function ToolbarPlugin({
  isFullscreen,
  setFullscreen,
}) {
  const toolbarRef = useRef(null)
  const [editor] = useLexicalComposerContext()
  const [selectedElementKey, setSelectedElementKey] = useState(null)
  const [, setIsRTL] = useState(false)

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const blockButtonRef = useRef(null)
  const [blockType, setBlockType] = useState('paragraph')
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = useState(false)

  const codeSelectButtonRef = useRef(null)
  const [showCodeBlockDropdown, setShowCodeBlockDropdown] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('')

  const fontFamilyButtonRef = useRef(null)
  const [fontFamily, setFontFamily] = useState('')
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false)

  const [fontSize, setFontSize] = useState('')

  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isLink, setIsLink] = useState(false)

  const fontColorButtonRef = useRef(null)
  const bgColorButtonRef = useRef(null)
  const [showFontColorPicker, setShowFontColorPicker] = useState(false)
  const [fontColor, setFontColor] = useState('')
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [bgColor, setBgColor] = useState('')

  const alignButtonRef = useRef(null)
  const [alignType, setAlignType] = useState('left-align')
  const [showAlignmentDropDown, setShowAlignmentDropDown] = useState(false)

  const [modal, showModal] = useModal()
  const insertButtonRef = useRef(null)
  const [showInsertDropdown, setShowInsertDropdown] = useState(false)

  const isEditable = useLexicalEditable()

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element
        = anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey)
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList ? parentList.getTag() : element.getTag()
          setBlockType(type)
        }
        else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          setBlockType(type)
          if ($isCodeNode(element)) {
            const language = element.getLanguage()
            setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : '')
          }
        }
      }

      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))
      setIsRTL($isParentElementRTL(selection))

      setFontColor($getSelectionStyleValueForProperty(selection, 'color', '#000'))
      setBgColor($getSelectionStyleValueForProperty(selection, 'background-color', '#fff'))
      setFontFamily(
        $getSelectionStyleValueForProperty(
          selection,
          'font-family',
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        ),
      )
      setFontSize($getSelectionStyleValueForProperty(selection, 'font-size', '15px'))

      // Update links
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      }
      else {
        setIsLink(false)
      }
    }
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, updateToolbar])

  const onCodeLanguageSelect = useCallback(
    (value) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey)
          if ($isCodeNode(node)) {
            node.setLanguage(value)
          }
        }
      })
    },
    [editor, selectedElementKey],
  )

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    }
    else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const applyStyleText = useCallback((styles, skipHistoryStack) => {
    editor.update(() => {
      const selection = $getSelection()
      if (selection !== null) {
        $patchStyleText(selection, styles)
      }
    }, skipHistoryStack ? { tag: HISTORIC_TAG } : {})
  }, [editor])

  const onFontColorSelect = useCallback((value, skipHistoryStack) => {
    applyStyleText({ color: value }, skipHistoryStack)
  }, [applyStyleText])

  const onBgColorSelect = useCallback((value, skipHistoryStack) => {
    applyStyleText({ 'background-color': value }, skipHistoryStack)
  }, [applyStyleText])

  const onFontFamilySelect = useCallback((value) => {
    editor.update(() => {
      const selection = $getSelection()
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-family': value,
        })
      }
    })
  }, [editor])

  return (
    <div ref={toolbarRef} className="toolbar">
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined)
        }}
        className="toolbar-item spaced"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined)
        }}
        className="toolbar-item"
      >
        <i className="format redo" />
      </button>
      <Divider />
      {supportedBlockTypes.has(blockType) && (
        <>
          <button
            ref={blockButtonRef}
            disabled={!isEditable}
            className="toolbar-item block-controls"
            onClick={() => setShowBlockOptionsDropDown(!showBlockOptionsDropDown)}
          >
            <span className={`icon block-type ${blockType}`} />
            <span className="text dropdown-button-text">{blockTypeToBlockName[blockType]}</span>
            <i className="chevron-down" />
          </button>
          {showBlockOptionsDropDown
            && createPortal(
              <BlockOptionDropdownList
                editor={editor}
                referenceRef={blockButtonRef}
                value={blockType}
                setVisible={setShowBlockOptionsDropDown}
              />,
              document.body,
            )}
          <Divider />
        </>
      )}
      <button
        ref={fontFamilyButtonRef}
        disabled={!isEditable}
        className="toolbar-item font-family"
        onClick={() => setShowFontFamilyDropdown(!showFontFamilyDropdown)}
      >
        <span className="icon type" />
        <span className="text dropdown-button-text">{getFontFamily(fontFamily)}</span>
        <i className="chevron-down" />
      </button>
      {showFontFamilyDropdown && (
        <>
          {createPortal(
            <FontFamilyDropdownList
              editor={editor}
              referenceRef={fontFamilyButtonRef}
              value={fontFamily}
              setVisible={setShowFontFamilyDropdown}
              onChange={onFontFamilySelect}
            />,
            document.body,
          )}
        </>
      )}
      <Divider />
      <FontSizeStepper
        selectionFontSize={fontSize.slice(0, -2)}
        disabled={!isEditable}
        editor={editor}
      />
      <Divider />
      {blockType === 'code'
        ? (
            <>
              <button
                ref={codeSelectButtonRef}
                disabled={!isEditable}
                className="toolbar-item code-language"
                onClick={() => setShowCodeBlockDropdown(!showCodeBlockDropdown)}
              >
                <span className="text">{getLanguageFriendlyName(codeLanguage)}</span>
                <i className="chevron-down" />
              </button>
              {showCodeBlockDropdown && (
                createPortal(
                  <CodeBlockDropdownList
                    editor={editor}
                    referenceRef={codeSelectButtonRef}
                    value={codeLanguage}
                    setVisible={setShowCodeBlockDropdown}
                    onChange={onCodeLanguageSelect}
                  />,
                  document.body,
                )
              )}
            </>
          )
        : (
            <>
              <button
                disabled={!isEditable}
                className={`toolbar-item spaced ${isBold ? 'active' : ''}`}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
                }}
              >
                <i className="format bold" />
              </button>
              <button
                disabled={!isEditable}
                className={`toolbar-item spaced ${isItalic ? 'active' : ''}`}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
                }}
              >
                <i className="format italic" />
              </button>
              <button
                disabled={!isEditable}
                className={`toolbar-item spaced ${isUnderline ? 'active' : ''}`}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
                }}
              >
                <i className="format underline" />
              </button>
              <button
                disabled={!isEditable}
                className={`toolbar-item spaced ${isStrikethrough ? 'active' : ''}`}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
                }}
              >
                <i className="format strikethrough" />
              </button>
              <button
                disabled={!isEditable}
                className={`toolbar-item spaced ${isCode ? 'active' : ''}`}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
                }}
              >
                <i className="format code" />
              </button>
              <button
                disabled={!isEditable}
                onClick={insertLink}
                className={`toolbar-item spaced ${isLink ? 'active' : ''}`}
              >
                <i className="format link" />
              </button>
              {isLink
                && createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
              <button
                ref={fontColorButtonRef}
                disabled={!isEditable}
                className="toolbar-item spaced"
                onClick={() => setShowFontColorPicker(!showFontColorPicker)}
              >
                <i className="format baseline" />
                <i className="chevron-down" />
              </button>
              {showFontColorPicker && (
                createPortal(
                  <ColorPicker
                    referenceRef={fontColorButtonRef}
                    setVisible={setShowFontColorPicker}
                    value={fontColor}
                    onChange={onFontColorSelect}
                  />,
                  document.body,
                )
              )}
              <button
                ref={bgColorButtonRef}
                disabled={!isEditable}
                className="toolbar-item spaced"
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              >
                <i className="format highlighter" />
                <i className="chevron-down" />
              </button>
              {showBgColorPicker && (
                createPortal(
                  <ColorPicker
                    referenceRef={bgColorButtonRef}
                    setVisible={setShowBgColorPicker}
                    value={bgColor}
                    onChange={onBgColorSelect}
                  />,
                  document.body,
                )
              )}
              <Divider />
              {supportedAlignTypes.has(alignType) && (
                <>
                  <button
                    ref={alignButtonRef}
                    disabled={!isEditable}
                    className="toolbar-item alignment"
                    onClick={() => setShowAlignmentDropDown(!showAlignmentDropDown)}
                  >
                    <span className={`icon ${alignType}`} />
                    <span className="text dropdown-button-text">{alignTypeToAlignName[alignType]}</span>
                    <i className="chevron-down" />
                  </button>
                  {showAlignmentDropDown
                    && createPortal(
                      <AlignmentDropdownList
                        editor={editor}
                        referenceRef={alignButtonRef}
                        setValue={setAlignType}
                        setVisible={setShowAlignmentDropDown}
                      />,
                      document.body,
                    )}
                  <Divider />
                </>
              )}
              <button
                ref={insertButtonRef}
                disabled={!isEditable}
                className="toolbar-item"
                onClick={() => setShowInsertDropdown(!showInsertDropdown)}
              >
                <span className="icon plus" />
                <span className="text dropdown-button-text">插入</span>
                <i className="chevron-down" />
              </button>
              {showInsertDropdown && (
                createPortal(
                  <InsertDropdownList
                    editor={editor}
                    referenceRef={insertButtonRef}
                    setVisible={setShowInsertDropdown}
                    showModal={showModal}
                  />,
                  document.body,
                )
              )}
              <Divider />
              <button
                className="toolbar-item spaced"
                disabled={!isEditable}
                onClick={() => setFullscreen(!isFullscreen)}
              >
                <i className={`format ${isFullscreen ? 'minimize' : 'maximize'}`} />
              </button>
            </>
          )}

      {modal}
    </div>
  )
}
