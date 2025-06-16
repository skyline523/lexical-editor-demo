import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_TABLE_COMMAND, TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import TextInput from '../components/Input/TextInput'

export const CellContext = createContext({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  },
})

export function TableContext({ children }) {
  const [contextValue, setContextValue] = useState({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  })
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins })
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins],
      )}
    >
      {children}
    </CellContext.Provider>
  )
}

export function InsertTableDialog({
  editor,
  onClose,
}) {
  const [rows, setRows] = useState('5')
  const [columns, setColumns] = useState('5')
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    const row = Number(rows)
    const column = Number(columns)

    if (row && row > 0 && row <= 100 && column && column > 0 && column <= 50) {
      setIsDisabled(false)
    }
    else {
      setIsDisabled(true)
    }
  }, [rows, columns])

  const onClick = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    })

    onClose()
  }

  return (
    <>
      <TextInput
        placeholder="输入行数（1-500）"
        label="行"
        value={rows}
        type="number"
        onChange={setRows}
      />
      <TextInput
        placeholder="输入列数（1-100）"
        label="列"
        value={columns}
        type="number"
        onChange={setColumns}
      />
      <div className="dialog-actions">
        <button className="dialog-actions-button" disabled={isDisabled} onClick={onClick}>
          确定
        </button>
      </div>
    </>
  )
}

export function TablePlugin({
  cellEditorConfig,
  children,
}) {
  const [editor] = useLexicalComposerContext()
  const cellContext = useContext(CellContext)

  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
      throw new Error(
        'TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor',
      )
    }
  }, [editor])

  useEffect(() => {
    cellContext.set(cellEditorConfig, children)
  }, [cellContext, cellEditorConfig, children])

  return null
}
