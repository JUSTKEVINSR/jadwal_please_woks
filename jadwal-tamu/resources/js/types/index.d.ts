export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    two_factor_enabled?: boolean;
    profile_photo_url?: string;
    remember_token?: string;
}
export interface NavItem {
    title: string;
    href?: string;
    icon?: ComponentType<LucideProps>;
}


export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    
};