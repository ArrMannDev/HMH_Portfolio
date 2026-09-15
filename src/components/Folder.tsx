import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import "./Folder.css";

type FolderStyle = CSSProperties & {
  "--folder-color": string;
  "--folder-back-color": string;
  "--folder-scale": number;
};

type PaperStyle = CSSProperties & {
  "--magnet-x"?: string;
  "--magnet-y"?: string;
};

type FolderProps = {
  color?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
  label?: string;
  onItemClick?: (index: number) => void;
};

function darkenColor(hex: string, percent: number) {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;

  if (color.length === 3) {
    color = color
      .split("")
      .map((character) => character + character)
      .join("");
  }

  const value = Number.parseInt(color.slice(0, 6), 16);
  const red = Math.max(0, Math.min(255, Math.floor(((value >> 16) & 255) * (1 - percent))));
  const green = Math.max(0, Math.min(255, Math.floor(((value >> 8) & 255) * (1 - percent))));
  const blue = Math.max(0, Math.min(255, Math.floor((value & 255) * (1 - percent))));

  return `#${((1 << 24) + (red << 16) + (green << 8) + blue)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

export default function Folder({
  color = "#d867c9",
  size = 1,
  items = [],
  className = "",
  label = "Open certificate folder",
  onItemClick,
}: FolderProps) {
  const [open, setOpen] = useState(false);
  const papers: ReactNode[] = items.slice(0, 3);

  const folderStyle: FolderStyle = {
    "--folder-color": color,
    "--folder-back-color": darkenColor(color, 0.16),
    "--folder-scale": size,
  };

  const handlePaperMove = (event: MouseEvent<HTMLButtonElement>) => {
    const paper = event.currentTarget;
    const bounds = paper.getBoundingClientRect();
    const offsetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.1;
    const offsetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.1;
    paper.style.setProperty("--magnet-x", `${offsetX}px`);
    paper.style.setProperty("--magnet-y", `${offsetY}px`);
  };

  const resetPaper = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--magnet-x", "0px");
    event.currentTarget.style.setProperty("--magnet-y", "0px");
  };

  return (
    <div className={`folder-wrap ${className}`.trim()} style={folderStyle}>
      <div className={`folder ${open ? "folder--open" : ""}`}>
        <span className="folder__back">
          {papers.map((item, index) => (
            <button
              type="button"
              className={`folder-paper folder-paper--${index + 1}`}
              key={index}
              onClick={() => onItemClick?.(index)}
              onMouseMove={(event) => handlePaperMove(event)}
              onMouseLeave={(event) => resetPaper(event)}
              style={{ "--magnet-x": "0px", "--magnet-y": "0px" } as PaperStyle}
              tabIndex={open ? 0 : -1}
              aria-label={`View certificate ${index + 1}`}
            >
              {item}
            </button>
          ))}

          <button
            type="button"
            className="folder__toggle"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={open ? "Close certificate folder" : label}
          >
            <span className="folder__front" />
            <span className="folder__front folder__front--right" />
          </button>
        </span>
      </div>
    </div>
  );
}
