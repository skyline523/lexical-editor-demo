import { useState, useEffect } from "react"
import { $createParagraphNode, $insertNodes, $isRootOrShadowRoot, COMMAND_PRIORITY_EDITOR, createCommand } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister } from "@lexical/utils"
import { $wrapNodeInElement } from "@lexical/utils"
import { $createImageNode, ImageNode } from "../nodes/ImageNode"
import TextInput from "../components/Input/TextInput"
import FileInput from "../components/Input/FileInput"

export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND")

export function InsertImageDialog({
  editor,
  onClose
}) {
  const [mode, setMode] = useState(null) // url | file

  const onClick = (payload) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)

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
      {mode === 'url' && <InsertImageUriDialog onClick={onClick} />}
      {mode === 'file' && <InsertImageUploadDialog onClick={onClick} />}
    </>
  )
}

export function InsertImageUriDialog({ onClick }) {
  const [src, setSrc] = useState("")
  const [altText, setAltText] = useState("")

  const isDisabled = src === ""

  return (
    <>
      <TextInput
        placeholder="输入图片URL"
        label="图片URL"
        value={src}
        onChange={setSrc}
      />
      <TextInput
        placeholder="输入图片描述"
        label="图片描述"
        value={altText}
        onChange={setAltText}
      />
      <div className="dialog-actions">
        <button
          className="dialog-actions-button"
          disabled={isDisabled}
          onClick={() => onClick({ src, altText  })}
        >
          确定
        </button>
      </div>
    </>
  )
}

export function InsertImageUploadDialog({ onClick }) {
  const [src, setSrc] = useState("")
  const [altText, setAltText] = useState("")

  const isDisabled = src === ""

  const loadImage = (files) => {
    console.log(files)
  }

  return (
    <>
      <FileInput
        label="上传图片"
        accept="image/*"
        onChange={loadImage}
      />
      <TextInput
        placeholder="输入图片描述"
        label="图片描述"
        value={altText}
        onChange={setAltText}
      />
      <div className="dialog-actions">
        <button
          className="dialog-actions-button"
          disabled={isDisabled}
          onClick={() => onClick({ src, altText })}
        >
          确定
        </button>
      </div>
    </>
  )
}

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload)
          $insertNodes([imageNode])
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }
  
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])
}
