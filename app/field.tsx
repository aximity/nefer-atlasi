export default function Field({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend>{name}</legend>
      <div>{children}</div>
    </fieldset>
  );
}
