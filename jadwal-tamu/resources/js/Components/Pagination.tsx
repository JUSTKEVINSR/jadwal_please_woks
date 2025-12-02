import { Link } from '@inertiajs/react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  links: PaginationLink[];
}

export default function Pagination({ links }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {links.map((link, key) => (
        link.url === null ? (
          <span
            key={key}
            className="px-4 py-2 text-gray-500 bg-gray-100 rounded cursor-not-allowed"
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ) : (
          <Link
            key={key}
            href={link.url}
            className={`px-4 py-2 rounded ${
              link.active
                ? 'text-white bg-blue-500 hover:bg-blue-600'
                : 'text-gray-600 bg-white hover:bg-gray-100'
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        )
      ))}
    </div>
  );
}