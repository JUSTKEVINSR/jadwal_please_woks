import { Icon } from '@/Components/icon';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({ items }: { items: NavItem[] }) {
    return (
        <div className="p-4 border-t">
            <ul>
                {items.map((item: NavItem) => (
                    <li key={item.title} className="py-1">
                        <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5 mr-2" />}
                            <span>{item.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

