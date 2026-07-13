import { Link } from "wouter";
import { AlertCircle, Home, Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTenantBranding } from "@/hooks/useTenantBranding";

export default function NotFound() {
  const { companyName } = useTenantBranding();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 — Page not found</h1>
          </div>

          <p className="mt-2 mb-6 text-sm text-gray-600">
            The link may be broken or the page may have been moved. Head back
            home or search {companyName}'s current deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-primary text-white rounded-full">
                <Home className="w-4 h-4 mr-2" /> Go home
              </Button>
            </Link>
            <Link href="/search" className="flex-1">
              <Button variant="outline" className="w-full rounded-full">
                <SearchIcon className="w-4 h-4 mr-2" /> Browse deals
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
