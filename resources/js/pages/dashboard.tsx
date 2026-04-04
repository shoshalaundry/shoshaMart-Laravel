import { Head, usePage, Link, router, useForm } from '@inertiajs/react';
import {
    ShoppingBag, Package, TrendingUp, History, LayoutDashboard,
    ArrowRight, Users, CheckCircle, Clock, AlertCircle, Filter,
    Search, RefreshCcw, X
} from 'lucide-react';
import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import ProfileController from '@/actions/App/Http/Controllers/ProfileController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { index as productsIndex } from '@/routes/products/index';
import { index as usersIndex } from '@/routes/users/index';

interface Stat {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}

interface RecentActivity {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    buyer?: {
        username: string;
        branch_name: string;
    };
}

export default function Dashboard() {
    const { auth, stats, recentActivity, chartData, filters, options } = usePage().props as any;
    const user = auth?.user;

    const { data: phoneData, setData: setPhoneData, post: postPhone, processing: isSavingPhone, errors: phoneErrors } = useForm({
        phone: user?.phone || '',
        has_verified_phone: false,
    });

    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(
        user?.role === 'BUYER' && !user?.has_verified_phone
    );

    const submitPhone = (e: React.FormEvent) => {
        e.preventDefault();
        postPhone(ProfileController.updatePhone.url(), {
            onSuccess: () => setIsPhoneModalOpen(false),
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value === 'all' ? '' : value };
        router.get(dashboard.url(), newFilters, {
            preserveState: true,
            preserveScroll: true,
            only: ['stats', 'recentActivity', 'chartData', 'filters'],
        });
    };

    const resetFilters = () => {
        router.get(dashboard.url(), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getIcon = (name: string) => {
        switch (name) {
            case 'users': return Users;
            case 'package': return Package;
            case 'shopping-bag': return ShoppingBag;
            case 'trending-up': return TrendingUp;
            case 'layout-dashboard': return LayoutDashboard;
            case 'clock': return Clock;
            default: return Package;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Disetujui</Badge>;
            case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
            case 'rejected': return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"><AlertCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>;
            case 'cancelled': return <Badge className="bg-muted text-muted-foreground"><X className="w-3 h-3 mr-1" /> Dibatalkan</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    if (!user) {
        return null;
    }

    const isFiltered = filters?.branch_name || filters?.jenis_pesanan || filters?.status;

    return (
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto animate-in fade-in duration-700">
            <Head title="Dasbor" />

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent italic">
                        Selamat Datang, {user.username}!
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        {user.role === 'SUPERADMIN'
                            ? 'Ringkasan operasional Shosha Mart hari ini.'
                            : user.role === 'ADMIN_TIER'
                                ? `Ringkasan untuk Tier ${user.tier?.name || 'Anda'}.`
                                : `Cabang ${user.branch_name || 'Utama'}.`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full h-12 px-6 border-2 font-bold" onClick={resetFilters}>
                        <RefreshCcw className="w-4 h-4 mr-2" /> Reset Dashboard
                    </Button>
                    {user.role === 'BUYER' && (
                        <Button size="lg" className="h-12 px-8 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-bold gap-2" asChild>
                            <Link href={productsIndex.url()}>
                                Belanja <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {(user.role === 'SUPERADMIN' || user.role === 'ADMIN_TIER') && (
                <Card className="border-sidebar-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="py-4 border-b border-sidebar-border/30 bg-muted/20">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary italic">
                            <Filter className="w-4 h-4" /> Filter Analitik
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Cabang</label>
                                <Select value={filters.branch_name || 'all'} onValueChange={(v) => handleFilterChange('branch_name', v)}>
                                    <SelectTrigger className="rounded-xl border-2 h-11 focus:ring-primary/20 transition-all font-bold">
                                        <SelectValue placeholder="Semua Cabang" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="all" className="font-bold">Semua Cabang</SelectItem>
                                        {options.branches.map((b: string) => (
                                            <SelectItem key={b} value={b} className="font-bold">{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Jenis Pesanan</label>
                                <Select value={filters.jenis_pesanan || 'all'} onValueChange={(v) => handleFilterChange('jenis_pesanan', v)}>
                                    <SelectTrigger className="rounded-xl border-2 h-11 focus:ring-primary/20 transition-all font-bold">
                                        <SelectValue placeholder="Semua Jenis" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="all" className="font-bold">Semua Jenis</SelectItem>
                                        {options.types.map((t: string) => (
                                            <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Status</label>
                                <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                                    <SelectTrigger className="rounded-xl border-2 h-11 focus:ring-primary/20 transition-all font-bold">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="all" className="font-bold">Semua Status</SelectItem>
                                        {options.statuses.map((s: string) => (
                                            <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    className={`w-full h-11 rounded-xl font-black italic tracking-widest uppercase transition-all duration-300 ${isFiltered ? 'bg-primary shadow-lg shadow-primary/30 scale-[1.02]' : 'bg-muted text-muted-foreground border-2 border-transparent'}`}
                                    onClick={() => handleFilterChange('', '')}
                                >
                                    <Search className="w-4 h-4 mr-2" /> Filter Data
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {stats?.map((stat: Stat, i: number) => {
                    const Icon = getIcon(stat.icon);

                    return (
                        <Card key={i} className="border-sidebar-border/50 dark:border-sidebar-border overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg relative">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${stat.color.replace('text-', 'bg-')}`} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold tracking-wider uppercase text-muted-foreground">{stat.title}</CardTitle>
                                <Icon className={`h-5 w-5 ${stat.color} group-hover:rotate-12 transition-transform`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                    <TrendingUp className="h-3 w-3" /> terupdate secara real-time
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            {(user.role === 'SUPERADMIN' || user.role === 'ADMIN_TIER') && (
                <Card className="border-sidebar-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold italic tracking-tight">Tren Pembelian (30 Hari Terakhir)</CardTitle>
                        <CardDescription>Visualisasi akumulasi transaksi pembelian harian dalam Rupiah.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4" style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                                    interval={4}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                                    tickFormatter={(v) => `Rp ${v >= 1000000 ? (v / 1000000).toFixed(1) + 'jt' : (v / 1000).toFixed(0) + 'rb'}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '12px' }}
                                    formatter={(v: any) => [formatCurrency(Number(v)), 'Total Pembelian']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Activity List */}
                <Card className="lg:col-span-2 border-sidebar-border/50 transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold italic">
                                <History className="h-5 w-5 text-primary" />
                                {user.role === 'SUPERADMIN' ? 'Pesanan Masuk Terbaru' : 'Riwayat Pesanan'}
                            </CardTitle>
                            <CardDescription>Menampilkan aktivitas transaksi sesuai filter aktif.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-full px-4">Lihat Semua</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentActivity?.length > 0 ? recentActivity.map((activity: RecentActivity) => (
                            <div key={activity.id} className="group flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black leading-none tracking-tight">
                                                {activity.buyer?.username || 'Buyer'}
                                            </p>
                                            {activity.buyer?.branch_name && (
                                                <Badge variant="outline" className="text-[9px] h-4 font-black uppercase bg-primary/5 px-1.5">{activity.buyer.branch_name}</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-bold italic">
                                            {new Date(activity.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="text-sm font-black tracking-tight italic underline decoration-primary/30 underline-offset-4">{formatCurrency(activity.total_amount)}</div>
                                    {getStatusBadge(activity.status)}
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                <Package className="h-12 w-12 opacity-20" />
                                <p className="font-medium italic text-sm">Tidak ada aktivitas pesanan yang sesuai kriteria.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Shortcuts */}
                <div className="space-y-8">
                    <Card className="bg-primary shadow-2xl shadow-primary/20 text-primary-foreground border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold italic">
                                <LayoutDashboard className="h-5 w-5 text-primary-foreground/80" />
                                Akses Cepat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="secondary" className="w-full justify-between h-12 rounded-xl font-bold group" asChild>
                                <Link href={productsIndex.url()}>
                                    Katalog Produk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            {(user.role === 'SUPERADMIN' || user.role === 'ADMIN_TIER') && (
                                <Button variant="secondary" className="w-full justify-between h-12 rounded-xl font-bold group" asChild>
                                    <Link href={usersIndex.url()}>
                                        Manajemen Pengguna <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            )}
                            <Button variant="secondary" className="w-full justify-between h-12 rounded-xl font-bold group">
                                Bantuan Teknis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/50 border-dashed bg-muted/30">
                        <CardContent className="pt-6">
                            <div className="p-4 rounded-2xl bg-background/80 border border-sidebar-border/50 space-y-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <Badge variant="secondary" className="font-bold tracking-widest text-[9px] uppercase px-2 py-0.5">Berita Sistem</Badge>
                                <p className="text-sm font-black italic leading-relaxed tracking-tight">
                                    Visualisasi dashboard sekarang mendukung filter dinamis per cabang dan jenis pesanan. Gunakan bilah filter di atas untuk melihat detail operasional.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Mandatory Phone Update Modal */}
            <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 border-none shadow-2xl overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic tracking-tight uppercase leading-none mb-2">Verifikasi Nomor</DialogTitle>
                            <DialogDescription className="text-primary-foreground/80 font-bold text-xs uppercase tracking-widest leading-relaxed">
                                Mohon lengkapi profil Anda untuk kenyamanan transaksi di Shosha Mart.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={submitPhone} className="p-8 space-y-6">
                        <div className="p-4 rounded-2xl bg-amber-500/5 border-2 border-amber-500/10 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold leading-relaxed text-amber-700">
                                <span className="uppercase tracking-widest block mb-1 opacity-70">Instruksi:</span>
                                Gunakan no laundry yang ada pada tablet kasir.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nomor WhatsApp Aktif</Label>
                                <Input
                                    id="phone"
                                    placeholder="Contoh: 0812XXXXXXXX"
                                    value={phoneData.phone}
                                    onChange={(e) => setPhoneData('phone', e.target.value)}
                                    className={`h-14 rounded-2xl border-2 font-bold px-6 focus:ring-primary/20 transition-all text-lg ${phoneErrors.phone ? 'border-destructive bg-destructive/5' : ''}`}
                                    required
                                    autoFocus
                                />
                                {phoneErrors.phone && (
                                    <p className="text-[10px] font-bold text-destructive px-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-300">
                                        {phoneErrors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed hover:border-primary/30 transition-colors cursor-pointer group">
                                <div className="flex items-center h-5">
                                    <Checkbox
                                        id="has_verified_phone"
                                        checked={phoneData.has_verified_phone}
                                        onCheckedChange={(checked) => setPhoneData('has_verified_phone', checked === true)}
                                        className="rounded-md h-5 w-5 border-2"
                                    />
                                </div>
                                <div className="flex flex-col space-y-0.5">
                                    <Label htmlFor="has_verified_phone" className="text-[11px] font-black uppercase tracking-tight cursor-pointer">
                                        Simpan & Jangan Tampilkan Lagi
                                    </Label>
                                    <p className="text-[9px] text-muted-foreground font-medium italic">Modal ini tidak akan muncul kembali di masa mendatang.</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSavingPhone || !phoneData.phone}
                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-sm uppercase tracking-widest transition-all hover:scale-[1.02]"
                            >
                                {isSavingPhone ? (
                                    <RefreshCcw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Simpan Perubahan <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dasbor',
            href: dashboard.url(),
        },
    ],
};

