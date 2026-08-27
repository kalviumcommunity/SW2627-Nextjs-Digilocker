export default async function DocumentPage({ params }) {
  const { id } = await params;

  return (
    <main>
      <h1>Document Details</h1>
      <p>Document ID: {id}</p>
    </main>
  );
}