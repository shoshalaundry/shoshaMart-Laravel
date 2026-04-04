import { Head, usePage, router, useForm } from '@inertiajs/react';
import { ShoppingCart, Eye, CheckCircle, XCircle, Filter, Loader2, ArrowRight, Package, User, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { OrderDetailModal } from '@/components/order-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, SearchInput } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as ordersIndex, approve as ordersApprove, reject as ordersReject, cancel as ordersCancel, destroy as ordersDestroy } from '@/routes/orders/index';

interface Order {
    id: string;
    status: string;
    total_amount: number;
    nama_pemesan: string;
    jenis_pesanan: string;
    created_at: string;
    buyer: {
        username: string;
        branch_name: string;
    };
    tier: {
        name: string;
    };
    permissions: {
        can_edit: boolean;
        can_cancel: boolean;
        can_approve: boolean;
        can_reject: boolean;
    };
}

export default function OrderIndex() {
    const { orders, auth_role, filters, buyers, tiers } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'ALL');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
    const [isQuickPrintOpen, setIsQuickPrintOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const [quickPrintData, setQuickPrintData] = useState({
        buyer_id: 'ALL',
        jenis_pesanan: 'ALL'
    });

    const [reportData, setReportData] = useState({
        jenis_pesanan: 'ALL',
        tier_id: 'ALL',
        format: 'pdf'
    });

    const { data, setData, post, processing, reset } = useForm({
        reason: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters.search || '') || statusFilter !== (filters.status || 'ALL')) {
                router.get(ordersIndex.url(), { search: searchQuery, status: statusFilter }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, filters.search, filters.status]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Disetujui</Badge>;
            case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
            case 'rejected': return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><AlertCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>;
            case 'cancelled': return <Badge variant="outline" className="opacity-50 italic">Dibatalkan</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleApprove = (id: string) => {
        if (confirm('Setujui pesanan ini?')) {
            router.post(ordersApprove.url(id));
        }
    };

    const handleCancel = (id: string) => {
        if (confirm('Batalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.patch(ordersCancel.url(id));
        }
    };

    const handleDelete = (id: string) => {
        router.delete(ordersDestroy.url(id), {
            onSuccess: () => setDeletingOrder(null),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();

        if (rejectingOrder) {
            post(ordersReject.url(rejectingOrder.id), {
                onSuccess: () => {
                    setRejectingOrder(null);
                    reset();
                },
            });
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Head title="Manajemen Pesanan" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent italic flex items-center gap-3">
                        <ShoppingCart className="h-10 w-10 text-primary" />
                        Manajemen Pesanan
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Pantau dan proses pesanan dari seluruh jaringan Shosha Mart.
                    </p>
                </div>

                {auth_role === 'SUPERADMIN' && (
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIsReportModalOpen(true)}
                            variant="outline"
                            className="rounded-full border-2 border-primary/20 hover:bg-primary/5 text-primary font-black italic uppercase tracking-widest px-8 h-14 flex items-center gap-2 group"
                        >
                            <Filter className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            EXPORT LAPORAN
                        </Button>
                        <Button
                            onClick={() => setIsQuickPrintOpen(true)}
                            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase tracking-widest px-8 h-14 shadow-2xl shadow-primary/20 flex items-center gap-2 group"
                        >
                            <Package className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            CETAK CEPAT
                        </Button>
                    </div>
                )}
            </div>

            {/* Main Table Card */}
            <Card className="border-sidebar-border/50 shadow-2xl shadow-foreground/5 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-sidebar-border/50 py-6 px-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Cari ID Pesanan atau Buyer..."
                            className="md:w-96"
                        />
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-10 px-4 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" />
                                <span className="text-primary font-bold">Status:</span>
                            </Badge>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 rounded-full h-10 border-2 border-primary/20 font-bold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    <SelectItem value="ALL">Semua Pesanan</SelectItem>
                                    <SelectItem value="PENDING">Menunggu (Pending)</SelectItem>
                                    <SelectItem value="APPROVED">Disetujui (Approved)</SelectItem>
                                    <SelectItem value="REJECTED">Ditolak (Rejected)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/20 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-8 py-4">Informasi Pesanan</th>
                                    <th className="px-6 py-4">Buyer & Tier</th>
                                    <th className="px-6 py-4">Total Tagihan</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-8 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {orders.data.map((order: Order) => (
                                    <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-foreground text-sm flex items-center gap-1 uppercase tracking-tight">#{order.id.slice(0, 8)}</div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="text-[10px] font-black text-primary italic uppercase tracking-wider truncate max-w-[150px]">
                                                            {order.nama_pemesan}
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground font-medium italic">
                                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {order.jenis_pesanan}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                                <span className="font-bold text-sm tracking-tight">{order.buyer.username}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-[9px] font-black tracking-widest uppercase py-0 px-2 rounded-sm opacity-70">
                                                {order.tier.name}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="font-black text-base text-primary tracking-tighter">{formatCurrency(order.total_amount)}</div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedOrderId(order.id); setIsDetailOpen(true);
                                                    }}
                                                    className="rounded-full font-bold hover:bg-primary/10 hover:text-primary gap-1"
                                                >
                                                    <Eye className="h-4 w-4" /> Detail
                                                </Button>

                                                <div className="flex items-center gap-2 ml-2 border-l pl-2">
                                                    {(order.permissions.can_approve || order.permissions.can_reject) && (
                                                        <>
                                                            {order.permissions.can_approve && (
                                                                <Button
                                                                    variant="default"
                                                                    size="icon"
                                                                    onClick={() => handleApprove(order.id)}
                                                                    className="rounded-full bg-emerald-500 hover:bg-emerald-600 h-8 w-8 shadow-lg shadow-emerald-500/20"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {order.permissions.can_reject && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() => setRejectingOrder(order)}
                                                                    className="rounded-full h-8 w-8 shadow-lg shadow-destructive/20"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}

                                                    {order.permissions.can_cancel && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancel(order.id)}
                                                            className="rounded-full h-8 text-[10px] font-black uppercase text-destructive hover:bg-destructive/10"
                                                        >
                                                            Batal
                                                        </Button>
                                                    )}

                                                    {auth_role === 'SUPERADMIN' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeletingOrder(order)}
                                                            className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={orders.meta.links} className="px-8 py-4 border-t bg-muted/5" />
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <OrderDetailModal
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                orderId={selectedOrderId}
                onReject={(order) => {
                    setIsDetailOpen(false); setRejectingOrder(order);
                }}
            />

            {/* Rejection Dialog */}
            <Dialog open={!!rejectingOrder} onOpenChange={(val) => !val && setRejectingOrder(null)}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic text-destructive">Tolak Pesanan</DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan untuk pesanan #{rejectingOrder?.id.slice(0, 8)}. Alasan ini akan tampak oleh Buyer.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="font-bold text-xs uppercase tracking-widest">Alasan Penolakan</Label>
                            <Input
                                id="reason"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                className="rounded-xl h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-destructive"
                                placeholder="..."
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={processing}
                                variant="destructive"
                                className="w-full h-12 rounded-full font-black text-lg shadow-xl shadow-destructive/20"
                            >
                                {processing ? <Loader2 className="animate-spin mr-2" /> : 'Konfirmasi Penolakan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Deletion Dialog */}
            <Dialog open={!!deletingOrder} onOpenChange={(val) => !val && setDeletingOrder(null)}>
                <DialogContent className="rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden sm:max-w-md">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2 tracking-tight uppercase text-destructive">
                            <Trash2 className="h-6 w-6" />
                            Hapus Pesanan?
                        </DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">
                            Tindakan ini permanen dan tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="bg-destructive/5 p-6 rounded-2xl border-2 border-destructive/10 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                <span>ID PESANAN</span>
                                <span className="text-foreground">#{deletingOrder?.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                <span>TOTAL TAGIHAN</span>
                                <span className="text-destructive">{deletingOrder ? formatCurrency(deletingOrder.total_amount) : ''}</span>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-3">
                            <Button
                                variant="ghost"
                                className="rounded-full font-black italic uppercase text-xs tracking-widest"
                                onClick={() => setDeletingOrder(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 rounded-full h-12 font-black italic uppercase text-xs tracking-widest shadow-lg shadow-destructive/20"
                                onClick={() => deletingOrder && handleDelete(deletingOrder.id)}
                            >
                                YA, HAPUS PERMANEN
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Quick Print Modal */}
            <Dialog open={isQuickPrintOpen} onOpenChange={setIsQuickPrintOpen}>
                <DialogContent className="rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden sm:max-w-md">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2 tracking-tight uppercase">
                            <Package className="h-6 w-6 text-primary" />
                            Cetak Cepat (Approved)
                        </DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">
                            Pilih filter untuk mencetak banyak invoice sekaligus.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori Cabang</Label>
                                <Select
                                    value={quickPrintData.buyer_id}
                                    onValueChange={(val) => setQuickPrintData(prev => ({ ...prev, buyer_id: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl border-2 font-bold focus:ring-primary/20 bg-muted/30">
                                        <SelectValue placeholder="Pilih Cabang" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="ALL" className="font-bold">SEMUA CABANG</SelectItem>
                                        {buyers?.map((buyer: any) => (
                                            <SelectItem key={buyer.id} value={buyer.id} className="font-bold">
                                                {buyer.branch_name || buyer.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jenis Pesanan</Label>
                                <Select
                                    value={quickPrintData.jenis_pesanan}
                                    onValueChange={(val) => setQuickPrintData(prev => ({ ...prev, jenis_pesanan: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl border-2 font-bold focus:ring-primary/20 bg-muted/30">
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="ALL" className="font-bold">SEMUA JENIS</SelectItem>
                                        <SelectItem value="awal bulan" className="font-bold">AWAL BULAN</SelectItem>
                                        <SelectItem value="pertengahan bulan" className="font-bold">PERTENGAHAN BULAN</SelectItem>
                                        <SelectItem value="Lembur" className="font-bold">LEMBUR</SelectItem>
                                        <SelectItem value="tambahan bulan ini" className="font-bold">TAMBAHAN BULAN INI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/10">
                            <p className="text-[10px] font-bold text-primary italic leading-relaxed text-center">
                                Sistem hanya akan mencetak pesanan dengan status <span className="underline">APPROVED</span> yang sesuai dengan filter di atas.
                            </p>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-3">
                            <Button
                                variant="ghost"
                                className="rounded-full font-black italic uppercase text-xs tracking-widest"
                                onClick={() => setIsQuickPrintOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                className="flex-1 rounded-full h-12 font-black italic uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                                onClick={() => {
                                    const url = new URL(window.location.origin + '/orders-bulk/invoice');
                                    url.searchParams.append('buyer_id', quickPrintData.buyer_id);
                                    url.searchParams.append('jenis_pesanan', quickPrintData.jenis_pesanan);
                                    window.open(url.toString(), '_blank');
                                    setIsQuickPrintOpen(false);
                                }}
                            >
                                <ArrowRight className="h-4 w-4 mr-2" /> CETAK SEKARANG
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Export Report Modal */}
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden sm:max-w-md">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2 tracking-tight uppercase text-primary">
                            <Filter className="h-6 w-6" />
                            Export Laporan Pesanan
                        </DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">
                            Generate laporan dalam format PDF atau Excel.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jenis Pesanan</Label>
                                <Select
                                    value={reportData.jenis_pesanan}
                                    onValueChange={(val) => setReportData(prev => ({ ...prev, jenis_pesanan: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl border-2 font-bold focus:ring-primary/20 bg-muted/30">
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="ALL" className="font-bold">SEMUA JENIS</SelectItem>
                                        <SelectItem value="awal bulan" className="font-bold text-xs">AWAL BULAN</SelectItem>
                                        <SelectItem value="pertengahan bulan" className="font-bold text-xs">PERTENGAHAN BULAN</SelectItem>
                                        <SelectItem value="Lembur" className="font-bold text-xs">LEMBUR</SelectItem>
                                        <SelectItem value="tambahan bulan ini" className="font-bold text-xs">TAMBAHAN BULAN INI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter Tier</Label>
                                <Select
                                    value={reportData.tier_id}
                                    onValueChange={(val) => setReportData(prev => ({ ...prev, tier_id: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl border-2 font-bold focus:ring-primary/20 bg-muted/30">
                                        <SelectValue placeholder="Pilih Tier" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="ALL" className="font-bold text-xs uppercase tracking-widest">SEMUA TIER</SelectItem>
                                        {tiers?.map((tier: any) => (
                                            <SelectItem key={tier.id} value={tier.id} className="font-bold text-xs uppercase tracking-widest leading-relaxed">
                                                {tier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Format Laporan</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant={reportData.format === 'pdf' ? 'default' : 'outline'}
                                        onClick={() => setReportData(prev => ({ ...prev, format: 'pdf' }))}
                                        className="h-12 rounded-2xl font-bold italic"
                                    >
                                        PDF (Format Tabel)
                                    </Button>
                                    <Button
                                        variant={reportData.format === 'excel' ? 'default' : 'outline'}
                                        onClick={() => setReportData(prev => ({ ...prev, format: 'excel' }))}
                                        className="h-12 rounded-2xl font-bold italic"
                                    >
                                        EXCEL (Multi-Sheet)
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/10">
                            <p className="text-[10px] font-bold text-primary italic leading-relaxed">
                                • PDF: Tabel pesanan per halaman per cabang.<br />
                                • Excel: Data pesanan per sheet per cabang.
                            </p>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-3">
                            <Button
                                variant="ghost"
                                className="rounded-full font-black italic uppercase text-xs tracking-widest"
                                onClick={() => setIsReportModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                className="flex-1 rounded-full h-12 font-black italic uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                                onClick={() => {
                                    const url = new URL(window.location.origin + '/orders-report');
                                    url.searchParams.append('format', reportData.format);
                                    url.searchParams.append('jenis_pesanan', reportData.jenis_pesanan);
                                    url.searchParams.append('tier_id', reportData.tier_id);
                                    window.open(url.toString(), '_blank');
                                    setIsReportModalOpen(false);
                                }}
                            >
                                <ArrowRight className="h-4 w-4 mr-2" /> GENERATE REPORT
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

OrderIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Pesanan',
            href: ordersIndex.url(),
        },
    ],
};
