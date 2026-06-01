import { fileToBase64 } from "./fileToBase64";

const makeFileReaderClass = (dataUrl: string | null, shouldError = false) => {
  return class MockFileReader {
    result = dataUrl;
    onload: (() => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    readAsDataURL = vi.fn(() => {
      setTimeout(() => {
        if (shouldError) {
          this.onerror?.(new Error("read failed"));
        } else {
          this.onload?.();
        }
      }, 0);
    });
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fileToBase64", () => {
  it("resolves with base64 string stripped of data URL prefix", async () => {
    vi.stubGlobal("FileReader", makeFileReaderClass("data:text/plain;base64,SGVsbG8="));
    const file = new File(["Hello"], "note.txt", { type: "text/plain" });

    await expect(fileToBase64(file)).resolves.toBe("SGVsbG8=");
  });

  it("calls readAsDataURL with the provided file", async () => {
    let capturedInstance: InstanceType<ReturnType<typeof makeFileReaderClass>> | null = null;
    const MockFileReader = makeFileReaderClass("data:text/plain;base64,dGVzdA==");
    const TrackedFileReader = class extends MockFileReader {
      constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        capturedInstance = this;
      }
    };
    vi.stubGlobal("FileReader", TrackedFileReader);
    const file = new File(["test"], "test.txt", { type: "text/plain" });

    await fileToBase64(file);

    expect(capturedInstance!.readAsDataURL).toHaveBeenCalledWith(file);
  });

  it("works with audio files", async () => {
    vi.stubGlobal("FileReader", makeFileReaderClass("data:audio/webm;base64,UklGRg=="));
    const file = new File(["binary"], "recording.webm", { type: "audio/webm" });

    await expect(fileToBase64(file)).resolves.toBe("UklGRg==");
  });

  it("rejects when FileReader fires onerror", async () => {
    vi.stubGlobal("FileReader", makeFileReaderClass(null, true));
    const file = new File([""], "bad.txt", { type: "text/plain" });

    await expect(fileToBase64(file)).rejects.toBeInstanceOf(Error);
  });
});
