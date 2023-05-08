export default function LoadingSkeleton() {
  return (
    <div className="bg-white p-2 sm:p-4 h-44 rounded-2xl  select-none">
      <div className="w-full h-full rounded-xl bg-gray-200  animate-pulse"></div>
    </div>
  );
}
