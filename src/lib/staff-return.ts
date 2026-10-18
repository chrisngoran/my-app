/** Pages a sign-in may return to. Anything else goes to the staff home page. */
const RETURN_TO = ["/staff", "/admin/products", "/portal/insights", "/portal/orders"];

export const safeReturnTo = (value: unknown) => (typeof value === "string" && RETURN_TO.includes(value) ? value : "/staff");
