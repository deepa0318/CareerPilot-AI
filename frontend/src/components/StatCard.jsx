export default function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6">

      <h3 className="text-gray-400">
        {title}
      </h3>

      <h1 className="text-5xl text-white mt-4">
        {value}
      </h1>

    </div>
  );
}