import LegalLayout from "@/components/legal/LegalLayout";

export default function LegalLoading() {
  return (
    <LegalLayout title="Loading Policies..." lastUpdated="Loading...">
      <div className="space-y-6 animate-pulse mt-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mt-8 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-11/12" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mt-8 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </LegalLayout>
  );
}
