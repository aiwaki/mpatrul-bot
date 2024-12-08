async function signIn(login: string, password: string) {
    const response = await fetch("https://mpatrul-api.ru/api/v1/identity/sign-in", {
        method: "POST",
        body: JSON.stringify({ login, password }),
        headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();
}

async function me(token: string) {
    const response = await fetch("https://mpatrul-api.ru/api/v1/profiles/me", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer ${token}" },
    });
    
    const body = await response.json();
}

async function create(url: string) {
    const response = await fetch("https://mpatrul-api.ru/api/v1/link/create", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();
}

