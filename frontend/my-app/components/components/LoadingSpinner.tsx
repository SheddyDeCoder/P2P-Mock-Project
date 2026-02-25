export default function Loading() {
  return (
    <main className="min-h-screen p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-8 text-primary">Trade Dashboard</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-700 rounded"></div>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {['ID', 'Buyer', 'Seller', 'Asset', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-600 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-5">
                      <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}