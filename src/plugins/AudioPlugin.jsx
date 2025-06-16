import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect, useState } from 'react'
import FileInput from '../components/Input/FileInput'
import TextInput from '../components/Input/TextInput'
import { $createAudioNode, AudioNode } from '../nodes/AudioNode'

export const INSERT_VIDEO_COMMAND = createCommand('INSERT_VIDEO_COMMAND')

export function InsertAudioDialog({
  editor,
  onClose,
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
      {mode === 'url' && <InsertAudioUriDialog onClick={onClick} />}
      {mode === 'file' && <InsertAudioUploadDialog onClick={onClick} />}
    </>
  )
}

export function InsertAudioUriDialog({ onClick }) {
  const [src, setSrc] = useState('')

  const isDisabled = src === ''

  return (
    <>
      <TextInput
        placeholder="输入音频URL"
        label="音频URL"
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

export function InsertAudioUploadDialog({ onClick }) {
  const [src, setSrc] = useState('')

  const isDisabled = src === ''

  const loadAudio = (files) => {
    console.log(files)
  }

  return (
    <>
      <FileInput
        label="上传音频"
        accept="audio/*"
        onChange={loadAudio}
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

export default function AudioPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([AudioNode])) {
      throw new Error('AudioPlugin: AudioNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const audioNode = $createAudioNode(payload)
          $insertNodeToNearestRoot(audioNode)

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])
}
