import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-10">
      <Card className="w-full max-w-lg border-slate-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-slate-900">
            Unauthorized
          </CardTitle>
          <CardDescription>
            You do not have permission to access this dashboard area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-600">
          <p>
            Your session is valid, but the requested page is restricted to a
            different role. Please sign in with an account that has the proper
            permissions or return to a safe page.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">Switch account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
