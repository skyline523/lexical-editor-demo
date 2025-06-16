import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import { DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import { $applyNodeReplacement } from 'lexical'

function VideoComponent({
  src,
  className,
  nodeKey,
  format,
}) {
  return (
    <BlockWithAlignableContents
      className={className}
      nodeKey={nodeKey}
      format={format}
    >
      <video
        controls
        src={src}
        width={560}
        height={315}
      />
    </BlockWithAlignableContents>
  )
}

function convertVideoElement(domNode) {
  if (domNode instanceof HTMLVideoElement) {
    const node = $createVideoNode(domNode.src)
    return { node }
  }
  return null
}

export class VideoNode extends DecoratorBlockNode {
  __src

  static getType() {
    return 'video'
  }

  static clone(node) {
    return new VideoNode(
      node.__src,
      node.__format,
      node.__key,
    )
  }

  static importJSON(serializedNode) {
    const node = $createVideoNode(serializedNode.src)
    node.setFormat(serializedNode.format)

    return node
  }

  // 暂时用不到
  exportJSON() {
    return {
      ...super.exportJSON(),
      src: this.__src,
      type: 'video',
      version: 1,
    }
  }

  constructor(
    src,
    format,
    key,
  ) {
    super(format, key)
    this.__src = src
  }

  exportDOM() {
    const element = document.createElement('video')
    element.setAttribute('src', this.__src)
    element.setAttribute('controls', 'true')
    element.setAttribute('width', '560')
    element.setAttribute('height', '315')
    return { element }
  }

  static importDOM() {
    return {
      video: () => ({
        conversion: convertVideoElement,
        priority: 1,
      }),
    }
  }

  updateDOM() {
    return false
  }

  getSrc() {
    return this.__src
  }

  decorate(_editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    }

    return (
      <VideoComponent
        className={className}
        src={this.__src}
        nodeKey={this.getKey()}
        format={this.__format}
      />
    )
  }
}

export function $createVideoNode(src) {
  return $applyNodeReplacement(
    new VideoNode(src),
  )
}

export function $isVideoNode(
  node,
) {
  return node instanceof VideoNode
}
