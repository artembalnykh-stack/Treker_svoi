export default function MainLoading() {
  return (
    <div className="container-app" aria-busy="true">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-[34rem]">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton mt-4 h-10 w-[80%]" />
          <div className="skeleton mt-3 h-4 w-full" />
          <div className="skeleton mt-2 h-4 w-[70%]" />
        </div>
        <div className="skeleton h-12 w-56" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="skeleton h-11 w-52" />
        <div className="skeleton h-12 w-40" />
      </div>

      <div className="kanban-scroll">
        {[0, 1, 2].map((column) => (
          <div key={column} className="min-h-[22rem] p-2">
            <div className="flex items-center gap-2.5 pb-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="skeleton h-5 w-32" />
            </div>
            <div className="grid gap-2.5">
              {[0, 1].map((card) => (
                <div key={card} className="surface p-4">
                  <div className="skeleton h-5 w-24" />
                  <div className="skeleton mt-3 h-5 w-[85%]" />
                  <div className="skeleton mt-2 h-4 w-[60%]" />
                  <div className="skeleton mt-4 h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="sr-only" role="status">
        Загружаем вашу демо-доску…
      </p>
    </div>
  );
}
