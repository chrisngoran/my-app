export function StockIndicator({ stock }: { stock: number }) {
  const state =
    stock <= 0
      ? { label: "Sold out", dot: "bg-danger", text: "text-danger" }
      : stock <= 30
        ? { label: `Only ${stock.toLocaleString("en-GB")} left`, dot: "bg-warm", text: "text-warm-ink" }
        : { label: "In stock", dot: "bg-accent", text: "text-accent" };
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${state.text}`}>
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${state.dot}`} />
      {state.label}
    </p>
  );
}
