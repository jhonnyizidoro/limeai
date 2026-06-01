import type { ChangeEvent, FC } from "react";
import { useRef } from "react";

import styles from "./FileInput.module.scss";

type Props = {
  id?: string;
  accept?: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

const FileInput: FC<Props> = ({ id, accept, required, file, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files?.[0] ?? null);
  };

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        required={required}
        className={styles.hiddenInput}
        onChange={handleChange}
      />
      <label htmlFor={id} className={styles.dropZone}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 16V8m0 0-3 3m3-3 3 3M20 16.5A4.5 4.5 0 0 0 15.5 12H14a6 6 0 1 0-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {file ? (
          <span className={styles.fileName}>{file.name}</span>
        ) : (
          <span className={styles.placeholder}>
            Click to upload audio <span className={styles.hint}>or drag & drop</span>
          </span>
        )}
      </label>
    </>
  );
};

export default FileInput;
