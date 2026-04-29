const catalog = {
    available: [
        {
            group: "auth",
            method: "POST",
            path: "/api/auth/register",
            authRequired: false,
            description: "Register a verified University of Auckland user",
        },
        {
            group: "auth",
            method: "POST",
            path: "/api/auth/login",
            authRequired: false,
            description: "Log in and receive a JWT token",
        },
        {
            group: "auth",
            method: "POST",
            path: "/api/auth/logout",
            authRequired: false,
            description: "Frontend logout acknowledgement endpoint",
        },
        {
            group: "profile",
            method: "GET",
            path: "/api/auth/me",
            authRequired: true,
            description: "Fetch the current signed-in user profile",
        },
        {
            group: "profile",
            method: "PATCH",
            path: "/api/auth/profile",
            authRequired: true,
            description: "Update the signed-in user profile",
        },
        {
            group: "meal",
            method: "GET",
            path: "/api/meal",
            authRequired: false,
            description: "List all active future meal sessions",
        },
        {
            group: "meal",
            method: "GET",
            path: "/api/meal/:id",
            authRequired: false,
            description: "Fetch full details for one meal session",
        },
        {
            group: "meal",
            method: "POST",
            path: "/api/meal/create",
            authRequired: true,
            description: "Create a new meal session",
        },
        {
            group: "meal",
            method: "POST",
            path: "/api/meal/:id/join",
            authRequired: true,
            description: "Join a meal session",
        },
        {
            group: "meal",
            method: "POST",
            path: "/api/meal/:id/leave",
            authRequired: true,
            description: "Leave a meal session",
        },
        {
            group: "meal",
            method: "POST",
            path: "/api/meal/:id/close",
            authRequired: true,
            description: "Close a meal session as the host",
        },
        {
            group: "meal",
            method: "GET",
            path: "/api/meal/mine/hosting",
            authRequired: true,
            description: "List sessions created by the current user",
        },
        {
            group: "meal",
            method: "GET",
            path: "/api/meal/mine/joined",
            authRequired: true,
            description: "List sessions joined by the current user",
        },
    ],
    planned: [
        {
            group: "notifications",
            method: "GET",
            path: "/api/platform/notifications",
            authRequired: true,
            description: "Reserved API for real-time and inbox notifications",
        },
        {
            group: "restaurants",
            method: "GET",
            path: "/api/platform/restaurants",
            authRequired: false,
            description: "Reserved API for restaurant offers and partner promotions",
        },
        {
            group: "history",
            method: "GET",
            path: "/api/platform/history",
            authRequired: true,
            description: "Reserved API for a user's meal session history",
        },
        {
            group: "rewards",
            method: "GET",
            path: "/api/platform/rewards",
            authRequired: true,
            description: "Reserved API for rewards and points",
        },
    ],
};
export const getApiCatalog = (req, res) => {
    res.json({
        project: "Platemates",
        summary: "Available endpoints are production-ready for the MVP. Planned endpoints are reserved for proposal-aligned future features.",
        ...catalog,
    });
};
//# sourceMappingURL=metaController.js.map