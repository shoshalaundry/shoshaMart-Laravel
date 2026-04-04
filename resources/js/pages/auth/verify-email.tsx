// Components
import { Form, Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Verify email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <Form action="#" method="POST">
                    {({ processing }) => (
                        <Button disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Resend verification email
                        </Button>
                    )}
                </Form>

                <form action="/logout" method="POST">
                    <button
                        type="submit"
                        className="text-sm text-muted-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:text-foreground hover:decoration-current! dark:decoration-neutral-500"
                    >
                        Log out
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
