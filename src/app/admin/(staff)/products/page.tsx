import type { Metadata } from "next";
import { AdminProductList } from "@/components/admin/product-list";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <AdminProductList />;
}
