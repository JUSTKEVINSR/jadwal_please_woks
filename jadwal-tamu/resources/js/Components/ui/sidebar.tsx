import React from 'react';

export function SidebarGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`sidebar-group ${className || ''}`} {...props}>
            {children}
        </div>
        
    );
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
    return <div className="sidebar-group-content">{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
    return <ul className="sidebar-menu">{children}</ul>;
}

export function SidebarMenuButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button className="sidebar-menu-button" {...props}>
            {children}
        </button>
    );
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
    return <li className="sidebar-menu-item">{children}</li>;
}




