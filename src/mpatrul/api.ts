export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

interface UploadMediaResponse {
    id: string;
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async signIn(login: string, password: string): Promise<ApiResponse<any>> {
        return this.request("/identity/sign-in", "POST", { login, password });
    }

    async me(token: string): Promise<ApiResponse<any>> {
        return this.request("/profiles/me", "GET", undefined, token);
    }

    async createLink(url: string, token: string): Promise<ApiResponse<any>> {
        return this.request("/link/create", "POST", { url }, token);
    }

    async createReport(
        url: string,
        description: string,
        image: File,
        token: string
    ): Promise<ApiResponse<any>> {
        const photoId = await this.uploadMedia(image, token);
        if (!photoId) {
            return { error: "Failed to upload media" };
        }

        return this.request("/report/create", "POST", {
            url,
            content: "249f1529-5ca5-4bf5-ae2f-cf18ec3c6eb1",
            description,
            isMedia: false,
            isPersonal: true,
            photoId,
        }, token);
    }

    async uploadMedia(image: File, token: string): Promise<string | null> {
        const formData = new FormData();
        formData.append("file", image);

        const response: ApiResponse<UploadMediaResponse> = await this.request(
            "/media/upload",
            "POST",
            formData,
            token,
            true
        ); // TODO: Fix (error: Failed to upload media)

        return response.data?.id || null;
    }

    private async request<T>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "DELETE",
        body?: Record<string, any> | FormData,
        token?: string,
        isFormData: boolean = false
    ): Promise<ApiResponse<T>> {
        try {
            const headers: Record<string, string> = {};

            if (!isFormData) {
                headers["Content-Type"] = "application/json";
            }
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: isFormData ? { Authorization: `Bearer ${token || ""}` } : headers,
                body: isFormData ? body as FormData : body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                return { error: `HTTP error ${response.status}: ${response.statusText}` };
            }

            return await response.json() as ApiResponse<T>;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error occurred";
            console.error(`Error in request to ${endpoint}:`, message);
            return { error: message };
        }
    }
}
