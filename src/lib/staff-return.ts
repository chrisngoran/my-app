/** Pages a sign-in may return to. Anything else goes to the staff home page. */
const RETURN_TO = ["/staff", "/admin/products", "/portal/insights", "/portal/orders", "/portal/reviews", "/portal/marketplace"];

export const safeReturnTo = (value: unknown) => (typeof value === "string" && RETURN_TO.includes(value) ? value : "/staff");

/** Pages a customer sign-in may return to. Anything else goes to their account. */
const CUSTOMER_RETURN_TO = ["/account", "/order"];

export const safeCustomerReturnTo = (value: unknown) =>
  typeof value === "string" && CUSTOMER_RETURN_TO.includes(value) ? value : "/account";
