import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import { DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import { $applyNodeReplacement } from 'lexical'

function AudioComponent({
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
      <audio
        controls
        src={src}
      />
    </BlockWithAlignableContents>
  )
}

function convertAudioElement(domNode) {
  if (domNode instanceof HTMLAudioElement) {
    const node = $createAudioNode(domNode.src)
    return { node }
  }
  return null
}

export class AudioNode extends DecoratorBlockNode {
  __src

  static getType() {
    return 'audio'
  }

  static clone(node) {
    return new AudioNode(
      node.__src,
      node.__format,
      node.__key,
    )
  }

  static importJSON(serializedNode) {
    const node = $createAudioNode(serializedNode.src)
    node.setFormat(serializedNode.format)

    return node
  }

  // 暂时用不到
  exportJSON() {
    return {
      ...super.exportJSON(),
      src: this.__src,
      type: 'audio',
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
    const element = document.createElement('audio')
    element.setAttribute('src', this.__src)
    element.setAttribute('controls', 'true')
    return { element }
  }

  static importDOM() {
    return {
      audio: () => ({
        conversion: convertAudioElement,
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
      <AudioComponent
        className={className}
        src={this.__src}
        nodeKey={this.getKey()}
        format={this.__format}
      />
    )
  }
}

export function $createAudioNode(src) {
  return $applyNodeReplacement(
    new AudioNode(src),
  )
}

export function $isAudioNode(
  node,
) {
  return node instanceof AudioNode
}
