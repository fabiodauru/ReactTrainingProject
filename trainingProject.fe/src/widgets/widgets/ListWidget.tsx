export default function ListWidget({
  content,
  title,
  amount,
}: {
  content: string[];
  title: string;
  amount?: number;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ul className="list-disc list-inside">
        {content.slice(0, amount).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

ListWidget.defaultProps = {
  amount: 3,
};
