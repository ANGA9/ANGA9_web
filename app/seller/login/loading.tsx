export default function LoginLoading() {
  const mobileView = (
    <div className="flex flex-col min-h-screen md:hidden bg-gradient-to-b from-[#EAF2FF] to-[#F8FBFF]">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-b border-[#E8EEF4] px-4 py-3 sticky top-0 z-10">
        <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex flex-col px-4 pt-8 pb-6">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,111,212,0.08)] p-6">
          <div className="mb-2">
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex border-b border-[#E8EEF4] mb-6 mt-4">
            <div className="h-10 w-24 bg-gray-100 rounded-t animate-pulse mr-2" />
            <div className="h-10 w-24 bg-gray-100 rounded-t animate-pulse" />
          </div>
          <div className="space-y-5">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-14 w-full bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mt-6" />
            <div className="h-3 w-3/4 mx-auto bg-gray-100 rounded animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );

  const desktopView = (
    <div className="hidden md:flex flex-col min-h-screen bg-gradient-to-br from-[#EAF2FF] via-[#F0F6FF] to-[#F8FBFF]">
      <div className="w-full bg-white border-b border-[#E8EEF4] h-14" />
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-[1000px]">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,111,212,0.10)] overflow-hidden flex min-h-[560px]">
            <div className="relative flex-1 min-w-[400px] bg-gray-200 animate-pulse" />
            <div className="flex-1 flex flex-col justify-center px-12 py-10">
              <div className="mb-4">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex border-b border-[#E8EEF4] mb-6 mt-4">
                <div className="h-12 w-28 bg-gray-100 rounded-t animate-pulse mr-2" />
                <div className="h-12 w-28 bg-gray-100 rounded-t animate-pulse" />
              </div>
              <div className="space-y-5">
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-14 w-full bg-gray-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mt-8" />
                <div className="h-3 w-3/4 mx-auto bg-gray-100 rounded animate-pulse mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}
