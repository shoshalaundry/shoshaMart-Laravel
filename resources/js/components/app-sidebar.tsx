import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, ShoppingBag, Users, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as ordersIndex } from '@/routes/orders/index';
import { index as productsIndex } from '@/routes/products/index';
// @ts-expect-error: Wayfinder routes are dynamically generated and may not be fully typed in all environments
import { index as usersIndex } from '@/routes/users/index';
// @ts-expect-error: NavItem type might have strict requirements that routes don't always meet
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const { setOpenMobile, isMobile } = useSidebar();

    // Close mobile sidebar on navigation
    useEffect(() => {
        return router.on('navigate', () => {
            if (isMobile) {
                setOpenMobile(false);
            }
        });
    }, [isMobile, setOpenMobile]);

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard.url(),
            icon: LayoutGrid,
        },
        {
            title: 'Katalog Produk',
            href: productsIndex.url(),
            icon: ShoppingBag,
        },
    ];

    if (user?.role === 'SUPERADMIN') {
        mainNavItems.push({
            title: 'Manajemen Pengguna',
            href: usersIndex.url(),
            icon: Users,
        });
    }

    if (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN_TIER') {
        mainNavItems.push({
            title: 'Kelola Pesanan',
            href: ordersIndex.url(),
            icon: ShoppingCart,
        });
    } else if (user?.role === 'BUYER') {
        mainNavItems.push({
            title: 'Pesanan Saya',
            href: ordersIndex.url(),
            icon: ShoppingCart,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
