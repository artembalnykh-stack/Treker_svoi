export default function SimpleLoading() {
  return (
    <div className="container-narrow" aria-busy="true">
      <div className="mx-auto max-w-[46rem] text-center">
        <div className="skeleton mx-auto h-6 w-32" />
        <div className="skeleton mx-auto mt-4 h-10 w-72" />
        <div className="skeleton mx-auto mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="mx-auto mt-7 w-full max-w-[46rem]">
        <div className="mb-4 flex justify-between">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-12 w-40" />
        </div>
        <div className="surface p-6 sm:p-8">
          <div className="skeleton h-7 w-28" />
          <div className="skeleton mt-5 h-10 w-[85%]" />
          <div className="skeleton mt-3 h-5 w-[60%]" />
          <div className="skeleton mt-7 h-16 w-full" />
        </div>
        <p className="sr-only" role="status">
          Загружаем простой вид…
        </p>
      </div>
    </div>
  );
}
