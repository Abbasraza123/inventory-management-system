function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className={`text-3xl font-bold mt-3 ${color}`}>
        {value}
      </h2>

    </div>
  );
}

export default StatCard;