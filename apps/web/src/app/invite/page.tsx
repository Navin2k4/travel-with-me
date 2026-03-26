import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteTokenForm } from "@/components/invite/invite-token-form";
export default function InviteLandingPage() {
    return (
        <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Join via Invite</CardTitle>
                    <CardDescription>Paste your invite token or open a full invite link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InviteTokenForm />
                </CardContent>
            </Card>
        </main>
    );
}