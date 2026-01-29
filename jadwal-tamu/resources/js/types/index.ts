export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    role: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    settings?: any;
};

export interface NavItem {
    title: string;
    href: string;
    icon?: any;
}
