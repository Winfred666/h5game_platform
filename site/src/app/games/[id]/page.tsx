export default async function ProductDetails(
  {params}:
  {params: Promise<{ id: string }>}
) {
  const id = (await params).id;
  return <h1>Page of games {id}</h1>;
}
