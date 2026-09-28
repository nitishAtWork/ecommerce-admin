import PageHeader from "../../components/common/PageHeader";

function Reports() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Analyze your store performance."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Reports will be available here.
        </p>
      </div>
    </div>
  );
}

export default Reports;