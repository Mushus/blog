export type BreadCrumbItem = { text: string; href: string };

type Props = {
  items: BreadCrumbItem[];
};

export default function BreadCrumb({ items }: Props) {
  return (
    <nav>
      <ol>
        {items.map((item) => (
          <li>
            <a href={item.href}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
