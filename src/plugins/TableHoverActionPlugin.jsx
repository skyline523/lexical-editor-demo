import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import {
  $getTableAndElementByKey,
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableNode,
  getTableElement,
  TableNode,
} from '@lexical/table'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
  $getNearestNodeFromDOMNode,
  isHTMLElement,
} from 'lexical'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useDebounce } from '../hooks/useDebounce'

const BUTTON_WIDTH_PX = 20

function TableHoverActionsContainer({
  anchorElem,
}) {
  const [editor, { getTheme }] = useLexicalComposerContext()
  const isEditable = useLexicalEditable()
  const [isShownRow, setShownRow] = useState(false)
  const [isShownColumn, setShownColumn] = useState(false)
  const [shouldListenMouseMove, setShouldListenMouseMove]
    = useState(false)
  const [position, setPosition] = useState({})
  const tableSetRef = useRef(new Set())
  const tableCellDOMNodeRef = useRef(null)

  const debouncedOnMouseMove = useDebounce(
    (event) => {
      const { isOutside, tableDOMNode } = getMouseInfo(event, getTheme)

      if (isOutside) {
        setShownRow(false)
        setShownColumn(false)
        return
      }

      if (!tableDOMNode) {
        return
      }

      tableCellDOMNodeRef.current = tableDOMNode

      let hoveredRowNode = null
      let hoveredColumnNode = null
      let tableDOMElement = null

      editor.getEditorState().read(
        () => {
          const maybeTableCell = $getNearestNodeFromDOMNode(tableDOMNode)

          if ($isTableCellNode(maybeTableCell)) {
            const table = $findMatchingParent(maybeTableCell, node =>
              $isTableNode(node))
            if (!$isTableNode(table)) {
              return
            }

            tableDOMElement = getTableElement(
              table,
              editor.getElementByKey(table.getKey()),
            )

            if (tableDOMElement) {
              const rowCount = table.getChildrenSize()
              const colCount = (
                (table).getChildAtIndex(0)
              )?.getChildrenSize()

              const rowIndex
                = $getTableRowIndexFromTableCellNode(maybeTableCell)
              const colIndex
                = $getTableColumnIndexFromTableCellNode(maybeTableCell)

              if (rowIndex === rowCount - 1) {
                hoveredRowNode = maybeTableCell
              }
              else if (colIndex === colCount - 1) {
                hoveredColumnNode = maybeTableCell
              }
            }
          }
        },
        { editor },
      )

      if (tableDOMElement) {
        const {
          width: tableElemWidth,
          y: tableElemY,
          right: tableElemRight,
          left: tableElemLeft,
          bottom: tableElemBottom,
          height: tableElemHeight,
        } = (tableDOMElement).getBoundingClientRect()

        // Adjust for using the scrollable table container
        const parentElement = (tableDOMElement)
          .parentElement
        let tableHasScroll = false
        if (
          parentElement
          && parentElement.classList.contains(
            'editor-table-scrollableWrapper',
          )
        ) {
          tableHasScroll
            = parentElement.scrollWidth > parentElement.clientWidth
        }
        const { y: editorElemY, left: editorElemLeft }
          = anchorElem.getBoundingClientRect()

        if (hoveredRowNode) {
          setShownColumn(false)
          setShownRow(true)
          setPosition({
            height: BUTTON_WIDTH_PX,
            left:
              tableHasScroll && parentElement
                ? parentElement.offsetLeft
                : tableElemLeft - editorElemLeft,
            top: tableElemBottom - editorElemY + 25,
            width:
              tableHasScroll && parentElement
                ? parentElement.offsetWidth
                : tableElemWidth,
          })
        }
        else if (hoveredColumnNode) {
          setShownColumn(true)
          setShownRow(false)
          setPosition({
            height: tableElemHeight,
            left: tableElemRight - editorElemLeft + 5,
            top: tableElemY - editorElemY + 20,
            width: BUTTON_WIDTH_PX,
          })
        }
      }
    },
    50,
    250,
  )

  // Hide the buttons on any table dimensions change to prevent last row cells
  // overlap behind the 'Add Row' button when text entry changes cell height
  const tableResizeObserver = useMemo(() => {
    return new ResizeObserver(() => {
      setShownRow(false)
      setShownColumn(false)
    })
  }, [])

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return
    }

    document.addEventListener('mousemove', debouncedOnMouseMove)

    return () => {
      setShownRow(false)
      setShownColumn(false)
      debouncedOnMouseMove.cancel()
      document.removeEventListener('mousemove', debouncedOnMouseMove)
    }
  }, [shouldListenMouseMove, debouncedOnMouseMove])

  useEffect(() => {
    return mergeRegister(
      editor.registerMutationListener(
        TableNode,
        (mutations) => {
          editor.getEditorState().read(
            () => {
              let resetObserver = false
              for (const [key, type] of mutations) {
                switch (type) {
                  case 'created': {
                    tableSetRef.current.add(key)
                    resetObserver = true
                    break
                  }
                  case 'destroyed': {
                    tableSetRef.current.delete(key)
                    resetObserver = true
                    break
                  }
                  default:
                    break
                }
              }
              if (resetObserver) {
                // Reset resize observers
                tableResizeObserver.disconnect()
                for (const tableKey of tableSetRef.current) {
                  const { tableElement } = $getTableAndElementByKey(tableKey)
                  tableResizeObserver.observe(tableElement)
                }
                setShouldListenMouseMove(tableSetRef.current.size > 0)
              }
            },
            { editor },
          )
        },
        { skipInitialization: false },
      ),
    )
  }, [editor, tableResizeObserver])

  const insertAction = (insertRow) => {
    editor.update(() => {
      if (tableCellDOMNodeRef.current) {
        const maybeTableNode = $getNearestNodeFromDOMNode(
          tableCellDOMNodeRef.current,
        )
        maybeTableNode?.selectEnd()
        if (insertRow) {
          $insertTableRowAtSelection()
          setShownRow(false)
        }
        else {
          $insertTableColumnAtSelection()
          setShownColumn(false)
        }
      }
    })
  }

  if (!isEditable) {
    return null
  }

  return (
    <>
      {isShownRow && (
        <button
          className={`${getTheme()?.tableAddRows}`}
          style={{ ...position }}
          onClick={() => insertAction(true)}
        />
      )}
      {isShownColumn && (
        <button
          className={`${getTheme()?.tableAddColumns}`}
          style={{ ...position }}
          onClick={() => insertAction(false)}
        />
      )}
    </>
  )
}

function getMouseInfo(
  event,
) {
  const target = event.target
  const tableCellClass = '.editor-table-cell'

  if (isHTMLElement(target)) {
    const tableDOMNode = target.closest(
      `td${tableCellClass}, th${tableCellClass}`,
    )

    const isOutside = !(
      tableDOMNode
      || target.closest(
        `button.editor-table-addRows`,
      )
      || target.closest(
        `button.editor-table-addColumns`,
      )
      || target.closest('div.editor-table-cellResizer')
    )

    return { isOutside, tableDOMNode }
  }
  else {
    return { isOutside: true, tableDOMNode: null }
  }
}

export default function TableHoverActionsPlugin({
  anchorElem = document.body,
}) {
  const isEditable = useLexicalEditable()

  return isEditable
    ? createPortal(
        <TableHoverActionsContainer anchorElem={anchorElem} />,
        anchorElem,
      )
    : null
}
