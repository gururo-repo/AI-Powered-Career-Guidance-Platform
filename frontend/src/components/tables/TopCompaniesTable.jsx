const TopCompaniesTable = ({ companies }) => {
  if (!companies || companies.length === 0) {
    return <div className="text-cyan-50/70">No company data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-cyan-50">
        <thead className="text-xs uppercase text-cyan-100/70 border-b border-zinc-700">
          <tr>
            <th scope="col" className="px-4 py-3">Company</th>
            <th scope="col" className="px-4 py-3">Open Positions</th>
            <th scope="col" className="px-4 py-3">Key Roles</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company, index) => (
            <tr key={index} className="border-b border-zinc-800">
              <td className="px-4 py-3 font-medium">{company.name}</td>
              <td className="px-4 py-3">{company.openPositions}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {company.roles.slice(0, 2).map((role, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-100/10 rounded-full text-xs">
                      {role}
                    </span>
                  ))}
                  {company.roles.length > 2 && (
                    <span className="px-2 py-1 bg-cyan-100/5 rounded-full text-xs">
                      +{company.roles.length - 2} more
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopCompaniesTable; 