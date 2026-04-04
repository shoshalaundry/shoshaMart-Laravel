// Components
import { Form, Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verifikasi email"
            description="Silakan verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan."
        >
            <Head title="Verifikasi email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    Tautan verifikasi baru telah dikirim ke alamat email yang
                    Anda berikan saat pendaftaran.
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <Form action="#" method="POST">
                    {({ processing }) => (
                        <Button disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Kirim ulang email verifikasi
                        </Button>
                    )}
                </Form>

                <form action="/logout" method="POST">
                    <button
                        type="submit"
                        className="text-sm text-muted-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:text-foreground hover:decoration-current! dark:decoration-neutral-500"
                    >
                        Keluar
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi email',
    description:
        'Silakan verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan.',
};
