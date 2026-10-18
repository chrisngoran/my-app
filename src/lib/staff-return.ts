/** Pages a sign-in may return to. Anything else goes to the admin. */
const RETURN_TO = ["/admin/products", "/portal/insights", "/portal/orders"];

export const safeReturnTo = (value: unknown) => (typeof value === "string" && RETURN_TO.includes(value) ? value : "/admin/products");
