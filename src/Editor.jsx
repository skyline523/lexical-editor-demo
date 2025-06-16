import { useState } from 'react'
import { ParagraphNode, TextNode} from 'lexical'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { $generateHtmlFromNodes } from '@lexical/html'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { TRANSFORMERS } from '@lexical/markdown'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { ImageNode } from './nodes/ImageNode'
import { VideoNode } from './nodes/VideoNode'
import { AudioNode } from './nodes/AudioNode'

import ContentInitPlugin from './plugins/ContentInitPlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import TreeViewPlugin from './plugins/TreeViewPlugin'
import AutoLinkPlugin from './plugins/AutoLinkPlugin'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import { TableContext } from './plugins/TablePlugin'
import TableCellResizerPlugin from './plugins/TableCellResizer'
import TableHoverActionsPlugin from './plugins/TableHoverActionPlugin'
import TableActionMenuPlugin from './plugins/TableActionMenuPlugin'
import ImagePlugin from './plugins/ImagePlugin'
import VideoPlugin from './plugins/VideoPlugin'
import AudioPlugin from './plugins/AudioPlugin'

import editorTheme from './theme/editorTheme'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'

import './index.css'
import './theme/editorTheme.css'

function onError(error) {
  console.error(error)
}

export default function Editor({
  value = '',
  width = 'auto',
  height = 240,
  placeholder = 'Enter some text...',
  disabled = false,
  mode = 'production', // development / production
  onChange
}) {
  const initialConfig = {
    namespace: 'NanoEditor',
    theme: editorTheme,
    onError,
    nodes: [
      ParagraphNode,
      TextNode,
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      ImageNode,
      VideoNode,
      AudioNode
    ]
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContent
        value={value}
        width={width}
        height={height}
        placeholder={placeholder}
        disabled={disabled}
        mode={mode}
        onChange={onChange}
      />
    </LexicalComposer>
  )
}

function EditorContent({
  value = '',
  width = 1024,
  height = 240,
  placeholder = 'Enter some text...',
  disabled = false,
  mode = 'production', // development / production
  onChange
}) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null)
  const [isFullscreen, setFullscreen] = useState(false)
  const [editor] = useLexicalComposerContext()
  const isEditable = useLexicalEditable()

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled])
  
  function handleChange(editorState, editor) {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor)
      onChange?.(html)
    })
  }

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <TableContext>
      <div
        className='editor-container'
        style={{
          position: isFullscreen ? 'fixed' : 'relative',
          width: isFullscreen ? '100%' : width || 1024,
          height: isFullscreen ? '100%' : 'auto'
        }}
      >
        <ToolbarPlugin
          isFullscreen={isFullscreen}
          setFullscreen={setFullscreen}
        />
        <div className='editor-inner'>
          <RichTextPlugin
            contentEditable={
              <div className='editor-scroller'>
                <div className='editor' ref={onRef}>
                  <ContentEditable disabled={isEditable} className='editor-input' style={{ height: isFullscreen ? 'auto' : height }} />
                </div>
              </div>
            }
            placeholder={<div className="editor-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {mode === 'development' && <TreeViewPlugin />}
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <ClickableLinkPlugin disabled={isEditable} />
          <TablePlugin
            hasHorizontalScroll
          />
          <TableCellResizerPlugin />
          <TableHoverActionsPlugin />
          {floatingAnchorElem && (
            <TableActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={true} />
          )}
          <ImagePlugin />
          <VideoPlugin />
          <AudioPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <ContentInitPlugin value={value} />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </div>
    </TableContext>
  )
}
