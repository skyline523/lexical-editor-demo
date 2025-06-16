import { useState, useEffect } from 'react'
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister } from "@lexical/utils"
import { $createVideoNode, VideoNode } from "../nodes/VideoNode"
import TextInput from '../components/Input/TextInput'
import FileInput from '../components/Input/FileInput'
import { $insertNodeToNearestRoot } from '@lexical/utils'

export const INSERT_VIDEO_COMMAND = createCommand("INSERT_VIDEO_COMMAND")

export function InsertVideoDialog({
  editor,
  onClose
}) {
  const [mode, setMode] = useState(null) // url | file

  const onClick = (payload) => {
    editor.dispatchCommand(INSERT_VIDEO_COMMAND, payload)

    onClose()
  }

  return (
    <>
      {!mode && (
        <div className="dialog-buttonList">
          <button className="Button" onClick={() => setMode('url')}>URL</button>
          <button className="Button" onClick={() => setMode('file')}>文件</button>
        </div>
      )}
      {mode === 'url' && <InsertVideoUriDialog onClick={onClick} />}
      {mode === 'file' && <InsertVideoUploadDialog onClick={onClick} />}
    </>
  )
}

export function InsertVideoUriDialog({ onClick }) {
  const [src, setSrc] = useState("")

  const isDisabled = src === ""

  return (
    <>
      <TextInput
        placeholder="输入视频URL"
        label="视频URL"
        value={src}
        onChange={setSrc}
      />
      <div className="dialog-actions">
        <button
          className="dialog-actions-button"
          disabled={isDisabled}
          onClick={() => onClick(src)}
        >
          确定
        </button>
      </div>
    </>
  )
}

export function InsertVideoUploadDialog({ onClick }) {
  const [src, setSrc] = useState("")

  const isDisabled = src === ""

  const loadVideo = (files) => {
    console.log(files)
  }

  return (
    <>
      <FileInput
        label="上传视频"
        accept="video/*"
        onChange={loadVideo}
      />
      <div className="dialog-actions">
        <button
          className="dialog-actions-button"
          disabled={isDisabled}
          onClick={() => onClick(src)}
        >
          确定
        </button>
      </div>
    </>
  )
}

export default function VideoPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error("VideoPlugin: VideoNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const videoNode = $createVideoNode(payload)
          $insertNodeToNearestRoot(videoNode)
          
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])
}
