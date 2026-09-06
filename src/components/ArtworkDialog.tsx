import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Project } from '../data/projects';

type ArtworkDialogProps = {
  project: Project;
  initialIndex: number;
  onClose: () => void;
};

export default function ArtworkDialog({ project, initialIndex, onClose }: ArtworkDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [failed, setFailed] = useState(false);
  const image = project.images[initialIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="artwork-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="artwork-dialog__panel">
        <header className="artwork-dialog__header">
          <h2 id={titleId}>{project.title ?? project.projectType}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close artwork">
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <div className="artwork-dialog__image">
          {failed ? <p role="alert">This image could not be loaded. Please close the preview and try again.</p> : (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
