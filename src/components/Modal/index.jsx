import { isDOMNode } from 'lexical'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import './index.css'

function PortalImpl({
  onClose,
  children,
  title,
  closeOnClickOutside,
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus()
    }
  }, [])

  useEffect(() => {
    let modalOverlayElement
    const handler = (event) => {
      if (event.key === 'Escape') {
        console.log(123123)
        onClose()
      }
    }
    const clickOutsideHandler = (event) => {
      const target = event.target
      if (
        modalRef.current !== null &&
        isDOMNode(target) &&
        !modalRef.current.contains(target) &&
        closeOnClickOutside
      ) {
        console.log(event)
        onClose()
      }
    }
    const modelElement = modalRef.current
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener('click', clickOutsideHandler)
      }
    }

    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener('click', clickOutsideHandler)
      }
    }
  }, [closeOnClickOutside, onClose])

  return (
    <div className="Modal__overlay" role="dialog">
      <div className="Modal__modal" tabIndex={-1} ref={modalRef}>
        <h2 className="Modal__title">{title}</h2>
        <button
          className="Modal__closeButton"
          aria-label="Close modal"
          type="button"
          onClick={onClose}
        >
          X
        </button>
        <div className="Modal__content">{children}</div>
      </div>
    </div>
  )
}

export default function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}) {
  return createPortal(
    <PortalImpl
      onClose={onClose}
      title={title}
      closeOnClickOutside={closeOnClickOutside}
    >
      {children}
    </PortalImpl>,
    document.body,
  )
}
