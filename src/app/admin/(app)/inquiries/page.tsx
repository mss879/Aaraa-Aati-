import { getInquiries } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import InquiriesView from "@/app/admin/_components/InquiriesView";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-gold-50">Inquiries</h1>
        <p className="mt-1.5 font-body text-sm text-[#8595ad]">
          Contact-form messages. Review, then send the good ones to the CRM.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <InquiriesView inquiries={inquiries} />
    </div>
  );
}
