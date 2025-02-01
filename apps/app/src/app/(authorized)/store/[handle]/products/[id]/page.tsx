import { ProductCreateForm } from "./_components/product-create-form";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (id === "create") {
    return <ProductCreateForm />;
  }

  return <div>{id}</div>;
}
