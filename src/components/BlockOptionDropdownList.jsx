import { useEffect, useRef } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,

} from 'lexical'
import { $createCodeNode } from '@lexical/code'
import { 
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $wrapNodes } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'

export const supportedBlockTypes = new Set([
  "paragraph",
  "quote",
  "code",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol"
])

export const blockTypeToBlockName = {
  code: "代码块",
  h1: "一级标题",
  h2: "二级标题",
  h3: "三级标题",
  h4: "四级标题",
  h5: "五级标题",
  ol: "排序列表",
  paragraph: "正文",
  quote: "引用",
  ul: "列表"
}

function BlockOptionDropdownList({
  editor,
  value,
  referenceRef,
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

  const formatParagraph = () => {
    if (value !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode())
        }
      })
    }
    setVisible(false)
  }

  const formatHeading1 = () => {
    if (value !== "h1") {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h1'))
        }
      })
    }
    setVisible(false)
  }

  const formatHeading2 = () => {
    if (value !== "h2") {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h2'))
        }
      })
    }
    setVisible(false)
  }

  const formatHeading3 = () => {
    if (value !== "h3") {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h3'))
        }
      })
    }
    setVisible(false)
  }

  const formatUnorderList = () => {
    if (value !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND)
    }
    setVisible(false)
  }

  const formatOrderList = () => {
    if (value !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND)
    }
    setVisible(false)
  }

  const formatQuote = () => {
    if (value !== "quote") {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode())
        }
      })
    }
    setVisible(false)
  }

  const formatCode = () => {
    if (value !== "code") {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createCodeNode())
        }
      })
    }
    setVisible(false)
  }

  return (
    <div ref={dropdownRef} className='dropdown'>
      <button className={`item${value === "paragraph" ? " active" : ""}`} onClick={formatParagraph}>
        <span className="icon paragraph" />
        <span className="text">正文</span>
      </button>
      <button className={`item${value === "h1" ? " active" : ""}`} onClick={formatHeading1}>
        <span className="icon heading-1" />
        <span className="text">一级标题</span>
      </button>
      <button className={`item${value === "h2" ? " active" : ""}`} onClick={formatHeading2}>
        <span className="icon heading-2" />
        <span className="text">二级标题</span>
      </button>
      <button className={`item${value === "h3" ? " active" : ""}`} onClick={formatHeading3}>
        <span className="icon heading-3" />
        <span className="text">三级标题</span>
      </button>
      <button className={`item${value === "ul" ? " active" : ""}`} onClick={formatUnorderList}>
        <span className="icon bullet-list" />
        <span className="text">列表</span>
      </button>
      <button className={`item${value === "ol" ? " active" : ""}`} onClick={formatOrderList}>
        <span className="icon numbered-list" />
        <span className="text">排序列表</span>
      </button>
      <button className={`item${value === "quote" ? " active" : ""}`} onClick={formatQuote}>
        <span className="icon quote" />
        <span className="text">引用</span>
      </button>
      <button className={`item${value === "code" ? " active" : ""}`} onClick={formatCode}>
        <span className="icon code" />
        <span className="text">代码块</span>
      </button>
    </div>
  )
}

export default BlockOptionDropdownList
