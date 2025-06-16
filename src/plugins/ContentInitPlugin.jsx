import { useEffect } from "react"
import { $getRoot, CLEAR_HISTORY_COMMAND } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $generateNodesFromDOM } from "@lexical/html"

export default function ContentInitPlugin({ value }) {
  const [editor] = useLexicalComposerContext()
  
  useEffect(() => {
    if (!editor || !value) return

    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(value, 'text/html')

      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()

      root.clear()

      const selection = root.select()
      selection.removeText()
      selection.insertNodes(nodes)
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, null) // 清空历史
    })
  }, [value])

  return null
}
