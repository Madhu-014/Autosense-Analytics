export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

export async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      if (error instanceof APIError && error.status < 500) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

export async function uploadFile(file, prompt = "", onProgress = null) {
  const formData = new FormData();
  formData.append("file", file);
  if (prompt.trim()) {
    formData.append("prompt", prompt);
  }

  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          reject(new APIError("Invalid JSON response", xhr.status));
        }
      } else {
        reject(new APIError(`Upload failed: ${xhr.statusText}`, xhr.status));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new APIError("Network error during upload", 0));
    });

    xhr.addEventListener("abort", () => {
      reject(new APIError("Upload cancelled", 0));
    });

    xhr.open("POST", `${getBackendUrl()}/analyze`);
    xhr.send(formData);
  });
}

export function validateFile(file) {
  const validTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];
  const validExtensions = [".csv", ".xlsx", ".xls"];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (file.size > maxSize) {
    throw new Error("File size exceeds 50MB limit");
  }

  const isValidType = validTypes.includes(file.type) || 
    validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

  if (!isValidType) {
    throw new Error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
  }

  return true;
}
